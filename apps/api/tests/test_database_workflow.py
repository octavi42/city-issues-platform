import unittest
from utils.database import crud


class FakeResult:
    def __init__(self, node):
        self._node = node
    def single(self):
        return self
    def get(self, key):
        return self._node


class FakeSession:
    def __init__(self):
        self.runs = []
    def run(self, query, **params):
        # Record the query and parameters
        self.runs.append((query.strip(), params))
        return FakeResult(params)
    def __enter__(self):
        return self
    def __exit__(self, exc_type, exc_val, exc_tb):
        pass


class TestDatabaseWorkflow(unittest.TestCase):
    def setUp(self):
        # Monkey-patch get_session to return our fake session
        self.fake_session = FakeSession()
        crud.get_session = lambda **kwargs: self.fake_session

    def test_workflow(self):
        # Dummy input data
        city_props = {
            'city_id': 'city123',
            'name': 'Testopolis',
            'location': {'latitude': 10.0, 'longitude': 20.0}
        }
        user_props = {
            'user_id': 'user123',
            'name': 'Tester'
        }
        photo_props = {
            'photo_id': 'photo123',
            'url': 'http://example.com/photo.jpg',
            'location': city_props['location']
        }
        event_props = {
            'event_id': 'event123',
            'reported_at': '2023-01-01T12:00:00Z'
        }

        # Simulate node creations
        self.assertEqual(crud.add_city(city_props), city_props)
        self.assertEqual(crud.add_user(user_props), user_props)
        self.assertEqual(crud.add_photo(photo_props), photo_props)
        self.assertEqual(crud.add_detection_event(event_props), event_props)

        # Simulate relationship creation
        session = crud.get_session()
        with session as s:
            # Event located in city
            s.run(
                "MATCH (e:DetectionEvent {event_id: $event_id}), (c:City {city_id: $city_id}) "
                "MERGE (e)-[:LOCATED_IN]->(c)",
                event_id=event_props['event_id'],
                city_id=city_props['city_id']
            )
            # Event reported by user
            s.run(
                "MATCH (e:DetectionEvent {event_id: $event_id}), (u:User {user_id: $user_id}) "
                "MERGE (e)-[:REPORTED_BY]->(u)",
                event_id=event_props['event_id'],
                user_id=user_props['user_id']
            )
            # Event has photo
            s.run(
                "MATCH (e:DetectionEvent {event_id: $event_id}), (p:Photo {photo_id: $photo_id}) "
                "MERGE (e)-[:HAS_PHOTO]->(p)",
                event_id=event_props['event_id'],
                photo_id=photo_props['photo_id']
            )

        # Total operations: 4 node creations + 3 relationship queries
        self.assertEqual(len(self.fake_session.runs), 7)

        # Verify relationship parameters
        _, params_loc = self.fake_session.runs[-3]
        _, params_rep = self.fake_session.runs[-2]
        _, params_pho = self.fake_session.runs[-1]

        self.assertEqual(params_loc, {'event_id': event_props['event_id'], 'city_id': city_props['city_id']})
        self.assertEqual(params_rep, {'event_id': event_props['event_id'], 'user_id': user_props['user_id']})
        self.assertEqual(params_pho, {'event_id': event_props['event_id'], 'photo_id': photo_props['photo_id']})

if __name__ == '__main__':
    unittest.main()