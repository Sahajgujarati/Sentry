"""
Risk Score, Confidence, and Risk Drivers Engine
===============================================
Computes a composite multi-factor quantitative risk score, deterministic
evidence-strength confidence metric, and ranked explanatory risk drivers.

Important Methodology Notice:
- The risk score is an analytical prototype index [0, 1], NOT an empirical probability.
- Confidence reflects evidence completeness and directional signal alignment, NOT forecast calibration.
- Risk drivers provide transparent attribution of risk components, NOT investment advice.

Configurable Weights & References:
- Risk weights: Exposure (30%), Severity (25%), Historical (20%), Market (15%), News (10%).
- Missing evidence sources are transparently excluded, and available weights are renormalized to sum to 1.0.
"""

from typing import Any, Dict, List, Optional, Sequence, Union
from pydantic import BaseModel, ConfigDict, Field

from backend.risk_engine.schemas.risk_input import (
    Event,
    MarketAssetData,
    NewsAnalysis,
    WeatherAnalysis,
)

# ---------------------------------------------------------------------------
# Default Configuration Constants
# ---------------------------------------------------------------------------

DEFAULT_RISK_WEIGHTS: Dict[str, float] = {
    "exposure": 0.30,
    "event_severity": 0.25,
    "historical_risk": 0.20,
    "market_signal": 0.15,
    "news_risk": 0.10,
}

# Reference shocks for normalizing return movements into [0, 1] risk factors
HISTORICAL_REFERENCE_SHOCK: float = 0.10  # 10% historical drawdown = 1.0 risk factor
MARKET_REFERENCE_SHOCK: float = 0.10      # 10% recent negative return = 1.0 risk factor

# Market return weighting: 60% daily change + 40% weekly change
MARKET_DAILY_WEIGHT: float = 0.60
MARKET_WEEKLY_WEIGHT: float = 0.40

# Risk level categorical tier boundaries [0.0, 1.0]
DEFAULT_RISK_LEVEL_THRESHOLDS: List[tuple[float, str]] = [
    (0.80, "VERY_HIGH"),
    (0.60, "HIGH"),
    (0.30, "MEDIUM"),
    (0.00, "LOW"),
]

# Confidence evidence component weights (sum = 1.0)
DEFAULT_CONFIDENCE_WEIGHTS: Dict[str, float] = {
    "historical": 0.20,
    "market": 0.20,
    "weather": 0.20,
    "news": 0.20,
    "signal_consistency": 0.20,
}

RISK_SCORE_DISCLAIMER: str = (
    "Analytical risk score based on multi-source evidence and historical analogs. "
    "Prototype index, not a statistically calibrated probability."
)


# ---------------------------------------------------------------------------
# Data Models
# ---------------------------------------------------------------------------

class RiskDriverItem(BaseModel):
    """Structured attribution item for an individual risk factor."""
    factor: str = Field(..., description="Factor identifier (e.g. 'event_severity', 'exposure')")
    score: float = Field(..., description="Normalized factor score [0.0, 1.0]")
    weight: float = Field(..., description="Effective normalized weight used in calculation")
    contribution: float = Field(..., description="Weighted contribution to total score (score * weight)")
    description: str = Field(..., description="Human-readable explanation of this factor's impact")

    model_config = ConfigDict(extra="allow", populate_by_name=True)


class ConfidenceResult(BaseModel):
    """Detailed evidence-strength and signal-consistency metrics."""
    confidence: float = Field(..., description="Composite evidence confidence score [0.0, 1.0]")
    evidence_sources_available: List[str] = Field(default_factory=list)
    missing_evidence_sources: List[str] = Field(default_factory=list)
    signal_consistency: float = Field(..., description="Directional consistency score [0.0, 1.0]")

    model_config = ConfigDict(extra="allow", populate_by_name=True)

    def to_dict(self) -> Dict[str, Any]:
        return self.model_dump()


