"""
Cypher statements to create constraints and indexes in Neo4j.

Safe to run multiple times (uses IF NOT EXISTS).
"""
from neo4j import AsyncGraphDatabase

# Constraint and index creation queries
_SCHEMA_QUERIES = [
    # 1. Uniqueness constraints
    """
    CREATE CONSTRAINT city_pk IF NOT EXISTS
      FOR (c:City) REQUIRE c.city_id IS UNIQUE;
    """,
    """
    CREATE CONSTRAINT event_pk IF NOT EXISTS
      FOR (e:DetectionEvent) REQUIRE e.event_id IS UNIQUE;
    """,
    """
    CREATE CONSTRAINT photo_pk IF NOT EXISTS
      FOR (p:Photo) REQUIRE p.photo_id IS UNIQUE;
    """,
    """
    CREATE CONSTRAINT analyzer_pk IF NOT EXISTS
      FOR (a:Analyzer) REQUIRE a.analyzer_id IS UNIQUE;
    """,
    """
    CREATE CONSTRAINT category_pk IF NOT EXISTS
      FOR (c:Category) REQUIRE c.category_id IS UNIQUE;
    """,
    """
    CREATE CONSTRAINT dept_pk IF NOT EXISTS
      FOR (d:Department) REQUIRE d.department_id IS UNIQUE;
    """,
    """
    CREATE CONSTRAINT solution_pk IF NOT EXISTS
      FOR (s:Solution) REQUIRE s.solution_id IS UNIQUE;
    """,
    """
    CREATE CONSTRAINT user_pk IF NOT EXISTS
      FOR (u:User) REQUIRE u.user_id IS UNIQUE;
    """,

    # 2. Property-existence constraint
    """
    CREATE CONSTRAINT event_reported_at IF NOT EXISTS
      FOR (e:DetectionEvent) REQUIRE e.reported_at IS NOT NULL;
    """,

    # 3. Spatial indexes for geolocation
    """
    CREATE POINT INDEX city_location_pt IF NOT EXISTS
      FOR (c:City) ON (c.location);
    """,
    """
    CREATE POINT INDEX photo_location_pt IF NOT EXISTS
      FOR (p:Photo) ON (p.location);
    """,
]

async def init_db_schema(uri: str, user: str, password: str) -> None:
    """
    Create all constraints and indexes in Neo4j.

    :param uri:       URI for Neo4j connection (e.g., bolt://localhost:7687)
    :param user:      Username for authentication
    :param password:  Password for authentication
    """
    driver = AsyncGraphDatabase.driver(uri, auth=(user, password))
    async with driver:
        async with driver.session() as session:
            for query in _SCHEMA_QUERIES:
                await session.run(query)
    await driver.close()