"""
Tests for Risk Score, Confidence, and Risk Drivers Engine
=========================================================
Validates all 20 required specifications: factor normalizations, missing data
renormalization, risk level classification, directional signal consistency,
confidence bounds, and explanatory risk driver attribution.
"""

import pytest

from backend.risk_engine.schemas.risk_input import Event, MarketAssetData, NewsAnalysis, WeatherAnalysis
from backend.risk_engine.services.risk_score import (
    DEFAULT_RISK_WEIGHTS,
    DEFAULT_CONFIDENCE_WEIGHTS,
    HISTORICAL_REFERENCE_SHOCK,
    MARKET_REFERENCE_SHOCK,
    normalize_exposure,
    normalize_event_severity,
    normalize_historical_risk,
    normalize_market_signal,
    normalize_news_risk,
    calculate_risk_level,
    calculate_risk_score,
    calculate_confidence,
    extract_risk_drivers,
    calculate_risk_assessment,
    RiskAssessmentResult,
)


# ---------------------------------------------------------------------------
# Test Cases (1 to 20)
# ---------------------------------------------------------------------------

def test_1_all_five_factors_available():
    """1. All five factors available: all 5 in available_factors, missing_factors empty."""
    res = calculate_risk_assessment(
        affected_sector_exposure=0.4898,
        weather_analysis=0.91,
        historical_median_impact=-0.058,
        market_data={"XOM": {"daily_change": -0.038, "weekly_change": -0.038}},
        news_sentiment_score=-0.72,
    )
    assert len(res.available_factors) == 5
    assert len(res.missing_factors) == 0
    assert set(res.available_factors) == {"exposure", "event_severity", "historical_risk", "market_signal", "news_risk"}


def test_2_correct_weighted_risk_score():
    """
    2. Correct weighted risk score calculation:
       - exposure: 0.4898 * 0.30 = 0.14694
       - event_severity: 0.91 * 0.25 = 0.22750
       - historical_risk: (0.058 / 0.10) * 0.20 = 0.58 * 0.20 = 0.11600
       - market_signal: (0.038 / 0.10) * 0.15 = 0.38 * 0.15 = 0.05700
       - news_risk: ((1 - (-0.72)) / 2) * 0.10 = 0.86 * 0.10 = 0.08600
       Total sum = 0.63344.
    """
    res = calculate_risk_assessment(
        affected_sector_exposure=0.4898,
        weather_analysis=0.91,
        historical_median_impact=-0.058,
        market_data={"XOM": {"daily_change": -0.038, "weekly_change": -0.038}},
        news_sentiment_score=-0.72,
    )
    assert res.risk_score == pytest.approx(0.6334, abs=1e-4)
    assert res.risk_score_100 == pytest.approx(63.34, abs=1e-2)


def test_3_correct_risk_level_mapping():
    """3. Correct risk-level mapping according to configured cutoffs."""
    # 0.00 - <0.30 -> LOW
    assert calculate_risk_level(0.00) == "LOW"
    assert calculate_risk_level(0.29) == "LOW"
    # 0.30 - <0.60 -> MEDIUM
    assert calculate_risk_level(0.30) == "MEDIUM"
    assert calculate_risk_level(0.59) == "MEDIUM"
    # 0.60 - <0.80 -> HIGH
    assert calculate_risk_level(0.60) == "HIGH"
    assert calculate_risk_level(0.79) == "HIGH"
    # 0.80 - 1.00 -> VERY_HIGH
    assert calculate_risk_level(0.80) == "VERY_HIGH"
    assert calculate_risk_level(1.00) == "VERY_HIGH"


def test_4_exposure_normalization():
    """4. Exposure normalization and clamping to [0, 1]."""
    assert normalize_exposure(0.4898) == 0.4898
    assert normalize_exposure(1.50) == 1.0  # Clamped upper
    assert normalize_exposure(-0.20) == 0.0  # Clamped lower
    assert normalize_exposure(None) is None


def test_5_event_severity_normalization():
    """5. Event severity normalization from weather score or event category."""
    # Weather severity score preferred
    assert normalize_event_severity(weather_analysis=0.91) == 0.91
    # Category 4 out of 5 -> 4 / 5.0 = 0.80
    assert normalize_event_severity(event_severity=4) == 0.80
    # String 'Category 4' -> 0.80
    assert normalize_event_severity(event_severity="Category 4") == 0.80
    # Weather preferred over event severity
    assert normalize_event_severity(weather_analysis=0.95, event_severity=3) == 0.95
    # Missing
    assert normalize_event_severity() is None


def test_6_historical_risk_normalization():
    """6. Historical-risk normalization based on reference shock."""
    # -0.058 / 0.10 = 0.58
    assert normalize_historical_risk(-0.058) == 0.58
    # -0.150 / 0.10 = 1.50 -> clamped to 1.0
    assert normalize_historical_risk(-0.150) == 1.0
    # 0.00
    assert normalize_historical_risk(0.0) == 0.0
    # Missing
    assert normalize_historical_risk(None) is None


