"""
Tests for Stress Testing Engine
===============================
Validates single-sector stress shocks (-2%, -5%, -10%, -15%), portfolio impact,
dollar impact valuation, zero exposure guards, empty portfolio handling,
zero portfolio value, multi-sector shocks, positive shocks, missing portfolio values,
and the canonical hurricane-energy demo portfolio.
"""

import pytest

from backend.risk_engine.schemas.risk_input import Holding, Portfolio
from backend.risk_engine.schemas.risk_output import StressTestResult
from backend.risk_engine.services.exposure import calculate_exposure
from backend.risk_engine.services.stress_test import (
    DEFAULT_STRESS_LEVELS,
    StressTestItem,
    calculate_stress_impact,
    calculate_stress_dollar_impact,
    run_stress_tests,
)


# ---------------------------------------------------------------------------
# Test Fixtures
# ---------------------------------------------------------------------------

@pytest.fixture
def canonical_portfolio():
    """Canonical hackathon portfolio: 240k XOM, 240k CVX, 500k MSFT = 980k."""
    return Portfolio(
        total_value=980000.0,
        holdings=[
            Holding(ticker="XOM", quantity=2000, current_price=120, sector="Energy"),
            Holding(ticker="CVX", quantity=1500, current_price=160, sector="Energy"),
            Holding(ticker="MSFT", quantity=1000, current_price=500, sector="Technology"),
        ],
    )


# ---------------------------------------------------------------------------
# Test Cases
# ---------------------------------------------------------------------------

def test_single_sector_2pct_shock():
    """1. Single-sector -2% shock: portfolio_impact = 0.4898 * -0.02 = -0.009796."""
    exposure = 0.4898
    shock = -0.02
    impact = calculate_stress_impact(exposure, shock)
    assert impact == -0.009796

    dollar = calculate_stress_dollar_impact(980000.0, impact)
    assert dollar == pytest.approx(-9600.08, rel=1e-3)
    assert round(dollar) == -9600


def test_single_sector_5pct_shock():
    """2. Single-sector -5% shock: portfolio_impact = 0.4898 * -0.05 = -0.02449."""
    exposure = 0.4898
    shock = -0.05
    impact = calculate_stress_impact(exposure, shock)
    assert impact == -0.02449

    dollar = calculate_stress_dollar_impact(980000.0, impact)
    assert dollar == pytest.approx(-24000.20, rel=1e-3)
    assert round(dollar) == -24000


def test_single_sector_10pct_shock():
    """3. Single-sector -10% shock: portfolio_impact = 0.4898 * -0.10 = -0.04898."""
    exposure = 0.4898
    shock = -0.10
    impact = calculate_stress_impact(exposure, shock)
    assert impact == -0.04898

    dollar = calculate_stress_dollar_impact(980000.0, impact)
    assert dollar == pytest.approx(-48000.40, rel=1e-3)
    assert round(dollar) == -48000


def test_single_sector_15pct_shock():
    """4. Single-sector -15% shock: portfolio_impact = 0.4898 * -0.15 = -0.07347."""
    exposure = 0.4898
    shock = -0.15
    impact = calculate_stress_impact(exposure, shock)
    assert impact == -0.07347

    dollar = calculate_stress_dollar_impact(980000.0, impact)
    assert dollar == pytest.approx(-72000.60, rel=1e-3)
    assert dollar == pytest.approx(-72000, abs=2.0)


def test_correct_portfolio_impact_calculation():
    """5. General portfolio impact calculation accuracy."""
    # 25% exposure under a -8% shock = -2% portfolio impact
    assert calculate_stress_impact(0.25, -0.08) == -0.02
    # 50% exposure under a -12% shock = -6% portfolio impact
    assert calculate_stress_impact(0.50, -0.12) == -0.06


def test_correct_dollar_impact_calculation():
    """6. Dollar impact calculation maintains sign and handles rounding."""
    portfolio_val = 980000.0
    impact = -0.04898
    dollar = calculate_stress_dollar_impact(portfolio_val, impact)
    assert dollar == -48000.4
    assert dollar < 0  # Preserves negative sign for losses


def test_zero_affected_sector_exposure():
    """7. Zero affected-sector exposure produces zero portfolio impact and zero dollar impact."""
    impact = calculate_stress_impact(0.0, -0.10)
    assert impact == 0.0

    dollar = calculate_stress_dollar_impact(1000000.0, impact)
    assert dollar == 0.0

    # End-to-end run
    tests = run_stress_tests(
        portfolio_value=1000000.0,
        sector_exposure={"Energy": 0.0, "Technology": 1.0},
        affected_sectors=["Energy"],
        stress_levels=[-0.10],
    )
    assert len(tests) == 1
    assert tests[0].portfolio_impact == 0.0
    assert tests[0].estimated_dollar_impact == 0.0


def test_empty_portfolio():
    """8. Empty portfolio handling without errors."""
    tests = run_stress_tests(
        portfolio_value=0.0,
        sector_exposure={},
        affected_sectors=["Energy"],
        stress_levels=[-0.05, -0.10],
    )
    assert len(tests) == 2
    for t in tests:
        assert t.portfolio_impact == 0.0
        assert t.estimated_dollar_impact == 0.0


