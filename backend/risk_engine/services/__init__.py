"""
Risk Engine Services package.
"""

from backend.risk_engine.services.exposure import (
    ExposureResult,
    calculate_position_value,
    calculate_portfolio_value,
    calculate_asset_exposure,
    calculate_sector_exposure,
    calculate_affected_sector_exposure,
    calculate_exposure,
)

from backend.risk_engine.services.historical import (
    HistoricalStatisticsResult,
    extract_valid_impacts,
    calculate_historical_statistics,
)

from backend.risk_engine.services.scenario import (
    DEFAULT_SCENARIO_MULTIPLIERS,
    DEFAULT_FALLBACK_SECTOR_IMPACT,
    SCENARIO_DISCLAIMER,
    ScenarioAnalysisResult,
    build_scenarios,
    calculate_scenario_portfolio_impact,
    calculate_scenario_dollar_impact,
    calculate_asset_scenario_impact,
    run_scenario_analysis,
)

from backend.risk_engine.services.stress_test import (
    DEFAULT_STRESS_LEVELS,
    DEFAULT_STRESS_METADATA,
    StressTestItem,
    calculate_stress_impact,
    calculate_stress_dollar_impact,
    run_stress_tests,
)

from backend.risk_engine.services.risk_score import (
    DEFAULT_RISK_WEIGHTS,
    HISTORICAL_REFERENCE_SHOCK,
    MARKET_REFERENCE_SHOCK,
    DEFAULT_RISK_LEVEL_THRESHOLDS,
    DEFAULT_CONFIDENCE_WEIGHTS,
    RISK_SCORE_DISCLAIMER,
    RiskDriverItem,
    ConfidenceResult,
    RiskAssessmentResult,
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
)

__all__ = [
    # Module 2 - Exposure
    "ExposureResult",
    "calculate_position_value",
    "calculate_portfolio_value",
    "calculate_asset_exposure",
    "calculate_sector_exposure",
    "calculate_affected_sector_exposure",
    "calculate_exposure",
    # Module 3 - Historical
    "HistoricalStatisticsResult",
    "extract_valid_impacts",
    "calculate_historical_statistics",
    # Module 4 - Scenario
    "DEFAULT_SCENARIO_MULTIPLIERS",
    "DEFAULT_FALLBACK_SECTOR_IMPACT",
    "SCENARIO_DISCLAIMER",
    "ScenarioAnalysisResult",
    "build_scenarios",
    "calculate_scenario_portfolio_impact",
    "calculate_scenario_dollar_impact",
    "calculate_asset_scenario_impact",
    "run_scenario_analysis",
    # Module 5 - Stress Test
    "DEFAULT_STRESS_LEVELS",
    "DEFAULT_STRESS_METADATA",
    "StressTestItem",
    "calculate_stress_impact",
    "calculate_stress_dollar_impact",
    "run_stress_tests",
    # Module 6 - Risk Score & Confidence
    "DEFAULT_RISK_WEIGHTS",
    "HISTORICAL_REFERENCE_SHOCK",
    "MARKET_REFERENCE_SHOCK",
    "DEFAULT_RISK_LEVEL_THRESHOLDS",
    "DEFAULT_CONFIDENCE_WEIGHTS",
    "RISK_SCORE_DISCLAIMER",
    "RiskDriverItem",
    "ConfidenceResult",
    "RiskAssessmentResult",
    "normalize_exposure",
    "normalize_event_severity",
    "normalize_historical_risk",
    "normalize_market_signal",
    "normalize_news_risk",
    "calculate_risk_level",
    "calculate_risk_score",
    "calculate_confidence",
    "extract_risk_drivers",
    "calculate_risk_assessment",
]
