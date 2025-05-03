#!/usr/bin/env python3
"""FastAPI server for City-Vision-Inspector."""
from fastapi import FastAPI, UploadFile, File, Form, HTTPException

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
    return {
        "status": "received",
        "filename": image.filename,
        "user_id": user_id,
        "location": {"latitude": latitude, "longitude": longitude},
    }

# To run the server:
# pip install fastapi uvicorn python-multipart
# uvicorn server:app --host 0.0.0.0 --port 8000 --reload