def test_zero_portfolio_value():
    """9. Zero portfolio value: percentage impact is calculated, dollar loss is 0.0."""
    tests = run_stress_tests(
        portfolio_value=0.0,
        sector_exposure={"Energy": 0.50},
        affected_sectors=["Energy"],
        stress_levels=[-0.10],
    )
    assert len(tests) == 1
    assert tests[0].portfolio_impact == -0.05
    assert tests[0].estimated_dollar_impact == 0.0


def test_multiple_affected_sectors():
    """
    10. Multi-sector stress handling:
        portfolio_impact = (0.40 * -0.10) + (0.30 * -0.05) = -0.04 - 0.015 = -0.055 (-5.5%).
    """
    sector_exposures = {
        "Energy": 0.40,
        "Technology": 0.30,
        "Healthcare": 0.30,
    }
    multi_shocks = {
        "Energy": -0.10,
        "Technology": -0.05,
    }

    impact = calculate_stress_impact(sector_exposures, multi_shocks)
    assert impact == pytest.approx(-0.055, abs=1e-6)

    # Dollar impact on 1M portfolio = -$55,000
    dollar = calculate_stress_dollar_impact(1000000.0, impact)
    assert dollar == -55000.0

    # Run via run_stress_tests
    tests = run_stress_tests(
        portfolio_value=1000000.0,
        sector_exposure=sector_exposures,
        stress_levels=[multi_shocks],
    )
    assert len(tests) == 1
    assert tests[0].portfolio_impact == pytest.approx(-0.055, abs=1e-6)
    assert tests[0].estimated_dollar_impact == -55000.0


def test_positive_stress_shock():
    """11. Positive stress shock handling (e.g. +5% stimulus/oil rally)."""
    exposure = 0.4898
    shock = 0.05
    impact = calculate_stress_impact(exposure, shock)
    assert impact == 0.02449

    dollar = calculate_stress_dollar_impact(980000.0, impact)
    assert dollar == pytest.approx(24000.20, rel=1e-3)
    assert dollar > 0


def test_missing_portfolio_value():
    """12. Missing portfolio value returns None for dollar impact without crashing."""
    dollar = calculate_stress_dollar_impact(portfolio_value=None, portfolio_impact=-0.04898)
    assert dollar is None

    tests = run_stress_tests(
        portfolio_value=None,
        sector_exposure={"Energy": 0.4898},
        affected_sectors=["Energy"],
        stress_levels=[-0.10],
    )
    assert len(tests) == 1
    assert tests[0].portfolio_impact == -0.04898
    assert tests[0].estimated_dollar_impact is None
    assert tests[0].estimated_portfolio_loss is None


def test_realistic_hurricane_energy_portfolio(canonical_portfolio):
    """
    13. Canonical Hurricane-Energy Portfolio end-to-end integration:
        Portfolio = $980,000
        Energy exposure = 0.4898
        Stress levels = [-0.02, -0.05, -0.10, -0.15]
    """
    exposure = calculate_exposure(canonical_portfolio, affected_sectors=["Energy"])
    assert exposure.affected_sector_exposure == 0.4898
    assert exposure.total_value == 980000.0

    tests = run_stress_tests(
        exposure_result=exposure,
        portfolio=canonical_portfolio,
        affected_sectors=["Energy"],
    )

    assert len(tests) == 4

    # 1. Mild shock (-2%)
    mild = tests[0]
    assert mild.name == "mild_shock"
    assert mild.sector_shock == -0.02
    assert mild.affected_sector_exposure == 0.4898
    assert mild.portfolio_impact == -0.009796
    assert round(mild.estimated_dollar_impact) == -9600

    # 2. Moderate shock (-5%)
    mod = tests[1]
    assert mod.name == "moderate_shock"
    assert mod.sector_shock == -0.05
    assert mod.portfolio_impact == -0.02449
    assert round(mod.estimated_dollar_impact) == -24000

    # 3. Severe shock (-10%)
    sev = tests[2]
    assert sev.name == "severe_shock"
    assert sev.sector_shock == -0.10
    assert sev.portfolio_impact == -0.04898
    assert round(sev.estimated_dollar_impact) == -48000

    # 4. Extreme shock (-15%)
    ext = tests[3]
    assert ext.name == "extreme_shock"
    assert ext.sector_shock == -0.15
    assert ext.portfolio_impact == -0.07347
    assert ext.estimated_dollar_impact == pytest.approx(-72000, abs=2.0)

    # Check asset contributions on severe shock (-10%)
    # XOM: weight 240k/980k = 0.244898 -> 0.244898 * -0.10 = -0.02449
    # CVX: weight 240k/980k = 0.244898 -> 0.244898 * -0.10 = -0.02449
    assert "XOM" in sev.asset_contributions
    assert "CVX" in sev.asset_contributions
    assert sev.asset_contributions["XOM"] == pytest.approx(-0.02449, abs=1e-4)
    assert sev.asset_contributions["CVX"] == pytest.approx(-0.02449, abs=1e-4)

    # Check conversion to canonical StressTestResult schema
    schema_model = sev.to_stress_test_result()
    assert isinstance(schema_model, StressTestResult)
    assert schema_model.test_name == sev.test_name
    assert schema_model.estimated_portfolio_impact_pct == -0.04898
    assert schema_model.estimated_portfolio_loss == sev.estimated_dollar_impact

    # Check to_dict() format
    d = sev.to_dict()
    assert d["name"] == "severe_shock"
    assert d["sector_shock"] == -0.10
    assert d["portfolio_impact"] == -0.04898
    assert round(d["estimated_dollar_impact"]) == -48000
