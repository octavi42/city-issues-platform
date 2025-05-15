#!/usr/bin/env python3
"""FastAPI server for City-Vision-Inspector."""
from fastapi import FastAPI, Form, HTTPException, BackgroundTasks, Request, Query
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
from db.crud.update_nodes import get_photo_and_event
from fastapi.responses import JSONResponse
from db.crud import add_message, add_message_for

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

@app.post("/relevance-analyze", summary="Analyze relevance and get delta_score using the agent")
async def relevance_analyze(
    photo_id: str,
    user_id: str = Query(..., description="User ID submitting the message or report"),
    message: str = Query(..., description="User message/comment for the photo/event"),
    submit_type: str = Query('message', regex="^(message|report)$", description="Type of submit: 'message' or 'report'"),
    background_tasks: BackgroundTasks = None
):
    photo, event, event_type = get_photo_and_event(photo_id)
    if not photo:
        raise HTTPException(status_code=404, detail="Photo not found")
    if not event:
        raise HTTPException(status_code=404, detail="No connected Issue or Maintenance node found for this photo")

    # --- Create Message node and connect to Photo and User at the start ---
    message_id = str(uuid.uuid4())
    add_message({
        "message_id": message_id,
        "text": message,
        "type": submit_type,
        "user_id": user_id,
        "photo_id": photo_id,
        "created_at": photo.get("created_at"),
    })
    # Only create the relationship between message and photo
    add_message_for({
        "message_id": message_id,
        "photo_id": photo_id,
        # user_id is not needed for the edge
    })

    # Prepare the response to return immediately
    response_data = {
        "status": "created",
        "message": "Message node created and being sent to AI for processing.",
        "created_message": {"message_id": message_id, "type": submit_type},
    }

    # Prepare data for AI analysis
    location = photo.get("location")
    if location and hasattr(location, 'x') and hasattr(location, 'y'):
        location_dict = {"longitude": location.x, "latitude": location.y}
    elif isinstance(location, dict) and "longitude" in location and "latitude" in location:
        location_dict = {"longitude": location["longitude"], "latitude": location["latitude"]}
    else:
        location_dict = None

    photo_data = {
        "photo_id": photo.get("photo_id"),
        "url": photo.get("url"),
        "created_at": photo.get("created_at"),
        "score": photo.get("score"),
        "location": location_dict
    }

    event_data = {
        "event_id": event.get("event_id"),
        "name": event.get("name"),
        "description": event.get("description"),
        "type": event.get("type"),
        "status": event.get("status"),
        "severity": event.get("severity"),
        "severity_score": event.get("severity_score"),
        "reported_at": event.get("reported_at"),
        "inspected_at": event.get("inspected_at")
    }

    additional_info_parts = [f"event_type: {event_type}"]
    if submit_type:
        additional_info_parts.append(f"submit_type: {submit_type}")
    if message:
        additional_info_parts.append(f"message: {message}")
    additional_info = "; ".join(additional_info_parts)

    ai_payload = {
        "photo": photo_data,
        "event": event_data,
        "event_type": event_type,
        "additional_info": additional_info,
        "message": message,
        "submit_type": submit_type
    }

    # Define the background task for AI analysis and updating the Message node
    def process_ai_and_update():
        try:
            result = analyze_message(ai_payload)
            result_dict = result.model_dump()
            session = get_session()
            with session as s:
                update_fields = {
                    "reason": result_dict.get("reason"),
                    "delta_score": result_dict.get("delta_score"),
                    "confidence": result_dict.get("confidence"),
                    "additional_info": result_dict.get("additional_info"),
                }
                set_clause = ", ".join([f"m.{k} = ${k}" for k in update_fields])
                params = {"message_id": message_id, **update_fields}
                s.run(
                    f"MATCH (m:Message {{message_id: $message_id}}) SET {set_clause}",
                    **params
                )
        except Exception as e:
            print(f"Background AI analysis error: {e}")


    background_tasks.add_task(process_ai_and_update)

    return JSONResponse(content=response_data, media_type="application/json", status_code=201)

# To run the server:
# pip install fastapi uvicorn python-multipart
# uvicorn server:app --host 0.0.0.0 --port 8000 --reload