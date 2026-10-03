"""
Tests for Historical Event Analysis Service
===========================================
Validates descriptive statistics (mean, median, min/worst-case, max/best-case,
population standard deviation), edge cases (empty, single-event),
mixed positive/negative returns, and canonical hurricane-energy datasets.
"""

import math
import pytest

from backend.risk_engine.schemas.risk_input import HistoricalAnalysis, HistoricalEvent
from backend.risk_engine.schemas.risk_output import HistoricalStatistics
from backend.risk_engine.services.historical import (
    calculate_historical_statistics,
    extract_valid_impacts,
    HistoricalStatisticsResult,
)


# ---------------------------------------------------------------------------
# Test Fixtures
# ---------------------------------------------------------------------------

@pytest.fixture
def canonical_impacts():
    """Canonical 5-event impact sample from hackathon specification."""
    return [-0.021, -0.045, -0.058, -0.062, -0.104]


@pytest.fixture
def hurricane_events_models():
    """List of HistoricalEvent Pydantic models representing Gulf hurricanes."""
    return [
        HistoricalEvent(event_name="Hurricane Ida", event_year=2021, impact_pct=-0.021),
        HistoricalEvent(event_name="Hurricane Harvey", event_year=2017, impact_pct=-0.045),
        HistoricalEvent(event_name="Hurricane Ike", event_year=2008, impact_pct=-0.058),
        HistoricalEvent(event_name="Hurricane Rita", event_year=2005, impact_pct=-0.062),
        HistoricalEvent(event_name="Hurricane Katrina", event_year=2005, impact_pct=-0.104),
    ]


@pytest.fixture
def hurricane_events_dicts():
    """List of dictionaries representing historical events from Person 1/2."""
    return [
        {"event_name": "Ida", "event_type": "hurricane", "date": "2021-08-29", "sector": "Energy", "impact": -0.021},
        {"event_name": "Harvey", "event_type": "hurricane", "date": "2017-08-25", "sector": "Energy", "impact": -0.045},
        {"event_name": "Ike", "event_type": "hurricane", "date": "2008-09-13", "sector": "Energy", "impact": -0.058},
        {"event_name": "Rita", "event_type": "hurricane", "date": "2005-09-24", "sector": "Energy", "impact": -0.062},
        {"event_name": "Katrina", "event_type": "hurricane", "date": "2005-08-29", "sector": "Energy", "impact": -0.104},
    ]


# ---------------------------------------------------------------------------
# Test Cases
# ---------------------------------------------------------------------------

def test_mean_calculation():
    """1. Correct arithmetic mean calculation across historical impacts."""
    data = [-0.02, -0.04, -0.06]
    stats = calculate_historical_statistics(data)
    assert stats.events == 3
    assert stats.mean_impact == -0.04


def test_median_calculation(canonical_impacts):
    """2. Correct median calculation for both odd and even sized datasets."""
    # Odd number of observations (5): middle element is -0.058
    stats_odd = calculate_historical_statistics(canonical_impacts)
    assert stats_odd.median_impact == -0.058

    # Even number of observations (4): average of -0.04 and -0.06 = -0.05
    data_even = [-0.02, -0.04, -0.06, -0.08]
    stats_even = calculate_historical_statistics(data_even)
    assert stats_even.median_impact == -0.05


def test_minimum_and_maximum(canonical_impacts):
    """3. Correct identification of minimum (worst-case) and maximum (best-case) outcomes."""
    stats = calculate_historical_statistics(canonical_impacts)

    # Minimum impact = numerically lowest and worst outcome (-10.4%)
    assert stats.min_impact == -0.104
    assert stats.worst_case == -0.104

    # Maximum impact = numerically highest and best outcome (-2.1%)
    assert stats.max_impact == -0.021
    assert stats.best_case == -0.021


def test_standard_deviation(canonical_impacts):
    """4. Correct population standard deviation (statistics.pstdev) calculation."""
    # pstdev of [-0.021, -0.045, -0.058, -0.062, -0.104] is ~0.0270924... -> 0.0271
    stats = calculate_historical_statistics(canonical_impacts)
    assert stats.volatility == 0.0271
    assert stats.standard_deviation == 0.0271


def test_single_historical_event():
    """5. Single historical event: mean = median = impact, standard deviation = 0.0."""
    single_event = [HistoricalEvent(event_name="Lone Storm", impact_pct=-0.042)]
    stats = calculate_historical_statistics(single_event)

    assert stats.events == 1
    assert stats.mean_impact == -0.042
    assert stats.median_impact == -0.042
    assert stats.min_impact == -0.042
    assert stats.max_impact == -0.042
    assert stats.worst_case == -0.042
    assert stats.best_case == -0.042
    assert stats.volatility == 0.0
    assert stats.standard_deviation == 0.0


