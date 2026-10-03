"""
Risk Engine Output Schemas
==========================
Defines Pydantic models for the Quantitative Risk & Forecast Engine's final outputs.
Produces standardized, audit-ready RiskReport JSON for Person 1 (Strategy Synthesis)
and Person 4 (Frontend Terminal & Risk Cards).

Important Prototype Notice:
Outputs (such as risk_score and scenario impacts) are prototype scenario estimates
derived from available historical analogs and real-time signals, not guaranteed market predictions.
"""

from typing import Any, Dict, List, Optional, Union
from pydantic import BaseModel, ConfigDict, Field


class PortfolioExposure(BaseModel):
    """
    Quantitative exposure metrics broken down by sector, affected sectors, and asset weights.
    """
    total_value: float = Field(..., description="Total portfolio value in USD")
    sector_breakdown: Dict[str, float] = Field(
        default_factory=dict,
        description="Sector name to portfolio allocation percentage (e.g. {'Energy': 48.0, 'Technology': 52.0})"
    )
    sector_values: Dict[str, float] = Field(
        default_factory=dict,
        description="Sector name to total dollar value (e.g. {'Energy': 480000.0, 'Technology': 520000.0})"
    )
    affected_sectors_exposure_pct: float = Field(
        default=0.0,
        description="Total percentage of portfolio allocated to event-impacted sectors"
    )
    affected_sectors_value: float = Field(
        default=0.0,
        description="Total dollar amount allocated to event-impacted sectors"
    )
    top_sector: Optional[str] = Field(
        default=None,
        description="Highest weighted sector in the portfolio"
    )
    top_sector_weight_pct: Optional[float] = Field(
        default=None,
        description="Percentage allocation of the top sector"
    )
    cash_pct: Optional[float] = Field(
        default=0.0,
        description="Percentage of portfolio held as uninvested cash"
    )

    model_config = ConfigDict(extra="allow", populate_by_name=True)


class AssetRisk(BaseModel):
    """
    Asset-level quantitative risk assessment, scenario sensitivity, and risk contribution.
    """
    ticker: str = Field(..., description="Asset ticker symbol (e.g. 'XOM')")
    sector: Optional[str] = Field(default=None, description="Industry sector of the asset")
    current_price: Optional[float] = Field(default=None, description="Current market price per unit")
    quantity: Optional[float] = Field(default=None, description="Number of units or shares held")
    current_value: float = Field(..., description="Current position market value in USD")
    weight_pct: float = Field(..., description="Weight of asset as percentage of total portfolio (0-100)")
    is_affected_sector: bool = Field(
        default=False,
        description="True if asset belongs to an event-affected sector"
    )
    estimated_impact_pct: Optional[float] = Field(
        default=None,
        description="Estimated base-scenario return fraction (e.g. -0.061 for -6.1%)"
    )
    estimated_dollar_impact: Optional[float] = Field(
        default=None,
        description="Estimated dollar gain or loss under base scenario"
    )
    risk_contribution_pct: Optional[float] = Field(
        default=None,
        description="Estimated percentage contribution of this asset to overall portfolio risk"
    )
    risk_level: Optional[str] = Field(
        default="Moderate",
        description="Qualitative risk tier for asset: 'Low', 'Moderate', 'High', 'Critical'"
    )
    volatility_30d: Optional[float] = Field(
        default=None,
        description="Recent 30-day realized volatility if available"
    )
    notes: Optional[str] = Field(
        default=None,
        description="Key observations or drivers specific to this holding"
    )

    model_config = ConfigDict(extra="allow", populate_by_name=True)


class ScenarioResult(BaseModel):
    """
    Simulated portfolio and asset outcome under a specific scenario trajectory (Mild, Base, or Severe).
    """
    scenario_name: str = Field(..., description="Name of scenario: 'Mild', 'Base', or 'Severe'")
    description: Optional[str] = Field(
        default=None,
        description="Core assumptions and narrative underlying this scenario"
    )
    probability_weight: Optional[float] = Field(
        default=None,
        description="Heuristic probability weighting (0.0 to 1.0)"
    )
    estimated_portfolio_impact_pct: float = Field(
        ...,
        description="Projected portfolio return fraction (e.g. -0.035 for -3.5%)"
    )
    estimated_portfolio_loss: Optional[float] = Field(
        default=None,
        description="Projected net dollar change in total portfolio value (e.g. -35000.0)"
    )
    projected_portfolio_value: Optional[float] = Field(
        default=None,
        description="Projected total portfolio value after scenario impact"
    )
    asset_impacts: Dict[str, float] = Field(
        default_factory=dict,
        description="Asset ticker mapped to estimated percentage return fraction"
    )
    sector_impacts: Dict[str, float] = Field(
        default_factory=dict,
        description="Sector name mapped to estimated percentage return fraction"
    )

    model_config = ConfigDict(extra="allow", populate_by_name=True)


