#!/usr/bin/env python3
"""
CLI tool to create Neo4j relationships via db.crud.

Usage:
  create_edges.py <rel_type> <properties_json_or_file>
"""
import argparse
import json
import sys

import db.crud as crud

def add_relationship(
    start_label: str,
    start_id_prop: str,
    start_id: str,
    rel_type: str,
    end_label: str,
    end_id_prop: str,
    end_id: str,
    props: dict = None,
) -> dict:
    """
    Create or update a relationship of given type between two existing nodes.

    :param start_label: Label of the start node.
    :param start_id_prop: Identifier property name for the start node.
    :param start_id: Identifier value for the start node.
    :param rel_type: Type/name of the relationship.
    :param end_label: Label of the end node.
    :param end_id_prop: Identifier property name for the end node.
    :param end_id: Identifier value for the end node.
    :param props: Optional dict of relationship properties.
    :return: The created or updated relationship, or None if nodes not found.
    """
    parameters = {
        f"start_{start_id_prop}": start_id,
        f"end_{end_id_prop}": end_id,
    }
    set_clauses = []
    if props:
        for key, val in props.items():
            set_clauses.append(f"r.{key} = ${key}")
            parameters[key] = val
    query = [
        f"MATCH (a:{start_label} {{{start_id_prop}: $start_{start_id_prop}}}),",
        f"      (b:{end_label} {{{end_id_prop}: $end_{end_id_prop}}})",
        f"MERGE (a)-[r:{rel_type}]->(b)",
    ]
    if set_clauses:
        query.append("SET " + ", ".join(set_clauses))
    query.append("RETURN r")
    query_str = "\n".join(query)
    session = crud.get_session()
    with session as s:
        result = s.run(query_str, **parameters)
        record = result.single()
        return record.get("r") if record else None

def add_uploaded_photo(props: dict) -> dict:
    required = ["user_id", "photo_id", "uploadedAt", "device", "userNotes"]
    for key in required:
        if key not in props:
            raise ValueError(f"Property '{key}' is required for UPLOADED_PHOTO relationship")
    rel_props = {k: props[k] for k in ["uploadedAt", "device", "userNotes"]}
    return add_relationship(
        "User", "user_id", props["user_id"],
        "UPLOADED_PHOTO",
        "Photo", "photo_id", props["photo_id"],
        rel_props
    )

def add_captured_in(props: dict) -> dict:
    required = ["photo_id", "city_id"]
    for key in required:
        if key not in props:
            raise ValueError(f"Property '{key}' is required for CAPTURED_IN relationship")
    return add_relationship(
        "Photo", "photo_id", props["photo_id"],
        "CAPTURED_IN",
        "City", "city_id", props["city_id"],
        None
    )

def add_analyzed(props: dict) -> dict:
    required = ["analyzer_id", "photo_id", "notes", "method", "confidence", "reasoning", "analyzedAt"]
    for key in required:
        if key not in props:
            raise ValueError(f"Property '{key}' is required for ANALYZED relationship")
    rel_props = {k: props[k] for k in ["notes", "method", "confidence", "reasoning", "analyzedAt"]}
    return add_relationship(
        "Analyzer", "analyzer_id", props["analyzer_id"],
        "ANALYZED",
        "Photo", "photo_id", props["photo_id"],
        rel_props
    )

def add_triggers_event(props: dict) -> dict:
    required = ["photo_id", "event_id", "triggeredAt"]
    for key in required:
        if key not in props:
            raise ValueError(f"Property '{key}' is required for TRIGGERS_EVENT relationship")
    rel_props = {"triggeredAt": props["triggeredAt"]}
    return add_relationship(
        "Photo", "photo_id", props["photo_id"],
        "TRIGGERS_EVENT",
        "DetectionEvent", "event_id", props["event_id"],
        rel_props
    )

def add_in_category(props: dict) -> dict:
    required = ["event_id", "category_id"]
    for key in required:
        if key not in props:
            raise ValueError(f"Property '{key}' is required for IN_CATEGORY relationship")
    return add_relationship(
        "DetectionEvent", "event_id", props["event_id"],
        "IN_CATEGORY",
        "Category", "category_id", props["category_id"],
        None
    )

def add_handled_by(props: dict) -> dict:
    required = ["category_id", "department_id"]
    for key in required:
        if key not in props:
            raise ValueError(f"Property '{key}' is required for HANDLED_BY relationship")
    return add_relationship(
        "Category", "category_id", props["category_id"],
        "HANDLED_BY",
        "Department", "department_id", props["department_id"],
        None
    )

def add_operates_in(props: dict) -> dict:
    required = ["department_id", "city_id"]
    for key in required:
        if key not in props:
            raise ValueError(f"Property '{key}' is required for OPERATES_IN relationship")
    return add_relationship(
        "Department", "department_id", props["department_id"],
        "OPERATES_IN",
        "City", "city_id", props["city_id"],
        None
    )

def add_has_solution(props: dict) -> dict:
    required = ["event_id", "solution_id", "proposedAt", "rank"]
    for key in required:
        if key not in props:
            raise ValueError(f"Property '{key}' is required for HAS_SOLUTION relationship")
    rel_props = {k: props[k] for k in ["proposedAt", "rank"]}
    return add_relationship(
        "DetectionEvent", "event_id", props["event_id"],
        "HAS_SOLUTION",
        "Solution", "solution_id", props["solution_id"],
        rel_props
    )

def add_proposed_by(props: dict) -> dict:
    required = ["solution_id", "user_id", "proposedAt"]
    for key in required:
        if key not in props:
            raise ValueError(f"Property '{key}' is required for PROPOSED_BY relationship")
    rel_props = {"proposedAt": props["proposedAt"]}
    return add_relationship(
        "Solution", "solution_id", props["solution_id"],
        "PROPOSED_BY",
        "User", "user_id", props["user_id"],
        rel_props
    )

_FUNCTIONS = {
    'uploaded_photo': add_uploaded_photo,
    'captured_in': add_captured_in,
    'analyzed': add_analyzed,
    'triggers_event': add_triggers_event,
    'in_category': add_in_category,
    'handled_by': add_handled_by,
    'operates_in': add_operates_in,
    'has_solution': add_has_solution,
    'proposed_by': add_proposed_by,
}

def load_props(arg: str) -> dict:
    """
    Load JSON properties from a string or file path.
    """
    try:
        return json.loads(arg)
    except json.JSONDecodeError:
        try:
            with open(arg, 'r') as f:
                return json.load(f)
        except Exception as e:
            print(f"Error loading properties: {e}", file=sys.stderr)
            sys.exit(1)

def main():
    parser = argparse.ArgumentParser(
        description='Create a Neo4j relationship of the given type.'
    )
    parser.add_argument(
        'rel_type', choices=_FUNCTIONS.keys(),
        help='Type of relationship to create'
    )
    parser.add_argument(
        'props',
        help='JSON string or path to JSON file with relationship properties'
    )
    args = parser.parse_args()

    props = load_props(args.props)
    creator = _FUNCTIONS[args.rel_type]
    rel = creator(props)
    print(rel)

if __name__ == '__main__':
    main()