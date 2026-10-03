from typing import Any

from backend.data_platform.api.data_service import DataService
from backend.orchestrator.graph.state import AnalysisState


data_service = DataService()


def weather_node(state: AnalysisState) -> dict[str, Any]:
    """
    Fetch weather data through P2 while preserving the event
    information extracted from the user's query.

    The supervisor is authoritative for the scenario being analyzed.
    Live weather data provides environmental evidence, but should not
    silently overwrite the user's explicitly specified event severity.
    """

    event = state.get("event", {})

    location = event.get(
        "location",
        "Gulf of Mexico",
    )

    weather_data = data_service.get_weather(
        location=location
    )

    # Never allow live weather data to silently replace
    # the severity explicitly identified by the supervisor.
    if event.get("severity") is not None:
        weather_data["severity"] = event["severity"]

    if event.get("location"):
        weather_data["location"] = event["location"]

    if event.get("type"):
        weather_data["event_type"] = event["type"]

    if event.get("affected_sectors"):
        weather_data["affected_sectors"] = event[
            "affected_sectors"
        ]

    return {
        "weather_data": weather_data,
        "agent_trace": [
            {
                "agent": "weather",
                "status": "completed",
                "source": "p2_data_platform",
            }
        ],
    }