class RiskAssessmentResult(BaseModel):
    """
    Comprehensive outcome of Module 6. Combines risk score, categorical risk tier,
    confidence metrics, factor scores, effective weights, and ranked risk drivers.
    """
    risk_score: float = Field(..., description="Composite quantitative risk score [0.0, 1.0]")
    risk_score_100: float = Field(..., description="Composite risk score scaled to [0.0, 100.0]")
    risk_level: str = Field(..., description="Categorical tier: 'LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH'")
    confidence: float = Field(..., description="Evidence completeness confidence [0.0, 1.0]")
    confidence_details: ConfidenceResult = Field(..., description="Underlying confidence breakdown")
    factor_scores: Dict[str, Optional[float]] = Field(default_factory=dict)
    effective_weights: Dict[str, float] = Field(default_factory=dict)
    contributions: Dict[str, float] = Field(default_factory=dict)
    risk_drivers: List[RiskDriverItem] = Field(default_factory=list)
    key_risk_drivers: List[str] = Field(default_factory=list)
    available_factors: List[str] = Field(default_factory=list)
    missing_factors: List[str] = Field(default_factory=list)
    disclaimer: str = Field(default=RISK_SCORE_DISCLAIMER)

    model_config = ConfigDict(extra="allow", populate_by_name=True)

    def __getitem__(self, item: str) -> Any:
        """Allow dict-like access: result['risk_score']."""
        if hasattr(self, item):
            return getattr(self, item)
        raise KeyError(f"Key '{item}' not found in RiskAssessmentResult")

    def to_dict(self) -> Dict[str, Any]:
        return self.model_dump()


# ---------------------------------------------------------------------------
# Normalization Helper Functions
# ---------------------------------------------------------------------------

def normalize_exposure(affected_sector_exposure: Optional[float]) -> Optional[float]:
    """
    Normalizes affected-sector portfolio exposure to [0.0, 1.0].
    Returns None if exposure is None.
    """
    if affected_sector_exposure is None:
        return None
    val = float(affected_sector_exposure)
    return min(1.0, max(0.0, val))


def normalize_event_severity(
    weather_analysis: Optional[Union[WeatherAnalysis, Dict[str, Any], float]] = None,
    event: Optional[Union[Event, Dict[str, Any]]] = None,
    event_severity: Optional[Union[int, float, str]] = None,
) -> Optional[float]:
    """
    Normalizes event/weather severity to [0.0, 1.0].

    Precedence:
    1. Weather severity_score (already in [0, 1]).
    2. Event severity (integer/float 1 to 5, normalized via severity / 5.0).
    3. Direct numeric event_severity argument.
    Returns None if neither is available.
    """
    # 1. Weather severity score
    if weather_analysis is not None:
        if isinstance(weather_analysis, (int, float)):
            return min(1.0, max(0.0, float(weather_analysis)))
        if isinstance(weather_analysis, WeatherAnalysis) and weather_analysis.severity_score is not None:
            return min(1.0, max(0.0, float(weather_analysis.severity_score)))
        if isinstance(weather_analysis, dict) and weather_analysis.get("severity_score") is not None:
            return min(1.0, max(0.0, float(weather_analysis["severity_score"])))

    # 2. Event severity attribute
    raw_sev = event_severity
    if raw_sev is None and event is not None:
        if isinstance(event, Event):
            raw_sev = event.severity
        elif isinstance(event, dict):
            raw_sev = event.get("severity")

    if raw_sev is not None:
        # Check if integer / float
        if isinstance(raw_sev, (int, float)) and not isinstance(raw_sev, bool):
            s_val = float(raw_sev)
            # If on 1-5 scale, normalize by dividing by 5.0
            if s_val > 1.0:
                s_val = s_val / 5.0
            return min(1.0, max(0.0, s_val))

        # Check if string like 'Category 4' or '4'
        if isinstance(raw_sev, str):
            digits = "".join(ch for ch in raw_sev if ch.isdigit() or ch == ".")
            if digits:
                try:
                    s_val = float(digits)
                    if s_val > 1.0:
                        s_val = s_val / 5.0
                    return min(1.0, max(0.0, s_val))
                except ValueError:
                    pass

    return None


