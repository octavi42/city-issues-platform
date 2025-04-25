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
from db.crud.create_nodes import add_city, add_user, add_photo, add_detection_event, add_category
from db.crud.create_edges import add_in_category, add_triggers_event
from db.crud.read_nodes import search_node

def _load(name):
    nodes = read_nodes("Category")
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
    if not category_names:
        category_names = ["other"]
    
    # Set the enum values
    schema["properties"]["category"]["enum"] = category_names
    
    # Ensure category is not in the required fields
    if "required" in schema:
        if "category" in schema["required"]:
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
        # Add the event to the database
        event = add_detection_event({
            'event_id': uuid.uuid4().hex[:8],
            'reported_at': datetime.now().isoformat(),
            **event_props
        })

        event_id = event["event_id"]
        category_id = category_node["category_id"]
        
        add_in_category({
            'event_id': event_id,
            'category_id': category_id
        })

        # Add the photo to the event
        photo_id = params.get('photo_id')
        if not photo_id:
            print("Warning: Photo ID not provided, event created without photo link")
        
        add_triggers_event({
            'event_id': event_id,
            'photo_id': photo_id,
            'triggeredAt': datetime.now().isoformat()
        })


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
        # Get the category name
        category_name = params.get('category')
        
        # Check if category exists
        category_node = search_node("Category", "category_id", category_name)
        
        # If category doesn't exist, create it
        if not category_node:
            print(f"Creating new maintenance category: {category_name}")
            category_props = {
                "event_type": "maintenance",
                "category_id": category_name,
                "name": category_name,
                "description": params.get('category_description', f"Maintenance category: {category_name}")
            }
            category_node = add_category(category_props)
            print(f"New maintenance category created: {category_name}")
        
        # Create the maintenance event with all parameters
        event_props = {
            'type': 'maintenance',
            'description': params.get('description'),
            'inspected_at': datetime.now().isoformat(),
            'condition_score': params.get('condition_score', 10),
            'status': params.get('status', 'good'),
        }
        
        # Add the event to the database
        event = add_detection_event({
            'event_id': uuid.uuid4().hex[:8],
            'reported_at': datetime.now().isoformat(),
            **event_props
        })

        print()
        print("maintenance event")
        print(event)
        print()

        # Connect the event to the category - safely extract IDs
        try:
            # Try multiple access patterns for Neo4j nodes
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
                
            # Extract category ID safely
            if isinstance(category_node, dict):
                category_id = category_node.get("category_id")
            elif hasattr(category_node, "__getitem__"):
                category_id = category_node["category_id"]
            elif hasattr(category_node, "category_id"):
                category_id = category_node.category_id
            elif hasattr(category_node, "_properties"):
                category_id = category_node._properties.get("category_id")
            else:
                category_id = category_name
        except Exception as e:
            event_id = uuid.uuid4().hex[:8]
            category_id = category_name
            print(f"Warning: Error extracting IDs: {str(e)}, using fallbacks")
        
        # Connect event to category
        add_in_category({
            'event_id': event_id,
            'category_id': category_id
        })

        # Add the photo to the event
        photo_id = params.get('node_id')
        if not photo_id:
            print("Warning: Photo ID not provided, event created without photo link")
        else:
            try:
                # Handle element_id format if needed
                if ':' in photo_id and len(photo_id.split(':')) > 2:
                    print(f"Using element_id format: {photo_id}")
                
                # Try to create a direct CONTAINS relationship from event to photo
                # with a different relationship type than IN_CATEGORY
                try:
                    # Create a custom query
                    from db.neo4j import get_session
                    
                    with get_session() as session:
                        # Using direct Cypher query with explicit relationship type
                        query = """
                        MATCH (e:DetectionEvent {event_id: $event_id})
                        MATCH (p {element_id: $photo_id})
                        MERGE (e)-[:CONTAINS]->(p)
                        RETURN e, p
                        """
                        session.run(query, event_id=event_id, photo_id=photo_id)
                        print(f"Event {event_id} linked to photo {photo_id} using CONTAINS relationship")
                except Exception as db_e:
                    print(f"Direct query failed: {str(db_e)}, trying fallback...")
                    # Fallback to original method but with additional parameters
                    add_in_category({
                        'event_id': event_id,
                        'photo_id': photo_id,
                        'rel_type': 'CONTAINS'  # Try specifying relationship type
                    })
                    print(f"Event {event_id} linked to photo {photo_id} with fallback method")
            except Exception as photo_e:
                print(f"Warning: Failed to link event to photo: {str(photo_e)}")
                # Continue execution even if photo linking fails
        
        return {
            "status": "success",
            "message": f"Well-maintained element recorded in category '{category_name}'",
            "event_id": event_id,
            "category": category_name
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
        "3. If the image is not relevant to civic infrastructure, respond with plain text explaining that the image doesn't contain relevant content\n\n"
        "IMPORTANT: Make ONLY ONE function call per image, even if you see multiple issues. Focus on the most significant or prominent issue.\n\n"
        "For all categories, use general, reusable terms (like 'pothole', 'graffiti', 'bench', 'pedestrian_crossing'). "
        "Note: existing categories will be provided in the function schema, but the category field is optional."
    ),
    model="gpt-4.1-mini",
    model_settings=ModelSettings(temperature=0.2),
    tools=[report_issue_tool, log_wm_tool],
)