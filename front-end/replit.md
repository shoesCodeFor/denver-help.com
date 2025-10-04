# Job Search Map Application

## Overview

A location-based job search platform that allows users to find employment opportunities within a specified radius of any city. The application combines interactive mapping with traditional list-based browsing, displaying real job postings from the USAJobs API with geographic visualization using Leaflet maps. Users can search by city name and radius, view results on an interactive map with markers, and access detailed job information through an intuitive card-based interface.

## Recent Updates (October 2025)

- Integrated with live USAJobs API at https://sea-lion-app-mfl5w.ondigitalocean.app
- Implemented fast geocoding with intelligent coordinate distribution for jobs
- Added interactive selection between map markers and job cards
- Performance optimized: searches complete in under 10 seconds
- Full error handling and loading states
- Added AI chat assistant powered by GenAI Agent API for job search help and career advice

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- React 18 with TypeScript for type-safe component development
- Vite as the build tool and development server
- Wouter for lightweight client-side routing
- TanStack Query (React Query) for server state management and data fetching
- Shadcn/ui component library with Radix UI primitives for accessible UI components
- Tailwind CSS for utility-first styling with custom design tokens
- React-Leaflet 4.2.1 for map integration

**Design System:**
- System-based design approach focused on functionality and scannability
- Custom color palette supporting both light and dark modes
- Inter font family loaded via Google Fonts CDN
- Responsive layout with mobile-first approach
- Component spacing based on Tailwind units (2, 4, 6, 8) for consistency
- Desktop layout: 60% map / 40% list side-by-side
- Mobile layout: Stacked vertically (search → map → list)

**Key Components:**
- `SearchForm`: City input, radius selector (5-100 miles), and search button with loading states
- `JobMap`: Leaflet-based interactive map with job location markers, popups, and selection highlighting
- `JobList`: Scrollable list of job cards with auto-scroll to selected items and job count display
- `JobCard`: Accessible card with aria-selected, keyboard navigation, title, company, location, salary, distance, and description
- `ChatModal`: AI assistant dialog with message history, text/function call handling, and error notifications

**State Management:**
- React Query for asynchronous job search data fetching and caching with explicit queryFn
- Local component state for UI interactions (selected job, search parameters)
- Query key pattern: `["/api/jobs/search", searchParams]` for proper cache invalidation
- Bi-directional selection sync between map and list

### Backend Architecture

**Server Framework:**
- Express.js with TypeScript running on Node.js
- ESM module system for modern JavaScript features
- Custom middleware for request logging and error handling
- Development: Vite middleware integration for HMR
- Production: Static file serving from dist/public

**API Design:**
- Job Search: `GET /api/jobs/search?city={city}&radius={radius}&query={query}`
- Chat: `POST /api/chat` with messages array, proxies to GenAI Agent API
- Query parameter validation using Zod schemas from shared/schema.ts
- Job response format: `{ jobs: Job[], center: { lat, lon } }`
- Chat response: OpenAI-compatible format with support for text and function calls
- Geocoding with rate limiting (1 request/second) and in-memory caching
- Smart coordinate generation for fast performance

**Performance Optimizations:**
- Only geocodes the search city (cached for repeated searches)
- Uses `generateJobCoordinates` function to instantly distribute jobs in concentric rings
- No per-job geocoding to avoid 50+ second delays
- Jobs arranged in realistic circular distribution pattern
- Response times under 10 seconds including external API calls

**Data Flow:**
1. Client sends search request with city, radius, and optional query
2. Server validates parameters using searchJobsSchema
3. Server geocodes city name to coordinates using Nominatim API (cached)
4. Server fetches jobs from USAJobs API with location filtering
5. Jobs are assigned coordinates using ring distribution algorithm
6. Distance calculations for each job from search center
7. Response includes jobs array and map center coordinates

### Data Storage

**Current Implementation:**
- In-memory storage using JavaScript Map for user data (auth scaffolding)
- No persistent database for job listings (fetched on-demand from external API)
- Geocoding results cached in-memory Map to reduce external API calls
- No database required for core functionality

**Schema Definitions:**
- Job schema defined in Zod: id, title, company, location, salary, postedDate, latitude, longitude, distance, description
- SearchJobs schema: city (string, min 1 char), radius (number, 1-100)
- User schema (unused): id (UUID), username (unique), password

### External Dependencies

**Third-Party APIs:**
- **USAJobs API**: Live job search service
  - Base URL: `https://sea-lion-app-mfl5w.ondigitalocean.app/api/usajobs`
  - Parameters: query (job search term), location (city), radius (miles), limit (max results)
  - Returns: { success: boolean, meta: { source, count }, jobs: [...] }
  - Response includes: id, title, company, location, description, salary, posted, url, source

- **Nominatim (OpenStreetMap)**: Geocoding service to convert city names to coordinates
  - Rate limit: 1 request per second (enforced in code)
  - Custom User-Agent header required: "JobSearchMapApp/1.0"
  - Results cached in-memory to minimize API calls
  - Only used for search city, not individual job locations

- **GenAI Agent API**: AI chat assistant for job search help and career advice
  - Base URL: `https://kljuttuu7ewfmcijfonkroyf.agents.do-ai.run/api/v1/chat/completions`
  - OpenAI-compatible chat completions API
  - Supports text responses and function calls
  - Authenticated via Bearer token (CHAT_API_KEY environment variable)
  - Frontend handles both text content and function call responses

**Mapping:**
- **Leaflet.js**: Interactive map rendering library (v1.9.4)
- **React-Leaflet**: React components for Leaflet (v4.2.1)
- **OpenStreetMap Tiles**: Map tile provider for base layers
- Custom marker icons: default (gray) and selected (blue)
- Popup support for job details on map markers
- Dynamic zoom based on job distribution

**UI Libraries:**
- **Radix UI**: Headless accessible component primitives
- **Shadcn/ui**: Pre-styled component library built on Radix
- **Lucide React**: Icon library (Search, MapPin, DollarSign, Clock icons)
- **Class Variance Authority**: Component variant styling system
- **Tailwind Merge & CLSX**: Utility functions for conditional class merging

**Development Tools:**
- **Drizzle Kit**: Database schema migrations and management (configured but unused)
- **TSX**: TypeScript execution for development server
- **ESBuild**: Production bundling for server code
- **Replit-specific plugins**: Runtime error overlay, cartographer, dev banner

## Key Features

1. **Real-time Job Search**: Searches live USAJobs API with city and radius parameters
2. **Interactive Map**: OpenStreetMap with clickable markers, popups, and zoom controls
3. **Synchronized Selection**: Clicking jobs in list highlights map markers and vice versa
4. **Smart Distribution**: Jobs arranged in realistic rings around search center for fast performance
5. **AI Chat Assistant**: Get job search help and career advice from an AI assistant
6. **Accessible UI**: ARIA attributes, keyboard navigation, screen reader support
7. **Responsive Design**: Works on mobile, tablet, and desktop
8. **Error Handling**: Clear error messages for failed searches or invalid cities
9. **Loading States**: Visual feedback during API calls with spinner
10. **Performance**: Fast responses with geocoding cache and smart coordinate generation
