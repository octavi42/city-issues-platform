# scripts/demo_database_crud.py
#!/usr/bin/env python3
"""
Run once to demo creating nodes & relationships in Neo4j
(using utils.database.crud) and leave them in place.
"""
import os
import sys
# Ensure project root is on PYTHONPATH so that 'utils' and 'db' packages can be imported when run as a script
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from utils.database.crud import add_city, add_user, add_photo, add_detection_event
from db.neo4j import get_session

def main():
    city_props = {
        "city_id": "demo_city_001",
        "name": "DemoVille",
        "location": {"latitude": 12.34, "longitude": 56.78}
    }
    user_props = {
        "user_id": "demo_user_001",
        "name": "DemoUser"
    }
    photo_props = {
        "photo_id": "demo_photo_001",
        "url": "http://example.com/demo.jpg",
        "location": city_props["location"]
    }
    event_props = {
        "event_id": "demo_event_001",
        "reported_at": "2025-01-01T00:00:00Z"
    }

    print("Creating nodes…")
    print("  City:", add_city(city_props))
    print("  User:", add_user(user_props))
    print("  Photo:", add_photo(photo_props))
    print("  Event:", add_detection_event(event_props))

    print("Linking relationships…")
    session = get_session()
    with session as s:
        s.run(
            "MATCH (e:DetectionEvent {event_id:$eid}), (c:City {city_id:$cid}) "
            "MERGE (e)-[:LOCATED_IN]->(c)",
            eid=event_props["event_id"], cid=city_props["city_id"]
        )
        s.run(
            "MATCH (e:DetectionEvent {event_id:$eid}), (u:User {user_id:$uid}) "
            "MERGE (e)-[:REPORTED_BY]->(u)",
            eid=event_props["event_id"], uid=user_props["user_id"]
        )
        s.run(
            "MATCH (e:DetectionEvent {event_id:$eid}), (p:Photo {photo_id:$pid}) "
            "MERGE (e)-[:HAS_PHOTO]->(p)",
            eid=event_props["event_id"], pid=photo_props["photo_id"]
        )

    print("Done!  Now open Neo4j Browser or `cypher-shell` and run:")
    print("  MATCH (n) RETURN n LIMIT 25;")

if __name__ == "__main__":
    main()