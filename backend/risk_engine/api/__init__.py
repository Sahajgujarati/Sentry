"""
Risk Engine FastAPI Router — Module 7
======================================
Exposes the Risk Engine as an HTTP API consumed by:
  - Person 1 (Orchestrator / LangGraph) via POST /risk/analyze
  - Person 4 (Frontend) via GET /risk/health

Endpoints
---------
POST /risk/analyze
    Accepts a RiskInput JSON body.
    Returns a RiskReport JSON response.

GET /risk/health
    Returns service health status and version metadata.

GET /risk/demo
    Returns a pre-built demo RiskReport using a sample hurricane scenario.
    Useful for frontend development without requiring live orchestrator input.

Design Rules
------------
- No LLM / LangGraph / external API / database logic.
- All heavy calculation is delegated to engine.run_risk_engine().
- All inputs and outputs are validated by Pydantic v2 models.
- Errors return structured JSON with clear messages.
"""

from __future__ import annotations

import traceback
from typing import Any, Dict

from fastapi import APIRouter, HTTPException, status
from fastapi.responses import JSONResponse

from backend.risk_engine.schemas.risk_input import (
    Event,
    HistoricalAnalysis,
    HistoricalEvent,
    Holding,
    MarketAssetData,
    NewsAnalysis,
    Portfolio,
    RiskInput,
    WeatherAnalysis,
)
from backend.risk_engine.schemas.risk_output import RiskReport
from backend.risk_engine.engine import run_risk_engine

# ---------------------------------------------------------------------------
# Router
# ---------------------------------------------------------------------------

router = APIRouter(
    prefix="/risk",
    tags=["Risk Engine"],
    responses={
        422: {"description": "Validation error — check your RiskInput payload."},
        500: {"description": "Internal risk engine error."},
    },
)

# Module version — increment when adding new features
_MODULE_VERSION = "7.0.0"


# ---------------------------------------------------------------------------
# Health endpoint
# ---------------------------------------------------------------------------

@router.get(
    "/health",
    summary="Risk Engine health check",
    response_model=Dict[str, Any],
)
async def health_check() -> Dict[str, Any]:
    """
    Returns the current health status of the Risk Engine service.

    Always returns HTTP 200 if the service is running.
    """
    return {
        "status": "ok",
        "service": "risk_engine",
        "version": _MODULE_VERSION,
        "modules": [
            "Module 1 — Pydantic Schemas",
            "Module 2 — Portfolio & Sector Exposure",
            "Module 3 — Historical Event Analysis",
            "Module 4 — Scenario & Forecast Engine",
            "Module 5 — Stress Testing Engine",
            "Module 6 — Risk Score, Confidence & Drivers",
            "Module 7 — FastAPI Risk Engine API",
        ],
    }


# ---------------------------------------------------------------------------
# Main analysis endpoint
# ---------------------------------------------------------------------------

@router.post(
    "/analyze",
    summary="Run full risk analysis",
    response_model=RiskReport,
    status_code=status.HTTP_200_OK,
    responses={
        200: {
            "description": "Successful risk analysis — returns a full RiskReport.",
            "content": {
                "application/json": {
                    "example": {
                        "risk_score": 72.4,
                        "risk_level": "High",
                        "confidence": 0.8,
                    }
                }
            },
        }
    },
)
async def analyze_risk(risk_input: RiskInput) -> RiskReport:
    """
    Accepts a structured `RiskInput` evidence package from Person 1 (Orchestrator)
    and returns a fully-populated quantitative `RiskReport`.

    **Pipeline executed:**
    1. Portfolio & sector exposure (Module 2)
    2. Historical descriptive statistics (Module 3)
    3. Mild / Base / Severe scenario projections (Module 4)
    4. Stress tests across -2%, -5%, -10%, -15% sector shocks (Module 5)
    5. Composite risk score, confidence, and risk drivers (Module 6)
    6. Full `RiskReport` assembly

    **Important:** All outputs are prototype estimates based on historical analogs and
    available real-time signals, **not** guaranteed financial predictions.
    """
    try:
        report: RiskReport = run_risk_engine(risk_input)
        return report
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Risk Engine validation error: {exc}",
        ) from exc
    except Exception as exc:
        # Log the full traceback for debugging during hackathon
        tb = traceback.format_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Risk Engine internal error: {exc}\n\n{tb}",
        ) from exc


# ---------------------------------------------------------------------------
# Demo endpoint — for frontend development
# ---------------------------------------------------------------------------

