"""
Risk Engine Input Schemas
=========================
Defines Pydantic models for incoming structured evidence packages from Person 1 (Orchestrator).
Designed to be robust, hackathon-friendly, and tolerant of missing optional evidence streams.
"""

from typing import Any, Dict, List, Optional, Union
from pydantic import BaseModel, ConfigDict, Field


class Event(BaseModel):
    """
    Represents the external shock or event triggering the risk analysis
    (e.g., Category 4 Hurricane in the Gulf of Mexico, geopolitical conflict, macro shock).
    """
    type: str = Field(..., description="Classification of event (e.g. 'hurricane', 'geopolitical', 'macro')")
    name: str = Field(..., description="Name or identifier of the event (e.g. 'Demo Hurricane', 'Hurricane Milton')")
    severity: Optional[Union[int, float, str]] = Field(
        default=None,
        description="Event severity rating or category (e.g. 4, 'Category 4', 0.9)"
    )
    location: Optional[str] = Field(default=None, description="Geographic epicenter or affected region")
    affected_regions: List[str] = Field(
        default_factory=list,
        description="List of specific geographic regions affected (e.g. ['Texas', 'Louisiana'])"
    )
    affected_sectors: List[str] = Field(
        default_factory=list,
        description="List of industry sectors affected (e.g. ['Energy', 'Utilities'])"
    )
    description: Optional[str] = Field(default=None, description="Narrative summary or description of the event")

    model_config = ConfigDict(extra="allow", populate_by_name=True)


class Holding(BaseModel):
    """
    Represents an individual asset holding within the user's investment portfolio.
    """
    ticker: str = Field(..., description="Ticker symbol of the asset (e.g. 'XOM', 'CVX', 'MSFT')")
    quantity: float = Field(..., description="Number of units or shares held")
    current_price: float = Field(..., description="Current market price per unit in USD")
    sector: Optional[str] = Field(default="Unassigned", description="Industry sector of the asset (e.g. 'Energy')")
    asset_class: Optional[str] = Field(default="Equity", description="Asset class (e.g. 'Equity', 'Commodity')")
    weight: Optional[float] = Field(default=None, description="Pre-computed portfolio weight fraction (0.0 to 1.0)")

    model_config = ConfigDict(extra="allow", populate_by_name=True)


class Portfolio(BaseModel):
    """
    Represents the full portfolio provided by the user/orchestrator.
    """
    total_value: Optional[float] = Field(
        default=None,
        description="Total portfolio value in USD. If omitted, calculated from sum of holdings + cash"
    )
    holdings: List[Holding] = Field(default_factory=list, description="List of individual position holdings")
    cash: Optional[float] = Field(default=0.0, description="Uninvested cash reserve in USD")

    model_config = ConfigDict(extra="allow", populate_by_name=True)


class MarketAssetData(BaseModel):
    """
    Market return dynamics and volatility metrics for a specific asset ticker.
    """
    daily_change: Optional[float] = Field(default=None, description="1-day return fraction (e.g. -0.032 for -3.2%)")
    weekly_change: Optional[float] = Field(default=None, description="5-day/weekly return fraction (e.g. -0.051 for -5.1%)")
    monthly_change: Optional[float] = Field(default=None, description="1-month return fraction")
    volatility_30d: Optional[float] = Field(default=None, description="30-day historical or implied volatility")
    beta: Optional[float] = Field(default=None, description="Beta relative to benchmark index (e.g. S&P 500)")
    current_price: Optional[float] = Field(default=None, description="Latest quoted price from market feed")

    model_config = ConfigDict(extra="allow", populate_by_name=True)


class WeatherAnalysis(BaseModel):
    """
    Meteorological evidence from Person 2 (Data Platform) regarding severe weather events.
    """
    severity_score: Optional[float] = Field(default=None, description="Normalized weather severity metric (e.g. 0.91)")
    expected_duration_days: Optional[Union[int, float]] = Field(
        default=None,
        description="Anticipated event duration in days (e.g. 5)"
    )
    category: Optional[Union[int, str]] = Field(default=None, description="Storm category rating (e.g. 4 or 'Category 4')")
    wind_speed_mph: Optional[float] = Field(default=None, description="Peak sustained wind speed in mph")
    precipitation_inches: Optional[float] = Field(default=None, description="Estimated total precipitation in inches")
    details: Optional[str] = Field(default=None, description="Meteorological forecast notes or path trajectory")

    model_config = ConfigDict(extra="allow", populate_by_name=True)


