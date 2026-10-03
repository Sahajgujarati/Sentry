"""
Stress Testing Engine
=====================
Calculates quantitative portfolio-level and asset-level stress impacts
under explicit hypothetical shocks (e.g. -2%, -5%, -10%, -15%).

Unlike Module 4 (which infers Mild/Base/Severe scenarios from historical data),
stress testing answers: "What if the affected sector experiences a specified shock?"

Core Formulas:
1. Single affected sector:
   portfolio_impact = sector_exposure * sector_shock
2. Multiple affected sectors:
   portfolio_impact = sum(sector_exposure[sec] * sector_shock[sec])
3. Dollar impact:
   estimated_dollar_impact = portfolio_value * portfolio_impact
"""

from typing import Any, Dict, List, Optional, Sequence, Union
from pydantic import BaseModel, ConfigDict, Field

from backend.risk_engine.schemas.risk_input import Holding, Portfolio
from backend.risk_engine.schemas.risk_output import StressTestResult
from backend.risk_engine.services.exposure import ExposureResult, calculate_exposure

# Configurable default stress levels and descriptive metadata
DEFAULT_STRESS_LEVELS: List[float] = [
    -0.02,
    -0.05,
    -0.10,
    -0.15,
]

DEFAULT_STRESS_METADATA: Dict[float, Dict[str, str]] = {
    -0.02: {
        "name": "mild_shock",
        "title": "Mild Sector Shock (-2%)",
        "severity": "Mild",
        "description": "Minor sector disruption representing localized temporary supply constraints.",
    },
    -0.05: {
        "name": "moderate_shock",
        "title": "Moderate Sector Shock (-5%)",
        "severity": "Moderate",
        "description": "Moderate sector shock representing widespread short-term operational shutdowns.",
    },
    -0.10: {
        "name": "severe_shock",
        "title": "Severe Sector Shock (-10%)",
        "severity": "Severe",
        "description": "Severe market shock representing acute infrastructure damage and sustained outage.",
    },
    -0.15: {
        "name": "extreme_shock",
        "title": "Extreme Sector Shock (-15%)",
        "severity": "Extreme",
        "description": "Extreme tail-risk stress test representing catastrophic structural devastation.",
    },
}


class StressTestItem(BaseModel):
    """
    Individual stress test result supporting both canonical StressTestResult schema
    attributes and conceptual hackathon dictionary keys.
    """
    name: str = Field(..., description="Machine-readable stress test identifier (e.g. 'mild_shock')")
    test_name: str = Field(..., description="Human-readable title (e.g. 'Mild Sector Shock (-2%)')")
    sector_shock: Union[float, Dict[str, float]] = Field(
        ...,
        description="Sector shock fraction (e.g. -0.10) or dictionary of sector shocks"
    )
    affected_sector_exposure: float = Field(
        ...,
        description="Combined portfolio exposure fraction to stressed sectors"
    )
    portfolio_impact: float = Field(
        ...,
        description="Estimated fractional portfolio return impact (e.g. -0.04898 for -4.898%)"
    )
    estimated_portfolio_impact_pct: float = Field(
        ...,
        description="Identical to portfolio_impact for schema compatibility"
    )
    estimated_dollar_impact: Optional[float] = Field(
        default=None,
        description="Estimated dollar change in total portfolio value (negative for losses)"
    )
    estimated_portfolio_loss: Optional[float] = Field(
        default=None,
        description="Identical to estimated_dollar_impact for schema compatibility"
    )
    scenario_type: str = Field(
        default="Hypothetical Stress",
        description="Classification: 'Hypothetical Stress', 'Historical Replay', etc."
    )
    severity: str = Field(
        default="Severe",
        description="Stress tier: 'Mild', 'Moderate', 'Severe', 'Extreme'"
    )
    description: Optional[str] = Field(
        default=None,
        description="Narrative context of the stress test"
    )
    vulnerable_assets: List[str] = Field(
        default_factory=list,
        description="Portfolio tickers sustaining the largest stress drawdowns"
    )
    asset_contributions: Dict[str, float] = Field(
        default_factory=dict,
        description="Asset ticker mapped to its fractional contribution to portfolio drawdown"
    )

    model_config = ConfigDict(extra="allow", populate_by_name=True)

    def __getitem__(self, item: str) -> Any:
        """Support dictionary-style access: test['portfolio_impact']."""
        if hasattr(self, item):
            return getattr(self, item)
        raise KeyError(f"Key '{item}' not found in StressTestItem")

    def to_dict(self) -> Dict[str, Any]:
        """Convert to conceptual dictionary format requested in specification."""
        return {
            "name": self.name,
            "sector_shock": self.sector_shock,
            "affected_sector_exposure": self.affected_sector_exposure,
            "portfolio_impact": self.portfolio_impact,
            "estimated_dollar_impact": self.estimated_dollar_impact,
        }

    def to_stress_test_result(self) -> StressTestResult:
        """Adapts this item into the canonical StressTestResult schema for RiskReport."""
        return StressTestResult(
            test_name=self.test_name,
            scenario_type=self.scenario_type,
            description=self.description,
            estimated_portfolio_impact_pct=self.estimated_portfolio_impact_pct,
            estimated_portfolio_loss=self.estimated_portfolio_loss,
            vulnerable_assets=self.vulnerable_assets,
            severity=self.severity,
            name=self.name,
            sector_shock=self.sector_shock,
            affected_sector_exposure=self.affected_sector_exposure,
            portfolio_impact=self.portfolio_impact,
            estimated_dollar_impact=self.estimated_dollar_impact,
            asset_contributions=self.asset_contributions,
        )


