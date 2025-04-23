"""Neo4j driver initialization module."""
import os
from neo4j import GraphDatabase
from utils.env_loader import load_dotenv

# Load environment variables from .env at project root
load_dotenv()

# Environment variables for Neo4j connection
NEO4J_URI = os.getenv("NEO4J_URI", "bolt://localhost:7687")
NEO4J_USER = os.getenv("NEO4J_USER", "neo4j")
NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD", "")

# Initialize the Neo4j driver
driver = GraphDatabase.driver(
    NEO4J_URI,
    auth=(NEO4J_USER, NEO4J_PASSWORD)
)

def get_driver():
    """
    Returns the Neo4j driver instance.
    """
    return driver

def get_session(**kwargs):
    """
    Returns a new Neo4j session.

    :param kwargs: Optional parameters for session creation (e.g., database name).
    """
    return driver.session(**kwargs)

def close_driver():
    """
    Closes the Neo4j driver connection.
    """
    driver.close()
