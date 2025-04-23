#!/usr/bin/env python3
"""
CLI tool to create Neo4j nodes via db.crud.

Usage:
  create_nodes.py <node_type> <properties_json_or_file>
"""
import argparse
import json
import sys
import db.crud as crud

def add_node(label: str, id_prop: str, props: dict) -> dict:
    """
    Create or update a node with the given label and properties.

    :param label: The Neo4j node label.
    :param id_prop: The name of the unique identifier property.
    :param props: A dict of properties, must include id_prop.
    :return: The created or updated node.
    """
    if id_prop not in props:
        raise ValueError(f"Property '{id_prop}' is required in props")
    id_value = props[id_prop]
    parameters = {id_prop: id_value}
    set_clauses = []
    for key, value in props.items():
        if key == id_prop:
            continue
        if key == "location":
            set_clauses.append(f"n.{key} = point(${key})")
            parameters[key] = value
        else:
            set_clauses.append(f"n.{key} = ${key}")
            parameters[key] = value
    query = [f"MERGE (n:{label} {{{id_prop}: ${id_prop}}})"]
    if set_clauses:
        query.append("SET " + ", ".join(set_clauses))
    query.append("RETURN n")
    query_str = "\n".join(query)
    session = crud.get_session()
    with session as s:
        result = s.run(query_str, **parameters)
        record = result.single()
        return record.get("n") if record else None

def add_city(props: dict) -> dict:
    return add_node("City", "city_id", props)

def add_detection_event(props: dict) -> dict:
    return add_node("DetectionEvent", "event_id", props)

def add_photo(props: dict) -> dict:
    return add_node("Photo", "photo_id", props)

def add_analyzer(props: dict) -> dict:
    return add_node("Analyzer", "analyzer_id", props)

def add_category(props: dict) -> dict:
    return add_node("Category", "category_id", props)

def add_department(props: dict) -> dict:
    return add_node("Department", "department_id", props)

def add_solution(props: dict) -> dict:
    return add_node("Solution", "solution_id", props)

def add_user(props: dict) -> dict:
    return add_node("User", "user_id", props)

_FUNCTIONS = {
    'city': add_city,
    'user': add_user,
    'photo': add_photo,
    'analyzer': add_analyzer,
    'category': add_category,
    'department': add_department,
    'solution': add_solution,
    'event': add_detection_event,
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
        description='Create a Neo4j node of the given type.'
    )
    parser.add_argument(
        'node_type', choices=_FUNCTIONS.keys(),
        help='Type of node to create'
    )
    parser.add_argument(
        'props',
        help='JSON string or path to JSON file with node properties'
    )
    args = parser.parse_args()

    props = load_props(args.props)
    creator = _FUNCTIONS[args.node_type]
    node = creator(props)
    print(node)

if __name__ == '__main__':
    main()