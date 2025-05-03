"""
Runner module for the city inspector agent.
"""
try:
    from agents import Runner
except ImportError:
    raise ImportError("agents library is required for Runner")

from def_agents import city_inspector

import uuid
from datetime import datetime
import sys
import os
from pathlib import Path
from utils.env_loader import load_dotenv
from utils.s3 import upload_file_to_s3
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))
from db.crud.create_nodes import add_city, add_user, add_photo

def run_with_image_url(image_url: str, message: str = "Analyze this image and report the main issue or well-maintained element"):
    """
    Run the city inspector agent with an image URL, properly formatted for vision.
    """

    # create new photo
    photo_props = {
        'photo_id': str(uuid.uuid4()),
        'url': image_url,
        'created_at': datetime.now().isoformat(),
        'location': {
            'latitude': 12.34,
            'longitude': 56.78
        }
    }

    # Add the photo to the database
    node = add_photo(photo_props)

    photo_id = node['photo_id']
    print("Photo node created with element_id:", photo_id)

    # Build a single multimodal turn with explicit instruction for a single response
    event_id = f"event_{uuid.uuid4().hex[:8]}"
    
    multimodal_input = [
        {
            "role": "user",
            "content": [
                {"type": "input_text", "text": message},
                {"type": "input_text", "text": f"photo_id: {photo_id}"},
                {"type": "input_text", "text": "Please make EXACTLY ONE function call to report what you see."},
                {"type": "input_image", "image_url": image_url}
            ]
        }
    ]

    # Set stricter temperature to reduce creativity/variation
    city_inspector.model_settings.temperature = 0.0
    
    # Execute the agent synchronously
    result = Runner.run_sync(city_inspector, input=multimodal_input)
    return result



# Example usage when run directly
if __name__ == "__main__":
    # pothole:  https://images.squarespace-cdn.com/content/v1/573365789f726693272dc91a/1704992146415-CI272VYXPALWT52IGLUB/AdobeStock_201419293.jpeg?format=1500w
    # fire:     https://abc3340.com/resources/media2/16x9/full/1015/center/80/0d07bb0e-a4e9-45a0-aaae-0246c7be94e1-large16x9_AP18121311865539.jpg
    # flood:    https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSGyTL8T4cAUd7kZDU3z8OU5I84Q4zHXs9o8Q&s
    image_url = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSGyTL8T4cAUd7kZDU3z8OU5I84Q4zHXs9o8Q&s"
    result = run_with_image_url(image_url)
    print("Final Output:", result)

def run_with_image_file(file_path: str, message: str = "Analyze this image and report the main issue or well-maintained element"):
    """
    Upload a local image file to S3 and run the city inspector agent on its URL.
    """
    load_dotenv()
    bucket = os.getenv("AWS_S3_BUCKET")
    if not bucket:
        raise RuntimeError("AWS_S3_BUCKET environment variable is not set")
    ext = Path(file_path).suffix
    object_name = f"{uuid.uuid4().hex}{ext}"
    image_url = upload_file_to_s3(file_path, bucket, object_name)
    return run_with_image_url(image_url, message)
