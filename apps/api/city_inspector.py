"""
City vision inspector agent definition.
"""
try:
    from agents import Agent, ModelSettings
    from agents.tool import FunctionTool
except ImportError:
    raise ImportError("agents and agents.tool libraries are required for Agent, ModelSettings, and FunctionTool")
import sys
import os
import json
from pathlib import Path

# Directory containing JSON schema files
_SCHEMA_DIR = Path(__file__).parents[1] / "schemas"

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from db.crud.read_nodes import read_nodes

def _load(name, etype):
    nodes = read_nodes("Category")
    schema = json.loads((_SCHEMA_DIR/name).read_text())
    # Filter by event_type if needed
    filtered_nodes = [n for n in nodes if n.get("event_type") == etype] if etype else nodes
    # Get all categories including "other" option
    category_names = [n["name"] for n in filtered_nodes]
    if "other" not in category_names:
        category_names.append("other")
    schema["properties"]["category"]["enum"] = category_names
    return schema

async def run_function(function_name, function_args):
    """
    Function to run when the tool is invoked.
    This function will be called with the function name and arguments.
    """
    # Here you would implement the logic to handle the function call
    # For example, you could log the function call or perform some action
    print(f"Function {function_name} called with arguments: {function_args}")
    
    # Return a string instead of a dict to avoid hashability issues
    return f"Successfully processed {function_name} with arguments: {function_args}"

report_issue_tool = FunctionTool(
    name="report_issue",
    description="Processes extracted user data",
    params_json_schema=_load("issue.json","issue"),
    on_invoke_tool=run_function,
)

log_wm_tool = FunctionTool(
    name="log_well_maintained",
    description="Processes extracted user data",
    params_json_schema=_load("maintained.json","maintenance"),
    on_invoke_tool=run_function,
)


# Define the City-Vision-Inspector agent
city_inspector = Agent(
    name="City-Vision-Inspector",
    instructions=(
        "You are a computer-vision assistant for civic infrastructure. "
        "If the image shows an ISSUE, call the 'report_issue' function. "
        "If it shows a WELL-MAINTAINED element, call the 'log_well_maintained' function. "
        "If neither applies, respond with plain text explaining why."
    ),
    model="gpt-4.1-mini",
    model_settings=ModelSettings(temperature=0.2),
    tools=[report_issue_tool, log_wm_tool],
)

