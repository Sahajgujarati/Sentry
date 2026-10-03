"""
Tests for Portfolio & Sector Exposure Engine
============================================
Validates position valuation, total portfolio sums, asset-level exposures,
sector distributions, affected-sector calculations, zero-division guards,
and demo hurricane portfolios.
"""

import pytest

from backend.risk_engine.schemas.risk_input import Holding, Portfolio
from backend.risk_engine.services.exposure import (
    calculate_position_value,
    calculate_portfolio_value,
    calculate_asset_exposure,
    calculate_sector_exposure,
    calculate_affected_sector_exposure,
    calculate_exposure,
    ExposureResult,
)


# ---------------------------------------------------------------------------
# Test Fixtures
# ---------------------------------------------------------------------------

@pytest.fixture
def demo_hurricane_holdings():
    """Returns the canonical hackathon hurricane-energy holdings list."""
    return [
        Holding(ticker="XOM", quantity=2000, current_price=120, sector="Energy"),
        Holding(ticker="CVX", quantity=1500, current_price=160, sector="Energy"),
        Holding(ticker="MSFT", quantity=1000, current_price=500, sector="Technology"),
    ]


@pytest.fixture
def multi_sector_holdings():
    """Returns holdings diversified across 4 distinct sectors."""
    return [
        Holding(ticker="XOM", quantity=100, current_price=100, sector="Energy"),          # 10,000
        Holding(ticker="NEE", quantity=200, current_price=50, sector="Utilities"),        # 10,000
        Holding(ticker="JNJ", quantity=100, current_price=150, sector="Healthcare"),      # 15,000
        Holding(ticker="JPM", quantity=100, current_price=150, sector="Financials"),      # 15,000
    ]  # Total = 50,000


# ---------------------------------------------------------------------------
# Test Cases
# ---------------------------------------------------------------------------

def test_calculate_position_value():
    """1. Correct position value calculation (quantity * current_price)."""
    # From Holding Pydantic model
    holding = Holding(ticker="XOM", quantity=2000, current_price=120, sector="Energy")
    assert calculate_position_value(holding) == 240000.0

    # From dictionary
    dict_holding = {"ticker": "MSFT", "quantity": 1000, "current_price": 500}
    assert calculate_position_value(dict_holding) == 500000.0


def test_calculate_portfolio_value(demo_hurricane_holdings):
    """2. Correct total portfolio value calculation."""
    # Sum of 240,000 + 240,000 + 500,000 = 980,000
    total = calculate_portfolio_value(demo_hurricane_holdings)
    assert total == 980000.0

    # With cash reserve
    total_with_cash = calculate_portfolio_value(demo_hurricane_holdings, cash=20000.0)
    assert total_with_cash == 1000000.0


def test_calculate_asset_exposure(demo_hurricane_holdings):
    """3. Correct asset exposure calculation (position_value / total_value)."""
    exposures = calculate_asset_exposure(demo_hurricane_holdings)

    # Expected:
    # XOM: 240000 / 980000 = 0.2449
    # CVX: 240000 / 980000 = 0.2449
    # MSFT: 500000 / 980000 = 0.5102
    assert exposures["XOM"] == 0.2449
    assert exposures["CVX"] == 0.2449
    assert exposures["MSFT"] == 0.5102
    assert round(sum(exposures.values()), 2) == 1.0


def test_calculate_sector_exposure(demo_hurricane_holdings):
    """4. Correct sector exposure calculation."""
    sector_exposures = calculate_sector_exposure(demo_hurricane_holdings)

    # Expected:
    # Energy: (240000 + 240000) / 980000 = 480000 / 980000 = 0.4898
    # Technology: 500000 / 980000 = 0.5102
    assert sector_exposures["Energy"] == 0.4898
    assert sector_exposures["Technology"] == 0.5102
    assert round(sum(sector_exposures.values()), 2) == 1.0


def test_calculate_affected_sector_exposure(demo_hurricane_holdings):
    """5. Correct affected-sector exposure calculation."""
    # Hurricane affecting only Energy
    affected = calculate_affected_sector_exposure(
        demo_hurricane_holdings,
        affected_sectors=["Energy"]
    )
    assert affected == 0.4898

    # Hurricane affecting both Energy and Utilities (none in this portfolio)
    affected_multiple = calculate_affected_sector_exposure(
        demo_hurricane_holdings,
        affected_sectors=["Energy", "Utilities"]
    )
    assert affected_multiple == 0.4898

    # Event affecting an unrelated sector
    unaffected = calculate_affected_sector_exposure(
        demo_hurricane_holdings,
        affected_sectors=["Healthcare"]
    )
    assert unaffected == 0.0


