"""
City vision inspector agent definition.
"""
try:
    from agents import Agent, ModelSettings, RunContextWrapper
    from agents.tool import FunctionTool
except ImportError:
    raise ImportError("agents and agents.tool libraries are required for Agent, ModelSettings, and FunctionTool")
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
from db.crud.create_nodes import add_city, add_user, add_photo, add_detection_event

def _load(name):
    nodes = read_nodes("Category")
    schema = json.loads((_SCHEMA_DIR/name).read_text())
    # Get all categories including "other" option
    category_names = [n["name"] for n in nodes]
    if "other" not in category_names:
        category_names.append("other")
    schema["properties"]["category"]["enum"] = category_names
    return schema


async def run_function(ctx: RunContextWrapper, args):
    """
    Generic FunctionTool callback.
    - ctx.context   is your user-defined context object (if any).
    - ctx.usage     is the OpenAI usage so far (tokens, etc).
    - args          is the dict of parameters the LLM passed.
    """

    # 1. Access your own context (passed to Runner.run)
    user_ctx = ctx.context
    print("User context object:", user_ctx)

    # 2. Inspect usage metrics if you want
    print("Tokens used so far:", ctx.usage)

    # 3. Normalize args to a dict
    if isinstance(args, str):
        try:
            params = json.loads(args)
        except json.JSONDecodeError:
            params = {}
    else:
        params = args or {}

    # 4. If you want the tool name, the SDK wraps it on the FunctionTool itself.
    #    ctx doesn’t directly carry the tool, but you can capture it via closure:
    #    e.g. `on_invoke_tool=lambda c,a,tool=tool: run_function(c,a,tool)`
    #    or use a decorator to pass it in. For a quick debug, assume run_function is bound:
    tool_name = getattr(ctx, 'tool_name', '<unknown>')
    print(f"Invoked tool: {tool_name}")

    # 5. Now you have all the parameters — log or process them:
    print("Function arguments:")
    for k, v in params.items():
        print(f"  • {k}: {v!r}")

    # 6. Return whatever you need; can be dict or string
    return {"status": "ok", "received": params}


report_issue_tool = FunctionTool(
    name="report_issue",
    description="Processes extracted user data",
    params_json_schema=_load("issue.json"),
    on_invoke_tool=run_function,
    strict_json_schema=True,
)

log_wm_tool = FunctionTool(
    name="log_well_maintained",
    description="Processes extracted user data",
    params_json_schema=_load("maintained.json"),
    on_invoke_tool=run_function,
    strict_json_schema=True,
)


# Define the City-Vision-Inspector agent
city_inspector = Agent(
    name="City-Vision-Inspector",
    instructions=(
        "You are a computer-vision assistant for civic infrastructure. "
        "Analyze the image and categorize it according to these rules:\n"
        "1. If the image shows a known ISSUE, call `report_issue` with the appropriate category.\n"
        "2. If it shows a WELL-MAINTAINED element, call `log_well_maintained` with the appropriate category.\n"
        "3. If it doesn't fit any existing category:\n"
        "   - Call the appropriate function based on whether it's an issue or well-maintained element\n"
        "   - Set category to \"other\"\n"
        "   - Fill in the suggested_category field with your specific suggestion for a new category\n"
        "   - Provide a detailed description explaining what you see and why it needs a new category"
    ),
    model="gpt-4.1-nano",
    model_settings=ModelSettings(temperature=0.2),
    tools=[report_issue_tool, log_wm_tool],
)