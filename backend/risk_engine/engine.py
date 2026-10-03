"""
Risk Engine Orchestrator
========================
Module 7 — Part A: Pure-Python orchestration layer.

Wires Modules 2–6 into a single `run_risk_engine()` call that accepts a
`RiskInput` and returns a fully-populated `RiskReport`.

Responsibilities:
- Module 2: Calculate portfolio & sector exposure.
- Module 3: Calculate historical statistics from evidence.
- Module 4: Run Mild / Base / Severe scenario analysis.
- Module 5: Run stress tests across default shock levels.
- Module 6: Compute composite risk score, confidence, and risk drivers.
- Assemble all results into the canonical `RiskReport` schema.

No LLM / LangGraph / external API / database logic lives here.
All calculations are deterministic and transparent.
"""

from __future__ import annotations

import datetime
import datetime as _dt
from typing import Any, Dict, List, Optional

from backend.risk_engine.schemas.risk_input import RiskInput
from backend.risk_engine.schemas.risk_output import (
    AssetRisk,
    HistoricalStatistics,
    RiskReport,
)
from backend.risk_engine.services.exposure import calculate_exposure
from backend.risk_engine.services.historical import calculate_historical_statistics
from backend.risk_engine.services.scenario import run_scenario_analysis
from backend.risk_engine.services.stress_test import run_stress_tests
from backend.risk_engine.services.risk_score import calculate_risk_assessment


# ---------------------------------------------------------------------------
# Risk level tier mapping — aligns Module 6 internal labels to RiskReport labels
# ---------------------------------------------------------------------------
_RISK_LEVEL_MAP: Dict[str, str] = {
    "LOW": "Low",
    "MEDIUM": "Moderate",
    "HIGH": "High",
    "VERY_HIGH": "Critical",
}


def _map_risk_level(internal: str) -> str:
    """Converts internal risk tier labels (LOW/MEDIUM/HIGH/VERY_HIGH) to display labels."""
    return _RISK_LEVEL_MAP.get(internal.upper(), internal)


def _build_asset_risk_list(
    risk_input: RiskInput,
    exposure_result,
    scenario_result,
    affected_sectors_lower: set,
) -> List[AssetRisk]:
    """
    Constructs per-asset risk entries from exposure and scenario results.
    Each entry combines position value, portfolio weight, scenario impact,
    and dollar impact for the base scenario.
    """
    total_val = exposure_result.total_value
    base_scenario = scenario_result.scenarios.get("base") if scenario_result else None
    asset_items: List[AssetRisk] = []

    for holding in risk_input.portfolio.holdings:
        ticker = holding.ticker
        pos_val = exposure_result.position_values.get(ticker, 0.0)
        weight_pct = round(exposure_result.asset_exposure.get(ticker, 0.0) * 100.0, 4)

        # Determine sector membership in affected groups
        sector = holding.sector or "Unassigned"
        is_affected = sector.strip().lower() in affected_sectors_lower

        # Base scenario impact for this asset (fraction like -0.061)
        est_impact_pct: Optional[float] = None
        est_dollar_impact: Optional[float] = None
        if base_scenario and ticker in base_scenario.asset_impacts:
            est_impact_pct = base_scenario.asset_impacts[ticker]
            est_dollar_impact = round(pos_val * est_impact_pct, 2) if est_impact_pct is not None else None

        # Qualitative risk tier
        if not is_affected:
            risk_level = "Low"
        elif weight_pct >= 20:
            risk_level = "Critical"
        elif weight_pct >= 10:
            risk_level = "High"
        else:
            risk_level = "Moderate"

        # Market volatility if available
        volatility_30d: Optional[float] = None
        if ticker in risk_input.market:
            md = risk_input.market[ticker]
            volatility_30d = md.volatility_30d

        # Risk contribution rough estimate: weight_pct * estimated_impact_pct
        risk_contrib: Optional[float] = None
        if est_impact_pct is not None and total_val > 0:
            asset_loss = pos_val * abs(est_impact_pct)
            risk_contrib = round((asset_loss / total_val) * 100.0, 4)

        asset_items.append(
            AssetRisk(
                ticker=ticker,
                sector=sector,
                current_price=holding.current_price,
                quantity=holding.quantity,
                current_value=round(pos_val, 2),
                weight_pct=weight_pct,
                is_affected_sector=is_affected,
                estimated_impact_pct=est_impact_pct,
                estimated_dollar_impact=est_dollar_impact,
                risk_contribution_pct=risk_contrib,
                risk_level=risk_level,
                volatility_30d=volatility_30d,
            )
        )

    return asset_items


