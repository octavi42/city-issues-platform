"""
City vision inspector agent definition.
"""
try:
    from agents import Agent, ModelSettings, RunContextWrapper
    from agents.tool import FunctionTool
except ImportError:
    # Fallback stubs for environments without the agents package
    class Agent:
        def __init__(self, *args, **kwargs):
            pass
    class ModelSettings:
        def __init__(self, *args, **kwargs):
            pass
    class RunContextWrapper:
        pass
    class FunctionTool:
        def __init__(self, *args, **kwargs):
            pass
import sys
import os
import json
import uuid
from datetime import datetime
from pathlib import Path

# Directory containing JSON schema files
_SCHEMA_DIR = Path(__file__).parents[1] / "schemas"

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from db.crud.read_nodes import read_nodes
from db.crud.create_nodes import add_city, add_user, add_photo, add_issue, add_maintenance, add_category, add_node
from db.crud.create_edges import add_relationship
from db.crud.read_nodes import search_node

def _load(name):
    # Read existing categories, default to empty list if unavailable
    nodes = read_nodes("Category") or []
    schema = json.loads((_SCHEMA_DIR/name).read_text())
    
    # Determine event type based on schema name
    event_type = "issue" if name == "issue.json" else "maintenance"
    
    # Get category names from nodes filtered by correct event type
    category_names = []
    for node in nodes:
        if node.get("event_type") == event_type:
            if "name" in node:
                category_names.append(node["name"])
            elif "category_id" in node:
                category_names.append(node["category_id"])
    
    # Make sure the enum always has at least one value to satisfy validation
    # if not category_names:
    #     category_names = ["other"]
    
    # Set the enum values if the schema defines a category property
    if "properties" in schema and "category" in schema["properties"]:
        schema["properties"]["category"]["enum"] = category_names
    # Ensure category is not in the required fields
    if "required" in schema and "category" in schema.get("required", []):
        schema["required"].remove("category")
    
    return schema


async def run_iss_function(ctx: RunContextWrapper, args):
    """
    Handle 'report_issue' tool: Create and store an issue in Neo4j.
    If the category doesn't exist, it will create a new category node.
    """
    # Normalize input to dict
    if isinstance(args, str):
        try:
            params = json.loads(args)
        except Exception:
            params = {}
    else:
        params = args or {}

    # Log arguments
    print("report_issue called with:")
    for k, v in params.items():
        print(f"  • {k}: {v}")
    
    try:
        print("Processing issue report...")
        # Get the category name
        category_name = params.get('category')
        
        # Check if category exists
        category_node = search_node("Category", "category_id", category_name)
        
        # If category doesn't exist, create it
        if not category_node:
            print(f"Creating new category: {category_name}")
            category_props = {
                "event_type": "issue",
                "category_id": category_name,
                "name": category_name,
                "description": params.get('category_description', f"Issue category: {category_name}")
            }
            category_node = add_category(category_props)
            print(f"New category created: {category_name}")

        
        # Create the issue event with all parameters
        event_props = {
            'type': 'issue',
            'name': params.get('name'),
            'description': params.get('description'),
            'inspected_at': datetime.now().isoformat(),
            'severity': params.get('severity'),
            'severity_score': params.get('severity_score'),
            'status': params.get('status'),
        }
        # Create the Issue event in the database
        event = add_issue({
            'event_id': uuid.uuid4().hex[:8],
            'reported_at': datetime.now().isoformat(),
            **event_props
        })

        event_id = event["event_id"]
        category_id = category_node["category_id"]
        
        # Link Issue to its Category
        add_relationship(
            "Issue", "event_id", event_id,
            "IN_CATEGORY",
            "Category", "category_id", category_id
        )

        # Link Photo to Issue if provided
        photo_id = params.get('photo_id')
        if not photo_id:
            print("Warning: Photo ID not provided, Issue created without photo link")
        else:
            add_relationship(
                "Photo", "photo_id", photo_id,
                "TRIGGERS_EVENT",
                "Issue", "event_id", event_id,
                {"triggeredAt": datetime.now().isoformat()}
            )
        
        # Link Issue to its City if provided
        city_id = params.get('city_id')
        if city_id:
            add_relationship(
                "Issue", "event_id", event_id,
                "IN_CITY",
                "City", "city_id", city_id
            )
        else:
            print("Warning: city_id not provided, Issue created without city link")


        # # Create detection event with all parameters
        # event_props = {
        #     'id': params.get('event_id'),
        #     'node_id': params.get('node_id'),
        #     'type': 'issue',
        #     'description': params.get('description'),
        #     'inspected_at': params.get('inspected_at'),
        #     'severity': params.get('severity'),
        #     'severity_score': params.get('severity_score'),
        #     'reported_at': params.get('reported_at'),
        #     'status': params.get('status'),
        #     'category': category_name,
        #     'category_description': params.get('category_description')
        # }
        
        # # Add the event to the database
        # result = add_detection_event(event_props)
        # print(f"Detection event added: {result}")
        
        # # Link event to category
        # add_in_category({
        #     'event_id': params.get('event_id'),
        #     'category_id': category_name
        # })
        
        return {
            "status": "success"
        }
        
    except Exception as e:
        import traceback
        print(f"Error processing issue: {str(e)}")
        print(traceback.format_exc())
        return {
            "status": "error",
            "message": f"Failed to process issue: {str(e)}",
            "received": params
        }


