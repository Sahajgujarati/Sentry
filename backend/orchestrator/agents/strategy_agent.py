from typing import Any

from backend.orchestrator.graph.state import AnalysisState


def strategy_node(state: AnalysisState) -> dict[str, Any]:
    risk_report = state["risk_report"]

    base_scenario = risk_report["scenarios"]["base"]

    strategy = {
        "action": "HEDGE_AND_REALLOCATE",
        "confidence": risk_report["confidence"],
        "rationale": [
            "Energy sector has high portfolio exposure",
            "Historical hurricane events indicate negative sector impact",
            "Current weather severity indicates elevated disruption risk",
            "News sentiment indicates refinery and offshore production risks",
        ],
        "proposed_actions": [
            {
                "action": "Reduce energy exposure",
                "target": "XOM",
                "allocation_change": -0.05,
                "reason": "Reduce concentration risk",
            },
            {
                "action": "Reduce energy exposure",
                "target": "CVX",
                "allocation_change": -0.05,
                "reason": "Reduce concentration risk",
            },
            {
                "action": "Increase defensive allocation",
                "target": "Cash / defensive assets",
                "allocation_change": 0.10,
                "reason": "Buffer event-driven downside risk",
            },
        ],
        "scenario": {
            "base_portfolio_impact": base_scenario["portfolio_impact"],
            "risk_level": risk_report["risk_level"],
        },
        "disclaimer": (
            "This is a simulated portfolio strategy for decision support, "
            "not financial advice."
        ),
    }

    return {
        "strategy": strategy,
        "agent_trace": [
            {
                "agent": "strategy",
                "status": "completed",
                "source": "risk_report + evidence",
            }
        ],
    }