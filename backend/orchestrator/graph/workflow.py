from langgraph.graph import END, START, StateGraph

from backend.orchestrator.agents.historical_agent import historical_node
from backend.orchestrator.agents.market_agent import market_node
from backend.orchestrator.agents.news_agent import news_node
from backend.orchestrator.agents.strategy_agent import strategy_node
from backend.orchestrator.agents.supervisor import analyze_query
from backend.orchestrator.agents.synthesis_agent import synthesis_node
from backend.orchestrator.agents.weather_agent import weather_node

from backend.orchestrator.graph.state import AnalysisState
from backend.orchestrator.services.evidence_service import merge_evidence
from backend.orchestrator.services.risk_client import analyze_risk


def supervisor_node(state: AnalysisState) -> dict:
    """
    Analyze the user's query and determine:
    - event type
    - event location
    - severity
    - affected sectors
    - required evidence agents
    """

    result = analyze_query(state["user_query"])

    return {
        "event": result["event"],
        "agent_trace": [
            {
                "agent": "supervisor",
                "status": "completed",
                "required_agents": result["required_agents"],
            }
        ],
    }


def risk_node(state: AnalysisState) -> dict:
    """
    Convert the collected evidence into the Risk Engine's
    canonical input format and run the quantitative risk engine.
    """

    evidence_package = state["evidence"][0]

    risk_report = analyze_risk(
        evidence_package,
        user_query=state.get("user_query", ""),
    )

    # Temporary integration debugging
    print("\n========== P3 RISK REPORT ==========")
    print(risk_report)
    print("====================================\n")

    return {
        "risk_report": risk_report,
        "agent_trace": [
            {
                "agent": "risk_engine",
                "status": "completed",
                "source": "p3_risk_engine",
            }
        ],
    }


def build_workflow():
    """
    Build the complete Sentry multi-agent workflow.

    Flow:

        User Query
             ↓
        Supervisor
             ↓
       ┌─────┼─────┬─────┐
       ↓     ↓     ↓     ↓
    Weather News Market Historical
       └─────┼─────┴─────┘
             ↓
       Evidence Merger
             ↓
        Risk Engine
             ↓
        Strategy Agent
             ↓
        Synthesis Agent
             ↓
           END
    """

    graph = StateGraph(AnalysisState)

    # --------------------------------------------------
    # Agent Nodes
    # --------------------------------------------------

    graph.add_node("supervisor", supervisor_node)

    graph.add_node("weather", weather_node)
    graph.add_node("news", news_node)
    graph.add_node("market", market_node)
    graph.add_node("historical", historical_node)

    graph.add_node("evidence_merger", merge_evidence)

    graph.add_node("risk_engine", risk_node)

    graph.add_node("strategy", strategy_node)

    graph.add_node("synthesis", synthesis_node)

    # --------------------------------------------------
    # Start
    # --------------------------------------------------

    graph.add_edge(START, "supervisor")

    # --------------------------------------------------
    # Parallel Evidence Collection
    # --------------------------------------------------

    graph.add_edge("supervisor", "weather")
    graph.add_edge("supervisor", "news")
    graph.add_edge("supervisor", "market")
    graph.add_edge("supervisor", "historical")

    # --------------------------------------------------
    # Evidence Merger
    # --------------------------------------------------

    graph.add_edge("weather", "evidence_merger")
    graph.add_edge("news", "evidence_merger")
    graph.add_edge("market", "evidence_merger")
    graph.add_edge("historical", "evidence_merger")

    # --------------------------------------------------
    # Quantitative Risk Analysis
    # --------------------------------------------------

    graph.add_edge("evidence_merger", "risk_engine")

    # --------------------------------------------------
    # Strategy Generation
    # --------------------------------------------------

    graph.add_edge("risk_engine", "strategy")

    # --------------------------------------------------
    # Final Intelligence Synthesis
    # --------------------------------------------------

    graph.add_edge("strategy", "synthesis")

    # --------------------------------------------------
    # End
    # --------------------------------------------------

    graph.add_edge("synthesis", END)

    return graph.compile()