def normalize_historical_risk(
    median_impact: Optional[float],
    reference_shock: float = HISTORICAL_REFERENCE_SHOCK,
) -> Optional[float]:
    """
    Normalizes historical drawdown risk to [0.0, 1.0].
    Increases with larger negative historical movement: abs(median) / reference_shock.
    Returns None if median_impact is None.
    """
    if median_impact is None:
        return None
    val = abs(float(median_impact)) / reference_shock
    return min(1.0, max(0.0, val))


def normalize_market_signal(
    market: Optional[Union[Dict[str, Any], Sequence[Any]]],
    affected_tickers: Optional[Sequence[str]] = None,
    reference_shock: float = MARKET_REFERENCE_SHOCK,
) -> Optional[float]:
    """
    Normalizes recent market movements for affected holdings to [0.0, 1.0].
    Formula:
        weighted_return = 0.6 * avg_daily_change + 0.4 * avg_weekly_change
        market_risk = max(0.0, -weighted_return) / reference_shock

    Positive returns contribute 0 risk. Returns None if no market data is available.
    """
    if not market:
        return None

    # Filter tickers if specified
    target_set = {t.strip().upper() for t in affected_tickers} if affected_tickers else None

    daily_changes: List[float] = []
    weekly_changes: List[float] = []

    if isinstance(market, dict):
        for ticker, data in market.items():
            if target_set and ticker.strip().upper() not in target_set:
                continue

            if isinstance(data, MarketAssetData):
                if data.daily_change is not None:
                    daily_changes.append(float(data.daily_change))
                if data.weekly_change is not None:
                    weekly_changes.append(float(data.weekly_change))
            elif isinstance(data, dict):
                if "daily_change" in data and data["daily_change"] is not None:
                    daily_changes.append(float(data["daily_change"]))
                if "weekly_change" in data and data["weekly_change"] is not None:
                    weekly_changes.append(float(data["weekly_change"]))

    if not daily_changes and not weekly_changes:
        return None

    avg_daily = sum(daily_changes) / len(daily_changes) if daily_changes else 0.0
    avg_weekly = sum(weekly_changes) / len(weekly_changes) if weekly_changes else 0.0

    weighted_return = (MARKET_DAILY_WEIGHT * avg_daily) + (MARKET_WEEKLY_WEIGHT * avg_weekly)

    # Convert negative return to risk factor; positive return yields 0 risk
    risk_factor = max(0.0, -weighted_return) / reference_shock
    return min(1.0, max(0.0, risk_factor))


def normalize_news_risk(
    news_analysis: Optional[Union[NewsAnalysis, Dict[str, Any], float]] = None,
    sentiment_score: Optional[float] = None,
) -> Optional[float]:
    """
    Converts sentiment score [-1.0, +1.0] to a risk factor [0.0, 1.0]:
        news_risk = (1.0 - sentiment_score) / 2.0

    sentiment = -1.0 -> 1.0 (extreme bearish)
    sentiment =  0.0 -> 0.5 (neutral)
    sentiment = +1.0 -> 0.0 (extreme bullish)
    Returns None if sentiment is unavailable.
    """
    raw_sentiment = sentiment_score
    if raw_sentiment is None and news_analysis is not None:
        if isinstance(news_analysis, (int, float)):
            raw_sentiment = float(news_analysis)
        elif isinstance(news_analysis, NewsAnalysis) and news_analysis.sentiment_score is not None:
            raw_sentiment = float(news_analysis.sentiment_score)
        elif isinstance(news_analysis, dict) and news_analysis.get("sentiment_score") is not None:
            raw_sentiment = float(news_analysis["sentiment_score"])

    if raw_sentiment is None:
        return None

    clamped_sentiment = min(1.0, max(-1.0, float(raw_sentiment)))
    risk_val = (1.0 - clamped_sentiment) / 2.0
    return min(1.0, max(0.0, risk_val))


