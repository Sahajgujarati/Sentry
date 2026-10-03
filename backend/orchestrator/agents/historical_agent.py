from typing import Any

from backend.data_platform.api.data_service import DataService
from backend.orchestrator.graph.state import AnalysisState


data_service = DataService()


def historical_node(state: AnalysisState) -> dict[str, Any]:
    """
    Retrieve historically similar events through P2.
    """

    event = state.get("event", {})

    event_type = event.get(
        "type",
        "hurricane",
    )

    sectors = event.get(
        "affected_sectors",
        ["Energy"],
    )

    sector = (
        sectors[0]
        if sectors
        else "Energy"
    )

    historical_data = data_service.get_historical_events(
        event_type=event_type,
        sector=sector,
    )

    return {
        "historical_data": historical_data,
        "agent_trace": [
            {
                "agent": "historical",
                "status": "completed",
                "source": "p2_data_platform",
                "event_type": event_type,
                "sector": sector,
            }
        ],
    }