async def run_mai_function(ctx: RunContextWrapper, args):
    """
    Handle 'log_well_maintained' tool: Create and store a maintenance record in Neo4j.
    If the category doesn't exist, it will create a new category node.
    """
    # Normalize input to dict
    if isinstance(args, str):
        try:
            params = json.loads(args)
        except Exception:
            params = {}
    else:
        params = args or {}

    # Log arguments
    print("log_well_maintained called with:")
    for k, v in params.items():
        print(f"  • {k}: {v}")
    
    try:
        print("Processing maintenance report...")
        # Maintenance records no longer include categories
        
        # Create the maintenance event with all parameters
        event_props = {
            'type': 'maintenance',
            'description': params.get('description'),
            'inspected_at': datetime.now().isoformat(),
            'condition_score': params.get('condition_score', 10),
            'status': params.get('status', 'good'),
        }
        
        # Create the Maintenance event in the database
        event = add_maintenance({
            'event_id': uuid.uuid4().hex[:8],
            'reported_at': datetime.now().isoformat(),
            **event_props
        })

        print()
        print("maintenance event")
        print(event)
        print()

        # Extract event_id safely
        try:
            if isinstance(event, dict):
                event_id = event.get("event_id")
            elif hasattr(event, "__getitem__"):
                event_id = event["event_id"]
            elif hasattr(event, "event_id"):
                event_id = event.event_id
            elif hasattr(event, "_properties"):
                event_id = event._properties.get("event_id")
            elif hasattr(event, "id"):
                event_id = event.id
            else:
                event_id = uuid.uuid4().hex[:8]
                print(f"Warning: Could not extract event_id, using generated ID: {event_id}")
        except Exception as e:
            event_id = uuid.uuid4().hex[:8]
            print(f"Warning: Error extracting event_id: {str(e)}, using fallback")
        # Maintenance records are not linked to categories
        
        # Link Maintenance to its City if provided
        city_id = params.get('city_id')
        if city_id:
            add_relationship(
                "Maintenance", "event_id", event_id,
                "IN_CITY",
                "City", "city_id", city_id
            )
        else:
            print("Warning: city_id not provided, Maintenance created without city link")

        # Link Photo to Maintenance if provided (use photo_id, not node_id)
        photo_id = params.get('photo_id')
        if not photo_id:
            print("Warning: Photo ID not provided, Maintenance created without photo link")
        else:
            add_relationship(
                "Photo", "photo_id", photo_id,
                "CONTAINS",
                "Maintenance", "event_id", event_id
            )
        
        return {
            "status": "success",
            "message": "Well-maintained element recorded",
            "event_id": event_id
        }
        
    except Exception as e:
        import traceback
        print(f"Error processing maintenance record: {str(e)}")
        print(traceback.format_exc())
        return {
            "status": "error",
            "message": f"Failed to process maintenance record: {str(e)}",
            "received": params
        }


report_issue_tool = FunctionTool(
    name="report_issue",
    description="Report a new ISSUE detected in the civic infrastructure (problems, damage, disrepair, etc.)",
    params_json_schema=_load("issue.json"),
    on_invoke_tool=run_iss_function,
    strict_json_schema=False,  # Allow flexibility with the schema
)

