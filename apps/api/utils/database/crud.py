from db.neo4j import get_session

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
    session = get_session()
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