# ---------------------------------------------------------------------------
# Scoring, Confidence, and Driver Extraction
# ---------------------------------------------------------------------------

def calculate_risk_level(risk_score: float, thresholds: Optional[Sequence[tuple[float, str]]] = None) -> str:
    """Maps a risk score [0.0, 1.0] to its categorical tier (LOW, MEDIUM, HIGH, VERY_HIGH)."""
    th_list = thresholds or DEFAULT_RISK_LEVEL_THRESHOLDS
    for cutoff, tier in th_list:
        if risk_score >= cutoff:
            return tier
    return "LOW"


def calculate_risk_score(
    factor_scores: Dict[str, Optional[float]],
    base_weights: Optional[Dict[str, float]] = None,
) -> tuple[float, Dict[str, float], List[str], List[str]]:
    """
    Calculates weighted risk score [0.0, 1.0] with automatic weight renormalization
    over available evidence factors.

    Returns:
        tuple[risk_score, effective_weights, available_factors, missing_factors]
    """
    weights = base_weights or DEFAULT_RISK_WEIGHTS

    available_factors: List[str] = []
    missing_factors: List[str] = []
    available_weight_sum = 0.0

    for factor_name, weight in weights.items():
        score = factor_scores.get(factor_name)
        if score is not None:
            available_factors.append(factor_name)
            available_weight_sum += weight
        else:
            missing_factors.append(factor_name)

    # Edge case: No factors available
    if available_weight_sum <= 0.0:
        return 0.0, {}, [], missing_factors

    # Renormalize weights across available factors
    effective_weights: Dict[str, float] = {}
    weighted_sum = 0.0

    for factor_name in available_factors:
        renorm_weight = weights[factor_name] / available_weight_sum
        effective_weights[factor_name] = renorm_weight
        weighted_sum += factor_scores[factor_name] * renorm_weight

    risk_score = min(1.0, max(0.0, weighted_sum))
    return risk_score, effective_weights, available_factors, missing_factors


def calculate_confidence(
    has_historical: bool,
    has_market: bool,
    has_weather: bool,
    has_news: bool,
    directional_signals: Sequence[Optional[int]],  # -1 for negative, +1 for positive, 0 for neutral
    confidence_weights: Optional[Dict[str, float]] = None,
) -> ConfidenceResult:
    """
    Calculates deterministic evidence-strength confidence metric [0.0, 1.0].
    Combines source availability (historical, market, weather, news) and signal consistency.
    """
    weights = confidence_weights or DEFAULT_CONFIDENCE_WEIGHTS

    avail_sources: List[str] = []
    missing_sources: List[str] = []

    if has_historical:
        avail_sources.append("historical")
    else:
        missing_sources.append("historical")

    if has_market:
        avail_sources.append("market")
    else:
        missing_sources.append("market")

    if has_weather:
        avail_sources.append("weather")
    else:
        missing_sources.append("weather")

    if has_news:
        avail_sources.append("news")
    else:
        missing_sources.append("news")

    # Evaluate directional signal consistency across available pairs
    valid_signals = [sig for sig in directional_signals if sig is not None]

    if len(valid_signals) < 2:
        signal_consistency = 0.5  # Neutral fallback when < 2 directional sources
    else:
        agreeing_pairs = 0
        total_pairs = 0
        n_sigs = len(valid_signals)
        for i in range(n_sigs):
            for j in range(i + 1, n_sigs):
                total_pairs += 1
                if valid_signals[i] == valid_signals[j]:
                    agreeing_pairs += 1
        signal_consistency = agreeing_pairs / total_pairs if total_pairs > 0 else 0.5

    # Composite confidence score
    confidence_score = (
        weights.get("historical", 0.20) * (1.0 if has_historical else 0.0)
        + weights.get("market", 0.20) * (1.0 if has_market else 0.0)
        + weights.get("weather", 0.20) * (1.0 if has_weather else 0.0)
        + weights.get("news", 0.20) * (1.0 if has_news else 0.0)
        + weights.get("signal_consistency", 0.20) * signal_consistency
    )

    confidence_score = min(1.0, max(0.0, confidence_score))

    return ConfidenceResult(
        confidence=round(confidence_score, 4),
        evidence_sources_available=avail_sources,
        missing_evidence_sources=missing_sources,
        signal_consistency=round(signal_consistency, 4),
    )