def test_7_market_signal_normalization():
    """7. Market-signal normalization: converts negative returns to risk factor; positive is 0."""
    # -0.038 daily and weekly -> return = -0.038 -> risk = 0.038 / 0.10 = 0.38
    market_neg = {"XOM": {"daily_change": -0.038, "weekly_change": -0.038}}
    assert normalize_market_signal(market_neg) == pytest.approx(0.38, abs=1e-4)

    # Positive returns contribute 0 risk
    market_pos = {"XOM": {"daily_change": 0.05, "weekly_change": 0.03}}
    assert normalize_market_signal(market_pos) == 0.0

    # Missing / empty
    assert normalize_market_signal(None) is None
    assert normalize_market_signal({}) is None


def test_8_news_risk_normalization():
    """8. News-risk normalization: news_risk = (1 - sentiment) / 2."""
    assert normalize_news_risk(sentiment_score=-1.0) == 1.0
    assert normalize_news_risk(sentiment_score=0.0) == 0.5
    assert normalize_news_risk(sentiment_score=1.0) == 0.0
    assert normalize_news_risk(sentiment_score=-0.72) == pytest.approx(0.86, abs=1e-4)
    assert normalize_news_risk(sentiment_score=None) is None


def test_9_missing_news_source():
    """9. Missing news source: renormalizes weights across remaining 4 sources."""
    res = calculate_risk_assessment(
        affected_sector_exposure=0.50,
        weather_analysis=0.80,
        historical_median_impact=-0.05,
        market_data={"XOM": {"daily_change": -0.04, "weekly_change": -0.04}},
        news_analysis=None,
    )
    assert "news_risk" in res.missing_factors
    assert "news_risk" not in res.effective_weights
    # Available base weights sum = 0.30 + 0.25 + 0.20 + 0.15 = 0.90
    assert sum(res.effective_weights.values()) == pytest.approx(1.0, abs=1e-6)
    assert res.effective_weights["exposure"] == pytest.approx(0.30 / 0.90, abs=1e-4)


def test_10_missing_market_source():
    """10. Missing market source: renormalizes weights across remaining 4 sources."""
    res = calculate_risk_assessment(
        affected_sector_exposure=0.50,
        weather_analysis=0.80,
        historical_median_impact=-0.05,
        market_data=None,
        news_sentiment_score=-0.50,
    )
    assert "market_signal" in res.missing_factors
    assert sum(res.effective_weights.values()) == pytest.approx(1.0, abs=1e-6)
    assert res.effective_weights["exposure"] == pytest.approx(0.30 / 0.85, abs=1e-4)


def test_11_missing_historical_source():
    """11. Missing historical source: renormalizes weights across remaining 4 sources."""
    res = calculate_risk_assessment(
        affected_sector_exposure=0.50,
        weather_analysis=0.80,
        historical_median_impact=None,
        market_data={"XOM": {"daily_change": -0.04, "weekly_change": -0.04}},
        news_sentiment_score=-0.50,
    )
    assert "historical_risk" in res.missing_factors
    assert sum(res.effective_weights.values()) == pytest.approx(1.0, abs=1e-6)
    assert res.effective_weights["exposure"] == pytest.approx(0.30 / 0.80, abs=1e-4)


def test_12_multiple_missing_sources():
    """12. Multiple missing sources: only exposure and severity available."""
    res = calculate_risk_assessment(
        affected_sector_exposure=0.50,
        weather_analysis=0.80,
        historical_median_impact=None,
        market_data=None,
        news_analysis=None,
    )
    assert len(res.available_factors) == 2
    assert len(res.missing_factors) == 3
    # Total available weights = 0.30 + 0.25 = 0.55
    assert sum(res.effective_weights.values()) == pytest.approx(1.0, abs=1e-6)
    # Expected: (0.50 * 0.30/0.55) + (0.80 * 0.25/0.55) = (0.15 + 0.20) / 0.55 = 0.35 / 0.55 = 0.6364
    assert res.risk_score == pytest.approx(0.35 / 0.55, abs=1e-4)


def test_13_weight_renormalization():
    """13. Weight renormalization always sums to 1.0 regardless of available factors."""
    factor_scores = {"exposure": 0.40, "event_severity": None, "historical_risk": 0.60, "market_signal": None, "news_risk": 0.80}
    score, effective_w, avail, missing = calculate_risk_score(factor_scores)
    assert sum(effective_w.values()) == pytest.approx(1.0, abs=1e-6)
    assert set(avail) == {"exposure", "historical_risk", "news_risk"}
    assert set(missing) == {"event_severity", "market_signal"}


