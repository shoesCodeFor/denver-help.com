# DigitalOcean Function: get-usajobs

Serverless function that proxies USAJobs searches to your existing DO App endpoint, matching the OpenAI tool spec `get_usajobs`.

## Prerequisites
- doctl v1.98+ installed and authenticated: `doctl auth init`
- Serverless plugin installed (one-time): `doctl serverless install`

## Deploy
- From repo root:
  - `doctl serverless deploy serverless`

## Get URL
- `doctl serverless functions get usajobs/get-usajobs --url`

## Invoke (CLI)
- `doctl serverless functions invoke usajobs/get-usajobs -p query "software engineer" -p location "Denver, CO" -p radius 25 -p limit 50`

## Invoke (HTTP)
- GET:
  - `curl "<FUNCTION_URL>?query=software%20engineer&location=Denver%2C%20CO&radius=25&limit=50"`
- POST:
  - `curl -X POST -H "Content-Type: application/json" -d '{"query":"software engineer","location":"Denver, CO","radius":25,"limit":50}' "<FUNCTION_URL>"`

## Configuration
- Optional env override: `API_BASE_URL` (defaults to `https://sea-lion-app-mfl5w.ondigitalocean.app/api/usajobs`).
- CORS: `Access-Control-Allow-Origin: *` is enabled for browser calls.

## OpenAI Tool Mapping
- Name: `get_usajobs`
- Params: `query` (string), `location` (string), `radius` (number, default 25), `limit` (number, default 50)
- Response: JSON pass-through from upstream.

## OpenAI Input Schema
Define input as an object with a `parameters` array of OpenAPI Parameter objects.

```json
{
  "parameters": [
    {
      "name": "query",
      "in": "query",
      "description": "Search keywords, e.g., 'software engineer'",
      "required": true,
      "schema": { "type": "string" }
    },
    {
      "name": "location",
      "in": "query",
      "description": "City, State (or region), e.g., 'Denver, CO'",
      "required": true,
      "schema": { "type": "string" }
    },
    {
      "name": "radius",
      "in": "query",
      "description": "Search radius in miles (default 25)",
      "required": false,
      "schema": { "type": "integer", "minimum": 1, "default": 25 }
    },
    {
      "name": "limit",
      "in": "query",
      "description": "Maximum number of results (default 50)",
      "required": false,
      "schema": { "type": "integer", "minimum": 1, "maximum": 100, "default": 50 }
    }
  ]
}
```

## OpenAI Output Schema
Optional schema describing the function’s response shape using an OpenAPI Schema Object. The function proxies upstream JSON; this schema represents a normalized structure you can target when chaining tools.

```json
{
  "type": "object",
  "properties": {
    "query": { "type": "string", "description": "Echo of the search query" },
    "location": { "type": "string", "description": "Echo of the search location" },
    "total": { "type": "integer", "description": "Total results if known" },
    "results": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id": { "type": "string", "description": "Stable job identifier" },
          "title": { "type": "string" },
          "organization": { "type": "string" },
          "location": { "type": "string" },
          "url": { "type": "string", "format": "uri", "description": "Job detail or apply URL" },
          "posted_at": { "type": "string", "description": "ISO-8601 date or datetime" },
          "salary_min": { "type": "number" },
          "salary_max": { "type": "number" }
        },
        "required": ["id", "title", "location", "url"],
        "additionalProperties": true
      }
    }
  },
  "required": ["results"],
  "additionalProperties": false
}
```

Notes:
- Actual HTTP response is a pass-through from the upstream USAJobs proxy. Align your client mapping accordingly.
- Tighten validation by setting `additionalProperties: false` on items and enumerating all fields you consume.

## Update & Redeploy
- Edit function: `serverless/packages/usajobs/get-usajobs/index.js`
- Deploy again: `doctl serverless deploy serverless`