def calculate_stress_impact(
    sector_exposure: Union[float, Dict[str, float]],
    sector_shock: Union[float, Dict[str, float]],
    round_digits: Optional[int] = 6,
) -> float:
    """
    Calculates estimated percentage portfolio return under a stress shock.

    Cases:
    1. Single sector exposure (float) and single shock (float):
       portfolio_impact = sector_exposure * sector_shock
    2. Multi-sector exposures (dict) with a single common shock (float):
       portfolio_impact = sum(exp for exp in sector_exposure.values()) * sector_shock
    3. Multi-sector exposures (dict) with specific sector shocks (dict):
       portfolio_impact = sum(sector_exposure.get(sec, 0.0) * shock for sec, shock in sector_shock.items())

    Args:
        sector_exposure: Single exposure float or dict of {sector: exposure_fraction}.
        sector_shock: Single shock float or dict of {sector: shock_fraction}.
        round_digits: Decimal precision (default: 6, e.g. -0.048980).

    Returns:
        float: Portfolio impact fraction.
    """
    # Case 1: Both are scalars
    if isinstance(sector_exposure, (int, float)) and isinstance(sector_shock, (int, float)):
        exp_float = float(sector_exposure)
        if exp_float <= 0.0:
            return 0.0
        impact = exp_float * float(sector_shock)
        return round(impact, round_digits) if round_digits is not None else impact

    # Normalize sector_exposure into dict
    exposure_dict: Dict[str, float] = {}
    if isinstance(sector_exposure, dict):
        exposure_dict = {
            str(k).strip().lower(): float(v) for k, v in sector_exposure.items() if v is not None
        }
    elif isinstance(sector_exposure, (int, float)):
        # Scalar exposure with dict shocks
        exp_val = float(sector_exposure)
        if exp_val <= 0.0:
            return 0.0

    # Case 2: Dict exposures with Dict shocks
    if isinstance(sector_shock, dict):
        total_impact = 0.0
        for sec, shock in sector_shock.items():
            if shock is None:
                continue
            clean_sec = str(sec).strip().lower()
            sec_exp = exposure_dict.get(clean_sec, 0.0)
            total_impact += sec_exp * float(shock)
        return round(total_impact, round_digits) if round_digits is not None else total_impact

    # Case 3: Dict exposures with single common shock
    if isinstance(sector_shock, (int, float)):
        shock_val = float(sector_shock)
        combined_exp = sum(exposure_dict.values())
        if combined_exp <= 0.0:
            return 0.0
        total_impact = combined_exp * shock_val
        return round(total_impact, round_digits) if round_digits is not None else total_impact

    return 0.0