def test_empty_event_list():
    """6. Empty historical event list handling without crashing."""
    # Empty list
    stats_empty = calculate_historical_statistics([])
    assert stats_empty.events == 0
    assert stats_empty.mean_impact is None
    assert stats_empty.median_impact is None
    assert stats_empty.worst_case is None
    assert stats_empty.best_case is None
    assert stats_empty.volatility == 0.0

    # None passed
    stats_none = calculate_historical_statistics(None)
    assert stats_none.events == 0
    assert stats_none.mean_impact is None

    # HistoricalAnalysis with empty events
    analysis_empty = HistoricalAnalysis(similar_event_count=0, historical_events=[])
    stats_analysis = calculate_historical_statistics(analysis_empty)
    assert stats_analysis.events == 0
    assert stats_analysis.mean_impact is None


def test_positive_and_negative_impacts():
    """7. Support for mixed positive and negative historical returns."""
    mixed_data = [-0.05, 0.02, -0.01, 0.04]
    # Sum: -0.05 + 0.02 - 0.01 + 0.04 = 0.00 -> mean = 0.0
    # Sorted: [-0.05, -0.01, 0.02, 0.04] -> median = (-0.01 + 0.02)/2 = 0.005
    # min = -0.05, max = 0.04
    stats = calculate_historical_statistics(mixed_data)

    assert stats.events == 4
    assert stats.mean_impact == 0.0
    assert stats.median_impact == 0.005
    assert stats.worst_case == -0.05
    assert stats.best_case == 0.04
    assert stats.volatility > 0.0


def test_realistic_hurricane_dataset(hurricane_events_dicts, hurricane_events_models):
    """8. Realistic hurricane-energy dataset processing from dicts and models."""
    # Test from dictionaries (Person 1/2 ingestion format)
    stats_dicts = calculate_historical_statistics(hurricane_events_dicts)
    assert stats_dicts.events == 5
    assert stats_dicts.mean_impact == -0.058
    assert stats_dicts.median_impact == -0.058
    assert stats_dicts.worst_case == -0.104
    assert stats_dicts.best_case == -0.021
    assert stats_dicts.volatility == 0.0271

    # Verify key analogous events captured
    assert len(stats_dicts.key_analogous_events) == 5
    assert any("Katrina" in name for name in stats_dicts.key_analogous_events)

    # Test from Pydantic HistoricalAnalysis wrapper
    analysis = HistoricalAnalysis(
        similar_event_count=5,
        historical_events=hurricane_events_models
    )
    stats_models = calculate_historical_statistics(analysis)
    assert stats_models.events == 5
    assert stats_models.mean_impact == -0.058
    assert stats_models.median_impact == -0.058

    # Verify conversion to canonical HistoricalStatistics schema
    canonical_schema = stats_models.to_historical_statistics()
    assert isinstance(canonical_schema, HistoricalStatistics)
    assert canonical_schema.similar_events_analyzed == 5
    assert canonical_schema.median_drawdown_pct == -0.058
    assert canonical_schema.mean_drawdown_pct == -0.058
    assert canonical_schema.max_drawdown_pct == -0.104
    assert canonical_schema.historical_volatility_pct == 0.0271


def test_decimal_return_interpretation():
    """9. Correct mathematical interpretation of decimal percentage returns."""
    # -0.058 means -5.8%, 0.030 means +3.0%
    data = [-0.058, 0.030]
    stats = calculate_historical_statistics(data)

    assert stats.events == 2
    # Mean: (-0.058 + 0.030) / 2 = -0.028 / 2 = -0.014
    assert stats.mean_impact == -0.014
    assert stats.worst_case == -0.058  # Most negative outcome
    assert stats.best_case == 0.030   # Most positive outcome


def test_dirty_and_missing_data_filtering():
    """10. Resilient extraction skips invalid strings, booleans, and None impacts."""
    dirty_events = [
        {"event_name": "Valid 1", "impact": -0.03},
        {"event_name": "String Not Allowed", "impact": "not_a_number"},
        {"event_name": "Boolean Not Allowed", "impact": True},
        {"event_name": "None Impact", "impact": None},
        {"event_name": "Missing Impact Key"},
        {"event_name": "Valid 2", "impact": -0.07},
        "not a valid object",
        None,
    ]

    valid_impacts = extract_valid_impacts(dirty_events)
    assert valid_impacts == [-0.03, -0.07]

    stats = calculate_historical_statistics(dirty_events)
    assert stats.events == 2
    assert stats.mean_impact == -0.05
    assert stats.worst_case == -0.07
    assert stats.best_case == -0.03
