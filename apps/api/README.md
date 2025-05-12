 # City Vision Inspector

 City-Vision-Inspector is a microservice and CLI toolset for analyzing images of civic infrastructure using OpenAI vision models and storing insights in Neo4j. It integrates with AWS S3 for image storage, Neo4j for graph-based storage, and provides a FastAPI HTTP API and command-line utilities.

 ## Features

 - **AI-powered vision agent**
   - Detect and report issues (e.g., potholes, graffiti)
   - Log well-maintained elements for quality metrics
   - Uses OpenAI function calling with JSON schemas for structured output
 - **Neo4j Graph Database**
   - Graph data model: City, User, Photo, DetectionEvent, Category, Department, Solution, etc.
   - CRUD helpers for nodes and relationships
   - Integration tests for database workflow
 - **AWS S3 Integration**
   - Upload images with public-read access
   - Generate presigned URLs
 - **FastAPI Server**
   - `/analyze` endpoint for image analysis
   - `/relevance-analyze` endpoint for relevance scoring against existing records
 - **CLI Utilities and Demos**
   - `utils/image_runner.py`: run agent on local image file
   - `utils/upload_s3.py`: upload file to S3
   - `utils/scripts.py`: demo database CRUD

 ## Architecture

 ```
 Client (HTTP or CLI)
     |
     v
 FastAPI Server (HTTP API: /analyze, /relevance-analyze) or CLI
     |
     v
 AWS S3 (Image Storage)
     |
     v
 AI Agent (OpenAI GPT-4.1-mini)
     |
     v
 Neo4j Database (Graph Storage)
 ```

## Installation

 1. Clone the repository:
    ```bash
    git clone <repository_url>
    cd city-vision-inspector
    ```
 2. Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```

 ## Configuration

 Create a `.env` file in the project root:
 ```ini
 AWS_ACCESS_KEY_ID=your_access_key
 AWS_SECRET_ACCESS_KEY=your_secret_key
 AWS_REGION=us-east-1
 AWS_S3_BUCKET=your_bucket_name

 NEO4J_URI=bolt://localhost:7687
 NEO4J_USER=neo4j
 NEO4J_PASSWORD=your_password
 ```

 ## Running the FastAPI Server

 ```bash
 uvicorn server:app --host 0.0.0.0 --port 8000 --reload
 ```

Access interactive API docs at `http://localhost:8000/docs`.

## Relevance Analysis Endpoint

To evaluate the relevance of a new observation and obtain a delta score, send a POST request to `/relevance-analyze` with a JSON payload:

```bash
curl -X POST http://localhost:8000/relevance-analyze \
  -H "Content-Type: application/json" \
  -d '{
    "image_url": "https://example.com/image.jpg",
    "description": "A brief description of the issue or element",
    "current_score": 0.5,
    "node_details": {"id":"node123","category":"pothole"},
    "additional_info": "Optional additional context"
  }'
```

 ## CLI Usage

 - **Upload to S3**
   ```bash
   python utils/upload_s3.py <file_path> [object_name]
   ```
 - **Run agent on local image**
   ```bash
   python -c "from utils.image_runner import run_with_image_file; print(run_with_image_file('path/to/image.jpg', {'id':'user1','name':'User One'},{'city':'CityName','country':'Country','latitude':0,'longitude':0}))"
   ```
 - **Demo database CRUD**
   ```bash
   python utils/scripts.py
   ```

 ## Contributing

 Contributions are welcome! Please open issues or pull requests.