def test_empty_portfolio():
    """6. Empty portfolio handling without errors."""
    empty_holdings = []
    assert calculate_portfolio_value(empty_holdings) == 0.0
    assert calculate_asset_exposure(empty_holdings) == {}
    assert calculate_sector_exposure(empty_holdings) == {}
    assert calculate_affected_sector_exposure(empty_holdings, ["Energy"]) == 0.0

    result = calculate_exposure(empty_holdings, affected_sectors=["Energy"])
    assert result.total_value == 0.0
    assert result.asset_exposure == {}
    assert result.sector_exposure == {}
    assert result.affected_sector_exposure == 0.0


def test_zero_total_portfolio_value():
    """7. Division-by-zero protection when holdings have zero total value."""
    zero_holdings = [
        Holding(ticker="GHOST1", quantity=0, current_price=100, sector="Energy"),
        Holding(ticker="GHOST2", quantity=100, current_price=0, sector="Technology"),
    ]
    assert calculate_portfolio_value(zero_holdings) == 0.0

    # Must return 0.0 for all exposures rather than ZeroDivisionError
    asset_exp = calculate_asset_exposure(zero_holdings)
    assert asset_exp == {"GHOST1": 0.0, "GHOST2": 0.0}

    sector_exp = calculate_sector_exposure(zero_holdings)
    assert sector_exp == {"Energy": 0.0, "Technology": 0.0}

    affected_exp = calculate_affected_sector_exposure(zero_holdings, ["Energy"])
    assert affected_exp == 0.0

    res = calculate_exposure(zero_holdings, affected_sectors=["Energy"])
    assert res.total_value == 0.0
    assert res.affected_sector_exposure == 0.0


def test_multiple_sectors(multi_sector_holdings):
    """8. Correct calculations with multiple diverse sectors."""
    result = calculate_exposure(
        multi_sector_holdings,
        affected_sectors=["Energy", "Utilities"]
    )

    assert result.total_value == 50000.0
    # Energy: 10,000 / 50,000 = 0.20
    # Utilities: 10,000 / 50,000 = 0.20
    # Healthcare: 15,000 / 50,000 = 0.30
    # Financials: 15,000 / 50,000 = 0.30
    assert result.sector_exposure["Energy"] == 0.20
    assert result.sector_exposure["Utilities"] == 0.20
    assert result.sector_exposure["Healthcare"] == 0.30
    assert result.sector_exposure["Financials"] == 0.30

    # Combined affected: Energy + Utilities = 20,000 / 50,000 = 0.40
    assert result.affected_sector_exposure == 0.40
    assert result.affected_sectors_value == 20000.0


def test_realistic_hurricane_demo_portfolio(demo_hurricane_holdings):
    """9. Realistic Hurricane-Energy Demo Portfolio full end-to-end check."""
    portfolio = Portfolio(total_value=980000, holdings=demo_hurricane_holdings)
    result = calculate_exposure(portfolio, affected_sectors=["Energy"])

    # Verify structured result fields
    assert result.total_value == 980000.0
    assert result.position_values["XOM"] == 240000.0
    assert result.position_values["CVX"] == 240000.0
    assert result.position_values["MSFT"] == 500000.0

    assert result.asset_exposure["XOM"] == 0.2449
    assert result.asset_exposure["CVX"] == 0.2449
    assert result.asset_exposure["MSFT"] == 0.5102

    assert result.sector_exposure["Energy"] == 0.4898
    assert result.sector_exposure["Technology"] == 0.5102

    assert result.affected_sector_exposure == 0.4898
    assert result.affected_sectors_value == 480000.0

    # Verify dict access and to_dict()
    assert result["total_value"] == 980000.0
    d = result.to_dict()
    assert d["affected_sector_exposure"] == 0.4898

    # Verify conversion to PortfolioExposure schema
    portfolio_exposure_model = result.to_portfolio_exposure()
    assert portfolio_exposure_model.total_value == 980000.0
    assert portfolio_exposure_model.affected_sectors_exposure_pct == 48.98
    assert portfolio_exposure_model.top_sector == "Technology"
    assert portfolio_exposure_model.top_sector_weight_pct == 51.02


def test_input_validation_and_errors():
    """10. Validation checks for invalid prices, quantities, and missing fields."""
    with pytest.raises(ValueError, match="negative quantity"):
        calculate_position_value({"ticker": "XOM", "quantity": -10, "current_price": 100})

    with pytest.raises(ValueError, match="negative price"):
        calculate_position_value({"ticker": "XOM", "quantity": 10, "current_price": -100})

    with pytest.raises(ValueError, match="missing required 'ticker'"):
        calculate_position_value({"quantity": 10, "current_price": 100})

    with pytest.raises(ValueError, match="specify both 'quantity' and 'current_price'"):
        calculate_position_value({"ticker": "XOM", "quantity": 10})
