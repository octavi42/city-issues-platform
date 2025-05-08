"""
Defines OpenAI function-calling specifications using schemas.
"""
import json
from pathlib import Path
import sys
import os
"""
Defines OpenAI function-calling specifications using JSON schemas.
"""
import json
from pathlib import Path

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from db.crud.read_nodes import read_nodes

# Directory containing JSON schema files
_SCHEMA_DIR = Path(__file__).parents[1] / "schemas"

def issue() -> dict:
    """
    Return function-calling spec to report a new issue.
    """
    nodes = read_nodes("Category")
    schema_path = _SCHEMA_DIR / "issue.json"
    schema = json.loads(schema_path.read_text())
    # Restrict category enum to 'issue' event type
    if "properties" in schema and "category" in schema["properties"]:
        category_names = [n.get("name") for n in nodes if n.get("event_type") == "issue"]
        # Add "other" category for issues that don't fit existing categories
        if "other" not in category_names:
            category_names.append("other")
        schema["properties"]["category"]["enum"] = category_names
    # Disallow unspecified properties
    schema["additionalProperties"] = False
    return {
        "name": "report_issue",
        "description": schema.get(
            "description", "Report a new issue detected in the environment."
        ),
        "parameters": schema,
    }

def maintained() -> dict:
    """
    Return function-calling spec to log a well-maintained element.
    """
    nodes = read_nodes("Category")
    schema_path = _SCHEMA_DIR / "maintained.json"
    spec = json.loads(schema_path.read_text())
    # Extract parameters object
    params = spec.get("parameters", {})
    if "properties" in params and "category" in params["properties"]:
        category_names = [n.get("name") for n in nodes if n.get("event_type") == "maintenance"]
        # Add "other" category for well-maintained elements that don't fit existing categories
        if "other" not in category_names:
            category_names.append("other")
        params["properties"]["category"]["enum"] = category_names
    # Disallow unspecified properties
    params["additionalProperties"] = False
    return {
        "name": spec.get("name", "log_well_maintained"),
        "description": spec.get(
            "description", "Record a WELL-MAINTAINED element for QA metrics"
        ),
        "parameters": params,
    }
  
def irrelevant() -> dict:
    """
    Return function-calling spec for images irrelevant to city issues or well-maintained elements.
    """
    schema_path = _SCHEMA_DIR / "irrelevant.json"
    schema = json.loads(schema_path.read_text())
    return {
        "name": "irrelevant_image",
        "description": schema.get("description", "Indicate the image is irrelevant to the domain."),
        "parameters": schema,
    }



# def issue() -> dict:
#     """
#     Specification for reporting a new issue via OpenAI function call.
#     """
#     category_nodes = read_nodes("Category")

#     enum_values = [n["name"] for n in category_nodes] # if n.get("event_type") == "issue"

#     schema_path = _SCHEMA_DIR / "issue.json"
#     schema = json.loads(schema_path.read_text())
#     schema["properties"]["category"]["enum"][:] = enum_values

#     return {
#         "name": "issue",
#         "description": "Report a new issue detected in the environment.",
#         "parameters": schema,
#     }

# def maintained() -> dict:
#     """
#     Specification for marking an issue as maintained via function call.
#     """
#     # Populate category enum values as in issue()
#     category_nodes = read_nodes("Category")
#     enum_values = [n.get("name") for n in category_nodes]

#     schema_path = _SCHEMA_DIR / "maintained.json"
#     spec = json.loads(schema_path.read_text())
#     # Extract parameters schema
#     parameters = spec.get("parameters", spec)
#     # Update category enum if present
#     props = parameters.get("properties", {})
#     if "category" in props and "enum" in props["category"]:
#         props["category"]["enum"] = enum_values

#     return {
#         "name": "maintained",
#         "description": "Mark an existing issue as maintained via function call.",
#         "parameters": parameters,
#     }