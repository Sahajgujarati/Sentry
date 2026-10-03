from typing import Any


def analyze_query(user_query: str) -> dict[str, Any]:
    """
    Convert a natural-language financial question into
    structured routing information.

    This is intentionally deterministic for the baseline.
    The LLM-based version can replace this later.
    """

    query = user_query.lower()

    event = {
        "type": "unknown",
        "location": None,
        "severity": None,
        "affected_sectors": [],
    }

    # Basic event detection
    if "hurricane" in query or "cyclone" in query:
        event["type"] = "hurricane"

        if "gulf of mexico" in query:
            event["location"] = "Gulf of Mexico"

        # Detect hurricane category
        for category in range(1, 6):
            if f"category {category}" in query:
                event["severity"] = category
                break

        event["affected_sectors"] = ["Energy"]

    # Determine required evidence
    agents = [
        "market",
        "news",
        "historical",
    ]

    if event["type"] == "hurricane":
        agents.append("weather")

    return {
        "event": event,
        "required_agents": agents,
    }