class NewsAnalysis(BaseModel):
    """
    Aggregated news sentiment and coverage intensity evidence.
    """
    sentiment_score: Optional[float] = Field(
        default=None,
        description="Sentiment score ranging typically from -1.0 (bearish) to +1.0 (bullish)"
    )
    article_count: Optional[int] = Field(default=0, description="Total relevant news articles detected and analyzed")
    urgency_score: Optional[float] = Field(default=None, description="Urgency / panic index (0.0 to 1.0)")
    key_headlines: List[str] = Field(default_factory=list, description="Top impactful headlines related to the event")
    summary: Optional[str] = Field(default=None, description="High-level narrative synthesis of the news environment")

    model_config = ConfigDict(extra="allow", populate_by_name=True)


class HistoricalEvent(BaseModel):
    """
    Record of a single analogous historical event and its observed market impact.
    """
    event_name: Optional[str] = Field(default=None, description="Historical event name (e.g. 'Hurricane Katrina')")
    event_year: Optional[int] = Field(default=None, description="Year of occurrence (e.g. 2005)")
    event_type: Optional[str] = Field(default=None, description="Classification of the historical shock")
    severity: Optional[Union[int, float, str]] = Field(default=None, description="Recorded historical severity rating")
    impact_pct: Optional[float] = Field(default=None, description="Observed benchmark or sector return fraction")
    sector_impact_pct: Optional[float] = Field(default=None, description="Observed impact on key target sector")
    recovery_days: Optional[int] = Field(default=None, description="Trading days required to recover pre-event baseline")
    description: Optional[str] = Field(default=None, description="Brief contextual summary of historical precedent")

    model_config = ConfigDict(extra="allow", populate_by_name=True)


class HistoricalAnalysis(BaseModel):
    """
    Historical precedent statistics and analog records from Person 2 (Data Platform).
    """
    similar_event_count: Optional[int] = Field(default=0, description="Number of similar historical shocks identified")
    median_energy_impact: Optional[float] = Field(
        default=None,
        description="Median impact observed on energy sector holdings (e.g. -0.058 for -5.8%)"
    )
    median_market_impact: Optional[float] = Field(
        default=None,
        description="Median broad market impact observed across analog events"
    )
    historical_events: List[HistoricalEvent] = Field(
        default_factory=list,
        description="List of analogous historical event records"
    )

    model_config = ConfigDict(extra="allow", populate_by_name=True)


class RiskInput(BaseModel):
    """
    Comprehensive structured input schema delivered to Person 3 (Risk Engine) by Person 1 (Orchestrator).
    Combines event parameters, portfolio positions, market metrics, and multi-source evidence.
    """
    event: Event = Field(..., description="External shock or event triggering the risk evaluation")
    portfolio: Portfolio = Field(..., description="Portfolio positions and total asset allocations")
    market: Dict[str, MarketAssetData] = Field(
        default_factory=dict,
        description="Dictionary mapping asset tickers (e.g. 'XOM') to market dynamic metrics"
    )
    weather_analysis: Optional[WeatherAnalysis] = Field(
        default=None,
        description="Optional weather evidence package; None if not applicable or unavailable"
    )
    news_analysis: Optional[NewsAnalysis] = Field(
        default=None,
        description="Optional news sentiment package; None if not applicable or unavailable"
    )
    historical_analysis: Optional[HistoricalAnalysis] = Field(
        default=None,
        description="Optional historical analog package; None if not applicable or unavailable"
    )
    query: Optional[str] = Field(default=None, description="User's original natural-language prompt or inquiry")

    model_config = ConfigDict(extra="allow", populate_by_name=True)
