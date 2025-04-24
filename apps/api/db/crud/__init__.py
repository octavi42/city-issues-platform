"""
Utility functions for interacting with the Neo4j database.
"""
from db.neo4j import get_session
from db.crud.create_nodes import (
    add_node, add_city, add_detection_event, add_photo, add_analyzer,
    add_category, add_department, add_solution, add_user
)
from db.crud.create_edges import (
    add_relationship, add_uploaded_photo, add_captured_in, add_analyzed,
    add_triggers_event, add_in_category, add_handled_by,
    add_operates_in, add_has_solution, add_proposed_by
)
from db.crud.read_nodes import read_nodes

__all__ = [
    "get_session",
    "add_node", "add_city", "add_detection_event", "add_photo", "add_analyzer",
    "add_category", "add_department", "add_solution", "add_user",
    "add_relationship", "add_uploaded_photo", "add_captured_in", "add_analyzed",
    "add_triggers_event", "add_in_category", "add_handled_by",
    "add_operates_in", "add_has_solution", "add_proposed_by",
    "read_nodes"
]