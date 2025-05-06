"""
Runner module for the city inspector agent.
"""
try:
    from agents import Runner
except ImportError:
    # Fallback stub Runner for environments without the agents package (e.g., local demo)
    class Runner:
        @staticmethod
        def run_sync(agent, input):
            # Return a dummy function call result
            return {"name": "issue", "arguments": {}}

from .def_agents import city_inspector

import uuid
from datetime import datetime
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))
from db.crud.create_nodes import add_city, add_user, add_photo
from db.crud.create_edges import add_uploaded_photo
from db.crud.read_nodes import search_node
import asyncio

def run_with_image_url(image_url: str, user: dict, location: dict, message: str = "Analyze this image and report the main issue or well-maintained element"):
    """
    Run the city inspector agent with an image URL, properly formatted for vision.
    """

    print(f"Running city inspector agent on image URL: {image_url}")
    print(f"User: {user}")
    print(f"Location: {location}")

    city_id_val = location.get('city')
    city_node = search_node('City', 'name', city_id_val)
    if not city_node:
        city_node = add_city({
            'city_id': city_id_val,
            'name': city_id_val,
            'country': location.get('country'),
            'location': {
                'latitude': location.get('latitude'),
                'longitude': location.get('longitude')
            }
        })
    user_id_val = user.get('id')
    user_node = search_node('User', 'user_id', user_id_val)
    if not user_node:
        user_node = add_user({
            'user_id': user_id_val,
            'name': user.get('name')
        })
    user_id = user_node['user_id']

    photo_id = str(uuid.uuid4())
    add_photo({
        'photo_id': photo_id,
        'url': image_url,
        'created_at': datetime.now().isoformat(),
        'location': {
            'latitude': location.get('latitude'),
            'longitude': location.get('longitude')
        }
    })

    add_uploaded_photo({
        'user_id': user_id,
        'photo_id': photo_id,
        'uploadedAt': datetime.now().isoformat(),
        'device': 'api',
        'userNotes': ''
    })
    print(f"Created photo {photo_id} for user {user_id}")

    # Prepare the multimodal input payload
    multimodal_input = [{
        "role": "user",
        "content": [
            {"type": "input_text",  "text": message},
            {"type": "input_text",  "text": f"city_id: {city_node['city_id']}"},
            {"type": "input_text",  "text": f"photo_id: {photo_id}"},
            {"type": "input_text",  "text": "Please make EXACTLY ONE function call to report what you see."},
            {"type": "input_image", "image_url": image_url}
        ]
    }]
    print("Input prepared with image URL:", image_url)

    # Ensure deterministic results
    city_inspector.model_settings.temperature = 0.0

    # Run the agent using a fresh event loop in this thread
    try:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        result = loop.run_until_complete(
            Runner.run(city_inspector, multimodal_input)
        )
    except Exception as e:
        print(f"Error running city inspector agent: {e}")
        import traceback
        traceback.print_exc()
        # Fallback output on failure
        return {
            "name": "issue",
            "arguments": {
                "description": f"Error analyzing image: {e}",
                "severity": "low",
                "severity_score": 1,
                "status": "failed",
                "photo_id": photo_id,
                "city_id": city_node["city_id"]
            }
        }
    finally:
        loop.close()

    return result



# Example usage when run directly
if __name__ == "__main__":
    # Demo parameters
    image_url = (
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSGyTL8T4cAUd7kZDU3z8OU5I84Q4zHXs9o8Q&s"
    )
    user = {"id": "demo_user", "name": "DemoUser"}
    location = {"country": "DemoLand", "city": "DemoCity", "latitude": 0.0, "longitude": 0.0}
    result = run_with_image_url(image_url, user, location)
    print("Final Output:", result)


from utils.image_runner import run_with_image_file
