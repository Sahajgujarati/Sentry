from backend.orchestrator.graph.workflow import build_workflow


def test_supervisor_workflow():
    workflow = build_workflow()

    initial_state = {
        "user_query": (
            "A Category 4 hurricane is approaching the Gulf of Mexico. "
            "Analyze its impact on my energy portfolio."
        ),
        "portfolio_id": "demo-energy",
    }

    result = workflow.invoke(initial_state)

    # -------------------------
    # Supervisor
    # -------------------------

    assert result["event"]["type"] == "hurricane"
    assert result["event"]["location"] == "Gulf of Mexico"
    assert result["event"]["severity"] == 4

    # -------------------------
    # All agents executed
    # -------------------------

    agents = {
        trace["agent"]
        for trace in result["agent_trace"]
    }

    assert agents == {
        "supervisor",
        "weather",
        "news",
        "market",
        "historical",
        "evidence_merger",
        "risk_engine",
        "strategy",
        "synthesis",
    }

    # -------------------------
    # Individual evidence
    # -------------------------

    assert result["weather_data"]["severity"] == 4

    assert isinstance(
        result["news_data"]["article_count"],
        int,
    )

    assert result["news_data"]["article_count"] >= 0

    assert isinstance(
        result["market_data"]["XOM"]["price"],
        (int, float),
    )

    assert isinstance(
        result["historical_data"]["matches"],
        (list, int),
    )

    # -------------------------
    # Evidence package
    # -------------------------

    assert len(result["evidence"]) == 1

    evidence = result["evidence"][0]

    assert evidence["event"]["type"] == "hurricane"

    assert evidence["weather"]["severity"] == 4

    assert isinstance(
        evidence["news"]["article_count"],
        int,
    )

    assert evidence["news"]["article_count"] >= 0

    assert isinstance(
        evidence["market"]["XOM"]["price"],
        (int, float),
    )

    # P2 historical provider currently returns either
    # a list of matches or a numeric match count.
    assert isinstance(
        evidence["historical"]["matches"],
        (list, int),
    )

    # -------------------------
    # Risk Engine
    # -------------------------

    risk_report = result["risk_report"]

    assert isinstance(
        risk_report["risk_score"],
        (int, float),
    )

    assert 0 <= risk_report["risk_score"] <= 100

    assert risk_report["risk_level"].lower() in {
        "low",
        "medium",
        "high",
        "critical",
    }

    assert isinstance(
        risk_report["confidence"],
        (int, float),
    )

    assert 0 <= risk_report["confidence"] <= 1

    # -------------------------
    # Risk Engine Scenarios
    # -------------------------

    assert "scenarios" in risk_report

    scenarios = risk_report["scenarios"]

    assert isinstance(scenarios, dict)

    assert "base" in scenarios

    base_scenario = scenarios["base"]

    assert "portfolio_impact" in base_scenario

    assert isinstance(
        base_scenario["portfolio_impact"],
        (int, float),
    )

    # -------------------------
    # Strategy Agent
    # -------------------------

    strategy = result["strategy"]

    assert strategy["action"] == "HEDGE_AND_REALLOCATE"

    assert isinstance(
        strategy["confidence"],
        (int, float),
    )

    assert 0 <= strategy["confidence"] <= 1

    assert len(strategy["proposed_actions"]) == 3

    assert (
        strategy["proposed_actions"][0]["target"]
        == "XOM"
    )

    assert (
        strategy["proposed_actions"][1]["target"]
        == "CVX"
    )

    assert (
        strategy["scenario"]["base_portfolio_impact"]
        == base_scenario["portfolio_impact"]
    )

    # -------------------------
    # Final Synthesis
    # -------------------------

    assert "final_analysis" in result

    final_analysis = result["final_analysis"]

    # Event
    assert final_analysis["event"]["type"] == "hurricane"

    assert (
        final_analysis["event"]["location"]
        == "Gulf of Mexico"
    )

    assert final_analysis["event"]["severity"] == 4

    # -------------------------
    # Final Risk Summary
    # -------------------------

    final_risk = final_analysis["risk"]

    assert final_risk["level"].lower() in {
        "low",
        "medium",
        "high",
        "critical",
    }

    assert isinstance(
        final_risk["score"],
        (int, float),
    )

    assert 0 <= final_risk["score"] <= 100

    assert isinstance(
        final_risk["confidence"],
        (int, float),
    )

    assert 0 <= final_risk["confidence"] <= 1

    assert (
        final_risk["base_portfolio_impact"]
        == base_scenario["portfolio_impact"]
    )

    # -------------------------
    # Risk Drivers
    # -------------------------

    assert "key_risk_drivers" in final_analysis

    assert isinstance(
        final_analysis["key_risk_drivers"],
        list,
    )

    assert len(final_analysis["key_risk_drivers"]) > 0

    # -------------------------
    # Historical Context
    # -------------------------

    historical_context = final_analysis[
        "historical_context"
    ]

    assert "events" in historical_context

    assert isinstance(
        historical_context["events"],
        (int, float),
    )

    assert historical_context["events"] >= 0

    # -------------------------
    # Strategy
    # -------------------------

    assert (
        final_analysis["strategy"]["action"]
        == "HEDGE_AND_REALLOCATE"
    )

    # -------------------------
    # Evidence
    # -------------------------

    assert len(final_analysis["evidence"]) == 4

    # -------------------------
    # Audit
    # -------------------------

    audit = final_analysis["audit"]

    assert (
        audit["quantitative_source"]
        == "p3_risk_engine"
    )

    assert (
        audit["strategy_source"]
        == "strategy_agent"
    )