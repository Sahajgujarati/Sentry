from typing import Any

from backend.orchestrator.graph.state import AnalysisState


def merge_evidence(state: AnalysisState) -> dict[str, Any]:
    """
    Collect evidence produced by the parallel agents
    into one structured evidence package.
    """

    evidence = {
        "event": state.get("event", {}),
        "weather": state.get("weather_data", {}),
        "news": state.get("news_data", {}),
        "market": state.get("market_data", {}),
        "historical": state.get("historical_data", {}),
        "macro": state.get("macro_data", {}),
    }

    return {
        "evidence": [evidence],
        "agent_trace": [
            {
                "agent": "evidence_merger",
                "status": "completed",
                "sources": [
                    "weather",
                    "news",
                    "market",
                    "historical",
                    "macro",
                ],
            }
        ],
    }