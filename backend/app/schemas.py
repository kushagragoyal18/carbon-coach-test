"""
CarbonCoach API schemas — Pydantic v2 models for request validation and response structure.
"""

from enum import Enum
from pydantic import BaseModel, Field
from typing import Optional


# ---------- Enums ----------

class TransportMode(str, Enum):
    gasoline_car = "gasoline_car"
    diesel_car = "diesel_car"
    hybrid_car = "hybrid_car"
    ev_car = "ev_car"
    motorcycle = "motorcycle"
    bus = "bus"
    subway = "subway"
    train = "train"
    active = "active"


# ---------- Request Models ----------

class CommuterProfile(BaseModel):
    """Input profile for a single commuter calculation."""
    transport_mode: TransportMode = Field(
        default=TransportMode.gasoline_car,
        description="Primary commute transport mode."
    )
    transport_distance_weekly: float = Field(
        default=0.0, ge=0.0, le=5000.0,
        description="Total weekly commute distance in km."
    )
    meals_meat_weekly: int = Field(
        default=0, ge=0, le=21,
        description="Number of meat-based meals per week."
    )
    meals_veg_weekly: int = Field(
        default=0, ge=0, le=21,
        description="Number of vegetarian meals per week."
    )
    meals_vegan_weekly: int = Field(
        default=0, ge=0, le=21,
        description="Number of vegan meals per week."
    )
    home_energy_kwh_weekly: float = Field(
        default=0.0, ge=0.0, le=1000.0,
        description="Weekly home/office energy usage in kWh."
    )


class WhatIfRequest(BaseModel):
    """Two profiles for side-by-side comparison."""
    current: CommuterProfile
    alternate: CommuterProfile


class RoadmapQuery(BaseModel):
    """Query parameters for roadmap generation."""
    emission_level: str = Field(
        default="moderate",
        pattern=r"^(low|moderate|high)$",
        description="Emission tier: low, moderate, or high."
    )


# ---------- Response Models ----------

class EmissionsBreakdown(BaseModel):
    transport: float
    diet: float
    energy: float
    total: float


class BenchmarkData(BaseModel):
    transport: float
    diet: float
    energy: float
    total: float
    percentage_vs_benchmark: float


class CalculateResponse(BaseModel):
    emissions: EmissionsBreakdown
    benchmarks: BenchmarkData
    math_trace: list[str]


class RecommendationItem(BaseModel):
    title: str
    impact_kg: float
    difficulty: str
    action: str


class InsightsResponse(BaseModel):
    headline: str
    assessment: str
    comparison_vs_benchmark: str
    top_recommendations: list[RecommendationItem]


class WhatIfComparison(BaseModel):
    current: CalculateResponse
    alternate: CalculateResponse
    delta_total: float = Field(description="Difference: current.total - alternate.total (positive = savings)")
    delta_transport: float
    delta_diet: float
    delta_energy: float


class RoadmapMilestone(BaseModel):
    day_range: str
    title: str
    description: str
    difficulty: str
    expected_impact_kg: float
    tasks: list[str]


class RoadmapPhase(BaseModel):
    phase_number: int
    phase_name: str
    day_range: str
    milestones: list[RoadmapMilestone]


class RoadmapResponse(BaseModel):
    emission_level: str
    total_potential_reduction_kg: float
    phases: list[RoadmapPhase]
