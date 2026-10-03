from typing import Any

from backend.orchestrator.graph.state import AnalysisState


def synthesis_node(state: AnalysisState) -> dict[str, Any]:
    event = state["event"]
    risk_report = state["risk_report"]
    strategy = state["strategy"]
    evidence = state["evidence"][0]

    # ---------------------------------------------
    # Risk information
    # ---------------------------------------------

    scenarios = risk_report.get("scenarios") or {}
    base_scenario = scenarios.get("base") or {}

    # ---------------------------------------------
    # Historical information
    # ---------------------------------------------

    # P3 may return None instead of {}
    historical = risk_report.get(
        "historical_statistics"
    ) or {}

    historical_evidence = (
        evidence.get("historical") or {}
    )

    # P2 may return:
    #
    # matches = 7
    #
    # OR:
    #
    # matches = [{...}, {...}, ...]
    #
    raw_matches = historical_evidence.get(
        "matches",
        0,
    )

    if isinstance(raw_matches, list):
        fallback_event_count = len(raw_matches)
    else:
        fallback_event_count = raw_matches or 0

    historical_events = historical.get(
        "events",
        historical.get(
            "similar_event_count",
            fallback_event_count,
        ),
    )

    mean_impact = historical.get(
        "mean_impact",
        historical_evidence.get(
            "mean_impact"
        ),
    )

    median_impact = historical.get(
        "median_impact",
        historical_evidence.get(
            "median_impact"
        ),
    )

    # ---------------------------------------------
    # Final intelligence
    # ---------------------------------------------

    final_analysis = {
        "summary": (
            f"{event.get('type', 'Unknown').title()} event detected in "
            f"{event.get('location', 'unknown location')} with severity "
            f"{event.get('severity', 'unknown')}."
        ),

        "event": event,

        # -----------------------------------------
        # Risk Summary
        # -----------------------------------------

        "risk": {
            "level": risk_report.get(
                "risk_level"
            ),

            "score": risk_report.get(
                "risk_score"
            ),

            "confidence": risk_report.get(
                "confidence"
            ),

            "base_portfolio_impact": (
                base_scenario.get(
                    "portfolio_impact"
                )
            ),
        },

        # -----------------------------------------
        # Risk Drivers
        # -----------------------------------------

        "key_risk_drivers": risk_report.get(
            "key_risk_drivers"
        ) or [],

        # -----------------------------------------
        # Historical Context
        # -----------------------------------------

        "historical_context": {
            "events": historical_events,
            "mean_impact": mean_impact,
            "median_impact": median_impact,
        },

        # -----------------------------------------
        # Raw Signals
        # -----------------------------------------

        "market_signals": (
            evidence.get("market") or {}
        ),

        "news_signals": (
            evidence.get("news") or {}
        ),

        "weather_signals": (
            evidence.get("weather") or {}
        ),

        # -----------------------------------------
        # Strategy
        # -----------------------------------------

        "strategy": strategy,

        # -----------------------------------------
        # Evidence / Explainability
        # -----------------------------------------

        "evidence": [
            {
                "source": "weather_agent",
                "data": (
                    evidence.get("weather") or {}
                ),
            },
            {
                "source": "news_agent",
                "data": (
                    evidence.get("news") or {}
                ),
            },
            {
                "source": "market_agent",
                "data": (
                    evidence.get("market") or {}
                ),
            },
            {
                "source": "historical_agent",
                "data": (
                    evidence.get("historical") or {}
                ),
            },
        ],

        # -----------------------------------------
        # Audit Trail
        # -----------------------------------------

        "audit": {
            "agents_used": [
                "supervisor",
                "weather",
                "news",
                "market",
                "historical",
                "evidence_merger",
                "risk_engine",
                "strategy",
                "synthesis",
            ],

            "quantitative_source": (
                "p3_risk_engine"
            ),

            "strategy_source": (
                "strategy_agent"
            ),
        },
    }

    return {
        "final_analysis": final_analysis,

        "agent_trace": [
            {
                "agent": "synthesis",
                "status": "completed",
                "source": (
                    "risk_report + strategy + evidence"
                ),
            }
        ],
    }