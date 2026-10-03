"""
Scenario & Forecast Engine
==========================
Transforms portfolio exposure and historical event distributions into transparent,
probabilistic scenario projections: Mild, Base, and Severe.

Important Hackathon Prototype Disclaimer:
"Estimated scenario impact based on historical events and current signals.
Not a guaranteed financial prediction."

Methodology:
1. Base Scenario:
   - When valid historical analog data exists, Base equals the historical median impact.
2. Mild & Severe Scenarios:
   - When sufficient historical data exists (>=3 events or distinct range),
     Mild uses the best_case (least negative / most favorable) outcome,
     and Severe uses the worst_case (most negative / deepest drawdown) outcome.
   - When historical data is insufficient, fallback scenario multipliers
     (default: Mild=0.5x, Base=1.0x, Severe=1.5x) are applied to the available
     median/mean or documented baseline.
3. Portfolio Impact:
   portfolio_impact = affected_sector_exposure * scenario_sector_impact
4. Dollar Impact:
   estimated_dollar_impact = portfolio_value * portfolio_impact
"""

from typing import Any, Dict, List, Optional, Sequence, Union
from pydantic import BaseModel, ConfigDict, Field

from backend.risk_engine.schemas.risk_input import Holding, Portfolio
from backend.risk_engine.schemas.risk_output import ScenarioResult
from backend.risk_engine.services.exposure import ExposureResult, calculate_exposure
from backend.risk_engine.services.historical import (
    HistoricalStatisticsResult,
    calculate_historical_statistics,
)

# Standard disclaimer required across all scenario simulator outputs
SCENARIO_DISCLAIMER = (
    "Estimated scenario impact based on historical events and current signals. "
    "Not a guaranteed financial prediction."
)

# Configurable fallback multipliers when historical distribution is insufficient
DEFAULT_SCENARIO_MULTIPLIERS: Dict[str, float] = {
    "mild": 0.5,
    "base": 1.0,
    "severe": 1.5,
}

# Baseline sector impact shock used when historical data is completely unavailable
DEFAULT_FALLBACK_SECTOR_IMPACT: float = -0.05


class ScenarioAnalysisResult(BaseModel):
    """
    Structured outcome of the Scenario & Forecast Engine.
    Contains the Mild, Base, and Severe ScenarioResult models along with
    methodology audit metadata and presentation helpers.
    """
    scenarios: Dict[str, ScenarioResult] = Field(
        ...,
        description="Dictionary mapping 'mild', 'base', and 'severe' to ScenarioResult"
    )
    methodology: str = Field(
        default="historical_distribution",
        description="Methodology utilized: 'historical_distribution' or 'fallback_multipliers'"
    )
    disclaimer: str = Field(
        default=SCENARIO_DISCLAIMER,
        description="Mandatory scenario simulator notice"
    )
    affected_sector_exposure: float = Field(
        default=0.0,
        description="Portfolio allocation fraction to event-impacted sectors"
    )
    portfolio_value: Optional[float] = Field(
        default=None,
        description="Total portfolio dollar value if provided"
    )

    model_config = ConfigDict(extra="allow", populate_by_name=True)

    def __getitem__(self, item: str) -> Any:
        """Support dict-like access: result['scenarios']['base']."""
        if hasattr(self, item):
            return getattr(self, item)
        raise KeyError(f"Key '{item}' not found in ScenarioAnalysisResult")

    def to_dict(self) -> Dict[str, Any]:
        """
        Converts scenarios to the conceptual dictionary format expected
        by downstream modules and the frontend.
        """
        out: Dict[str, Any] = {"scenarios": {}}
        for name, sc in self.scenarios.items():
            out["scenarios"][name] = {
                "sector_impact": getattr(sc, "sector_impact", None),
                "portfolio_impact": sc.estimated_portfolio_impact_pct,
                "estimated_dollar_impact": sc.estimated_portfolio_loss,
            }
        return out