def test_14_zero_exposure():
    """14. Zero exposure results in 0.0 exposure factor without breaking other factors."""
    res = calculate_risk_assessment(
        affected_sector_exposure=0.0,
        weather_analysis=0.80,
        historical_median_impact=-0.05,
    )
    assert res.factor_scores["exposure"] == 0.0
    assert res.contributions["exposure"] == 0.0
    assert res.risk_score > 0.0  # Driven by weather and historical


def test_15_positive_news_sentiment():
    """15. Positive news sentiment produces low news risk factor."""
    res = calculate_risk_assessment(
        affected_sector_exposure=0.40,
        news_sentiment_score=0.80,
    )
    # (1 - 0.80) / 2 = 0.10
    assert res.factor_scores["news_risk"] == pytest.approx(0.10, abs=1e-4)


def test_16_negative_news_sentiment():
    """16. Negative news sentiment produces high news risk factor."""
    res = calculate_risk_assessment(
        affected_sector_exposure=0.40,
        news_sentiment_score=-0.80,
    )
    # (1 - (-0.80)) / 2 = 0.90
    assert res.factor_scores["news_risk"] == pytest.approx(0.90, abs=1e-4)


def test_17_signal_consistency():
    """17. Signal consistency across directional sources."""
    # Case A: 3 negative sources (historical, market, news) -> all 3 pairs agree -> consistency = 1.0
    conf_all_agree = calculate_confidence(
        has_historical=True,
        has_market=True,
        has_weather=True,
        has_news=True,
        directional_signals=[-1, -1, -1],
    )
    assert conf_all_agree.signal_consistency == 1.0

    # Case B: 2 agree, 1 disagrees (e.g. [-1, -1, 1]) -> pairs: (-1,-1)=1, (-1,1)=0, (-1,1)=0 -> 1/3 = 0.3333
    conf_partial = calculate_confidence(
        has_historical=True,
        has_market=True,
        has_weather=True,
        has_news=True,
        directional_signals=[-1, -1, 1],
    )
    assert conf_partial.signal_consistency == pytest.approx(0.3333, abs=1e-4)

    # Case C: < 2 directional sources -> neutral fallback 0.50
    conf_sparse = calculate_confidence(
        has_historical=True,
        has_market=False,
        has_weather=True,
        has_news=False,
        directional_signals=[-1],
    )
    assert conf_sparse.signal_consistency == 0.50


def test_18_risk_drivers_sorted_by_contribution():
    """18. Risk drivers are sorted in descending order of weighted contribution."""
    res = calculate_risk_assessment(
        affected_sector_exposure=0.4898,
        weather_analysis=0.91,
        historical_median_impact=-0.058,
        market_data={"XOM": {"daily_change": -0.038, "weekly_change": -0.038}},
        news_sentiment_score=-0.72,
    )
    drivers = res.risk_drivers
    assert len(drivers) == 5
    # Verify strict descending order
    for i in range(len(drivers) - 1):
        assert drivers[i].contribution >= drivers[i + 1].contribution

    # Top driver is event_severity (0.91 * 0.25 = 0.2275)
    assert drivers[0].factor == "event_severity"
    assert len(res.key_risk_drivers) == 3


def test_19_final_risk_score_always_between_0_and_1():
    """19. Final risk score is guaranteed to be bounded within [0.0, 1.0]."""
    # Max possible
    res_max = calculate_risk_assessment(
        affected_sector_exposure=1.0,
        weather_analysis=1.0,
        historical_median_impact=-0.50,
        market_data={"XOM": {"daily_change": -0.50, "weekly_change": -0.50}},
        news_sentiment_score=-1.0,
    )
    assert res_max.risk_score == 1.0
    assert 0.0 <= res_max.risk_score <= 1.0

    # Min possible
    res_min = calculate_risk_assessment(
        affected_sector_exposure=0.0,
        weather_analysis=0.0,
        historical_median_impact=0.0,
        market_data={"XOM": {"daily_change": 0.10, "weekly_change": 0.10}},
        news_sentiment_score=1.0,
    )
    assert res_min.risk_score == 0.0
    assert 0.0 <= res_min.risk_score <= 1.0


def test_20_confidence_always_between_0_and_1():
    """20. Confidence score is guaranteed to be bounded within [0.0, 1.0]."""
    # All missing
    conf_empty = calculate_confidence(
        has_historical=False,
        has_market=False,
        has_weather=False,
        has_news=False,
        directional_signals=[],
    )
    # Only consistency contribution: 0.20 * 0.50 = 0.10
    assert 0.0 <= conf_empty.confidence <= 1.0
    assert conf_empty.confidence == 0.10

    # All available
    conf_full = calculate_confidence(
        has_historical=True,
        has_market=True,
        has_weather=True,
        has_news=True,
        directional_signals=[-1, -1, -1],
    )
    assert 0.0 <= conf_full.confidence <= 1.0
    assert conf_full.confidence == 1.0
