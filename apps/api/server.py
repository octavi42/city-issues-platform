#!/usr/bin/env python3
"""FastAPI server for City-Vision-Inspector."""
from fastapi import FastAPI, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
# Prepare context and invoke vision agent
import asyncio
from ai.openai.runner import run_with_image_url

def _run_agent_sync(image_url, user, location_dict):
    """Run the vision agent in a fresh event loop in this thread."""
    return asyncio.run(run_with_image_url(image_url, user, location_dict))

import json
from pydantic import BaseModel
from agents import Runner
from ai.openai.def_agents import relevance_scorer
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
    "http://localhost:3001",
    "https://localhost:3001",
    # Allow requests from the deployed frontend (e.g., Vercel)
    "https://city-issues-platform.vercel.app"
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,  # This is already set correctly
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],  # Add this to expose all response headers
)

@app.post("/analyze", summary="Receive image URL, user, and location for analysis")
async def analyze(
    image_url: str = Form(...),
    user_id: str = Form(...),
    location: str = Form(...),
):
    """Basic analyze endpoint accepting an image URL, user ID, and location info."""
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

    # Build user and location dicts for the agent
    user = {"id": user_id, "name": user_id}
    location_dict = {
        "latitude": latitude,
        "longitude": longitude,
        "city": city,
        "country": country,
    }
    try:
        # Offload the blocking agent call to a thread to avoid event-loop conflicts
        print(f"Running city inspector agent on image URL: {image_url}")
        print(f"User: {user}")
        print(f"Location: {location_dict}")
        result = await asyncio.to_thread(_run_agent_sync, image_url, user, location_dict)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis error: {e}")
    return result

# To run the server:
# pip install fastapi uvicorn python-multipart
# uvicorn server:app --host 0.0.0.0 --port 8000 --reload
'''
Relevance adjustment endpoint:
Accepts JSON body with photo_id, user_id, additional_info;
retrieves linked Issue or Maintenance event for the photo,
then invokes the relevance_scorer agent and returns the delta_score.
'''

class RelevanceRequest(BaseModel):
    photo_id: str
    user_id: str
    additional_info: str

@app.post("/relevance", summary="Adjust relevance score based on user feedback")
def adjust_relevance(request: RelevanceRequest):
    # Lookup photo node
    photo = search_node("Photo", "photo_id", request.photo_id)
    if not photo:
        raise HTTPException(status_code=404, detail="Photo not found")
    # Extract image URL and current relevance score (default to 0)
    image_url = photo.get("url")
    current_score = photo.get("relevance_score") or 0
    # Find linked Issue event
    session = get_session()
    with session as s:
        rec = s.run(
            "MATCH (p:Photo {photo_id: $photo_id})-[:TRIGGERS_EVENT]->(e:Issue) RETURN e",  # issue link
            photo_id=request.photo_id
        ).single()
    if rec:
        event = rec["e"]
        event_type = "issue"
    else:
        # Fallback: check Maintenance link
        session2 = get_session()
        with session2 as s2:
            rec2 = s2.run(
                "MATCH (p:Photo {photo_id: $photo_id})-[:CONTAINS]->(e:Maintenance) RETURN e",  # maintenance link
                photo_id=request.photo_id
            ).single()
        if rec2:
            event = rec2["e"]
            event_type = "maintenance"
        else:
            raise HTTPException(status_code=404, detail="No linked Issue or Maintenance event for photo")
    # Prepare agent input
    description = event.get("description")
    node_details = {"node_id": event.get("event_id"), "type": event_type}
    params = {
        "image_url": image_url,
        "description": description,
        "current_score": current_score,
        "node_details": node_details,
        "additional_info": request.additional_info,
    }
    # Invoke relevance agent
    try:
        input_text = json.dumps(params)
        run_result = Runner.run_sync(relevance_scorer, input=input_text)
        delta = None
        # Extract final output from RunResult
        if hasattr(run_result, 'final_output') and isinstance(run_result.final_output, dict):
            delta = run_result.final_output.get('delta_score')
        # Fallback: inspect run_result.new_items
        if delta is None:
            delta = 0
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Relevance agent error: {e}")
    return {"delta_score": delta}