def build_scenarios(
    historical_stats: Optional[Union[HistoricalStatisticsResult, Dict[str, Any], Sequence[float]]] = None,
    multipliers: Optional[Dict[str, float]] = None,
    fallback_base_impact: float = DEFAULT_FALLBACK_SECTOR_IMPACT,
    round_digits: Optional[int] = 4,
) -> tuple[Dict[str, float], str]:
    """
    Derives sector return impacts for Mild, Base, and Severe scenarios.

    Logic:
    - If historical stats have >=3 events and distinct min/max:
      Mild = best_case (least negative / numerically highest)
      Base = median
      Severe = worst_case (most negative / numerically lowest)
      Methodology = 'historical_distribution'
    - If historical data has only 1-2 events or single median:
      Base = median
      Mild = base * multipliers['mild']
      Severe = base * multipliers['severe']
      Methodology = 'fallback_multipliers_from_median'
    - If historical data is completely missing / empty:
      Base = fallback_base_impact
      Mild = base * multipliers['mild']
      Severe = base * multipliers['severe']
      Methodology = 'fallback_multipliers_default'

    Returns:
        tuple[Dict[str, float], str]: ({'mild': ..., 'base': ..., 'severe': ...}, methodology)
    """
    mult = multipliers or DEFAULT_SCENARIO_MULTIPLIERS

    def _round(val: float) -> float:
        return round(val, round_digits) if round_digits is not None else val

    # Case A: Sequence of raw impact floats passed directly
    if isinstance(historical_stats, (list, tuple)):
        historical_stats = calculate_historical_statistics(historical_stats, round_digits=round_digits)

    # Case B: Dictionary passed
    if isinstance(historical_stats, dict):
        events_cnt = historical_stats.get("events", historical_stats.get("similar_events_analyzed", 0))
        median_val = historical_stats.get("median_impact", historical_stats.get("median_drawdown_pct"))
        best_val = historical_stats.get("best_case")
        worst_val = historical_stats.get("worst_case", historical_stats.get("max_drawdown_pct"))
    elif isinstance(historical_stats, HistoricalStatisticsResult):
        events_cnt = historical_stats.events
        median_val = historical_stats.median_impact
        best_val = historical_stats.best_case
        worst_val = historical_stats.worst_case
    elif hasattr(historical_stats, "similar_events_analyzed"):
        # Canonical HistoricalStatistics schema from risk_output
        events_cnt = getattr(historical_stats, "similar_events_analyzed", 0)
        median_val = getattr(historical_stats, "median_drawdown_pct", None)
        worst_val = getattr(historical_stats, "max_drawdown_pct", None)
        best_val = None
    else:
        events_cnt = 0
        median_val = None
        best_val = None
        worst_val = None

    # Branch 1: Rich historical sample (>= 3 events and distinct bounds)
    if events_cnt >= 3 and median_val is not None and best_val is not None and worst_val is not None:
        # If all negative impacts:
        # best_case is least negative (e.g. -0.021) -> Mild
        # worst_case is most negative (e.g. -0.104) -> Severe
        # If positive impacts:
        # best_case is highest gain (e.g. +0.050) -> Mild/Best
        # worst_case is lowest gain (e.g. +0.010) -> Severe/Worst
        return {
            "mild": _round(best_val),
            "base": _round(median_val),
            "severe": _round(worst_val),
        }, "historical_distribution"

    # Branch 2: Limited historical data with valid median
    if median_val is not None:
        base_val = median_val
        mild_val = base_val * mult.get("mild", 0.5)
        severe_val = base_val * mult.get("severe", 1.5)
        return {
            "mild": _round(mild_val),
            "base": _round(base_val),
            "severe": _round(severe_val),
        }, "fallback_multipliers_from_median"

    # Branch 3: No historical data available
    base_val = fallback_base_impact
    mild_val = base_val * mult.get("mild", 0.5)
    severe_val = base_val * mult.get("severe", 1.5)
    return {
        "mild": _round(mild_val),
        "base": _round(base_val),
        "severe": _round(severe_val),
    }, "fallback_multipliers_default"


