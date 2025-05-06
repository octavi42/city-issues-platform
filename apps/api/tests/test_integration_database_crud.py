"""
Integration tests against a live Neo4j instance.

Requires environment variable NEO4J_INTEGRATION=true and properly configured
NEO4J_URI, NEO4J_USER, NEO4J_PASSWORD.
"""
import os
import unittest
from utils.database import crud
from db.neo4j import get_session

@unittest.skipUnless(
    os.getenv("NEO4J_INTEGRATION") == "true",
    "Integration tests are skipped unless NEO4J_INTEGRATION=true"
)
class TestIntegrationDatabaseCRUD(unittest.TestCase):
    def setUp(self):
        # Dummy data for integration
        self.city_props = {
            'city_id': 'intg_city_001',
            'name': 'Integraville',
            'location': {'latitude': 1.23, 'longitude': 4.56}
        }
        self.user_props = {
            'user_id': 'intg_user_001',
            'name': 'Integrator'
        }
        self.photo_props = {
            'photo_id': 'intg_photo_001',
            'url': 'http://example.com/integration.jpg',
            'location': self.city_props['location'],
            'score': 50
        }
        self.event_props = {
            'event_id': 'intg_event_001',
            'reported_at': '2025-01-01T00:00:00Z'
        }

    def test_crud_and_query(self):
        # Create nodes
        self.assertEqual(crud.add_city(self.city_props), self.city_props)
        self.assertEqual(crud.add_user(self.user_props), self.user_props)
        self.assertEqual(crud.add_photo(self.photo_props), self.photo_props)
        self.assertEqual(crud.add_detection_event(self.event_props), self.event_props)

        # Create relationships
        session = get_session()
        with session as s:
            s.run(
                "MATCH (e:DetectionEvent {event_id: $eid}), (c:City {city_id: $cid}) "
                "MERGE (e)-[:LOCATED_IN]->(c)",
                eid=self.event_props['event_id'], cid=self.city_props['city_id']
            )
            s.run(
                "MATCH (e:DetectionEvent {event_id: $eid}), (u:User {user_id: $uid}) "
                "MERGE (e)-[:REPORTED_BY]->(u)",
                eid=self.event_props['event_id'], uid=self.user_props['user_id']
            )
            s.run(
                "MATCH (e:DetectionEvent {event_id: $eid}), (p:Photo {photo_id: $pid}) "
                "MERGE (e)-[:HAS_PHOTO]->(p)",
                eid=self.event_props['event_id'], pid=self.photo_props['photo_id']
            )

        # Verify each node exists via direct query
        session = get_session()
        with session as s:
            for label, id_prop, props in [
                ('City', 'city_id', self.city_props),
                ('User', 'user_id', self.user_props),
                ('Photo', 'photo_id', self.photo_props),
                ('DetectionEvent', 'event_id', self.event_props),
            ]:
                query = (
                    f"MATCH (n:{label} {{{id_prop}: $id}}) RETURN n.{id_prop} AS id"
                )
                result = s.run(query, id=props[id_prop])
                record = result.single()
                self.assertIsNotNone(record, f"{label} node not found at {id_prop}={props[id_prop]}")
                self.assertEqual(record['id'], props[id_prop])

        # Clean up created nodes and relationships
        session = get_session()
        with session as s:
            # Delete event (detaches relationships)
            s.run(
                "MATCH (e:DetectionEvent {event_id: $eid}) DETACH DELETE e",
                eid=self.event_props['event_id']
            )
            # Delete photo, user, city
            s.run(
                "MATCH (p:Photo {photo_id: $pid}) DETACH DELETE p",
                pid=self.photo_props['photo_id']
            )
            s.run(
                "MATCH (u:User {user_id: $uid}) DETACH DELETE u",
                uid=self.user_props['user_id']
            )
            s.run(
                "MATCH (c:City {city_id: $cid}) DETACH DELETE c",
                cid=self.city_props['city_id']
            )

if __name__ == '__main__':
    unittest.main()