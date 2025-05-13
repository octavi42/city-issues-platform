# City Issues Platform
 
A full-stack monorepo for detecting, analyzing, and visualizing city infrastructure issues. This platform leverages AI-powered vision analysis, a FastAPI microservice, and a Neo4j graph database, along with a modern Next.js frontend.
 
## Table of Contents
1. [Getting Started](#getting-started)
2. [Application Overview](#application-overview)
3. [Architecture](#architecture)
4. [Directory Structure](#directory-structure)
5. [Development](#development)
   - [Using Docker](#using-docker)
   - [Manual Setup](#manual-setup)
6. [Testing](#testing)
7. [Contributing](#contributing)
 
## Getting Started
 
Clone the repository:
```bash
git clone <repository_url>
cd city-issues-platform
```
 
For detailed setup instructions for each component, see the respective README files under `apps/api` and `apps/web/my-app`.
 
## Application Overview

This web application allows users to capture or upload photos of city infrastructure issues directly from their browser. Users must grant camera and location permissions to tag photos with geolocation data.

Uploaded images are processed by AI agents that analyze, categorize (e.g., potholes, graffiti), and generate structured descriptions of detected issues. The application tracks a browser fingerprint for each user, maintaining a history of uploads linked to user profiles.

All data—including users, cities, categories, and photos—is stored in a Neo4j graph database. Each city and its related problems form an isolated subgraph, ensuring clear boundaries and horizontal scalability. Upon photo upload, the backend automatically creates any missing nodes (such as City, Category, Photo, or User) and establishes appropriate relationships.

## Architecture
 
```text
 User (Browser)
     |
     v
 Next.js Frontend (apps/web/my-app)
     |
     v
 FastAPI Backend (apps/api)
     |      \
     |       --> AWS S3 (image storage)
     |      \
     |       --> OpenAI Vision (AI analysis)
     |
     --> Neo4j Graph Database
```  
 
## Directory Structure
 
- `apps/api`  
  Python FastAPI service and CLI tools for AI-powered image analysis, AWS S3 integration, and Neo4j graph storage.  
- `apps/web/my-app`  
  Next.js 13 application for exploring and managing detected issues.  
- `packages/shared-types`  
  Shared TypeScript type definitions.  
- `packages/ui`  
  Reusable UI component library.  
 
### Manual Setup
 
#### API Service
 
```bash
cd apps/api
pip install -r requirements.txt
# Create a .env file per apps/api/README.md
uvicorn server:app --reload --host 0.0.0.0 --port 8000
```
 
#### Frontend Application
 
```bash
cd apps/web/my-app
npm install
# Create a .env.local file per apps/web/my-app/README.md
npm run dev
```