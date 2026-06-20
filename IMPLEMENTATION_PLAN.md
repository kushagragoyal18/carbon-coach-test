# Implementation Plan

## Current Focus
Add a no-Google-billing backend deployment path.

## Task List
- [x] Trace frontend-to-backend footprint calculation flow.
- [x] Confirm pure carbon engine returns a valid footprint.
- [x] Surface calculation/API errors in the React UI.
- [x] Serve the built frontend from FastAPI for Docker/Cloud Run runs.
- [x] Run focused backend/frontend checks without committing generated output.
- [ ] Verify the calculation flow locally in the browser.
- [x] Add explicit Netlify frontend build configuration.
- [x] Make production API base URL configurable for static hosting.
- [x] Remove required Gemini secret from default Cloud Build deploy.
- [x] Add Docker build context ignore file.
- [x] Document Cloud Run-only deployment path.
- [x] Diagnose local `gcloud services enable` failure.
- [x] Add missing Google Cloud CLI setup steps to README.
- [x] Add Render backend deployment configuration.
- [x] Document Netlify frontend plus Render backend wiring.

## Notes
- The pure carbon engine calculates the default profile as 43.9 kg CO2/week.
- The app stores errors in Zustand and the root UI now renders them as an alert.
- The Dockerfile copies `frontend/dist` to `/app/static`, and FastAPI now serves that directory when it exists.
- Backend tests passed: `python -m pytest app\tests -p no:cacheprovider` (10 passed, 1 warning from deprecated `google.generativeai`).
- `/api/calculate` smoke test returned 43.9 kg CO2/week for the default profile.
- Frontend strict TypeScript passed with `tsc --noEmit`.
- Frontend Vitest passed: 1 file, 7 tests.
- Local frontend and backend servers are reachable at `http://127.0.0.1:5173` and `http://127.0.0.1:8000`.
- In-app browser verification is blocked by a browser runtime startup error: `windows sandbox failed: spawn setup refresh`.
- Netlify frontend deploy uses `netlify.toml` with `base = "frontend"`, `command = "npm run build"`, and `publish = "dist"`.
- Static Netlify deploys require `VITE_API_BASE_URL` to point at a separately hosted FastAPI backend.
- Netlify config check passed by inspection; local `frontend/dist` was not created.
- Frontend checks after Netlify patch passed: `tsc --noEmit` and Vitest (7 tests).
- Cloud Run is now the recommended hackathon deployment path.
- `cloudbuild.yaml` creates or reuses the Artifact Registry repository, builds the Docker image, pushes it, and deploys to Cloud Run without requiring `GEMINI_API_KEY`.
- Cloud Build image tags use `$BUILD_ID` so manual `gcloud builds submit --config cloudbuild.yaml .` deploys do not depend on a Git commit SHA.
- `Dockerfile` now respects Cloud Run's `PORT` environment variable.
- `.dockerignore` prevents local dependencies, build output, caches, logs, and secrets from entering the Docker build context.
- Post Cloud Run patch checks passed: backend pytest (10 passed), frontend `tsc --noEmit`, and Vitest (7 passed). No local `frontend/dist` was created.
- Local deploy command failed because `gcloud` is not installed or not available on `PATH`.
- Google Cloud billing is blocking Cloud Run for the user.
- Render is the preferred no-Google-billing backend alternative for the existing FastAPI app.
- `render.yaml` deploys the `backend/` folder as a Python web service named `carboncoach-api`.
- Netlify must set `VITE_API_BASE_URL` to the Render backend URL with `/api` appended.
- Render must set `CORS_ORIGINS` to the Netlify site URL.
- `CORS_ORIGINS` is a custom Render environment variable, not a built-in option; add it under Environment > Edit.
- `render.yaml` now includes a placeholder `CORS_ORIGINS` value that must be replaced with the real Netlify site URL.
