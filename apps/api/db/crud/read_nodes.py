"""
Utility for reading nodes from the Neo4j database.
"""
from db.neo4j import get_session
from typing import Optional, Any

def read_nodes(label: str) -> list:
    """
    Retrieve all nodes with the given label.

    :param label: The Neo4j node label to query.
    :return: List of matching node records.
    """
    session = get_session()
    with session as s:
        result = s.run(f"MATCH (n:{label}) RETURN n")
        return [record.get("n") for record in result]
    

def search_node(label: str,
                property_name: str,
                property_value: str) -> Optional[Any]:
    """
    Find a single node whose <property_name> equals <property_value>.
    Returns the node or None if no match is found.
    """
    session = get_session()                      # assumes you defined this
    cypher   = f"MATCH (n:{label}) WHERE n.{property_name} = $value RETURN n"

    with session as s:
        record = s.run(cypher, value=property_value).single()  #  <-- key line
        return record["n"] if record else None                 #  Optional[Node]