def _build_demo_input() -> RiskInput:
    """Constructs a representative hurricane energy demo RiskInput."""
    return RiskInput(
        event=Event(
            type="hurricane",
            name="Hurricane Demo Alpha",
            severity=4,
            location="Gulf of Mexico",
            affected_regions=["Texas", "Louisiana"],
            affected_sectors=["Energy", "Utilities"],
            description="Category 4 hurricane approaching the Gulf Coast energy corridor.",
        ),
        portfolio=Portfolio(
            holdings=[
                Holding(ticker="XOM", quantity=500, current_price=108.50, sector="Energy"),
                Holding(ticker="CVX", quantity=300, current_price=152.75, sector="Energy"),
                Holding(ticker="SLB", quantity=400, current_price=45.20,  sector="Energy"),
                Holding(ticker="SO",  quantity=200, current_price=68.40,  sector="Utilities"),
                Holding(ticker="MSFT", quantity=150, current_price=415.30, sector="Technology"),
                Holding(ticker="JPM",  quantity=100, current_price=198.60, sector="Financials"),
            ],
            cash=50_000.0,
        ),
        market={
            "XOM":  MarketAssetData(daily_change=-0.032, weekly_change=-0.051, volatility_30d=0.28),
            "CVX":  MarketAssetData(daily_change=-0.027, weekly_change=-0.044, volatility_30d=0.25),
            "SLB":  MarketAssetData(daily_change=-0.041, weekly_change=-0.065, volatility_30d=0.34),
            "SO":   MarketAssetData(daily_change=-0.018, weekly_change=-0.031, volatility_30d=0.18),
            "MSFT": MarketAssetData(daily_change=0.005,  weekly_change=0.012,  volatility_30d=0.22),
            "JPM":  MarketAssetData(daily_change=-0.008, weekly_change=-0.015, volatility_30d=0.19),
        },
        weather_analysis=WeatherAnalysis(
            severity_score=0.85,
            expected_duration_days=5,
            category=4,
            wind_speed_mph=145,
            precipitation_inches=18,
            details="Category 4 hurricane with 145 mph sustained winds. Landfall expected near Houston.",
        ),
        news_analysis=NewsAnalysis(
            sentiment_score=-0.62,
            article_count=234,
            urgency_score=0.81,
            key_headlines=[
                "Gulf energy platforms shut down ahead of Category 4 storm",
                "XOM, CVX shares slide as hurricane threatens refineries",
                "Texas declares state of emergency as Hurricane Demo Alpha nears",
            ],
            summary="Strongly negative news sentiment. Major energy firms shutting Gulf operations.",
        ),
        historical_analysis=HistoricalAnalysis(
            similar_event_count=4,
            median_energy_impact=-0.058,
            median_market_impact=-0.021,
            historical_events=[
                HistoricalEvent(
                    event_name="Hurricane Katrina",
                    event_year=2005,
                    event_type="hurricane",
                    severity=5,
                    impact_pct=-0.104,
                    sector_impact_pct=-0.104,
                    recovery_days=47,
                    description="Largest US natural disaster at time. Massive Gulf infrastructure damage.",
                ),
                HistoricalEvent(
                    event_name="Hurricane Harvey",
                    event_year=2017,
                    event_type="hurricane",
                    severity=4,
                    impact_pct=-0.045,
                    sector_impact_pct=-0.045,
                    recovery_days=28,
                    description="Record rainfall flooding Houston refineries and petrochemical plants.",
                ),
                HistoricalEvent(
                    event_name="Hurricane Ida",
                    event_year=2021,
                    event_type="hurricane",
                    severity=4,
                    impact_pct=-0.058,
                    sector_impact_pct=-0.058,
                    recovery_days=31,
                    description="Category 4 storm causing widespread Gulf platform shutdowns.",
                ),
                HistoricalEvent(
                    event_name="Hurricane Rita",
                    event_year=2005,
                    event_type="hurricane",
                    severity=3,
                    impact_pct=-0.021,
                    sector_impact_pct=-0.021,
                    recovery_days=19,
                    description="Gulf Coast category 3 storm with moderate energy sector disruption.",
                ),
            ],
        ),
        query="How will this Category 4 hurricane affect our current energy holdings?",
    )


@router.get(
    "/demo",
    summary="Demo risk analysis with sample hurricane scenario",
    response_model=RiskReport,
    status_code=status.HTTP_200_OK,
)
async def demo_analysis() -> RiskReport:
    """
    Returns a complete `RiskReport` generated from a pre-built demo scenario:
    **Category 4 Hurricane threatening Gulf of Mexico Energy holdings**.

    Useful for:
    - Frontend development without needing live data from Person 1.
    - End-to-end integration testing of the Risk Engine.
    - Demonstrating risk card, scenario chart, and stress gauge outputs.

    No request body required.
    """
    try:
        demo_input = _build_demo_input()
        report = run_risk_engine(demo_input)
        return report
    except Exception as exc:
        tb = traceback.format_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Demo generation error: {exc}\n\n{tb}",
        ) from exc