def _build_evidence_summary(risk_input: RiskInput) -> Dict[str, Any]:
    """
    Produces an audit-friendly evidence summary for the `RiskReport.evidence` field.
    Documents which evidence sources were present, key metrics, and their provenance.
    """
    ev: Dict[str, Any] = {
        "event": {
            "type": risk_input.event.type,
            "name": risk_input.event.name,
            "severity": risk_input.event.severity,
            "affected_sectors": risk_input.event.affected_sectors,
        },
        "market_tickers_provided": list(risk_input.market.keys()),
        "weather_analysis_present": risk_input.weather_analysis is not None,
        "news_analysis_present": risk_input.news_analysis is not None,
        "historical_analysis_present": risk_input.historical_analysis is not None,
    }

    if risk_input.weather_analysis:
        wa = risk_input.weather_analysis
        ev["weather"] = {
            "severity_score": wa.severity_score,
            "category": wa.category,
            "expected_duration_days": wa.expected_duration_days,
        }

    if risk_input.news_analysis:
        na = risk_input.news_analysis
        ev["news"] = {
            "sentiment_score": na.sentiment_score,
            "article_count": na.article_count,
            "urgency_score": na.urgency_score,
        }

    if risk_input.historical_analysis:
        ha = risk_input.historical_analysis
        ev["historical"] = {
            "similar_event_count": ha.similar_event_count,
            "median_energy_impact": ha.median_energy_impact,
            "median_market_impact": ha.median_market_impact,
            "analog_events_count": len(ha.historical_events),
        }

    return ev


