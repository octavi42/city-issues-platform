import json
from pathlib import Path
import instructor
from openai import OpenAI
from pydantic import BaseModel, Field
from typing import Optional, Literal, Union, List
from aiv2.tools.vision.report_issue import run_iss_function, run_mai_function, run_irrelevant_function
import asyncio
from db.crud.read_nodes import read_nodes, search_node
from db.crud.create_nodes import add_city, add_user, add_photo
from db.crud.create_edges import add_uploaded_photo
from datetime import datetime
import uuid

# Directory containing JSON schema files
_SCHEMA_DIR = Path(__file__).parents[3] / ".." / ".." / "ai" / "schemas"

from db.crud.read_nodes import read_nodes

# Patch the OpenAI client with instructor
client = instructor.from_openai(OpenAI())

# --- Category helpers ---
def get_category_enum(event_type: str) -> List[str]:
    """
    Query the database for categories of the given event_type ('issue' or 'maintenance').
    Returns a list of category names.
    """
    nodes = read_nodes("Category") or []
    return [n.get("name") for n in nodes if n.get("event_type") == event_type and n.get("name")]

def get_issue_categories() -> List[str]:
    """
    Returns a list of valid issue categories from the database.
    """
    return get_category_enum("issue")

def get_maintenance_categories() -> List[str]:
    """
    Returns a list of valid maintenance categories from the database.
    """
    return get_category_enum("maintenance")

# --- Pydantic models ---
class IssueReport(BaseModel):
    type: Literal["issue"] = "issue"
    city_id: str
    photo_id: str
    name: str
    description: str
    inspected_at: str
    # The valid categories can be injected at runtime using get_issue_categories()
    category: Optional[str] = Field(None, description="Category of the issue. See get_issue_categories().")
    category_description: str
    severity: str
    severity_score: float
    reported_at: str
    status: str
    suggested_category: Optional[str] = None

class WellMaintainedReport(BaseModel):
    type: Literal["well_maintained"] = "well_maintained"
    city_id: str
    photo_id: str
    event_id: str
    description: str
    inspected_at: str
    status: str
    condition_score: float
    # The valid categories can be injected at runtime using get_maintenance_categories()
    category: Optional[str] = Field(None, description="Category of the element. See get_maintenance_categories().")
    category_description: Optional[str] = None
    suggested_category: Optional[str] = None

class IrrelevantImage(BaseModel):
    type: Literal["irrelevant"] = "irrelevant"
    photo_id: str
    reason: str
    confidence: float

# --- Instructor function definitions ---

def report_issue(
    city_id: str,
    photo_id: str,
    name: str,
    description: str,
    inspected_at: str,
    category: Optional[str],
    category_description: str,
    severity: str,
    severity_score: float,
    reported_at: str,
    status: str,
    suggested_category: Optional[str] = None,
) -> IssueReport:
    return IssueReport(
        city_id=city_id,
        photo_id=photo_id,
        name=name,
        description=description,
        inspected_at=inspected_at,
        category=category,
        category_description=category_description,
        severity=severity,
        severity_score=severity_score,
        reported_at=reported_at,
        status=status,
        suggested_category=suggested_category,
    )

def log_well_maintained(
    city_id: str,
    photo_id: str,
    event_id: str,
    description: str,
    inspected_at: str,
    status: str,
    condition_score: float,
    category: Optional[str] = None,
    category_description: Optional[str] = None,
    suggested_category: Optional[str] = None,
) -> WellMaintainedReport:
    return WellMaintainedReport(
        city_id=city_id,
        photo_id=photo_id,
        event_id=event_id,
        description=description,
        inspected_at=inspected_at,
        status=status,
        condition_score=condition_score,
        category=category,
        category_description=category_description,
        suggested_category=suggested_category,
    )

def irrelevant_image(
    photo_id: str,
    reason: str,
    confidence: float,
) -> IrrelevantImage:
    return IrrelevantImage(
        photo_id=photo_id,
        reason=reason,
        confidence=confidence,
    )

