# USAJobs Search API

A professional API for searching government job listings through the official USAJobs API.

## Overview

This API provides a simple interface to search for federal job opportunities from USAJobs.gov, the official job site of the United States Federal Government. The API returns structured data about job listings, including position details, salary information, location data, and application instructions.

## Installation

1. Clone this repository
2. Install dependencies:

```bash
cd usajobs-api
npm install
```

3. Start the server:

```bash
npm start
```

The server will run on port 3000 by default.

## API Endpoints

### Search for Jobs

```
GET /api/usajobs
```

Parameters:
- `query` - Job search keywords (e.g., "nurse", "software engineer")
- `location` - Location to search (e.g., "Denver, CO", "Washington, DC")
- `radius` - Search radius in miles (default: 25)
- `limit` - Maximum number of results to return (default: 100)

Example Request:
```
GET /api/usajobs?query=software%20engineer&location=Denver,%20CO&radius=25&limit=50
```

Example Response:
```json
{
  "success": true,
  "meta": {
    "source": "usajobs",
    "count": 24
  },
  "stats": {
    "topCompanies": [
      ["Department of Agriculture", 5],
      ["Department of Defense", 3],
      ["Department of Veterans Affairs", 2]
    ],
    "locationDistribution": [...],
    "salaryInfo": {
      "count": 24,
      "percentage": 100
    }
  },
  "jobs": [
    {
      "id": "12345678",
      "title": "Software Engineer",
      "company": "Department of Agriculture",
      "location": "Denver, CO",
      "description": "As a Software Engineer, you will design, develop, and maintain...",
      "salary": "$75,000 - $110,000 Per Year",
      "posted": "Posted 10/01/2025",
      "url": "https://www.usajobs.gov/job/12345678",
      "source": "USAJobs",
      "departmentName": "Department of Agriculture",
      "jobGrade": "GS-13",
      "applyBy": "11/01/2025"
    },
    ...
  ]
}
```

## Example API Calls

### Healthcare Positions

#### 1. Registered Nurses in Denver

```
GET /api/usajobs?query=registered%20nurse&location=Denver,%20CO&radius=25
```

#### 2. Healthcare Administration in Washington DC

```
GET /api/usajobs?query=healthcare%20administration&location=Washington,%20DC&radius=25
```

#### 3. Medical Technicians Nationwide

```
GET /api/usajobs?query=medical%20technician
```

#### 4. Pharmacists in San Francisco

```
GET /api/usajobs?query=pharmacist&location=San%20Francisco,%20CA&radius=50
```

#### 5. Mental Health Professionals

```
GET /api/usajobs?query=mental%20health&location=New%20York,%20NY&radius=25
```

### Entry-Level Positions

#### 1. Entry-Level Government Jobs

```
GET /api/usajobs?query=entry%20level&location=Washington,%20DC
```

#### 2. Recent Graduate Positions

```
GET /api/usajobs?query=recent%20graduate&location=Chicago,%20IL&radius=50
```

#### 3. Administrative Assistant Roles

```
GET /api/usajobs?query=administrative%20assistant&location=Austin,%20TX
```

#### 4. GS-5 Level Positions in Denver

```
GET /api/usajobs?query=GS-5&location=Denver,%20CO&radius=50
```

#### 5. Internships Nationwide

```
GET /api/usajobs?query=internship&location=United%20States
```

## Additional Search Parameters

USAJobs API supports various additional parameters that can be used to refine your search:

- `jobCategory` - Filter by job category code
- `payGrade` - Filter by GS level (e.g., "GS-5", "GS-7")
- `hiringPath` - Filter by hiring path (e.g., "public", "student", "veteran")
- `postalCode` - Search by postal code instead of city/state

## Error Handling

The API returns appropriate HTTP status codes along with error messages:

- `400 Bad Request` - Missing required parameters
- `500 Internal Server Error` - Server-side errors

Example error response:
```json
{
  "success": false,
  "error": "missing_parameter",
  "message": "The location parameter is required"
}
```

## Running Tests

To test the USAJobs API integration:

```bash
node test-usajobs-api.js
```

This script makes a direct request to the USAJobs API to verify connectivity and proper response handling.