def run_risk_engine(risk_input: RiskInput) -> RiskReport:
    """
    Master Risk Engine orchestrator.

    Pipeline:
    1. Module 2 — Portfolio & Sector Exposure
    2. Module 3 — Historical Statistics
    3. Module 4 — Scenario Analysis (Mild / Base / Severe)
    4. Module 5 — Stress Testing
    5. Module 6 — Risk Score, Confidence & Risk Drivers
    6. Assemble → RiskReport

    Args:
        risk_input: Validated RiskInput model from the orchestrator / API.

    Returns:
        RiskReport: Fully-populated quantitative risk report.
    """

    affected_sectors: List[str] = risk_input.event.affected_sectors or []
    affected_sectors_lower = {s.strip().lower() for s in affected_sectors if s}

    # ------------------------------------------------------------------
    # Step 1 — Module 2: Portfolio & Sector Exposure
    # ------------------------------------------------------------------
    exposure_result = calculate_exposure(
        portfolio=risk_input.portfolio,
        affected_sectors=affected_sectors,
    )
    portfolio_exposure = exposure_result.to_portfolio_exposure()

    # ------------------------------------------------------------------
    # Step 2 — Module 3: Historical Statistics
    # ------------------------------------------------------------------
    hist_stats_result = calculate_historical_statistics(
        events=risk_input.historical_analysis,
    )

    # Prefer the explicit median_energy_impact from HistoricalAnalysis
    # if it was populated by Person 2 (Data Platform)
    historical_median_for_scenarios: Optional[float] = hist_stats_result.median_impact
    if (
        historical_median_for_scenarios is None
        and risk_input.historical_analysis
        and risk_input.historical_analysis.median_energy_impact is not None
    ):
        historical_median_for_scenarios = risk_input.historical_analysis.median_energy_impact

    # Convert to canonical HistoricalStatistics schema
    hist_stats_schema: Optional[HistoricalStatistics] = None
    if hist_stats_result.events > 0:
        hist_stats_schema = hist_stats_result.to_historical_statistics()
        # Supplement with high-level median if events were empty but explicit median was given
    elif (
        risk_input.historical_analysis
        and risk_input.historical_analysis.median_energy_impact is not None
    ):
        hist_stats_schema = HistoricalStatistics(
            similar_events_analyzed=risk_input.historical_analysis.similar_event_count or 0,
            median_drawdown_pct=risk_input.historical_analysis.median_energy_impact,
            mean_drawdown_pct=risk_input.historical_analysis.median_market_impact,
        )

    # ------------------------------------------------------------------
    # Step 3 — Module 4: Scenario Analysis
    # ------------------------------------------------------------------
    scenario_result = run_scenario_analysis(
        exposure_result=exposure_result,
        historical_stats=hist_stats_result if hist_stats_result.events > 0 else None,
        portfolio=risk_input.portfolio,
        affected_sectors=affected_sectors,
    )

    # ------------------------------------------------------------------
    # Step 4 — Module 5: Stress Testing
    # ------------------------------------------------------------------
    stress_test_items = run_stress_tests(
        exposure_result=exposure_result,
        portfolio=risk_input.portfolio,
        affected_sectors=affected_sectors,
    )
    stress_test_results = [item.to_stress_test_result() for item in stress_test_items]

    # ------------------------------------------------------------------
    # Step 5 — Module 6: Risk Score, Confidence & Risk Drivers
    # ------------------------------------------------------------------
    # Build affected tickers for market signal filtering
    affected_tickers = [
        h.ticker
        for h in risk_input.portfolio.holdings
        if (h.sector or "").strip().lower() in affected_sectors_lower
    ]

    # Primary affected sector name for driver descriptions
    primary_sector_name = affected_sectors[0] if affected_sectors else "affected sector"

    risk_assessment = calculate_risk_assessment(
        affected_sector_exposure=exposure_result.affected_sector_exposure,
        weather_analysis=risk_input.weather_analysis,
        event=risk_input.event,
        historical_median_impact=historical_median_for_scenarios,
        market_data=risk_input.market if risk_input.market else None,
        affected_tickers=affected_tickers or None,
        news_analysis=risk_input.news_analysis,
        affected_sector_name=primary_sector_name,
    )

    # ------------------------------------------------------------------
    # Step 6 — Asset-level risk
    # ------------------------------------------------------------------
    asset_risk_list = _build_asset_risk_list(
        risk_input=risk_input,
        exposure_result=exposure_result,
        scenario_result=scenario_result,
        affected_sectors_lower=affected_sectors_lower,
    )

    # ------------------------------------------------------------------
    # Step 7 — Evidence summary (audit trail)
    # ------------------------------------------------------------------
    evidence = _build_evidence_summary(risk_input)

    # ------------------------------------------------------------------
    # Step 8 — Assemble RiskReport
    # ------------------------------------------------------------------
    # Map internal risk level (LOW/MEDIUM/HIGH/VERY_HIGH) to display tier
    risk_level_display = _map_risk_level(risk_assessment.risk_level)

    # Scale risk_score_100 to 0-100 for the RiskReport schema
    report = RiskReport(
        risk_score=risk_assessment.risk_score_100,
        risk_level=risk_level_display,
        confidence=risk_assessment.confidence,
        portfolio_exposure=portfolio_exposure,
        asset_risk=asset_risk_list,
        scenarios=scenario_result.scenarios,
        stress_tests=stress_test_results,
        historical_statistics=hist_stats_schema,
        key_risk_drivers=risk_assessment.key_risk_drivers,
        evidence=evidence,
        summary=_build_executive_summary(
            risk_level=risk_level_display,
            risk_score=risk_assessment.risk_score_100,
            affected_exposure_pct=portfolio_exposure.affected_sectors_exposure_pct,
            primary_sector=primary_sector_name,
            event_name=risk_input.event.name,
            base_scenario_loss=scenario_result.scenarios.get("base", None),
        ),
        timestamp=datetime.datetime.now(datetime.timezone.utc).isoformat(),
    )

    return report


def _build_executive_summary(
    risk_level: str,
    risk_score: float,
    affected_exposure_pct: float,
    primary_sector: str,
    event_name: str,
    base_scenario_loss: Any,
) -> str:
    """
    Generates a concise executive summary string for terminal display.
    Combines risk level, affected sector exposure, and base scenario impact.
    """
    base_loss_str = ""
    if base_scenario_loss is not None:
        pct = base_scenario_loss.estimated_portfolio_impact_pct
        dollar = base_scenario_loss.estimated_portfolio_loss
        pct_str = f"{pct * 100:+.2f}%"
        if dollar is not None:
            base_loss_str = f" Base scenario: {pct_str} (${dollar:,.0f})."
        else:
            base_loss_str = f" Base scenario: {pct_str}."

    return (
        f"{risk_level} risk (score {risk_score:.1f}/100) for '{event_name}'. "
        f"{affected_exposure_pct:.1f}% portfolio exposure to {primary_sector} sector."
        f"{base_loss_str}"
    )
