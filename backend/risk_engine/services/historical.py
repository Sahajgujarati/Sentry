"""
Historical Event Analysis Service
=================================
Calculates quantitative descriptive statistics from historical analog shock impacts.
Receives structured historical precedent data and computes event counts, mean impact,
median impact, minimum (worst-case), maximum (best-case), and population standard deviation.

Designed to be resilient to missing evidence, single-observation samples,
and mixed positive/negative returns without external API calls or LLM dependencies.
"""

import math
import statistics
from typing import Any, Dict, List, Optional, Sequence, Union
from pydantic import BaseModel, ConfigDict, Field

from backend.risk_engine.schemas.risk_input import HistoricalAnalysis, HistoricalEvent
from backend.risk_engine.schemas.risk_output import HistoricalStatistics


class HistoricalStatisticsResult(BaseModel):
    """
    Structured outcome of the historical descriptive statistics calculation.
    Supports both conceptual field names (events, best_case, worst_case, volatility)
    and canonical schema field names (similar_events_analyzed, mean_drawdown_pct, etc.).
    """
    events: int = Field(default=0, description="Total count of valid historical events analyzed")
    mean_impact: Optional[float] = Field(
        default=None,
        description="Arithmetic mean return impact across valid historical events"
    )
    median_impact: Optional[float] = Field(
        default=None,
        description="Median return impact across valid historical events"
    )
    min_impact: Optional[float] = Field(
        default=None,
        description="Numerically lowest return impact (worst historical outcome)"
    )
    max_impact: Optional[float] = Field(
        default=None,
        description="Numerically highest return impact (best historical outcome)"
    )
    worst_case: Optional[float] = Field(
        default=None,
        description="Worst-case historical impact (identical to min_impact)"
    )
    best_case: Optional[float] = Field(
        default=None,
        description="Best-case historical impact (identical to max_impact)"
    )
    volatility: float = Field(
        default=0.0,
        description="Population standard deviation of historical return impacts"
    )
    standard_deviation: float = Field(
        default=0.0,
        description="Population standard deviation (statistics.pstdev)"
    )
    key_analogous_events: List[str] = Field(
        default_factory=list,
        description="Names/identifiers of the historical events included in this sample"
    )

    model_config = ConfigDict(extra="allow", populate_by_name=True)

    def __getitem__(self, item: str) -> Any:
        """Support dictionary-style access for hackathon convenience."""
        if hasattr(self, item):
            return getattr(self, item)
        # Support aliases
        if item == "count" or item == "similar_events_analyzed":
            return self.events
        if item == "minimum":
            return self.min_impact
        if item == "maximum":
            return self.max_impact
        raise KeyError(f"Key '{item}' not found in HistoricalStatisticsResult")

    def to_dict(self) -> Dict[str, Any]:
        """Returns standard dictionary representation matching project conventions."""
        return {
            "events": self.events,
            "mean_impact": self.mean_impact,
            "median_impact": self.median_impact,
            "best_case": self.best_case,
            "worst_case": self.worst_case,
            "volatility": self.volatility,
            "key_analogous_events": self.key_analogous_events,
        }

    def to_historical_statistics(self) -> HistoricalStatistics:
        """
        Adapts this result into the canonical HistoricalStatistics schema
        used in the master RiskReport output model.
        """
        return HistoricalStatistics(
            similar_events_analyzed=self.events,
            median_drawdown_pct=self.median_impact,
            mean_drawdown_pct=self.mean_impact,
            max_drawdown_pct=self.worst_case,
            historical_volatility_pct=self.volatility,
            key_analogous_events=self.key_analogous_events,
        )


def _extract_single_impact(item: Any) -> Optional[float]:
    """
    Extracts a numeric float impact from an individual event item.
    Rejects booleans, non-numeric strings, NaNs, and infinite values.
    Returns None if no valid numeric impact is present.
    """
    if isinstance(item, bool):
        return None

    if isinstance(item, (int, float)):
        val = float(item)
        return val if not (math.isnan(val) or math.isinf(val)) else None

    if isinstance(item, HistoricalEvent):
        # Prefer impact_pct, fallback to sector_impact_pct or dynamic attributes
        if item.impact_pct is not None and not isinstance(item.impact_pct, bool):
            val = float(item.impact_pct)
            return val if not (math.isnan(val) or math.isinf(val)) else None
        if hasattr(item, "impact") and getattr(item, "impact") is not None:
            val = getattr(item, "impact")
            if isinstance(val, (int, float)) and not isinstance(val, bool):
                return float(val) if not (math.isnan(val) or math.isinf(val)) else None
        if item.sector_impact_pct is not None and not isinstance(item.sector_impact_pct, bool):
            val = float(item.sector_impact_pct)
            return val if not (math.isnan(val) or math.isinf(val)) else None
        return None

    if isinstance(item, dict):
        # Look for common impact keys without silent string conversion
        for key in ("impact", "impact_pct", "return", "drawdown", "sector_impact_pct"):
            if key in item and item[key] is not None:
                raw = item[key]
                if isinstance(raw, (int, float)) and not isinstance(raw, bool):
                    val = float(raw)
                    return val if not (math.isnan(val) or math.isinf(val)) else None
        return None

    return None


def _extract_event_name(item: Any, index: int) -> str:
    """Extracts a readable event name or generates a standard fallback."""
    if isinstance(item, HistoricalEvent):
        if item.event_name:
            year_str = f" ({item.event_year})" if item.event_year else ""
            return f"{item.event_name}{year_str}"
    elif isinstance(item, dict):
        name = item.get("event_name") or item.get("name") or item.get("title")
        year = item.get("event_year") or item.get("year") or item.get("date")
        if name:
            return f"{name} ({year})" if year else str(name)
    return f"Event {index + 1}"


