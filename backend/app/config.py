"""
CarbonCoach application configuration.
All secrets sourced from environment variables with graceful defaults.
"""

from dataclasses import dataclass
import os
from typing import Optional


@dataclass(frozen=True)
class Settings:
    """
    Application settings loaded from environment variables.
    All fields have safe defaults so the app works locally with zero configuration.
    """

    # AI — optional, app falls back to deterministic insights when absent
    GEMINI_API_KEY: Optional[str] = os.getenv("GEMINI_API_KEY")

    # CORS — comma-separated origins, defaults to Vite dev server
    CORS_ORIGINS: str = os.getenv(
        "CORS_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173",
    )

    # Rate limiting (requests per minute per IP)
    RATE_LIMIT: str = os.getenv("RATE_LIMIT", "60/minute")

    # App metadata
    APP_NAME: str = os.getenv("APP_NAME", "CarbonCoach")
    APP_VERSION: str = os.getenv("APP_VERSION", "1.0.0")

    @property
    def cors_origin_list(self) -> list[str]:
        """Parse comma-separated CORS origins into a list."""
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]


settings = Settings()
