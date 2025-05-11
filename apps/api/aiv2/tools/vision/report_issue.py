"""
Moved from ai/openai/def_agents.py
"""
import json
import uuid
from datetime import datetime
from db.crud.create_nodes import add_issue, add_category, add_maintenance, add_node
from db.crud.create_edges import add_relationship
from db.crud.read_nodes import search_node

async def run_iss_function(ctx, args):
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

"""
Moved from ai/openai/def_agents.py: run_mai_function
"""
from db.crud.create_nodes import add_maintenance, add_node

async def run_mai_function(ctx, args):
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

"""
Moved from ai/openai/def_agents.py: run_irrelevant_function
"""
async def run_irrelevant_function(ctx, args):
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
