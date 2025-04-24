"""
Defines OpenAI function-calling specifications using schemas.
"""
import json
from pathlib import Path
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from db.crud.read_nodes import read_nodes

# Directory containing JSON schema files
_SCHEMA_DIR = Path(__file__).parents[1] / "schemas"

def issue() -> dict:
    """
    Specification for reporting a new issue via OpenAI function call.
    """
    category_nodes = read_nodes("Category")

    enum_values = [n["name"] for n in category_nodes] # if n.get("event_type") == "issue"

    schema_path = _SCHEMA_DIR / "issue.json"
    schema = json.loads(schema_path.read_text())
    schema["properties"]["category"]["enum"][:] = enum_values

    return {
        "name": "issue",
        "description": "Report a new issue detected in the environment.",
        "parameters": schema,
    }

def maintained() -> dict:
    """
    Specification for marking an issue as maintained via function call.
    """
    # Populate category enum values as in issue()
    category_nodes = read_nodes("Category")
    enum_values = [n.get("name") for n in category_nodes]

    schema_path = _SCHEMA_DIR / "maintained.json"
    spec = json.loads(schema_path.read_text())
    # Extract parameters schema
    parameters = spec.get("parameters", spec)
    # Update category enum if present
    props = parameters.get("properties", {})
    if "category" in props and "enum" in props["category"]:
        props["category"]["enum"] = enum_values

    return {
        "name": "maintained",
        "description": spec.get(
            "description", "Mark an existing issue as maintained via function call."
        ),
        "parameters": parameters,
    }