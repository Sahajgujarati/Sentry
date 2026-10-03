"""
Portfolio & Sector Exposure Engine
==================================
Calculates position values, portfolio totals, asset-level exposures,
sector allocations, and event-affected sector exposure ratios.

Designed to work directly with Pydantic models from `risk_engine.schemas`
as well as raw dictionaries and lists for hackathon-friendly flexibility.
"""

from typing import Any, Dict, List, Optional, Sequence, Union
from pydantic import BaseModel, ConfigDict, Field

from backend.risk_engine.schemas.risk_input import Holding, Portfolio
from backend.risk_engine.schemas.risk_output import PortfolioExposure


class ExposureResult(BaseModel):
    """
    Structured outcome of the exposure calculation engine.
    Provides position values, asset exposures, sector breakdowns,
    and event-impacted sector metrics.
    """
    total_value: float = Field(..., description="Total portfolio value including cash in USD")
    position_values: Dict[str, float] = Field(
        default_factory=dict,
        description="Market value per asset ticker in USD"
    )
    asset_exposure: Dict[str, float] = Field(
        default_factory=dict,
        description="Asset weight fraction of total portfolio (0.0 to 1.0)"
    )
    sector_values: Dict[str, float] = Field(
        default_factory=dict,
        description="Aggregated market value per industry sector in USD"
    )
    sector_exposure: Dict[str, float] = Field(
        default_factory=dict,
        description="Sector allocation fraction of total portfolio (0.0 to 1.0)"
    )
    affected_sector_exposure: float = Field(
        default=0.0,
        description="Combined portfolio allocation fraction to event-impacted sectors"
    )
    affected_sectors_value: float = Field(
        default=0.0,
        description="Total dollar amount in event-impacted sectors"
    )
    cash: float = Field(
        default=0.0,
        description="Uninvested cash reserve in USD"
    )

    model_config = ConfigDict(extra="allow", populate_by_name=True)

    def __getitem__(self, item: str) -> Any:
        """Allow dict-like subscription access for hackathon convenience."""
        if hasattr(self, item):
            return getattr(self, item)
        raise KeyError(f"Key '{item}' not found in ExposureResult")

    def to_dict(self) -> Dict[str, Any]:
        """Convert result to standard dictionary."""
        return self.model_dump()

    def to_portfolio_exposure(self) -> PortfolioExposure:
        """
        Adapts this result into the standardized PortfolioExposure schema
        used by Person 4 (Frontend) and Person 1 (RiskReport).
        """
        top_sector = None
        top_sector_pct = None
        if self.sector_exposure:
            top_sector = max(self.sector_exposure, key=self.sector_exposure.get)
            top_sector_pct = round(self.sector_exposure[top_sector] * 100.0, 2)

        cash_pct = 0.0
        if self.total_value > 0:
            cash_pct = round((self.cash / self.total_value) * 100.0, 2)

        # Convert fractional sector exposure to percentages for presentation
        sector_breakdown_pct = {
            sector: round(weight * 100.0, 2)
            for sector, weight in self.sector_exposure.items()
        }

        affected_pct = round(self.affected_sector_exposure * 100.0, 2)

        return PortfolioExposure(
            total_value=round(self.total_value, 2),
            sector_breakdown=sector_breakdown_pct,
            sector_values={k: round(v, 2) for k, v in self.sector_values.items()},
            affected_sectors_exposure_pct=affected_pct,
            affected_sectors_value=round(self.affected_sectors_value, 2),
            top_sector=top_sector,
            top_sector_weight_pct=top_sector_pct,
            cash_pct=cash_pct,
        )


def _extract_holding_fields(holding: Union[Holding, Dict[str, Any]]) -> tuple[str, float, float, str]:
    """
    Extracts and validates (ticker, quantity, current_price, sector) from a Holding model or dict.
    Raises ValueError on negative or invalid numeric inputs.
    """
    if isinstance(holding, Holding):
        ticker = holding.ticker
        qty = holding.quantity
        price = holding.current_price
        sector = holding.sector or "Unassigned"
    elif isinstance(holding, dict):
        if "ticker" not in holding:
            raise ValueError("Holding is missing required 'ticker' field")
        ticker = str(holding["ticker"]).strip()
        if not ticker:
            raise ValueError("Holding ticker cannot be empty")
        qty = holding.get("quantity")
        price = holding.get("current_price")
        sector = holding.get("sector") or "Unassigned"
    else:
        raise TypeError(f"Expected Holding instance or dict, got {type(holding).__name__}")

    if qty is None or price is None:
        raise ValueError(f"Holding '{ticker}' must specify both 'quantity' and 'current_price'")

    try:
        qty_num = float(qty)
        price_num = float(price)
    except (ValueError, TypeError) as exc:
        raise ValueError(f"Holding '{ticker}' has non-numeric quantity or price: {exc}") from exc

    if qty_num < 0:
        raise ValueError(f"Holding '{ticker}' has negative quantity: {qty_num}")
    if price_num < 0:
        raise ValueError(f"Holding '{ticker}' has negative price: {price_num}")

    sector_clean = str(sector).strip() if sector else "Unassigned"
    return ticker, qty_num, price_num, sector_clean


