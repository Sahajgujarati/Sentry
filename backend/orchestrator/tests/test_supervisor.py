from backend.orchestrator.agents.supervisor import analyze_query


def test_hurricane_query():
    result = analyze_query(
        "A Category 4 hurricane is approaching the Gulf of Mexico. "
        "Analyze its impact on my energy portfolio."
    )

    assert result["event"]["type"] == "hurricane"
    assert result["event"]["location"] == "Gulf of Mexico"
    assert result["event"]["severity"] == 4
    assert "Energy" in result["event"]["affected_sectors"]

    assert "weather" in result["required_agents"]
    assert "news" in result["required_agents"]
    assert "market" in result["required_agents"]
    assert "historical" in result["required_agents"]