def calculate_stress_dollar_impact(
    portfolio_value: Optional[float],
    portfolio_impact: float,
    round_digits: Optional[int] = 2,
) -> Optional[float]:
    """
    Calculates estimated portfolio dollar impact under stress:
        estimated_dollar_impact = portfolio_value * portfolio_impact

    Preserves the negative sign for losses.
    Returns None if portfolio_value is None.
    """
    if portfolio_value is None:
        return None

    raw_dollar = float(portfolio_value) * float(portfolio_impact)
    return round(raw_dollar, round_digits) if round_digits is not None else raw_dollar


def _resolve_stress_metadata(shock: Union[float, Dict[str, float]]) -> tuple[str, str, str, str]:
    """Resolves name, title, severity tier, and description for a given stress shock."""
    if isinstance(shock, (int, float)):
        s_float = round(float(shock), 4)
        if s_float in DEFAULT_STRESS_METADATA:
            meta = DEFAULT_STRESS_METADATA[s_float]
            return meta["name"], meta["title"], meta["severity"], meta["description"]

        pct_str = f"{s_float * 100:+.1f}%"
        abs_shock = abs(s_float)
        if abs_shock <= 0.03:
            severity = "Mild"
        elif abs_shock <= 0.07:
            severity = "Moderate"
        elif abs_shock <= 0.12:
            severity = "Severe"
        else:
            severity = "Extreme"

        slug = f"{severity.lower()}_shock_{int(abs_shock * 100)}pct"
        title = f"{severity} Stress Shock ({pct_str})"
        desc = f"Hypothetical stress test applying a {pct_str} shock to affected holdings."
        return slug, title, severity, desc

    # Dictionary of multiple sector shocks
    return (
        "custom_multi_sector_stress",
        "Multi-Sector Stress Shock",
        "Severe",
        f"Hypothetical stress test applying custom multi-sector shocks: {shock}",
    )


