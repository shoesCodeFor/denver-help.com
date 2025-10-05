# Deployment Guide — Jobby

This guide covers running Jobby locally, validating a Docker image for the front‑end, and deploying to DigitalOcean (Functions + App Platform). It assumes you’ve reviewed README.md for context and API details.

## Components
- Front‑end: Static/SPAs app in its own directory (e.g., `frontend/`). Deploys to DigitalOcean App Platform. Auto‑deploys on pushes to `main`.
- Functions (API proxy): DigitalOcean Functions in `serverless/` (OpenWhisk). Deployed with `doctl`.
- Upstream API: Default is the hosted USAJobs proxy URL; can be overridden per deployment via `API_BASE_URL`.
- Agent (optional): “DO Agent” service accessible via API. Updates are manual (see “Agent updates”).

## Prerequisites
- Node.js 18+
- DigitalOcean CLI `doctl` v1.98+ and authenticated: `doctl auth init`
- DO Serverless plugin installed (one‑time): `doctl serverless install`
- Docker Desktop or Docker Engine (for local image builds)

## Local Development
### Functions (API) locally
You can call the serverless function’s `main` directly without deploying:

```
node -e "(async () => { const fn=require('./serverless/packages/usajobs/get-usajobs/index.js'); const res=await fn.main({query:'nurse',location:'Denver, CO',limit:5}); console.log(res); })()"
```

Notes:
- This exercises validation/CORS/error paths but still calls the configured upstream over the network.
- For end‑to‑end browser testing, deploy to a DO dev project and point the front‑end to that URL.

### Front‑end locally
Within the front‑end directory (e.g., `frontend/`):
- Install deps: `npm install` (or `pnpm install`, `yarn install`)
- Set env to point at your function URL or the live API (e.g., `VITE_API_URL`, `NEXT_PUBLIC_API_URL`)
- Run dev server: `npm run dev`

## Docker (Front‑end)
If your front‑end includes a `Dockerfile`, build and run it locally:

Build:
```
docker build -t jobby-frontend ./frontend
```
Run (example ports):
```
docker run --rm -it -p 3000:3000 -e JOBBY_API_URL="<FUNCTION_URL>" jobby-frontend
```

Tips:
- Replace `./frontend` with your actual front‑end directory.
- Use the env var your app expects (e.g., `VITE_API_URL`, `NEXT_PUBLIC_API_URL`, or `JOBBY_API_URL`).
- The serverless functions are not containerized; they run on DigitalOcean Functions via `doctl`.

## DigitalOcean — Functions (API)
Source lives under `serverless/`. See `serverless/README.md` for CLI and schema details.

Deploy from repo root:
```
doctl serverless deploy serverless
```
Get the function URL:
```
doctl serverless functions get usajobs/get-usajobs --url
```
Smoke test (CLI):
```
doctl serverless functions invoke usajobs/get-usajobs \
  -p query "software engineer" -p location "Denver, CO" -p radius 25 -p limit 50
```

Environment configuration:
- Optional `API_BASE_URL` env var for the function to override the upstream base URL.
- Set it in the DO UI: Functions > `usajobs/get-usajobs` > Settings > Environment Variables.

## DigitalOcean — App Platform (Front‑end)
- The front‑end lives in its own directory and deploys to DO App Platform.
- Auto‑deployment: configured to build and deploy on pushes to `main`.

Initial setup (one‑time in DO console):
- Create a new App from GitHub/Git repo
- Select the front‑end directory as the App’s source
- Set environment variable to the function URL (e.g., `JOBBY_API_URL` or your app’s expected var)
- Choose starter build command and run command as needed (framework‑specific)
- Enable automatic deploys on `main`

Updating:
- Push to `main` to trigger an automatic front‑end deployment.
- Update the function separately via `doctl serverless deploy serverless` when API changes.

## Agent Updates (Manual)
If you maintain a “DO Agent” accessible via API:
- Changes to the agent are updated manually (outside App Platform auto‑deploys).
- Use the agent’s documented API to update its configuration or content.
- Keep the function and front‑end in sync with any agent schema/contract changes.

## Environments
- Dev: optional DO project with test function URL; front‑end pointed to dev function.
- Prod: `main` branch auto‑deploys front‑end; functions are deployed via `doctl` from `main`.
- Consider per‑env `API_BASE_URL` and front‑end API URL variables.

## Verification & Rollback
Verification:
- Functions: invoke via CLI and verify HTTP GET/POST from curl/browser.
- Front‑end: hit the App URL, confirm searches work, check CORS and error handling.

Rollback:
- Front‑end: revert the commit on `main`; App Platform will redeploy the previous version.
- Functions: redeploy the last known good commit via `doctl serverless deploy serverless`.

## Common Issues
- 400 from function: missing `query` or `location`.
- 5xx from function: upstream unavailable or timed out; inspect `error/message` in JSON.
- CORS errors: ensure you’re calling the function URL (not upstream) from the browser.

---
For detailed function parameters and upstream schema notes, see `serverless/README.md`.
