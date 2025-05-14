import instructor
from openai import OpenAI
from pydantic import BaseModel, Field, conint
from typing import Optional, Dict, Any
import json

# Patch the OpenAI client with instructor
client = instructor.from_openai(OpenAI())

# --- Pydantic model for relevance scoring output (matching relevance.json) ---
class RelevanceAnalysis(BaseModel):
    reason: str = Field(..., description="Explanation for the score adjustment")
    additional_info: str = Field(..., description="Extra textual information to consider")
    delta_score: conint(ge=-10, le=10) = Field(..., description="Adjustment to apply to current_score (positive or negative)")
    confidence: float = Field(..., ge=0, le=1, description="Confidence in the delta_score (0 to 1)")

# --- System prompt for the relevance analyzer agent ---
RELEVANCE_ANALYZER_SYSTEM_PROMPT = (
    "You are a relevance scoring assistant for civic infrastructure images. "
    "Given the following fields, analyze the relevance and return a structured output with ALL of these fields: "
    "1. reason: explanation for the score adjustment (string)\n"
    "2. additional_info: extra textual information to consider (string)\n"
    "3. delta_score: an integer between -10 and 10 (inclusive) representing the adjustment to apply to current_score (positive or negative)\n"
    "4. confidence: a float between 0 and 1 representing your confidence in the delta_score\n"
    "Return all fields in the output."
)

# --- Main entry point ---
def analyze_message(message: dict) -> RelevanceAnalysis:
    # Accepts a dict with keys photo, event, event_type
    if not isinstance(message, dict):
        raise ValueError("Input message must be a dict with keys 'photo', 'event', and 'event_type'.")
    photo = message.get("photo", {})
    event = message.get("event", {})
    event_type = message.get("event_type", "")
    structured = {
        "image_url": photo.get("url", ""),
        "description": event.get("description", ""),
        "current_score": photo.get("score", 0),
        "node_details": event,
        "additional_info": f"event_type: {event_type}"
    }
    messages = [
        {"role": "system", "content": RELEVANCE_ANALYZER_SYSTEM_PROMPT},
        {"role": "user", "content": json.dumps(structured)},
    ]
    result = client.chat.completions.create(
        model="gpt-4o",
        messages=messages,
        response_model=RelevanceAnalysis,
    )
    return result
