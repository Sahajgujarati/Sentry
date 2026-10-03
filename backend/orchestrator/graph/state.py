from typing import Any, Annotated, TypedDict


def merge_lists(existing, new):
    return existing + new


class AnalysisState(TypedDict, total=False):
    # -------------------------
    # User Input
    # -------------------------

    user_query: str
    portfolio_id: str

    # -------------------------
    # Event & Portfolio
    # -------------------------

    event: dict[str, Any]
    portfolio: dict[str, Any]

    # -------------------------
    # Agent Data
    # -------------------------

    market_data: dict[str, Any]
    news_data: dict[str, Any]
    weather_data: dict[str, Any]
    macro_data: dict[str, Any]
    historical_data: dict[str, Any]

    # -------------------------
    # Combined Evidence
    # -------------------------

    evidence: list[dict[str, Any]]

    # -------------------------
    # Risk Analysis
    # -------------------------

    risk_report: dict[str, Any]

    # -------------------------
    # Strategy
    # -------------------------

    strategy: dict[str, Any]

    # -------------------------
    # Final Output
    # -------------------------

    final_analysis: dict[str, Any]

    # -------------------------
    # Agent Execution Trace
    # -------------------------

    agent_trace: Annotated[
        list[dict[str, Any]],
        merge_lists,
    ]

    # -------------------------
    # Errors / Failures
    # -------------------------

    errors: list[str]