def run_stress_tests(
    portfolio_value: Optional[float] = None,
    sector_exposure: Optional[Dict[str, float]] = None,
    affected_sectors: Optional[Sequence[str]] = None,
    stress_levels: Optional[Sequence[Union[float, Dict[str, float]]]] = None,
    exposure_result: Optional[Union[ExposureResult, Dict[str, Any]]] = None,
    portfolio: Optional[Union[Portfolio, Dict[str, Any], Sequence[Any]]] = None,
    round_digits: Optional[int] = 6,
) -> List[StressTestItem]:
    """
    Executes a comprehensive stress testing battery across specified or default shock levels.

    Args:
        portfolio_value: Total value of portfolio in USD (can be None).
        sector_exposure: Mapping of sector names to fractional portfolio weights.
        affected_sectors: List of industry sectors subject to the stress shock.
        stress_levels: Shocks to evaluate (default: [-0.02, -0.05, -0.10, -0.15]).
        exposure_result: Optional precomputed ExposureResult from Module 2.
        portfolio: Optional portfolio instance or dict with holdings for asset-level attribution.
        round_digits: Decimal precision for portfolio percentage impacts (default: 6).

    Returns:
        List[StressTestItem]: List of structured stress test results.
    """
    # 1. Resolve inputs from exposure_result or portfolio if provided
    total_val = portfolio_value
    sec_exp_map: Dict[str, float] = {}
    combined_affected_exposure = 0.0
    target_sectors: List[str] = list(affected_sectors) if affected_sectors else []

    if exposure_result is not None:
        if isinstance(exposure_result, ExposureResult):
            sec_exp_map = exposure_result.sector_exposure
            combined_affected_exposure = exposure_result.affected_sector_exposure
            if total_val is None:
                total_val = exposure_result.total_value
        elif isinstance(exposure_result, dict):
            sec_exp_map = exposure_result.get("sector_exposure", {})
            combined_affected_exposure = float(exposure_result.get("affected_sector_exposure", 0.0))
            if total_val is None and "total_value" in exposure_result:
                total_val = exposure_result["total_value"]
    elif portfolio is not None:
        exp = calculate_exposure(portfolio, affected_sectors=target_sectors, round_digits=4)
        sec_exp_map = exp.sector_exposure
        combined_affected_exposure = exp.affected_sector_exposure
        if total_val is None:
            total_val = exp.total_value

    if sector_exposure is not None:
        sec_exp_map = sector_exposure

    # Normalize affected sectors and calculate combined exposure if not precomputed
    normalized_affected = {s.strip().lower() for s in target_sectors if s}
    if combined_affected_exposure == 0.0 and normalized_affected and sec_exp_map:
        for sec, weight in sec_exp_map.items():
            if str(sec).strip().lower() in normalized_affected:
                combined_affected_exposure += float(weight)

    # 2. Extract asset-level weights if holdings are available
    asset_exposures: Dict[str, float] = {}
    holdings_list: List[Any] = []
    if isinstance(portfolio, Portfolio):
        holdings_list = portfolio.holdings
    elif isinstance(portfolio, dict):
        holdings_list = portfolio.get("holdings", [])
    elif isinstance(portfolio, (list, tuple)):
        holdings_list = list(portfolio)

    if holdings_list and total_val and total_val > 0:
        for h in holdings_list:
            if isinstance(h, Holding):
                ticker = h.ticker
                val = h.quantity * h.current_price
                sec = h.sector or "Unassigned"
            elif isinstance(h, dict):
                ticker = str(h.get("ticker", "")).strip()
                val = float(h.get("quantity", 0)) * float(h.get("current_price", 0))
                sec = str(h.get("sector", "Unassigned"))
            else:
                continue

            if ticker and sec.strip().lower() in normalized_affected:
                asset_exposures[ticker] = asset_exposures.get(ticker, 0.0) + (val / total_val)

    # 3. Determine shocks to run
    shocks_to_run = list(stress_levels) if stress_levels is not None else list(DEFAULT_STRESS_LEVELS)

    results: List[StressTestItem] = []

    for shock in shocks_to_run:
        # Resolve shock name and metadata
        name, title, severity, desc = _resolve_stress_metadata(shock)

        # Calculate portfolio impact
        if isinstance(shock, dict):
            p_impact = calculate_stress_impact(
                sector_exposure=sec_exp_map,
                sector_shock=shock,
                round_digits=round_digits,
            )
            # Combined exposure for the sectors in the shock dict
            affected_exp = sum(
                sec_exp_map.get(sec, 0.0)
                for sec in shock.keys()
                if sec in sec_exp_map
            )
            shock_val = shock
        else:
            s_float = float(shock)
            shock_val = s_float
            affected_exp = combined_affected_exposure
            p_impact = calculate_stress_impact(
                sector_exposure=affected_exp,
                sector_shock=s_float,
                round_digits=round_digits,
            )

        # Calculate dollar impact
        dollar_impact = calculate_stress_dollar_impact(
            portfolio_value=total_val,
            portfolio_impact=p_impact,
            round_digits=2,
        )

        # Asset-level contributions
        asset_contribs: Dict[str, float] = {}
        vulnerable_assets: List[str] = []
        if isinstance(shock_val, (int, float)) and asset_exposures:
            for ticker, exp_weight in asset_exposures.items():
                contrib = round(exp_weight * float(shock_val), 6)
                asset_contribs[ticker] = contrib
            # Sort vulnerable assets by deepest drawdown
            vulnerable_assets = sorted(asset_contribs, key=lambda t: asset_contribs[t])

        item = StressTestItem(
            name=name,
            test_name=title,
            sector_shock=shock_val,
            affected_sector_exposure=round(affected_exp, 4),
            portfolio_impact=p_impact,
            estimated_portfolio_impact_pct=p_impact,
            estimated_dollar_impact=dollar_impact,
            estimated_portfolio_loss=dollar_impact,
            scenario_type="Hypothetical Stress",
            severity=severity,
            description=desc,
            vulnerable_assets=vulnerable_assets,
            asset_contributions=asset_contribs,
        )
        results.append(item)

    return results
