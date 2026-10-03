from typing import Any

from backend.data_platform.api.data_service import DataService
from backend.orchestrator.graph.state import AnalysisState


data_service = DataService()


def news_node(state: AnalysisState) -> dict[str, Any]:
    """
    Fetch news through P2 and normalize the provider response
    into the canonical P1 news contract.
    """

    event = state.get("event", {})

    location = event.get(
        "location",
        "Gulf of Mexico",
    )

    sectors = event.get(
        "affected_sectors",
        ["Energy"],
    )

    sector_text = " ".join(sectors)

    query = f"{location} hurricane {sector_text}"

    raw_news = data_service.get_news(
        query=query
    ) or {}

    # ---------------------------------------------
    # Normalize article count
    # ---------------------------------------------

    article_count = raw_news.get("article_count")

    if article_count is None:
        articles = raw_news.get("articles", [])

        if isinstance(articles, list):
            article_count = len(articles)
        else:
            article_count = 0

    # ---------------------------------------------
    # Normalize sentiment
    # ---------------------------------------------

    sentiment = raw_news.get(
        "overall_sentiment"
    )

    if sentiment is None:
        sentiment = raw_news.get(
            "sentiment_score"
        )

    if sentiment is None:
        sentiment = 0.0

    # ---------------------------------------------
    # Normalize key signals/headlines
    # ---------------------------------------------

    key_signals = raw_news.get(
        "key_signals"
    )

    if key_signals is None:
        key_signals = raw_news.get(
            "key_headlines",
            [],
        )

    if not isinstance(key_signals, list):
        key_signals = []

    # ---------------------------------------------
    # Canonical P1 contract
    # ---------------------------------------------

    news_data = {
        "article_count": article_count,
        "overall_sentiment": sentiment,
        "key_signals": key_signals,
    }

    return {
        "news_data": news_data,
        "agent_trace": [
            {
                "agent": "news",
                "status": "completed",
                "source": "p2_data_platform",
                "query": query,
            }
        ],
    }