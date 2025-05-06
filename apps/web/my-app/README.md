# City Issues Platform

A Next.js 13 application for exploring and managing city infrastructure issues using a Neo4j graph database backend. Built to demonstrate issue detection, categorization, and detailed views of problems (e.g., potholes) in Cluj-Napoca.

## Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Database Schema Dump](#database-schema-dump)
- [Running the App](#running-the-app)
- [Testing Neo4j Queries](#testing-neo4j-queries)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [S3 Integration](#s3-integration)

## Features
- Home page with dynamic category cards loaded from Neo4j (fallback to static data).
- Category details page displaying issues as photo cards with detection event data.
- Issue detail page with comprehensive information: image, severity badge, location, suggestions, and comments.
- Neo4j integration with auto-generated TypeScript schema and generic query utilities.
- Responsive UI built with React, Next.js, Tailwind CSS, Anime.js, Framer Motion, and shadcn/ui components.

## Tech Stack
- **Framework:** Next.js 13 (App Router, Server & Client Components)
- **Language:** TypeScript
- **Styling:** Tailwind CSS, shadcn/ui
- **Database:** Neo4j (with `neo4j-driver` & APOC)
- **Animations:** Anime.js, Framer Motion
- **Utilities:** date-fns for date formatting, ESLint for linting

## Prerequisites
- Node.js 18+  
- npm, yarn, or pnpm  
- A running Neo4j database (e.g., Docker image of Neo4j 5+ with APOC plugin)

## Installation
1. Clone the repository:
   ```bash
   git clone <repo-url>
   cd my-app
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the project root with the following variables:
   ```bash
   NEO4J_URI=bolt://localhost:7687
   NEO4J_USERNAME=neo4j
   NEO4J_PASSWORD=your_password
   ```

## Environment Variables
- `NEO4J_URI`: Bolt URI of the Neo4j database (e.g., `bolt://localhost:7687`)  
- `NEO4J_USERNAME`: Username for Neo4j authentication  
- `NEO4J_PASSWORD`: Password for Neo4j authentication  

## Database Schema Dump
This project includes a script to dump the Neo4j schema using the APOC procedure:
```bash
npm run dump-schema
```
The JSON schema is generated at `generated/neo4j-schema.json`. TypeScript types are auto-generated in `src/lib/neo4j-schema.ts`.

## Running the App

### Development (HTTPS)
```bash
npm run dev
```  
Starts the development server with HTTPS enabled.  
Open <https://localhost:3000> (or <http://localhost:3000>) in your browser.

### Production
Build and start the application:
```bash
npm run build
npm run start
```

## Testing Neo4j Queries
Sample scripts are provided to test the Neo4j data-fetching functions. Ensure your environment variables are set, then run:
```bash
npx ts-node test-neo4j-queries.ts
```
This will fetch and log nodes for Users, Analyzers, Categories, Departments, Solutions, and DetectionEvents.

## Project Structure
```
.  
├── app/                   Next.js App Router (pages & layouts)  
│   ├── page.tsx           Home page  
│   ├── categories/        Category pages (dynamic `[slug]`)  
│   └── issue/             Issue detail pages (dynamic `[slug]`)  
├── components/            React UI components (pages, UI primitives)  
├── lib/                   Core utilities  
│   ├── neo4j.ts           Generic Neo4j driver & query utilities  
│   ├── neo4j-queries.ts   High-level service functions for domain models  
│   └── neo4j-schema.ts    Auto-generated TS types from database schema  
├── scripts/               Helper scripts  
│   └── dump-schema.js     Neo4j schema export script  
├── generated/             Generated files (e.g., `neo4j-schema.json`)  
├── public/                Static assets (images, favicon)  
├── test-neo4j-queries.ts  Neo4j query test script  
├── package.json  
└── README.md  
```

## Contributing
Contributions welcome! Please open issues or submit pull requests for any bugs or enhancements.

## S3 Integration

This application now uploads images to AWS S3 before sending the URL to the vision API for analysis. 

### Required Environment Variables

In your `.env.local` file, add the following variables:

```
# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key
AWS_REGION=your_region # e.g., us-east-1
S3_BUCKET_NAME=your_bucket_name
```

Make sure your S3 bucket is configured with appropriate CORS settings to allow public read access, and that your AWS IAM user has the necessary permissions to upload objects to the bucket.

### CORS Configuration for S3 Bucket

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": []
  }
]
```

Note: In a production environment, you should restrict the AllowedOrigins to your specific domains.