class StressTestResult(BaseModel):
    """
    Tail-risk simulation testing extreme hypothetical shocks or historical replay events.
    """
    test_name: str = Field(..., description="Stress test title (e.g. 'Hurricane Katrina Replay (2005)', 'Category 5 Escalation')")
    scenario_type: Optional[str] = Field(
        default="Hypothetical Stress",
        description="Stress classification (e.g. 'Historical Replay', 'Hypothetical Extreme', 'Compound Shock')"
    )
    description: Optional[str] = Field(
        default=None,
        description="Assumptions, severity conditions, and contagion factors tested"
    )
    estimated_portfolio_impact_pct: float = Field(
        ...,
        description="Simulated extreme portfolio drawdown fraction (e.g. -0.115 for -11.5%)"
    )
    estimated_portfolio_loss: Optional[float] = Field(
        default=None,
        description="Simulated total portfolio dollar loss under stress conditions"
    )
    vulnerable_assets: List[str] = Field(
        default_factory=list,
        description="List of tickers experiencing the deepest drawdowns in this test"
    )
    severity: Optional[str] = Field(
        default="Severe",
        description="Severity classification: 'Moderate', 'Severe', 'Extreme'"
    )

    model_config = ConfigDict(extra="allow", populate_by_name=True)


class HistoricalStatistics(BaseModel):
    """
    Empirical statistical summary derived from historical analog shocks.
    """
    similar_events_analyzed: int = Field(
        default=0,
        description="Total number of historical analog events sampled"
    )
    median_drawdown_pct: Optional[float] = Field(
        default=None,
        description="Median historical drawdown of affected holdings (e.g. -0.058 for -5.8%)"
    )
    mean_drawdown_pct: Optional[float] = Field(
        default=None,
        description="Mean historical drawdown observed across analogs"
    )
    max_drawdown_pct: Optional[float] = Field(
        default=None,
        description="Worst-case historical drawdown observed in historical dataset"
    )
    recovery_time_days_median: Optional[float] = Field(
        default=None,
        description="Median trading days elapsed before recovering to pre-event price levels"
    )
    historical_volatility_pct: Optional[float] = Field(
        default=None,
        description="Average annualized volatility observed during analog event windows"
    )
    key_analogous_events: List[str] = Field(
        default_factory=list,
        description="Names and years of primary historical analogs referenced (e.g. ['Katrina (2005)', 'Ida (2021)'])"
    )

    model_config = ConfigDict(extra="allow", populate_by_name=True)


class RiskReport(BaseModel):
    """
    Standardized Quantitative Risk Report produced by the Risk Engine.
    Consumed by Person 1 (Strategy Synthesis) for LLM narrative generation
    and Person 4 (Frontend) for dashboard charts, risk gauges, and cards.
    """
    risk_score: float = Field(
        ...,
        description="Composite quantitative risk score on a 0-100 scale (prototype metric)"
    )
    risk_level: str = Field(
        ...,
        description="Categorical risk tier: 'Low' (0-25), 'Moderate' (26-50), 'High' (51-75), 'Critical' (76-100)"
    )
    confidence: float = Field(
        ...,
        description="Evidence-strength confidence score (0.0 to 1.0) based on source coverage and data quality"
    )
    portfolio_exposure: PortfolioExposure = Field(
        ...,
        description="Portfolio exposure breakdown by total value, sector, and affected industry exposure"
    )
    asset_risk: List[AssetRisk] = Field(
        default_factory=list,
        description="Granular asset-level risk metrics, impacts, and risk contributions"
    )
    scenarios: Union[Dict[str, ScenarioResult], List[ScenarioResult]] = Field(
        default_factory=dict,
        description="Mild, Base, and Severe scenario impact projections"
    )
    stress_tests: List[StressTestResult] = Field(
        default_factory=list,
        description="Stress tests evaluating extreme tail risks and historical precedent replays"
    )
    historical_statistics: Optional[HistoricalStatistics] = Field(
        default=None,
        description="Empirical statistical benchmarks from historical analog events"
    )
    correlations: Optional[Union[Dict[str, Dict[str, float]], Dict[str, Any]]] = Field(
        default=None,
        description="Cross-asset correlation matrix when usable historical price series are available"
    )
    key_risk_drivers: List[str] = Field(
        default_factory=list,
        description="Ranked qualitative and quantitative drivers elevating portfolio vulnerability"
    )
    evidence: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Audit summary of multi-source signals (weather, news sentiment, market feeds) used"
    )
    disclaimer: str = Field(
        default="Estimated scenario impact based on historical events and current signals. Not a guaranteed financial prediction.",
        description="Mandatory disclaimer clarifying hackathon scenario simulator methodology"
    )
    summary: Optional[str] = Field(
        default=None,
        description="Optional executive summary of risk findings for terminal UI display"
    )
    timestamp: Optional[str] = Field(
        default=None,
        description="ISO 8601 formatted timestamp of risk computation"
    )

    model_config = ConfigDict(extra="allow", populate_by_name=True)
