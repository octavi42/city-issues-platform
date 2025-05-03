"""
Utility for uploading a local image to S3 and running the City-Vision-Inspector agent.
"""
from pathlib import Path
import os
import uuid

from .env_loader import load_dotenv
from .s3 import upload_file_to_s3

def run_with_image_file(file_path: str, user: dict, location: dict, message: str = "Analyze this image and report the main issue or well-maintained element"):
    """
    Upload a local image file to S3 and run the city inspector agent on its URL with user and location context.
    """
    load_dotenv()
    bucket = os.getenv("AWS_S3_BUCKET")
    if not bucket:
        raise RuntimeError("AWS_S3_BUCKET environment variable is not set")
    ext = Path(file_path).suffix
    object_name = f"{uuid.uuid4().hex}{ext}"
    image_url = upload_file_to_s3(file_path, bucket, object_name)
    from ai.openai.runner import run_with_image_url
    return run_with_image_url(image_url, user, location, message)