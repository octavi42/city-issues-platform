import instructor
from openai import OpenAI
from pydantic import BaseModel, Field, conint
from typing import Optional, Dict, Any
import json

# Patch the OpenAI client with instructor
client = instructor.from_openai(OpenAI())

# --- Pydantic model for relevance scoring output (matching relevance.json) ---
class RelevanceAnalysis(BaseModel):
    image_url: str = Field(..., description="URL of the image to assess")
    description: str = Field(..., description="Text description of the image content")
    current_score: float = Field(..., description="Current relevance score")
    node_details: Dict[str, Any] = Field(..., description="Existing node details relevant to the image")
    additional_info: str = Field(..., description="Extra textual information to consider")
    delta_score: conint(ge=-10, le=10) = Field(..., description="Adjustment to apply to current_score (positive or negative)")

# --- System prompt for the relevance analyzer agent ---
RELEVANCE_ANALYZER_SYSTEM_PROMPT = (
    "You are a relevance scoring assistant for civic infrastructure images. "
    "Given the following fields, analyze the relevance and return a structured output with ALL of these fields: "
    "1. image_url: the URL of the image to assess\n"
    "2. description: a text description of the image content\n"
    "3. current_score: the current relevance score (number)\n"
    "4. node_details: a dictionary of node details relevant to the image\n"
    "5. additional_info: extra textual information to consider\n"
    "6. delta_score: an integer between -10 and 10 (inclusive) representing the adjustment to apply to current_score (positive or negative)\n"
    "Return all fields in the output."
)

# --- Main entry point ---
def analyze_message(message: str) -> RelevanceAnalysis:
    # Accept either a JSON string or a dict
    if isinstance(message, str):
        try:
            data = json.loads(message)
        except Exception:
            raise ValueError("Input message must be a JSON string or dict matching the relevance schema.")
    else:
        data = message
    messages = [
        {"role": "system", "content": RELEVANCE_ANALYZER_SYSTEM_PROMPT},
        {"role": "user", "content": json.dumps(data)},
    ]
    result = client.chat.completions.create(
        model="gpt-4o",
        messages=messages,
        response_model=RelevanceAnalysis,
    )
    return result