# --- System prompt for the agent ---
VISION_AGENT_SYSTEM_PROMPT = (
    "You are a computer-vision assistant for civic infrastructure. "
    "Analyze the image and respond with EXACTLY ONE function call according to these rules:\n"
    "1. If the image presents an ISSUE:\n"
    "   - Call the `report_issue` function EXACTLY ONCE\n"
    "   - Identify the MAIN issue in the image and focus only on that\n"
    "   - If the issue fits an existing category, use it in the 'category' field\n"
    "   - If it doesn't fit existing categories, provide a new suggested one-word category name in the 'suggested_category' field\n"
    "   - Include all details in a single comprehensive description\n"
    "   - Always provide a detailed explanation in the 'category_description' field\n"
    "2. If the image presents a WELL-MAINTAINED element:\n"
    "   - Call the `log_well_maintained` function EXACTLY ONCE\n"
    "   - Identify the MAIN element in the image and focus only on that\n"
    "   - If the element fits an existing category, use it in the 'category' field\n"
    "   - If it doesn't fit existing categories, provide a new suggested one-word category name in the 'suggested_category' field\n"
    "   - Include all details in a single comprehensive description\n"
    "   - Always provide a detailed explanation in the 'category_description' field\n"
    "3. If the image is not relevant to civic infrastructure, call the `irrelevant_image` function EXACTLY ONCE, providing 'reason' and 'confidence' fields.\n\n"
    "IMPORTANT: Make ONLY ONE function call per image, even if you see multiple issues. Focus on the most significant or prominent issue.\n\n"
    "For all categories, use general, reusable terms (like 'pothole', 'graffiti', 'bench', 'pedestrian_crossing'). "
    "Note: valid categories can be injected at runtime using get_issue_categories() or get_maintenance_categories()."
)

# --- Main entry point ---
def analyze_vision_image(image_url: str, user: dict, location: dict) -> Union[IssueReport, WellMaintainedReport, IrrelevantImage]:
    # Extract IDs and generate photo_id
    city_id = location["city"]
    user_id = user["id"]
    photo_id = str(uuid.uuid4())

    # --- Ensure user, city, and photo nodes exist and are connected ---
    city_node = search_node('City', 'city_id', city_id)
    if not city_node:
        city_node = add_city({
            'city_id': city_id,
            'name': city_id,
            'country': location.get('country'),
            'location': {
                'latitude': location.get('latitude'),
                'longitude': location.get('longitude')
            }
        })
    user_node = search_node('User', 'user_id', user_id)
    if not user_node:
        user_node = add_user({
            'user_id': user_id,
            'name': user.get('name', user_id)
        })
    # Always create a photo node (or check if exists if you want idempotency)
    add_photo({
        'photo_id': photo_id,
        'url': image_url,
        'created_at': datetime.now().isoformat(),
        'location': {
            'latitude': location.get('latitude'),
            'longitude': location.get('longitude')
        }
    })
    add_uploaded_photo({
        'user_id': user_id,
        'photo_id': photo_id,
        'uploadedAt': datetime.now().isoformat(),
        'device': 'api',
        'userNotes': ''
    })
    # --- End node creation logic ---

    messages = [
        {"role": "system", "content": VISION_AGENT_SYSTEM_PROMPT},
        {"role": "user", "content": f"city_id: {city_id}"},
        {"role": "user", "content": f"photo_id: {photo_id}"},
        {"role": "user", "content": "Please make EXACTLY ONE function call to report what you see."},
        {
            "role": "user",
            "content": [
                {
                    "type": "image_url",
                    "image_url": {
                        "url": image_url
                    }
                }
            ]
        },
    ]
    # Use instructor to call the correct function
    result = client.chat.completions.create(
        model="gpt-4o",
        tools=[report_issue_schema, log_well_maintained_schema, irrelevant_image_schema],
        messages=messages,
        response_model=Union[IssueReport, WellMaintainedReport, IrrelevantImage],
    )
    print()
    print()
    print()
    print()
    print("--------------------------------")
    print()
    print()
    print(result)
    print()
    # Call the appropriate handler from report_issue.py
    if isinstance(result, IssueReport):
        print("Running report_issue")
        data = result.dict()
        if not data.get("category") and data.get("suggested_category"):
            # Use the suggested_category as the category
            data["category"] = data["suggested_category"]
        return asyncio.run(run_iss_function(None, data))
    elif isinstance(result, WellMaintainedReport):
        print("Running log_well_maintained")
        return asyncio.run(run_mai_function(None, result.dict()))
    elif isinstance(result, IrrelevantImage):
        print("Running irrelevant_image")
        return asyncio.run(run_irrelevant_function(None, result.dict()))
    else:
        raise ValueError("Unknown result type from vision agent")

report_issue_schema = {
    "name": "report_issue",
    "description": "Report a new ISSUE detected in the civic infrastructure (problems, damage, disrepair, etc.)",
    "parameters": IssueReport.schema()
}

log_well_maintained_schema = {
    "name": "log_well_maintained",
    "description": "Log a WELL-MAINTAINED element in the civic infrastructure (good condition, properly functioning facilities, etc.)",
    "parameters": WellMaintainedReport.schema()
}

irrelevant_image_schema = {
    "name": "irrelevant_image",
    "description": "Indicate the image does not contain any relevant city issue or well-maintained element.",
    "parameters": IrrelevantImage.schema()
}
