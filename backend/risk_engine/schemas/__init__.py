"""
Risk Engine Schemas
===================
Exports input and output schemas for the Quantitative Risk & Forecast Engine.
"""

from backend.risk_engine.schemas.risk_input import (
    Event,
    Holding,
    Portfolio,
    MarketAssetData,
    WeatherAnalysis,
    NewsAnalysis,
    HistoricalEvent,
    HistoricalAnalysis,
    RiskInput,
)

from backend.risk_engine.schemas.risk_output import (
    PortfolioExposure,
    AssetRisk,
    ScenarioResult,
    StressTestResult,
    HistoricalStatistics,
    RiskReport,
)

__all__ = [
    # Input Models
    "Event",
    "Holding",
    "Portfolio",
    "MarketAssetData",
    "WeatherAnalysis",
    "NewsAnalysis",
    "HistoricalEvent",
    "HistoricalAnalysis",
    "RiskInput",
    # Output Models
    "PortfolioExposure",
    "AssetRisk",
    "ScenarioResult",
    "StressTestResult",
    "HistoricalStatistics",
    "RiskReport",
]
