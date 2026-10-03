"""
Tests for Scenario & Forecast Engine
====================================
Validates baseline median alignment, mild/severe distribution derivation,
portfolio-level impact formula, dollar impact valuation, zero-exposure guards,
null portfolio value resilience, positive impact support, fallback multiplier triggers,
and the canonical hurricane-energy demo portfolio.
"""

import pytest

from backend.risk_engine.schemas.risk_input import Holding, Portfolio
from backend.risk_engine.services.exposure import calculate_exposure
from backend.risk_engine.services.historical import calculate_historical_statistics
from backend.risk_engine.services.scenario import (
    DEFAULT_SCENARIO_MULTIPLIERS,
    build_scenarios,
    calculate_scenario_portfolio_impact,
    calculate_scenario_dollar_impact,
    calculate_asset_scenario_impact,
    run_scenario_analysis,
    ScenarioAnalysisResult,
)


# ---------------------------------------------------------------------------
# Test Fixtures
# ---------------------------------------------------------------------------

@pytest.fixture
def canonical_historical_stats():
    """Historical statistics for Gulf hurricanes with median -0.058."""
    impacts = [-0.021, -0.045, -0.058, -0.062, -0.104]
    return calculate_historical_statistics(impacts)


@pytest.fixture
def canonical_portfolio():
    """Canonical hackathon portfolio: 240k XOM, 240k CVX, 500k MSFT = 980k."""
    return Portfolio(
        total_value=980000.0,
        holdings=[
            Holding(ticker="XOM", quantity=2000, current_price=120, sector="Energy"),
            Holding(ticker="CVX", quantity=1500, current_price=160, sector="Energy"),
            Holding(ticker="MSFT", quantity=1000, current_price=500, sector="Technology"),
        ]
    )


# ---------------------------------------------------------------------------
# Test Cases
# ---------------------------------------------------------------------------

def test_base_scenario_equals_historical_median(canonical_historical_stats):
    """1. Base scenario equals historical median when historical data is available."""
    scenarios, methodology = build_scenarios(canonical_historical_stats)
    assert methodology == "historical_distribution"
    assert scenarios["base"] == -0.058
    assert scenarios["base"] == canonical_historical_stats.median_impact


def test_mild_scenario_less_severe_than_base(canonical_historical_stats):
    """2. Mild scenario is less severe (smaller loss / higher value) than base when impacts are negative."""
    scenarios, _ = build_scenarios(canonical_historical_stats)
    # -0.021 is less negative / smaller drop than -0.058
    assert scenarios["mild"] == -0.021
    assert scenarios["mild"] > scenarios["base"]
    assert abs(scenarios["mild"]) < abs(scenarios["base"])


def test_severe_scenario_more_severe_than_base(canonical_historical_stats):
    """3. Severe scenario is more severe (deeper loss / lower value) than base when impacts are negative."""
    scenarios, _ = build_scenarios(canonical_historical_stats)
    # -0.104 is more negative / deeper drop than -0.058
    assert scenarios["severe"] == -0.104
    assert scenarios["severe"] < scenarios["base"]
    assert abs(scenarios["severe"]) > abs(scenarios["base"])


def test_portfolio_impact_formula():
    """4. Portfolio impact formula: portfolio_impact = affected_sector_exposure * sector_impact."""
    exposure = 0.4898
    sector_impact = -0.058
    # 0.4898 * -0.058 = -0.0284084 -> -0.0284
    impact = calculate_scenario_portfolio_impact(exposure, sector_impact, round_digits=4)
    assert impact == -0.0284

    # Mild test: 0.4898 * -0.021 = -0.0102858 -> -0.0103
    mild_impact = calculate_scenario_portfolio_impact(exposure, -0.021, round_digits=4)
    assert mild_impact == -0.0103

    # Severe test: 0.4898 * -0.104 = -0.0509392 -> -0.0509
    severe_impact = calculate_scenario_portfolio_impact(exposure, -0.104, round_digits=4)
    assert severe_impact == -0.0509


def test_dollar_impact_formula():
    """5. Dollar impact formula: estimated_dollar_impact = portfolio_value * portfolio_impact."""
    portfolio_val = 980000.0
    portfolio_impact = -0.0284
    # 980000 * -0.0284 = -27832.0
    dollar_impact = calculate_scenario_dollar_impact(portfolio_val, portfolio_impact)
    assert dollar_impact == -27832.0
    # Must preserve negative sign indicating loss
    assert dollar_impact < 0

    # Mild test: 980000 * -0.0103 = -10094.0
    mild_dollar = calculate_scenario_dollar_impact(portfolio_val, -0.0103)
    assert mild_dollar == -10094.0

    # Severe test: 980000 * -0.0509 = -49882.0
    severe_dollar = calculate_scenario_dollar_impact(portfolio_val, -0.0509)
    assert severe_dollar == -49882.0


def test_zero_affected_sector_exposure():
    """6. Zero affected-sector exposure produces zero portfolio impact and zero dollar impact."""
    zero_exposure = 0.0
    sector_impact = -0.058
    portfolio_val = 1000000.0

    impact = calculate_scenario_portfolio_impact(zero_exposure, sector_impact)
    assert impact == 0.0

    dollar = calculate_scenario_dollar_impact(portfolio_val, impact)
    assert dollar == 0.0

    # Full runner with unaffected sector
    result = run_scenario_analysis(
        exposure_result={"affected_sector_exposure": 0.0, "total_value": portfolio_val},
        historical_stats=[-0.021, -0.058, -0.104],
        affected_sectors=["Healthcare"]
    )
    for name in ("mild", "base", "severe"):
        assert result.scenarios[name].estimated_portfolio_impact_pct == 0.0
        assert result.scenarios[name].estimated_portfolio_loss == 0.0


