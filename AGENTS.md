# AGENTS.md — CarbonCoach project context

## Goal
CarbonCoach: an AI carbon-footprint assistant for the "urban daily commuter" persona.
Flow: Understand → Track → Reduce. Differentiators: what-if simulator, 90-day reduction
roadmap, "show the math" explainability, profile benchmarking, Gemini insights + deterministic fallback.

## HARD RULES (violation = disqualified)
- Final repo must stay under 10 MB. Never create node_modules, dist, .venv, __pycache__,
  or build output that would get committed — add them to .gitignore from the start.
- The repo will be PUBLIC with a SINGLE branch (main). Do not run any git commands yet;
  we initialize git and commit everything at the END.
- App MUST run locally with NO cloud creds and NO API key (graceful fallback).
- Every external call (Gemini, Firestore, Pub/Sub) is try/except wrapped and optional.

## Stack
- Frontend: React 18 + TypeScript (strict) + Vite + Zustand + Recharts. Tests: Vitest.
- Backend: Python 3.11 + FastAPI + Pydantic v2 + SlowAPI. Tests: pytest.
- AI: Gemini 1.5 Flash — temperature 0.4, JSON output, schema-validated, repair+retry, injection-guarded.
- Cloud (optional, deploy only): Cloud Run, Cloud Build, Secret Manager, Firestore, Pub/Sub, BigQuery.

## Layout
backend/app/{main.py,schemas.py,config.py,carbon_engine/,insight_engine/}
frontend/src/{store.ts,api.ts,components/}
.github/workflows/ci.yml, Dockerfile, cloudbuild.yaml, README.md, .gitignore

## Quality bar
- carbon_engine is PURE (no I/O), fully unit-tested.
- WCAG 2.1 AA, verified with axe-core in CI.
- Zero PII: history keyed by a client-generated random device UUID.
- Strict input validation, CORS allowlist, rate limiting, secrets only from env/Secret Manager.

## Working style
- Always maintain an implementation-plan Artifact and a task list.
- Build in phases; after each phase run tests and verify the app in the browser.
- Do NOT run git/commit/push during the build. Keep diffs small. Ask before adding any dependency.