def extract_valid_impacts(
    events: Union[HistoricalAnalysis, Sequence[Any], None],
    target_sector: Optional[str] = None
) -> List[float]:
    """
    Extracts a list of clean numeric decimal impact returns from a collection of events.
    Skips invalid entries, non-numeric strings, or records without impact values.

    Args:
        events: HistoricalAnalysis instance, list/sequence of events, or sequence of floats.
        target_sector: Optional sector filter (case-insensitive). If provided, only events
                       matching this sector (or without sector metadata) are included.

    Returns:
        List[float]: Valid numeric impact returns (e.g. [-0.021, -0.045, -0.058]).
    """
    if events is None:
        return []

    # If HistoricalAnalysis model was passed, extract its historical_events list
    if isinstance(events, HistoricalAnalysis):
        raw_list = events.historical_events
    elif isinstance(events, (list, tuple)):
        raw_list = events
    else:
        return []

    valid_impacts: List[float] = []
    normalized_sector = target_sector.strip().lower() if target_sector else None

    for item in raw_list:
        # Check sector filter if specified
        if normalized_sector:
            item_sector = None
            if isinstance(item, HistoricalEvent):
                item_sector = getattr(item, "sector", None)
            elif isinstance(item, dict):
                item_sector = item.get("sector")

            if item_sector and str(item_sector).strip().lower() != normalized_sector:
                continue

        val = _extract_single_impact(item)
        if val is not None:
            valid_impacts.append(val)

    return valid_impacts


def calculate_historical_statistics(
    events: Union[HistoricalAnalysis, Sequence[Any], None],
    round_digits: Optional[int] = 4,
    target_sector: Optional[str] = None
) -> HistoricalStatisticsResult:
    """
    Calculates quantitative descriptive statistics for historical event impacts:
    - Count of valid historical events
    - Arithmetic mean impact
    - Median impact
    - Minimum impact (worst-case outcome)
    - Maximum impact (best-case outcome)
    - Population standard deviation (statistics.pstdev, 0.0 for <= 1 observation)

    Args:
        events: HistoricalAnalysis model, sequence of HistoricalEvent objects,
                list of event dicts, or sequence of numeric impact floats.
        round_digits: Optional rounding precision for outputs (default 4 decimals).
        target_sector: Optional sector to filter events by.

    Returns:
        HistoricalStatisticsResult: Structured result with full descriptive statistics.
    """
    if events is None:
        return HistoricalStatisticsResult(
            events=0,
            mean_impact=None,
            median_impact=None,
            min_impact=None,
            max_impact=None,
            worst_case=None,
            best_case=None,
            volatility=0.0,
            standard_deviation=0.0,
            key_analogous_events=[]
        )

    # Resolve event sequence and extract names
    if isinstance(events, HistoricalAnalysis):
        raw_list = events.historical_events
    elif isinstance(events, (list, tuple)):
        raw_list = events
    else:
        raw_list = []

    valid_impacts: List[float] = []
    event_names: List[str] = []
    normalized_sector = target_sector.strip().lower() if target_sector else None

    for idx, item in enumerate(raw_list):
        if normalized_sector:
            item_sector = None
            if isinstance(item, HistoricalEvent):
                item_sector = getattr(item, "sector", None)
            elif isinstance(item, dict):
                item_sector = item.get("sector")

            if item_sector and str(item_sector).strip().lower() != normalized_sector:
                continue

        val = _extract_single_impact(item)
        if val is not None:
            valid_impacts.append(val)
            name = _extract_event_name(item, idx)
            event_names.append(name)

    n = len(valid_impacts)

    # Case 1: Empty event list / no valid impacts
    if n == 0:
        return HistoricalStatisticsResult(
            events=0,
            mean_impact=None,
            median_impact=None,
            min_impact=None,
            max_impact=None,
            worst_case=None,
            best_case=None,
            volatility=0.0,
            standard_deviation=0.0,
            key_analogous_events=[]
        )

    # Case 2: Exactly one valid event
    if n == 1:
        single_val = valid_impacts[0]
        val_rounded = round(single_val, round_digits) if round_digits is not None else single_val
        return HistoricalStatisticsResult(
            events=1,
            mean_impact=val_rounded,
            median_impact=val_rounded,
            min_impact=val_rounded,
            max_impact=val_rounded,
            worst_case=val_rounded,
            best_case=val_rounded,
            volatility=0.0,
            standard_deviation=0.0,
            key_analogous_events=event_names
        )

    # Case 3: Multiple valid events (n >= 2)
    raw_mean = statistics.mean(valid_impacts)
    raw_median = statistics.median(valid_impacts)
    raw_min = min(valid_impacts)
    raw_max = max(valid_impacts)
    raw_pstdev = statistics.pstdev(valid_impacts)

    def _round(x: float) -> float:
        return round(x, round_digits) if round_digits is not None else x

    mean_rounded = _round(raw_mean)
    median_rounded = _round(raw_median)
    min_rounded = _round(raw_min)
    max_rounded = _round(raw_max)
    pstdev_rounded = _round(raw_pstdev)

    return HistoricalStatisticsResult(
        events=n,
        mean_impact=mean_rounded,
        median_impact=median_rounded,
        min_impact=min_rounded,
        max_impact=max_rounded,
        worst_case=min_rounded,
        best_case=max_rounded,
        volatility=pstdev_rounded,
        standard_deviation=pstdev_rounded,
        key_analogous_events=event_names
    )
