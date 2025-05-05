"""
Demo script to run run_with_image_url on images from assets/issue_images
and cleanup inserted data.
"""
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../')))

import uuid
from pathlib import Path
from utils.env_loader import load_dotenv
from utils.s3 import upload_file_to_s3
from ai.openai.runner import run_with_image_url
from db.neo4j import get_session

def run_demo():
    # Load AWS credentials and bucket
    load_dotenv()
    bucket = os.getenv("AWS_S3_BUCKET")
    if not bucket:
        raise RuntimeError("AWS_S3_BUCKET environment variable is not set")
    # Define multiple users and locations (some share the same location)
    users = [
        {"id": "demo_user1", "name": "DemoUser1"},
        {"id": "demo_user2", "name": "DemoUser2"},
        {"id": "demo_user3", "name": "DemoUser3"},
    ]
    locations = [
        {"city": "demo_cityA", "country": "DemoLand", "latitude": 1.0, "longitude": 2.0},
        {"city": "demo_cityB", "country": "DemoLand", "latitude": 3.0, "longitude": 4.0},
        {"city": "demo_cityA", "country": "DemoLand", "latitude": 1.0, "longitude": 2.0},
    ]

    # Directory containing test images
    images_dir = os.path.abspath(
        os.path.join(os.path.dirname(__file__), os.pardir, "assets", "issue_images")
    )
    images = [f for f in os.listdir(images_dir) if os.path.isfile(os.path.join(images_dir, f))]

    print("Running run_with_image_url for multiple users/locations:")
    # Use one image per user for demonstration (up to available images)
    for i, user in enumerate(users):
        if i >= len(images):
            break
        location = locations[i]
        # Select the image and upload to S3
        filename = images[i]
        file_path = os.path.join(images_dir, filename)
        ext = Path(file_path).suffix
        object_name = f"{uuid.uuid4().hex}{ext}"
        print(f"Uploading {filename} to s3://{bucket}/{object_name}...")
        image_url = upload_file_to_s3(file_path, bucket, object_name)
        print(f"Uploaded URL: {image_url}")
        # Run the inspector on the uploaded S3 URL
        print(f"User: {user['id']}, Location: {location['city']}, Image: {image_url}")
        result = run_with_image_url(image_url, user, location)
        print("Result:", result)
        print("-" * 40)

def cleanup_demo_data():
    # Clean up inserted data from Neo4j
    # Load AWS bucket for identifying uploaded images
    load_dotenv()
    bucket = os.getenv("AWS_S3_BUCKET")
    if not bucket:
        raise RuntimeError("AWS_S3_BUCKET environment variable is not set for cleanup")
    session = get_session()
    with session as s:
        # Delete photos introduced by this demo (matching bucket domain)
        s.run(
            "MATCH (p:Photo) WHERE p.url CONTAINS $bucket DETACH DELETE p",
            bucket=bucket
        )
        # Delete demo users
        s.run(
            "MATCH (u:User) WHERE u.user_id STARTS WITH $prefix DETACH DELETE u",
            prefix="demo_user"
        )
        # Delete demo cities
        s.run(
            "MATCH (c:City) WHERE c.city_id STARTS WITH $prefix DETACH DELETE c",
            prefix="demo_city"
        )
    print("Cleanup complete.")
    
def run_maintenance_demo():
    """
    Demo script to run run_with_image_url on images from assets/maintanance_images
    for maintenance (well-maintained) images.
    """
    # Load AWS credentials and bucket
    load_dotenv()
    bucket = os.getenv("AWS_S3_BUCKET")
    if not bucket:
        raise RuntimeError("AWS_S3_BUCKET environment variable is not set")
    # Define multiple users and locations (some share the same location)
    users = [
        {"id": "demo_user1", "name": "DemoUser1"},
        {"id": "demo_user2", "name": "DemoUser2"},
        {"id": "demo_user3", "name": "DemoUser3"},
    ]
    locations = [
        {"city": "demo_cityA", "country": "DemoLand", "latitude": 1.0, "longitude": 2.0},
        {"city": "demo_cityB", "country": "DemoLand", "latitude": 3.0, "longitude": 4.0},
        {"city": "demo_cityA", "country": "DemoLand", "latitude": 1.0, "longitude": 2.0},
    ]

    # Directory containing maintenance test images
    images_dir = os.path.abspath(
        os.path.join(os.path.dirname(__file__), os.pardir, "assets", "maintanance_images")
    )
    images = [f for f in os.listdir(images_dir) if os.path.isfile(os.path.join(images_dir, f))]

    print("Running run_with_image_url for maintenance images:")
    # Use one image per user for demonstration (up to available images)
    for i, user in enumerate(users):
        if i >= len(images):
            break
        location = locations[i]
        # Select the image and upload to S3
        filename = images[i]
        file_path = os.path.join(images_dir, filename)
        ext = Path(file_path).suffix
        object_name = f"{uuid.uuid4().hex}{ext}"
        print(f"Uploading {filename} to s3://{bucket}/{object_name}...")
        image_url = upload_file_to_s3(file_path, bucket, object_name)
        print(f"Uploaded URL: {image_url}")
        # Run the inspector on the uploaded S3 URL for maintenance
        print(f"User: {user['id']}, Location: {location['city']}, Image: {image_url}")
        result = run_with_image_url(image_url, user, location)
        print("Result:", result)
        print("-" * 40)

if __name__ == "__main__":
    run_demo()
    run_maintenance_demo()
    # cleanup_demo_data()