def extract_risk_drivers(
    factor_scores: Dict[str, Optional[float]],
    effective_weights: Dict[str, float],
    raw_context: Optional[Dict[str, Any]] = None,
) -> tuple[List[RiskDriverItem], List[str]]:
    """
    Identifies and ranks the strongest contributors to the risk score.
    Returns structured items and clean explanatory strings for RiskReport.key_risk_drivers.
    """
    ctx = raw_context or {}
    items: List[RiskDriverItem] = []

    for factor, weight in effective_weights.items():
        score = factor_scores.get(factor)
        if score is None:
            continue

        contrib = score * weight

        # Human-readable description
        if factor == "exposure":
            exp_pct = ctx.get("affected_sector_exposure_pct")
            if exp_pct is None:
                exp_pct = score * 100.0
            sector_name = ctx.get("affected_sector_name", "affected sector")
            desc = f"{exp_pct:.1f}% portfolio exposure to {sector_name}"
        elif factor == "event_severity":
            sev_pct = score * 100.0
            desc = f"High event severity index ({sev_pct:.0f}%)"
        elif factor == "historical_risk":
            med_pct = ctx.get("historical_median_pct")
            if med_pct is None:
                med_pct = score * 10.0
            desc = f"Historical analog precedent with {abs(med_pct):.1f}% median drawdown"
        elif factor == "market_signal":
            ret_pct = ctx.get("market_weighted_return_pct")
            if ret_pct is None:
                ret_pct = -score * 10.0
            desc = f"Negative recent market price momentum ({ret_pct:.1f}%)"
        elif factor == "news_risk":
            sent = ctx.get("news_sentiment_score")
            if sent is None:
                sent = 1.0 - (score * 2.0)
            desc = f"Negative news coverage sentiment (score {sent:+.2f})"
        else:
            desc = f"Elevated {factor.replace('_', ' ')} index ({score:.2f})"

        items.append(
            RiskDriverItem(
                factor=factor,
                score=round(score, 4),
                weight=round(weight, 4),
                contribution=round(contrib, 4),
                description=desc,
            )
        )

    # Rank factors by contribution descending
    items.sort(key=lambda d: d.contribution, reverse=True)

    # Extract top explanatory strings
    key_drivers_str = [d.description for d in items]
    return items, key_drivers_str


# ---------------------------------------------------------------------------
# Master Assessment Orchestrator
# ---------------------------------------------------------------------------