def calculate_scenario_portfolio_impact(
    affected_sector_exposure: float,
    sector_impact: float,
    round_digits: Optional[int] = 4,
) -> float:
    """
    Calculates estimated portfolio percentage impact:
        portfolio_impact = affected_sector_exposure * sector_impact

    If affected_sector_exposure is 0, portfolio impact is 0.0.
    """
    if affected_sector_exposure <= 0:
        return 0.0

    raw = affected_sector_exposure * sector_impact
    return round(raw, round_digits) if round_digits is not None else raw


def calculate_scenario_dollar_impact(
    portfolio_value: Optional[float],
    portfolio_impact: float,
    round_digits: Optional[int] = 2,
) -> Optional[float]:
    """
    Calculates estimated dollar impact:
        estimated_dollar_impact = portfolio_value * portfolio_impact

    Maintains the sign: negative portfolio impact produces negative dollar loss.
    Returns None if portfolio_value is missing/None.
    """
    if portfolio_value is None:
        return None

    raw = portfolio_value * portfolio_impact
    return round(raw, round_digits) if round_digits is not None else raw


def calculate_asset_scenario_impact(
    holdings: Sequence[Union[Holding, Dict[str, Any]]],
    affected_sectors: Sequence[str],
    sector_impact: float,
    round_digits: Optional[int] = 4,
) -> Dict[str, float]:
    """
    Calculates estimated scenario return for individual holdings.
    Assets in event-impacted sectors assume the scenario sector impact;
    unaffected assets default to 0.0.
    """
    normalized_affected = {s.strip().lower() for s in affected_sectors if s}
    asset_impacts: Dict[str, float] = {}

    for h in holdings:
        if isinstance(h, Holding):
            ticker = h.ticker
            sector = h.sector or "Unassigned"
        elif isinstance(h, dict):
            ticker = str(h.get("ticker", "")).strip()
            sector = str(h.get("sector", "Unassigned"))
        else:
            continue

        if not ticker:
            continue

        is_affected = sector.strip().lower() in normalized_affected
        impact = sector_impact if is_affected else 0.0
        val = round(impact, round_digits) if round_digits is not None else impact
        asset_impacts[ticker] = val

    return asset_impacts


