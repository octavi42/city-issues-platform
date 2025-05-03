#!/usr/bin/env python3
"""FastAPI server for City-Vision-Inspector."""
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
import os
import tempfile
import shutil
import uuid
from pathlib import Path

from utils.env_loader import load_dotenv
from utils.s3 import upload_file_to_s3

app = FastAPI(
    title="City-Vision-Inspector API",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

@app.post("/analyze", summary="Receive image, user, and location for analysis")
async def analyze(
    image: UploadFile = File(...),
    user_id: str = Form(...),
    latitude: float = Form(...),
    longitude: float = Form(...),
):
    """Basic analyze endpoint accepting an image file, user ID, and GPS coordinates."""
    # Print received inputs for now
    print(f"Received image file: {image.filename}")
    print(f"User ID: {user_id}")
    print(f"Location: latitude={latitude}, longitude={longitude}")

    # Upload image to S3
    load_dotenv()
    bucket = os.getenv("AWS_S3_BUCKET")
    if not bucket:
        raise HTTPException(status_code=500, detail="AWS_S3_BUCKET environment variable is not set")
    # Save incoming file to a temporary location
    suffix = Path(image.filename).suffix
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        shutil.copyfileobj(image.file, tmp)
        tmp_path = tmp.name
    # Generate a unique object name
    object_name = f"{uuid.uuid4().hex}{suffix}"
    try:
        image_url = upload_file_to_s3(tmp_path, bucket, object_name)
    except Exception as e:
        os.remove(tmp_path)
        raise HTTPException(status_code=500, detail=f"Failed to upload image: {e}")
    # Clean up temp file after upload
    os.remove(tmp_path)

    return {
        "status": "received",
        "filename": image.filename,
        "user_id": user_id,
        "location": {"latitude": latitude, "longitude": longitude},
        "image_url": image_url,
    }

# To run the server:
# pip install fastapi uvicorn python-multipart
# uvicorn server:app --host 0.0.0.0 --port 8000 --reload