def test_missing_portfolio_value_handles_null():
    """7. Missing portfolio value produces unavailable/null dollar impact rather than crashing."""
    dollar = calculate_scenario_dollar_impact(portfolio_value=None, portfolio_impact=-0.0284)
    assert dollar is None

    # Full runner with None portfolio_value
    result = run_scenario_analysis(
        exposure_result={"affected_sector_exposure": 0.4898, "total_value": None},
        historical_stats=[-0.021, -0.058, -0.104],
    )
    for name in ("mild", "base", "severe"):
        assert result.scenarios[name].estimated_portfolio_impact_pct != 0.0
        assert result.scenarios[name].estimated_portfolio_loss is None
        assert result.scenarios[name].projected_portfolio_value is None


def test_positive_historical_impacts():
    """8. Positive historical impacts are supported mathematically."""
    positive_impacts = [0.010, 0.030, 0.050]
    scenarios, methodology = build_scenarios(positive_impacts)
    assert methodology == "historical_distribution"
    assert scenarios["base"] == 0.030
    assert scenarios["mild"] == 0.050  # Best case (+5.0%)
    assert scenarios["severe"] == 0.010  # Worst case (+1.0%)

    # Positive portfolio impact
    exposure = 0.50
    p_impact = calculate_scenario_portfolio_impact(exposure, scenarios["base"])
    assert p_impact == 0.0150
    dollar = calculate_scenario_dollar_impact(100000.0, p_impact)
    assert dollar == 1500.0


def test_insufficient_historical_data_triggers_fallback():
    """9. Insufficient historical data triggers the documented multiplier fallback."""
    # Sub-case A: Only single historical median available
    limited_stats = {"median_impact": -0.060, "events": 1}
    scenarios, method_limited = build_scenarios(limited_stats)
    assert method_limited == "fallback_multipliers_from_median"
    assert scenarios["base"] == -0.060
    assert scenarios["mild"] == round(-0.060 * DEFAULT_SCENARIO_MULTIPLIERS["mild"], 4)  # -0.030
    assert scenarios["severe"] == round(-0.060 * DEFAULT_SCENARIO_MULTIPLIERS["severe"], 4)  # -0.090

    # Sub-case B: No historical data at all (None or empty)
    scenarios_none, method_none = build_scenarios(None, fallback_base_impact=-0.05)
    assert method_none == "fallback_multipliers_default"
    assert scenarios_none["base"] == -0.05
    assert scenarios_none["mild"] == -0.025
    assert scenarios_none["severe"] == -0.075


def test_realistic_hurricane_energy_demo_scenario(canonical_historical_stats, canonical_portfolio):
    """10. Realistic Hurricane-Energy Demo Portfolio end-to-end integration."""
    # Module 2 exposure
    exposure = calculate_exposure(canonical_portfolio, affected_sectors=["Energy"])
    assert exposure.total_value == 980000.0
    assert exposure.affected_sector_exposure == 0.4898

    # Module 4 scenario analysis
    result = run_scenario_analysis(
        exposure_result=exposure,
        historical_stats=canonical_historical_stats,
        portfolio=canonical_portfolio,
        affected_sectors=["Energy"]
    )

    assert isinstance(result, ScenarioAnalysisResult)
    assert result.methodology == "historical_distribution"

    # Verify Base scenario
    base = result.scenarios["base"]
    assert base.scenario_name == "Base"
    assert base.sector_impact == -0.058
    assert base.estimated_portfolio_impact_pct == -0.0284
    assert base.estimated_portfolio_loss == -27832.0
    assert base.projected_portfolio_value == 952168.0

    # Verify Mild scenario
    mild = result.scenarios["mild"]
    assert mild.sector_impact == -0.021
    assert mild.estimated_portfolio_impact_pct == -0.0103
    assert mild.estimated_portfolio_loss == -10094.0

    # Verify Severe scenario
    severe = result.scenarios["severe"]
    assert severe.sector_impact == -0.104
    assert severe.estimated_portfolio_impact_pct == -0.0509
    assert severe.estimated_portfolio_loss == -49882.0

    # Verify Asset-level scenario impact
    assert base.asset_impacts["XOM"] == -0.058
    assert base.asset_impacts["CVX"] == -0.058
    assert base.asset_impacts["MSFT"] == 0.0  # Technology unaffected

    # Verify conceptual dictionary format
    d = result.to_dict()
    assert d["scenarios"]["base"]["sector_impact"] == -0.058
    assert d["scenarios"]["base"]["portfolio_impact"] == -0.0284
    assert d["scenarios"]["base"]["estimated_dollar_impact"] == -27832.0

    assert d["scenarios"]["mild"]["sector_impact"] == -0.021
    assert d["scenarios"]["mild"]["portfolio_impact"] == -0.0103
    assert d["scenarios"]["mild"]["estimated_dollar_impact"] == -10094.0

    assert d["scenarios"]["severe"]["sector_impact"] == -0.104
    assert d["scenarios"]["severe"]["portfolio_impact"] == -0.0509
    assert d["scenarios"]["severe"]["estimated_dollar_impact"] == -49882.0