def calculate_position_value(holding: Union[Holding, Dict[str, Any]]) -> float:
    """
    Calculates market value of a single holding position:
        position_value = quantity * current_price

    Args:
        holding: A Holding Pydantic model or dictionary with 'quantity' and 'current_price'.

    Returns:
        float: Market value of the position in USD.
    """
    _, qty, price, _ = _extract_holding_fields(holding)
    return qty * price


def calculate_portfolio_value(
    holdings: Sequence[Union[Holding, Dict[str, Any]]],
    cash: float = 0.0
) -> float:
    """
    Calculates total portfolio value across all holdings plus uninvested cash:
        total_value = sum(quantity * price) + cash

    Args:
        holdings: Sequence of Holding models or dictionaries.
        cash: Optional cash reserve in USD (default 0.0).

    Returns:
        float: Total portfolio value.
    """
    if cash < 0:
        raise ValueError(f"Cash cannot be negative: {cash}")

    total = float(cash)
    for h in holdings:
        total += calculate_position_value(h)
    return total


def calculate_asset_exposure(
    holdings: Sequence[Union[Holding, Dict[str, Any]]],
    total_value: Optional[float] = None,
    round_digits: Optional[int] = 4
) -> Dict[str, float]:
    """
    Calculates the weight fraction of each asset relative to the total portfolio:
        asset_exposure = position_value / total_portfolio_value

    Handles multiple holdings for the same ticker by aggregating their position values.
    Guards against division by zero if total_value is 0 or portfolio is empty.

    Args:
        holdings: Sequence of Holding models or dictionaries.
        total_value: Optional precomputed total portfolio value.
        round_digits: Optional precision to round fractions (default: 4, e.g. 0.2449).

    Returns:
        Dict[str, float]: Ticker mapped to fractional portfolio exposure.
    """
    ticker_values: Dict[str, float] = {}
    for h in holdings:
        ticker, qty, price, _ = _extract_holding_fields(h)
        val = qty * price
        ticker_values[ticker] = ticker_values.get(ticker, 0.0) + val

    if total_value is None:
        total_value = sum(ticker_values.values())

    if total_value <= 0:
        return {t: 0.0 for t in ticker_values}

    exposures: Dict[str, float] = {}
    for t, val in ticker_values.items():
        ratio = val / total_value
        exposures[t] = round(ratio, round_digits) if round_digits is not None else ratio

    return exposures


def calculate_sector_exposure(
    holdings: Sequence[Union[Holding, Dict[str, Any]]],
    total_value: Optional[float] = None,
    round_digits: Optional[int] = 4
) -> Dict[str, float]:
    """
    Calculates the weight fraction of each industry sector relative to the total portfolio:
        sector_exposure = total_sector_value / total_portfolio_value

    Guards against division by zero if total_value is 0 or portfolio is empty.

    Args:
        holdings: Sequence of Holding models or dictionaries.
        total_value: Optional precomputed total portfolio value.
        round_digits: Optional precision to round fractions (default: 4, e.g. 0.4898).

    Returns:
        Dict[str, float]: Sector name mapped to fractional portfolio exposure.
    """
    sector_values: Dict[str, float] = {}
    for h in holdings:
        _, qty, price, sector = _extract_holding_fields(h)
        val = qty * price
        sector_values[sector] = sector_values.get(sector, 0.0) + val

    if total_value is None:
        total_value = sum(sector_values.values())

    if total_value <= 0:
        return {sec: 0.0 for sec in sector_values}

    exposures: Dict[str, float] = {}
    for sec, val in sector_values.items():
        ratio = val / total_value
        exposures[sec] = round(ratio, round_digits) if round_digits is not None else ratio

    return exposures


