"""
CarbonCoach — FastAPI Application
AI-powered carbon footprint assistant for urban daily commuters.
"""

import logging
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, Request, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from app.config import settings
from app.schemas import (
    CommuterProfile,
    WhatIfRequest,
    CalculateResponse,
    InsightsResponse,
    WhatIfComparison,
    RoadmapResponse,
)
from app.carbon_engine.engine import run_carbon_engine
from app.carbon_engine.roadmap import generate_roadmap
from app.insight_engine.insights import run_insight_engine

# Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Rate limiter
limiter = Limiter(key_func=get_remote_address)

# Built frontend location in the Docker/Cloud Run runtime.
STATIC_DIR = Path(__file__).resolve().parent.parent / "static"
INDEX_FILE = STATIC_DIR / "index.html"


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events."""
    logger.info(f"🌱 {settings.APP_NAME} v{settings.APP_VERSION} starting up")
    logger.info(f"   Gemini API key: {'configured' if settings.GEMINI_API_KEY else 'not set (deterministic fallback)'}")
    yield
    logger.info(f"🛑 {settings.APP_NAME} shutting down")


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="AI-powered carbon footprint assistant for urban daily commuters.",
    lifespan=lifespan,
)

# Attach rate limiter
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------- Endpoints ----------


@app.get("/api/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "gemini_available": bool(settings.GEMINI_API_KEY),
    }


@app.post("/api/calculate", response_model=CalculateResponse)
@limiter.limit(settings.RATE_LIMIT)
async def calculate_emissions(request: Request, profile: CommuterProfile):
    """
    Calculate carbon emissions for a commuter profile.
    Returns emissions breakdown, benchmark comparison, and full math trace.
    """
    device_uuid = request.headers.get("X-Device-UUID", "anonymous")
    logger.info(f"[{device_uuid}] /calculate — mode={profile.transport_mode.value}, dist={profile.transport_distance_weekly}km")

    profile_dict = profile.model_dump()
    profile_dict["transport_mode"] = profile.transport_mode.value

    result = run_carbon_engine(profile_dict)
    return result


@app.post("/api/insights", response_model=InsightsResponse)
@limiter.limit(settings.RATE_LIMIT)
async def get_insights(request: Request, profile: CommuterProfile):
    """
    Generate personalized carbon reduction insights.
    Uses Gemini AI when API key is available, otherwise deterministic fallback.
    """
    device_uuid = request.headers.get("X-Device-UUID", "anonymous")
    logger.info(f"[{device_uuid}] /insights — requesting personalized insights")

    profile_dict = profile.model_dump()
    profile_dict["transport_mode"] = profile.transport_mode.value

    # First calculate emissions
    emissions_result = run_carbon_engine(profile_dict)

    # Then generate insights
    try:
        insights = run_insight_engine(profile_dict, emissions_result)
    except Exception as e:
        logger.error(f"Insight engine error: {e}. Using minimal fallback.")
        insights = {
            "headline": "Your Carbon Snapshot",
            "assessment": "We calculated your emissions. Check the dashboard for details.",
            "comparison_vs_benchmark": f"Your total is {emissions_result['emissions']['total']:.1f} kg CO2/week.",
            "top_recommendations": [
                {
                    "title": "Explore Transit Options",
                    "impact_kg": 3.0,
                    "difficulty": "Easy",
                    "action": "Try public transit for one commute day this week.",
                },
                {
                    "title": "Try a Meatless Day",
                    "impact_kg": 2.0,
                    "difficulty": "Easy",
                    "action": "Replace one meat meal with a vegetarian option.",
                },
            ],
        }

    return insights


@app.post("/api/what-if", response_model=WhatIfComparison)
@limiter.limit(settings.RATE_LIMIT)
async def what_if_comparison(request: Request, scenario: WhatIfRequest):
    """
    Compare two commuter profiles side-by-side.
    Returns emissions for both scenarios and the delta (savings).
    """
    device_uuid = request.headers.get("X-Device-UUID", "anonymous")
    logger.info(f"[{device_uuid}] /what-if — running scenario comparison")

    current_dict = scenario.current.model_dump()
    current_dict["transport_mode"] = scenario.current.transport_mode.value

    alternate_dict = scenario.alternate.model_dump()
    alternate_dict["transport_mode"] = scenario.alternate.transport_mode.value

    current_result = run_carbon_engine(current_dict)
    alternate_result = run_carbon_engine(alternate_dict)

    c_em = current_result["emissions"]
    a_em = alternate_result["emissions"]

    return {
        "current": current_result,
        "alternate": alternate_result,
        "delta_total": round(c_em["total"] - a_em["total"], 2),
        "delta_transport": round(c_em["transport"] - a_em["transport"], 2),
        "delta_diet": round(c_em["diet"] - a_em["diet"], 2),
        "delta_energy": round(c_em["energy"] - a_em["energy"], 2),
    }


@app.get("/api/roadmap", response_model=RoadmapResponse)
@limiter.limit(settings.RATE_LIMIT)
async def get_roadmap(
    request: Request,
    emission_level: str = Query(
        default="moderate",
        pattern=r"^(low|moderate|high)$",
        description="Emission tier for roadmap: low, moderate, or high.",
    ),
):
    """
    Generate a 90-day carbon reduction roadmap.
    Three phases (Easy → Medium → Advanced) with actionable milestones.
    """
    device_uuid = request.headers.get("X-Device-UUID", "anonymous")
    logger.info(f"[{device_uuid}] /roadmap — level={emission_level}")

    roadmap = generate_roadmap(emission_level)
    return roadmap


# ---------- Frontend Static App ----------


if INDEX_FILE.exists():
    assets_dir = STATIC_DIR / "assets"
    if assets_dir.exists():
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}", include_in_schema=False)
    async def serve_frontend(request: Request, full_path: str):
        """Serve the React single-page app for non-API routes."""
        if request.url.path.startswith("/api"):
            return JSONResponse(status_code=404, content={"detail": "API route not found"})
        return FileResponse(INDEX_FILE)