def calculate_risk_assessment(
    affected_sector_exposure: Optional[float] = None,
    weather_analysis: Optional[Union[WeatherAnalysis, Dict[str, Any], float]] = None,
    event: Optional[Union[Event, Dict[str, Any]]] = None,
    event_severity: Optional[Union[int, float, str]] = None,
    historical_median_impact: Optional[float] = None,
    market_data: Optional[Union[Dict[str, Any], Sequence[Any]]] = None,
    affected_tickers: Optional[Sequence[str]] = None,
    news_analysis: Optional[Union[NewsAnalysis, Dict[str, Any], float]] = None,
    news_sentiment_score: Optional[float] = None,
    risk_weights: Optional[Dict[str, float]] = None,
    affected_sector_name: Optional[str] = None,
) -> RiskAssessmentResult:
    """
    Master risk scoring orchestrator for Module 6.
    Evaluates factor normalizations, computes weighted risk score, assigns risk tier,
    measures evidence completeness confidence, and extracts ranked risk drivers.
    """
    # 1. Normalize each factor into [0.0, 1.0] or None
    exp_factor = normalize_exposure(affected_sector_exposure)
    sev_factor = normalize_event_severity(
        weather_analysis=weather_analysis,
        event=event,
        event_severity=event_severity,
    )
    hist_factor = normalize_historical_risk(historical_median_impact)
    mkt_factor = normalize_market_signal(market=market_data, affected_tickers=affected_tickers)
    news_factor = normalize_news_risk(
        news_analysis=news_analysis,
        sentiment_score=news_sentiment_score,
    )

    factor_scores: Dict[str, Optional[float]] = {
        "exposure": exp_factor,
        "event_severity": sev_factor,
        "historical_risk": hist_factor,
        "market_signal": mkt_factor,
        "news_risk": news_factor,
    }

    # 2. Weighted risk score with missing-source renormalization
    risk_score, effective_weights, avail_factors, missing_factors = calculate_risk_score(
        factor_scores=factor_scores,
        base_weights=risk_weights or DEFAULT_RISK_WEIGHTS,
    )

    # 3. Categorical risk tier
    risk_level = calculate_risk_level(risk_score)

    # 4. Directional signals for confidence consistency
    # Direction: -1 for negative/bearish, +1 for positive/bullish, 0 for neutral
    hist_dir = None
    if historical_median_impact is not None:
        hist_dir = -1 if historical_median_impact < 0 else (1 if historical_median_impact > 0 else 0)

    mkt_dir = None
    if mkt_factor is not None:
        # If market risk > 0, return is negative -> -1
        mkt_dir = -1 if mkt_factor > 0 else 1

    news_dir = None
    actual_sent = news_sentiment_score
    if actual_sent is None and isinstance(news_analysis, NewsAnalysis):
        actual_sent = news_analysis.sentiment_score
    elif actual_sent is None and isinstance(news_analysis, dict):
        actual_sent = news_analysis.get("sentiment_score")
    elif actual_sent is None and isinstance(news_analysis, (int, float)):
        actual_sent = float(news_analysis)

    if actual_sent is not None:
        news_dir = -1 if actual_sent < 0 else (1 if actual_sent > 0 else 0)

    confidence_res = calculate_confidence(
        has_historical=hist_factor is not None,
        has_market=mkt_factor is not None,
        has_weather=sev_factor is not None,
        has_news=news_factor is not None,
        directional_signals=[hist_dir, mkt_dir, news_dir],
    )

    # 5. Risk drivers attribution
    context = {
        "affected_sector_exposure_pct": (affected_sector_exposure * 100.0) if affected_sector_exposure is not None else None,
        "affected_sector_name": affected_sector_name or "Energy",
        "historical_median_pct": (historical_median_impact * 100.0) if historical_median_impact is not None else None,
        "news_sentiment_score": actual_sent,
    }
    driver_items, key_drivers_str = extract_risk_drivers(
        factor_scores=factor_scores,
        effective_weights=effective_weights,
        raw_context=context,
    )

    contributions = {d.factor: d.contribution for d in driver_items}

    return RiskAssessmentResult(
        risk_score=round(risk_score, 4),
        risk_score_100=round(risk_score * 100, 2),
        risk_level=risk_level,
        confidence=confidence_res.confidence,
        confidence_details=confidence_res,
        factor_scores=factor_scores,
        effective_weights=effective_weights,
        contributions=contributions,
        risk_drivers=driver_items,
        key_risk_drivers=key_drivers_str[:3],  # Top 3 drivers
        available_factors=avail_factors,
        missing_factors=missing_factors,
        disclaimer=RISK_SCORE_DISCLAIMER,
    )