def calculate_affected_sector_exposure(
    holdings: Sequence[Union[Holding, Dict[str, Any]]],
    affected_sectors: Sequence[str],
    total_value: Optional[float] = None,
    round_digits: Optional[int] = 4
) -> float:
    """
    Calculates combined portfolio exposure to all event-affected sectors.
    Performs case-insensitive matching between holding sectors and affected sector names.

    Args:
        holdings: Sequence of Holding models or dictionaries.
        affected_sectors: List of affected sector strings (e.g. ['Energy', 'Utilities']).
        total_value: Optional precomputed total portfolio value.
        round_digits: Optional precision to round fractions (default: 4, e.g. 0.4898).

    Returns:
        float: Fractional portfolio exposure to affected sectors (0.0 to 1.0).
    """
    if not affected_sectors:
        return 0.0

    normalized_affected = {s.strip().lower() for s in affected_sectors if s}
    if not normalized_affected:
        return 0.0

    affected_value = 0.0
    all_values = 0.0

    for h in holdings:
        _, qty, price, sector = _extract_holding_fields(h)
        val = qty * price
        all_values += val
        if sector.strip().lower() in normalized_affected:
            affected_value += val

    if total_value is None:
        total_value = all_values

    if total_value <= 0:
        return 0.0

    ratio = affected_value / total_value
    return round(ratio, round_digits) if round_digits is not None else ratio


def calculate_exposure(
    portfolio: Union[Portfolio, Dict[str, Any], Sequence[Union[Holding, Dict[str, Any]]]],
    affected_sectors: Optional[Sequence[str]] = None,
    round_digits: Optional[int] = 4
) -> ExposureResult:
    """
    Master exposure calculation function.
    Aggregates position values, asset exposures, sector values, sector exposures,
    and event-affected sector exposures into a structured ExposureResult.

    Args:
        portfolio: A Portfolio model, dict with 'holdings' (and optional 'cash'),
                   or a direct sequence of Holding items.
        affected_sectors: Optional list of affected sectors (e.g. ['Energy']).
        round_digits: Decimal precision for fractions (default: 4).

    Returns:
        ExposureResult: Structured result supporting both dot notation and dictionary access.
    """
    # Normalize input into holdings sequence and cash
    cash = 0.0
    if isinstance(portfolio, Portfolio):
        holdings = portfolio.holdings
        cash = portfolio.cash or 0.0
    elif isinstance(portfolio, dict):
        holdings = portfolio.get("holdings", [])
        cash = float(portfolio.get("cash", 0.0))
    elif isinstance(portfolio, (list, tuple)):
        holdings = portfolio
        cash = 0.0
    else:
        raise TypeError(f"Unsupported portfolio input type: {type(portfolio).__name__}")

    # Calculate position values and sector values
    position_values: Dict[str, float] = {}
    sector_values: Dict[str, float] = {}
    total_positions_val = 0.0

    for h in holdings:
        ticker, qty, price, sector = _extract_holding_fields(h)
        val = qty * price
        position_values[ticker] = position_values.get(ticker, 0.0) + val
        sector_values[sector] = sector_values.get(sector, 0.0) + val
        total_positions_val += val

    total_value = total_positions_val + cash

    # Calculate asset exposures
    asset_exposure: Dict[str, float] = {}
    if total_value > 0:
        for t, val in position_values.items():
            ratio = val / total_value
            asset_exposure[t] = round(ratio, round_digits) if round_digits is not None else ratio
    else:
        asset_exposure = {t: 0.0 for t in position_values}

    # Calculate sector exposures
    sector_exposure: Dict[str, float] = {}
    if total_value > 0:
        for sec, val in sector_values.items():
            ratio = val / total_value
            sector_exposure[sec] = round(ratio, round_digits) if round_digits is not None else ratio
    else:
        sector_exposure = {sec: 0.0 for sec in sector_values}

    # Calculate affected sector exposure and values
    affected_sector_exp = 0.0
    affected_sectors_val = 0.0
    if affected_sectors:
        normalized_affected = {s.strip().lower() for s in affected_sectors if s}
        for sec, val in sector_values.items():
            if sec.strip().lower() in normalized_affected:
                affected_sectors_val += val

        if total_value > 0:
            ratio = affected_sectors_val / total_value
            affected_sector_exp = round(ratio, round_digits) if round_digits is not None else ratio

    return ExposureResult(
        total_value=round(total_value, 2),
        position_values={k: round(v, 2) for k, v in position_values.items()},
        asset_exposure=asset_exposure,
        sector_values={k: round(v, 2) for k, v in sector_values.items()},
        sector_exposure=sector_exposure,
        affected_sector_exposure=affected_sector_exp,
        affected_sectors_value=round(affected_sectors_val, 2),
        cash=round(cash, 2)
    )
