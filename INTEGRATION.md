# Frontend and Backend Integration Guide

This document explains how the frontend React application and Express backend are integrated in this project.

## Architecture Overview

The application consists of two main components:

1. **Express Backend API**: A Node.js/Express application that provides the job search API endpoints
2. **React Frontend**: A Vite-based React application with TypeScript that provides the user interface

## Integration Approach

The frontend and backend are integrated using the following approach:

- The Express backend serves the built frontend assets at the root URL (`/`)
- All API endpoints are maintained under the `/api` prefix
- The frontend is built as a static site and placed in the expected location for Express to serve
- For any non-API routes, the Express server serves the frontend `index.html` to enable client-side routing

## Directory Structure

```
/                             # Project root
├── front-end/                # Frontend application (React/Vite)
│   ├── client/              # React source code
│   ├── server/              # Development server (not used in production)
│   ├── package.json         # Frontend dependencies
│   └── vite.config.ts       # Vite configuration
├── src/                     # Backend source code
│   ├── providers/           # Job search API providers
│   └── ...                  # Other backend code
├── dist/                    # Production build output
│   └── public/              # Frontend built assets (created during Docker build)
├── server.js                # Express server main file
├── package.json             # Backend dependencies
└── Dockerfile               # Docker configuration for both frontend and backend
```

## Build Process

The frontend and backend are built in the following order:

1. Backend dependencies are installed
2. Frontend dependencies are installed
3. Frontend application is built using Vite
4. Frontend built assets are placed in the `dist/public` directory
5. Express server is started, serving both the API and frontend

## Docker Build Process

The Dockerfile handles the complete build process:

1. Installs backend dependencies
2. Installs frontend dependencies
3. Builds the frontend application
4. Moves the built frontend assets to the location expected by Express
5. Starts the Express server when the container is run

## Development Workflow

### Local Development

For local development, you can run both applications separately:

1. **Backend**: Run `npm start` in the project root
2. **Frontend**: Run `npm run dev` in the `front-end` directory

### Building for Production

To build for production:

1. Run `docker build -t denver-help .` to build the Docker image
2. Run `docker run -p 3000:3000 denver-help` to run the container

## Making Changes

### Frontend Changes

1. Make changes to the React application in the `front-end/client` directory
2. Test your changes by running the frontend development server
3. Rebuild the Docker image to include your changes in production

### Backend Changes

1. Make changes to the Express server code
2. Test your changes by running the backend server
3. Rebuild the Docker image to include your changes in production

## Troubleshooting

### Missing Frontend Files

If the frontend files are not being served correctly:

1. Check that the frontend build was successful
2. Verify that the frontend files were copied to the `dist/public` directory
3. Check the Express static file serving middleware is correctly configured

### API Endpoints Not Working

1. Ensure all API routes are properly defined in `server.js`
2. Check that API routes are prefixed with `/api`
3. Verify the frontend is making requests to the correct API endpoints