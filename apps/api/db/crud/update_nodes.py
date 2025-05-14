#!/usr/bin/env python3
"""
Utility functions to update existing nodes in Neo4j.
"""
from db.neo4j import get_session
import json
import os

def update_photo_relevance_score(photo_id: str, new_score: float) -> None:
    """
    Update the relevance_score property of a Photo node.

    :param photo_id: The unique identifier of the photo.
    :param new_score: The new relevance score to set.
    """
    session = get_session()
    with session as s:
        s.run(
            "MATCH (p:Photo {photo_id: $photo_id}) "
            "SET p.relevance_score = $new_score",
            photo_id=photo_id,
            new_score=new_score,
        )
    # return nothing

def delete_photo_and_event(photo_id: str) -> None:
    """
    Delete a Photo node and its linked Issue or Maintenance event.
    """
    session = get_session()
    with session as s:
        # Delete linked Issue event if exists
        s.run(
            "MATCH (p:Photo {photo_id: $photo_id})-[:TRIGGERS_EVENT]->(e:Issue) "
            "DETACH DELETE e",
            photo_id=photo_id,
        )
        # Delete linked Maintenance event if exists
        s.run(
            "MATCH (p:Photo {photo_id: $photo_id})-[:CONTAINS]->(e:Maintenance) "
            "DETACH DELETE e",
            photo_id=photo_id,
        )
        # Delete the Photo node itself
        s.run(
            "MATCH (p:Photo {photo_id: $photo_id}) DETACH DELETE p",
            photo_id=photo_id,
        )

def export_high_score(photo_id: str) -> dict:
    """
    Export the photo URL and linked event properties to a JSONL file when relevance score exceeds threshold.
    Only photo_id is needed; the photo's URL and connected Issue or Maintenance node are looked up internally.
    """
    session = get_session()
    # Fetch photo with URL
    with session as s:
        rec = s.run(
            "MATCH (p:Photo {photo_id: $photo_id}) RETURN p",
            photo_id=photo_id,
        ).single()
        if not rec:
            return
        photo_node = rec["p"]
        image_url = photo_node.get("url")
        # Try linked Issue
        rec2 = s.run(
            "MATCH (p:Photo {photo_id: $photo_id})-[:TRIGGERS_EVENT]->(e:Issue) RETURN e",
            photo_id=photo_id,
        ).single()
        if rec2:
            event_node = rec2["e"]
            event_type = "issue"
        else:
            # Fallback to Maintenance
            rec3 = s.run(
                "MATCH (p:Photo {photo_id: $photo_id})-[:CONTAINS]->(e:Maintenance) RETURN e",
                photo_id=photo_id,
            ).single()
            if rec3:
                event_node = rec3["e"]
                event_type = "maintenance"
            else:
                return
    # Prepare event properties as dict
    try:
        event_props = dict(event_node)
    except Exception:
        event_props = {k: event_node.get(k) for k in getattr(event_node, 'keys', lambda: [])()}
    # Determine the tool name based on event type
    tool_name = "report_issue" if event_type == "issue" else "log_well_maintained"
    # Construct fine-tuning record
    record = {
        "prompt": image_url,
        "image_url": image_url,
        "tool": tool_name,
        "content": event_props,
    }
    # Write to JSONL file under ai/data/fine_tuning
    finedir = os.path.join(os.getcwd(), "ai", "data", "fine_tuning")
    try:
        os.makedirs(finedir, exist_ok=True)
        out_path = os.path.join(finedir, "high_scores.jsonl")
        with open(out_path, "a") as fout:
            fout.write(json.dumps(record) + "\n")
    except Exception:
        # Skip file write errors but proceed to return the record
        pass
    return record

def get_photo_and_event(photo_id: str):
    """
    Fetch the photo node and its connected Issue or Maintenance node.
    Returns a tuple: (photo_dict, event_dict, event_type) or (None, None, None) if not found.
    """
    session = get_session()
    with session as s:
        rec = s.run(
            "MATCH (p:Photo {photo_id: $photo_id}) RETURN p",
            photo_id=photo_id,
        ).single()
        if not rec:
            return None, None, None
        photo_node = rec["p"]
        # Try linked Issue
        rec2 = s.run(
            "MATCH (p:Photo {photo_id: $photo_id})-[:TRIGGERS_EVENT]->(e:Issue) RETURN e",
            photo_id=photo_id,
        ).single()
        if rec2:
            event_node = rec2["e"]
            event_type = "issue"
        else:
            # Fallback to Maintenance
            rec3 = s.run(
                "MATCH (p:Photo {photo_id: $photo_id})-[:CONTAINS]->(e:Maintenance) RETURN e",
                photo_id=photo_id,
            ).single()
            if rec3:
                event_node = rec3["e"]
                event_type = "maintenance"
            else:
                return dict(photo_node), None, None
    print(f"photo_node: {photo_node}")
    print(f"event_node: {event_node}")
    print(f"event_type: {event_type}")
    return dict(photo_node), dict(event_node), event_type