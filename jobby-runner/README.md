# Jobby — Community Job Search (Serverless)

Jobby is a community-run job search service that any town can host. It uses lightweight serverless functions to proxy job data and power a simple, friendly front‑end.

## Mission
Make job searching — and related resources — easily accessible for young adults. We focus on clarity, low friction, and inclusive, mobile-friendly experiences that help first-time job seekers and their supporters (parents, mentors, counselors) find opportunities quickly and safely.

- Live API (example):
  - `https://sea-lion-app-mfl5w.ondigitalocean.app/api/usajobs?query=software%20engineer&location=Denver,%20CO&radius=25&limit=50`
- Front‑end preview (will move to DigitalOcean App Platform):
  - `https://34569451-917c-4090-9e22-2f7ed660dce2-00-32oo9mts52sbf.riker.replit.dev/`

## Architecture
- Front‑end: Static web app that calls the Jobby API over HTTPS.
- API Layer (this repo): DigitalOcean Functions (Apache OpenWhisk) providing a thin proxy to upstream job data.
  - Package: `usajobs`
  - Function: `get-usajobs` — validates inputs, handles CORS, times out safely, and proxies to an upstream base URL.
- Upstream: A hosted endpoint (default is the live API above) that returns job data JSON.

Why a proxy? It stabilizes params/response, adds CORS, timeouts, and friendly errors, and gives each community a simple deployment surface.

## Repository Layout
- `serverless/` — DO Functions source & manifest
  - `packages/usajobs/get-usajobs/index.js` — function source
  - `project.yml` — serverless function/package config
  - `README.md` — deeper usage and schema notes
- `CONTRIBUTING.md` — how to contribute (self‑tested, approachable)
- `CODE_OF_CONDUCT.md` — No Assholes Rule + AI usage policy
 - `DEPLOYMENT.md` — local run, Docker checks, and DigitalOcean deploys

## API — `GET /usajobs`
The function is exposed as a web action. It accepts query params and returns JSON from the upstream.

Parameters:
- `query` (string, required): e.g., `software engineer`
- `location` (string, required): e.g., `Denver, CO`
- `radius` (integer, optional): miles, default `25`
- `limit` (integer, optional): default `50`, max `100`

Example (HTTP GET):
```
curl "<FUNCTION_URL>?query=software%20engineer&location=Denver%2C%20CO&radius=25&limit=50"
```

Example (HTTP POST JSON):
```
curl -X POST -H "Content-Type: application/json" \
  -d '{"query":"software engineer","location":"Denver, CO","radius":25,"limit":50}' \
  "<FUNCTION_URL>"
```

Notes:
- CORS is enabled: `Access-Control-Allow-Origin: *`.
- Errors are returned with helpful messages and appropriate status codes.
- Response is a pass‑through of upstream JSON; shape may vary by upstream.

## Local Setup
Prerequisites:
- Node.js 18+
- DigitalOcean CLI `doctl` v1.98+ authenticated: `doctl auth init`
- DO Serverless plugin installed (one‑time): `doctl serverless install`

Setup steps:
1) Clone this repo.
2) Optional: set an upstream base URL via env var `API_BASE_URL` (defaults to the live API above). You can set this in the DO Functions UI after deploy.
3) Deploy from the repo root:
   - `doctl serverless deploy serverless`
4) Get your function URL:
   - `doctl serverless functions get usajobs/get-usajobs --url`
5) Smoke test:
   - `doctl serverless functions invoke usajobs/get-usajobs -p query "software engineer" -p location "Denver, CO" -p radius 25 -p limit 50`

### Local Testing (without deployment)
These functions are plain Node modules. You can call `main` directly:
```
node -e "(async () => { const fn=require('./serverless/packages/usajobs/get-usajobs/index.js'); const res=await fn.main({query:'nurse',location:'Denver, CO',limit:5}); console.log(res); })()"
```
This exercises validation and proxy logic locally. Network calls still go to the configured upstream URL.

## Environment Configuration
- `API_BASE_URL` (optional): override the upstream endpoint the proxy calls. If unset, defaults to the live API above.

Where to set it:
- After deploy, set in DigitalOcean: Functions > `usajobs/get-usajobs` > Settings > Environment Variables > add `API_BASE_URL`.
- Alternatively, maintainers may wire env through manifest or CI/CD in their own forks.

## Front‑end Integration
- The front‑end should call the function URL you retrieved above.
- For local development, you can point the front‑end env (e.g., `VITE_API_URL`, `NEXT_PUBLIC_API_URL`, etc.) to your function URL.
- The preview front‑end will migrate to DigitalOcean App Platform; when it does, configure its env var to the function URL.

## Deployment
See `DEPLOYMENT.md` for:
- Running functions and front‑end locally
- Building/running the front‑end Docker image
- Deploying functions with `doctl` and front‑end via DO App Platform (auto on `main`)

## Deploying Your Own “Town”
- Fork this repository.
- Deploy the serverless functions to your DO account.
- Set `API_BASE_URL` if you have a different upstream or a local data source.
- Host your front‑end (DO App Platform or static hosting) and point it at your function URL.

## Contributing & Conduct
- See `CONTRIBUTING.md` for workflow, quality checklist, and local testing tips.
- See `CODE_OF_CONDUCT.md` for community expectations and AI‑usage policy. Short version: don’t be a jerk; if AI writes code, it also writes tests.

## Troubleshooting
- 400 errors: missing `query` or `location` params — check your request.
- 5xx from proxy: upstream unavailable or timed out — try again, inspect `error` and `message` in JSON.
- CORS issues: ensure you’re calling the function URL (not the upstream directly) from the browser.

## Roadmap
- Additional data sources and normalizers for more regions.
- Front‑end move to DigitalOcean App Platform with town‑theming.
- Lightweight integration tests and sample UI fixtures.

---
Built for neighbors helping neighbors. 💛
