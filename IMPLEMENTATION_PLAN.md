# Implementation Plan

## Current Focus
Fix Netlify frontend deployment configuration.

## Task List
- [x] Trace frontend-to-backend footprint calculation flow.
- [x] Confirm pure carbon engine returns a valid footprint.
- [x] Surface calculation/API errors in the React UI.
- [x] Serve the built frontend from FastAPI for Docker/Cloud Run runs.
- [x] Run focused backend/frontend checks without committing generated output.
- [ ] Verify the calculation flow locally in the browser.
- [x] Add explicit Netlify frontend build configuration.
- [x] Make production API base URL configurable for static hosting.

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
