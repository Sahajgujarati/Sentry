from backend.orchestrator.services.orchestrator_service import (
    OrchestratorService,
)


def test_orchestrator_service():
    service = OrchestratorService()

    result = service.analyze(
        user_query=(
            "A Category 4 hurricane is approaching the Gulf of Mexico. "
            "Analyze its impact on my energy portfolio."
        ),
        portfolio_id="demo-energy",
    )

    # -------------------------
    # Analysis Result
    # -------------------------

    assert result["analysis_id"]
    assert "analysis" in result

    analysis = result["analysis"]

    # -------------------------
    # Event
    # -------------------------

    assert analysis["event"]["type"] == "hurricane"

    assert analysis["event"]["location"] == "Gulf of Mexico"

    assert analysis["event"]["severity"] == 4

    # -------------------------
    # Risk
    # -------------------------

    # Risk level is produced dynamically by P3.
    # Do not hardcode a specific level.
    assert analysis["risk"]["level"].lower() in {
        "low",
        "medium",
        "high",
        "critical",
    }

    assert isinstance(
        analysis["risk"]["score"],
        (int, float),
    )

    assert 0 <= analysis["risk"]["score"] <= 100

    assert isinstance(
        analysis["risk"]["confidence"],
        (int, float),
    )

    assert 0 <= analysis["risk"]["confidence"] <= 1

    # -------------------------
    # Portfolio Impact
    # -------------------------

    assert isinstance(
        analysis["risk"]["base_portfolio_impact"],
        (int, float),
    )

    # -------------------------
    # Strategy
    # -------------------------

    assert (
        analysis["strategy"]["action"]
        == "HEDGE_AND_REALLOCATE"
    )

    assert "proposed_actions" in analysis["strategy"]

    assert len(
        analysis["strategy"]["proposed_actions"]
    ) == 3