log_wm_tool = FunctionTool(
    name="log_well_maintained",
    description="Log a WELL-MAINTAINED element in the civic infrastructure (good condition, properly functioning facilities, etc.)",
    params_json_schema=_load("maintained.json"),
    on_invoke_tool=run_mai_function,
    strict_json_schema=False,  # Allow flexibility with the schema
)
 
# Function tool for irrelevant images
async def run_irrelevant_function(ctx: RunContextWrapper, args):
    """
    Handle 'irrelevant_image' tool: acknowledge image irrelevance.
    Returns the provided reason and confidence.
    """
    # Parse arguments
    if isinstance(args, str):
        try:
            params = json.loads(args)
        except Exception:
            params = {}
    else:
        params = args or {}
    # Extract parameters
    photo_id = params.get("photo_id")
    reason = params.get("reason")
    confidence = params.get("confidence")
    # Create an Irrelevant node
    try:
        irrelevant_id = uuid.uuid4().hex
        props = {
            "irrelevant_id": irrelevant_id,
            "reason": reason,
            "confidence": confidence
        }
        irrelevant_node = add_node("Irrelevant", "irrelevant_id", props)
        # Link Photo to Irrelevant node
        add_relationship(
            "Photo", "photo_id", photo_id,
            "MARKED_IRRELEVANT",
            "Irrelevant", "irrelevant_id", irrelevant_id
        )
    except Exception:
        # Ignore DB errors
        pass
    # Return structured response
    return {"irrelevant_id": irrelevant_id, "photo_id": photo_id, "reason": reason, "confidence": confidence}

irrelevant_tool = FunctionTool(
    name="irrelevant_image",
    description="Indicate the image does not contain any relevant city issue or well-maintained element.",
    params_json_schema=_load("irrelevant.json"),
    on_invoke_tool=run_irrelevant_function,
    strict_json_schema=False,
)


# Define the City-Vision-Inspector agent
city_inspector = Agent(
    name="City-Vision-Inspector",
    instructions=(
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
        "Note: existing categories will be provided in the function schema, but the category field is optional."
    ),
    model="gpt-4.1-mini",
    model_settings=ModelSettings(temperature=0.2),
    tools=[report_issue_tool, log_wm_tool, irrelevant_tool],
)
   
# Relevance scoring tool for image-context match
REL_SCHEMA = json.loads((_SCHEMA_DIR / "relevance.json").read_text())

async def run_relevance_function(ctx: RunContextWrapper, args):
    # Normalize input to dict
    if isinstance(args, str):
        try:
            params = json.loads(args)
        except Exception:
            params = {}
    else:
        params = args or {}

    # Extract the delta score from the model's output
    delta = params.get('delta_score')
    return { 'delta_score': delta }

adjust_relevance_tool = FunctionTool(
    name="adjust_relevance_score",
    description="Compute an integer delta to adjust the relevance score based on photo data and user feedback accuracy",
    params_json_schema=REL_SCHEMA,
    on_invoke_tool=run_relevance_function,
    strict_json_schema=False,
)

relevance_scorer = Agent(
    name="RelevanceScorer",
    instructions=(
        "You are an assistant that adjusts an image's relevance score based on how relevant and accurate the user's feedback (additional_info) is to the image and its existing description. "
        "You will receive a JSON object with these fields: 'image_url' (the image link), 'description' (the current image description), "
        "'current_score' (the current relevance score), 'node_details' (the photo node metadata), and 'additional_info' (user feedback about the description). "
        "Evaluate the feedback: if it accurately reflects and enhances the image content, apply a positive delta; "
        "if it contradicts or is inaccurate, apply a negative delta; "
        "if it is irrelevant or off-topic, apply a delta of 0 (no change). "
        "Choose an integer 'delta_score' between -10 and 10 inclusive. "
        "Return EXACTLY ONE function call to 'adjust_relevance_score' including all required parameters: image_url, description, current_score, node_details, additional_info, and delta_score."
    ),
    model="gpt-4.1-mini",
    model_settings=ModelSettings(temperature=0.2),
    tools=[adjust_relevance_tool],
)