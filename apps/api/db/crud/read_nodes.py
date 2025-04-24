"""
Utility for reading nodes from the Neo4j database.
"""
from db.neo4j import get_session

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