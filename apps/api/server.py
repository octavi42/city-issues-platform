#!/usr/bin/env python3
"""FastAPI server for City-Vision-Inspector."""
from fastapi import FastAPI, Form, HTTPException, BackgroundTasks, Request
from fastapi.middleware.cors import CORSMiddleware
import os
import asyncio
import json
import uuid
from pydantic import BaseModel
from aiv2.agents.vision.vision_agent import analyze_vision_image
from aiv2.agents.messages.agent import analyze_message
from db.crud.read_nodes import search_node
from db.neo4j import get_session

app = FastAPI(
    title="City-Vision-Inspector API",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)
# Configure CORS to allow calls from frontend
origins = [
    # Local development origins
    "http://localhost:3000",
    "https://localhost:3000",
    "http://localhost:3001",
    "https://localhost:3001",
    "https://172.20.10.10:3000", # Cross origin request detected from 172.20.10.10 to /_next/* resource. In a future major version of Next.js, you will need to explicitly configure "allowedDevOrigins" in next.config to allow this. Read more: https://nextjs.org/docs/app/api-reference/config/next-config-js/allowedDevOrigins
    # Allow requests from the deployed frontend (e.g., Vercel)
    "https://city-issues-platform.vercel.app",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,      # Allow only the specified origins
    allow_credentials=True,  # This is already set correctly
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/analyze", summary="Receive image URL, user, and location for analysis")
async def analyze(
    image_url: str = Form(...),
    user_id: str = Form(...),
    location: str = Form(...),
):
    """Analyze endpoint accepting an image URL, user ID, and location info. Returns the agent result."""
    print(f"Received image URL: {image_url}")
    print(f"User ID: {user_id}")
    # Parse and validate location JSON
    try:
        loc = json.loads(location)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="location must be a JSON object string with keys latitude, longitude, city, country")
    required_fields = ("latitude", "longitude", "city", "country")
    missing = [field for field in required_fields if field not in loc]
    if missing:
        raise HTTPException(status_code=400, detail=f"Missing location field(s): {', '.join(missing)}")
    try:
        latitude = float(loc["latitude"])
        longitude = float(loc["longitude"])
        city = str(loc["city"])
        country = str(loc["country"])
    except (TypeError, ValueError):
        raise HTTPException(status_code=400, detail="Invalid types for location fields")
    print(f"Location: latitude={latitude}, longitude={longitude}, city={city}, country={country}")

    user = {"id": user_id, "name": user_id}
    location_dict = {
        "latitude": latitude,
        "longitude": longitude,
        "city": city,
        "country": country,
    }
    # Call the vision agent (sync wrapper for async if needed)
    try:
        result = await asyncio.to_thread(
            analyze_vision_image,
            image_url=image_url,
            user=user,
            location=location_dict,
        )
    except Exception as e:
        print(f"Analysis error: {e}")
        raise HTTPException(status_code=500, detail=f"Agent error: {e}")
    return {"success": True, "result": result}

class RelevanceAnalyzeRequest(BaseModel):
    image_url: str
    description: str
    current_score: float
    node_details: dict
    additional_info: str

@app.post("/relevance-analyze", summary="Analyze relevance and get delta_score using the agent")
async def relevance_analyze(request: RelevanceAnalyzeRequest):
    try:
        # Convert request to dict and pass to analyze_message
        result = await asyncio.to_thread(analyze_message, request.dict())
    except Exception as e:
        print(f"Relevance analysis error: {e}")
        raise HTTPException(status_code=500, detail=f"Relevance agent error: {e}")
    return result

# To run the server:
# pip install fastapi uvicorn python-multipart
# uvicorn server:app --host 0.0.0.0 --port 8000 --reload