def run_scenario_analysis(
    exposure_result: Optional[Union[ExposureResult, Dict[str, Any]]] = None,
    historical_stats: Optional[Union[HistoricalStatisticsResult, Dict[str, Any], Sequence[float]]] = None,
    portfolio: Optional[Union[Portfolio, Dict[str, Any], Sequence[Any]]] = None,
    affected_sectors: Optional[Sequence[str]] = None,
    multipliers: Optional[Dict[str, float]] = None,
    fallback_base_impact: float = DEFAULT_FALLBACK_SECTOR_IMPACT,
    round_digits: Optional[int] = 4,
) -> ScenarioAnalysisResult:
    """
    Master scenario orchestration function.
    Combines portfolio exposure from Module 2 with historical statistics from Module 3
    to construct Mild, Base, and Severe ScenarioResult models.

    Args:
        exposure_result: ExposureResult from Module 2 (or dict).
        historical_stats: HistoricalStatisticsResult from Module 3 (or list of impacts).
        portfolio: Optional portfolio for asset-level scenario mapping and total value.
        affected_sectors: Optional list of affected sectors (e.g. ['Energy']).
        multipliers: Optional scenario multipliers (Mild, Base, Severe).
        fallback_base_impact: Baseline shock if historical data is unavailable.
        round_digits: Precision for percentage returns.

    Returns:
        ScenarioAnalysisResult: Contains 'mild', 'base', and 'severe' ScenarioResults.
    """
    # 1. Resolve affected_sector_exposure and total_value
    affected_sector_exp = 0.0
    total_val: Optional[float] = None
    target_sectors: List[str] = list(affected_sectors) if affected_sectors else []

    if exposure_result is not None:
        if isinstance(exposure_result, ExposureResult):
            affected_sector_exp = exposure_result.affected_sector_exposure
            total_val = exposure_result.total_value
        elif isinstance(exposure_result, dict):
            affected_sector_exp = float(exposure_result.get("affected_sector_exposure", 0.0))
            if "total_value" in exposure_result and exposure_result["total_value"] is not None:
                total_val = float(exposure_result["total_value"])
    elif portfolio is not None:
        # If exposure_result wasn't precomputed, compute it on the fly via Module 2
        exp = calculate_exposure(portfolio, affected_sectors=target_sectors, round_digits=round_digits)
        affected_sector_exp = exp.affected_sector_exposure
        total_val = exp.total_value

    # Extract holdings if available for asset-level impacts
    holdings_list: List[Any] = []
    if isinstance(portfolio, Portfolio):
        holdings_list = portfolio.holdings
        if total_val is None:
            total_val = portfolio.total_value
    elif isinstance(portfolio, dict):
        holdings_list = portfolio.get("holdings", [])
        if total_val is None and "total_value" in portfolio:
            total_val = float(portfolio["total_value"]) if portfolio["total_value"] is not None else None
    elif isinstance(portfolio, (list, tuple)):
        holdings_list = list(portfolio)

    # 2. Derive scenario sector impacts (Mild, Base, Severe)
    sector_impacts_map, methodology = build_scenarios(
        historical_stats=historical_stats,
        multipliers=multipliers,
        fallback_base_impact=fallback_base_impact,
        round_digits=round_digits,
    )

    # Heuristic probability weights and descriptive narratives
    scenario_configs = {
        "mild": {
            "title": "Mild",
            "prob": 0.25,
            "desc": "Favorable storm trajectory with limited infrastructure damage and rapid recovery.",
        },
        "base": {
            "title": "Base",
            "prob": 0.50,
            "desc": "Expected event impact aligned with historical median precedent.",
        },
        "severe": {
            "title": "Severe",
            "prob": 0.25,
            "desc": "Deep tail-risk shock reflecting worst-case historical damage and prolonged disruption.",
        },
    }

    scenarios_dict: Dict[str, ScenarioResult] = {}

    for name in ("mild", "base", "severe"):
        cfg = scenario_configs[name]
        sector_imp = sector_impacts_map[name]

        # Calculate portfolio-level percentage impact
        p_impact = calculate_scenario_portfolio_impact(
            affected_sector_exposure=affected_sector_exp,
            sector_impact=sector_imp,
            round_digits=round_digits,
        )

        # Calculate estimated dollar impact
        dollar_impact = calculate_scenario_dollar_impact(
            portfolio_value=total_val,
            portfolio_impact=p_impact,
            round_digits=2,
        )

        # Projected portfolio value
        projected_val = None
        if total_val is not None and dollar_impact is not None:
            projected_val = round(total_val + dollar_impact, 2)

        # Asset-level scenario breakdown
        asset_impacts = {}
        if holdings_list and target_sectors:
            asset_impacts = calculate_asset_scenario_impact(
                holdings=holdings_list,
                affected_sectors=target_sectors,
                sector_impact=sector_imp,
                round_digits=round_digits,
            )

        # Sector impact mapping
        sec_impacts = {sec: sector_imp for sec in target_sectors} if target_sectors else {}

        # Build ScenarioResult schema model
        scenario_obj = ScenarioResult(
            scenario_name=cfg["title"],
            description=cfg["desc"],
            probability_weight=cfg["prob"],
            estimated_portfolio_impact_pct=p_impact,
            estimated_portfolio_loss=dollar_impact,
            projected_portfolio_value=projected_val,
            asset_impacts=asset_impacts,
            sector_impacts=sec_impacts,
            # Extra fields matching conceptual dictionary output
            sector_impact=sector_imp,
            portfolio_impact=p_impact,
            estimated_dollar_impact=dollar_impact,
        )

        scenarios_dict[name] = scenario_obj

    return ScenarioAnalysisResult(
        scenarios=scenarios_dict,
        methodology=methodology,
        disclaimer=SCENARIO_DISCLAIMER,
        affected_sector_exposure=affected_sector_exp,
        portfolio_value=total_val,
    )
