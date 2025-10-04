# Contributing to Jobby Runner

Thanks for your interest in helping build a community-led service any town can host. Vibe coders welcome — we aim for friendly, practical collaboration and high‑quality, self‑tested changes.

## Mission
Make job searching — and related resources — easily accessible for young adults. Contributions that improve clarity, accessibility, mobile usability, and guidance for first-time job seekers are especially appreciated.

## What We’re Building
- A small set of serverless functions (DigitalOcean Functions/OpenWhisk) that power job search and related civic services.
- Easily forkable and configurable so any city or community group can host its own instance.

Repo highlights:
- `serverless/` — DO Functions packages (e.g., `usajobs/get-usajobs`).
- `serverless/README.md` — deployment and invocation examples.
- `project.yml` and `serverless/project.yml` — function/package manifests.

## Quick Start
- Prerequisites:
  - Node.js 18+
  - `doctl` v1.98+ logged in: `doctl auth init`
  - DO Serverless plugin (one-time): `doctl serverless install`
- Deploy all functions from repo root:
  - `doctl serverless deploy serverless`
- Get a function URL:
  - `doctl serverless functions get usajobs/get-usajobs --url`
- Invoke via CLI to smoke test:
  - `doctl serverless functions invoke usajobs/get-usajobs -p query "software engineer" -p location "Denver, CO" -p radius 25 -p limit 50`

Tip: You can also call the HTTP URL directly with `curl` (GET or POST JSON). See `serverless/README.md` for examples.

## Development Workflow
- Fork the repo and create a feature branch.
- Make focused, incremental changes; keep PRs small and self‑contained.
- Include a clear description: what changed, why, and how you tested.
- Mark breaking changes clearly and provide migration notes.
- Be polite and specific in reviews; we’re all here to help each other.

## Adding or Updating a Function
Use the existing USAJobs proxy as a reference:
- Source: `serverless/packages/usajobs/get-usajobs/index.js`
- Config: `serverless/project.yml`

To add a new function:
1) Create a new folder under `serverless/packages/<group>/<function>/index.js`.
2) Export `exports.main = async function main(args) { ... }`.
3) Follow the patterns:
   - Parse JSON bodies and query params.
   - Validate inputs; return helpful 4xx errors.
   - Use `CORS` headers for browser calls.
   - Add timeouts and friendly error messages.
4) Register the function in `serverless/project.yml` with `runtime: nodejs:18`, `web: true`, and `main: index.main`.
5) Deploy with `doctl serverless deploy serverless` and verify with `invoke`.

## Local Testing Patterns
These functions are just Node modules; you can unit‑call `main` locally:

Example (Node REPL):
```
> const fn = require('./serverless/packages/usajobs/get-usajobs/index.js');
> fn.main({ query: 'nurse', location: 'Denver, CO', limit: 5 }).then(console.log)
```

For HTTP‑like testing without deploying, keep logic contained in small helpers you can import and test directly. If you add lightweight tests, prefer no external dependencies and keep them colocated (e.g., `index.test.js`).

## Environment and Config
- Prefer configuration via environment variables (e.g., `API_BASE_URL`).
- Never commit secrets or tokens. Use your DO account or a fork to test.
- Keep defaults safe and non‑destructive; document any required env vars.

## Quality Checklist (Self‑Tested)
Before opening a PR, please verify:
- Function deploys successfully: `doctl serverless deploy serverless`.
- Basic invocations behave as expected (both success and error paths).
- Inputs validated and errors are clear (messages + status codes).
- CORS works for browsers (`Access-Control-Allow-Origin: *`).
- Timeouts and upstream failures return helpful 5xx responses.
- README comments and examples updated if behavior or params changed.
- Small, focused diff; unused code removed.

## Reporting Issues and Proposing Features
- Use issues for bugs and proposals. Include steps to reproduce and context.
- For new “towns” or data sources, outline:
  - What source/API you want to proxy
  - Any rate limits/auth needs
  - Expected parameters and example responses
- If unsure how to implement, open an issue first for guidance.

## Community Norms
- Be welcoming and respectful. Assume good intent and ask clarifying questions.
- Prefer empathy over cleverness in reviews and discussions.
- Accessibility and inclusivity matter — reflect this in language and UX.

## Code Style & Patterns
- Node 18+/ES syntax, async/await.
- Small, composable functions; avoid deep nesting.
- Return JSON bodies and consistent error shapes.
- Keep external deps minimal for portability; prefer the platform runtime.

## Governance & Ownership
- Maintainers will triage issues and review PRs as available.
- Clear, helpful PR descriptions speed up reviews.
- If you’re interested in helping maintain a “town” deployment template, say hi in an issue.

## Release & Hosting Notes
- Deploys are manual via `doctl serverless deploy serverless`.
- Each town/community can fork and deploy to its own DO account.
- Document your deployment URL and any custom env overrides in your fork.

## Thanks
This project exists to make it easier for neighbors to help neighbors. Your contributions — code, docs, ideas, and feedback — all make a difference. 💛
