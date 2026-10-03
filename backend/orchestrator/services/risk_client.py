from typing import Any

from backend.risk_engine.engine import run_risk_engine
from backend.risk_engine.schemas.risk_input import (
    Event,
    Holding,
    HistoricalAnalysis,
    HistoricalEvent,
    MarketAssetData,
    NewsAnalysis,
    Portfolio,
    RiskInput,
    WeatherAnalysis,
)


def analyze_risk(
    evidence_package: dict[str, Any],
    user_query: str = "",
) -> dict[str, Any]:

    event_data = evidence_package.get("event", {})
    market_data = evidence_package.get("market", {})
    weather_data = evidence_package.get("weather", {})
    news_data = evidence_package.get("news", {})
    historical_data = evidence_package.get("historical", {})

    # ---------------------------------------------------------
    # 1. Event
    # ---------------------------------------------------------

    event = Event(
        type=event_data.get("type", "unknown"),
        name=(
            f"{event_data.get('type', 'Unknown').title()} "
            f"Event"
        ),
        severity=event_data.get("severity"),
        location=event_data.get("location"),
        affected_regions=event_data.get("affected_regions", []),
        affected_sectors=event_data.get("affected_sectors", []),
    )

    # ---------------------------------------------------------
    # 2. Demo portfolio
    # ---------------------------------------------------------
    # Temporary canonical portfolio until P2 portfolio data
    # is connected.

    holdings = [
        Holding(
            ticker="XOM",
            quantity=1000,
            current_price=120.0,
            sector="Energy",
        ),
        Holding(
            ticker="CVX",
            quantity=750,
            current_price=160.0,
            sector="Energy",
        ),
        Holding(
            ticker="OXY",
            quantity=1500,
            current_price=55.0,
            sector="Energy",
        ),
        Holding(
            ticker="MSFT",
            quantity=500,
            current_price=500.0,
            sector="Technology",
        ),
        Holding(
            ticker="XLE",
            quantity=800,
            current_price=90.0,
            sector="Energy ETF",
        ),
    ]

    portfolio = Portfolio(
        holdings=holdings,
        total_value=sum(
            holding.quantity * holding.current_price
            for holding in holdings
        ),
        cash=0.0,
    )

    # ---------------------------------------------------------
    # 3. Market data
    # ---------------------------------------------------------

    market = {}

    for ticker, data in market_data.items():
        market[ticker] = MarketAssetData(
            daily_change=data.get("change_1d"),
            current_price=data.get("price"),
        )

    # ---------------------------------------------------------
    # 4. Weather analysis
    # ---------------------------------------------------------

    weather_analysis = WeatherAnalysis(
        severity_score=weather_data.get("severity_score"),
        category=weather_data.get("severity"),
        details=(
            f"Affected regions: "
            f"{', '.join(weather_data.get('affected_regions', []))}"
        ),
    )

    # ---------------------------------------------------------
    # 5. News analysis
    # ---------------------------------------------------------

    news_analysis = NewsAnalysis(
        sentiment_score=news_data.get("overall_sentiment"),
        article_count=news_data.get("article_count", 0),
        key_headlines=news_data.get("key_signals", []),
    )

    # ---------------------------------------------------------
    # 6. Historical analysis
    # ---------------------------------------------------------

    raw_matches = historical_data.get("matches", [])

    # P2 may return either:
    #
    # 1. matches = 7
    # 2. matches = [{...}, {...}, ...]
    #
    # Normalize both formats into the P3 contract.

    if isinstance(raw_matches, list):
        similar_event_count = len(raw_matches)
        historical_events_data = raw_matches
    else:
        similar_event_count = int(raw_matches or 0)
        historical_events_data = historical_data.get(
            "historical_events",
            []
        )

    historical_events = []

    for item in historical_events_data:
        if not isinstance(item, dict):
            continue

        historical_events.append(
            HistoricalEvent(
                event_name=item.get(
                    "event_name",
                    item.get("name"),
                ),
                event_year=item.get(
                    "event_year",
                    item.get("year"),
                ),
                event_type=item.get(
                    "event_type",
                    item.get("type"),
                ),
                severity=item.get("severity"),
                impact_pct=item.get(
                    "impact_pct",
                    item.get("impact"),
                ),
                sector_impact_pct=item.get(
                    "sector_impact_pct",
                    item.get("sector_impact"),
                ),
                recovery_days=item.get(
                    "recovery_days"
                ),
                description=item.get(
                    "description"
                ),
            )
        )

        historical_analysis = HistoricalAnalysis(
            similar_event_count=similar_event_count,
            median_energy_impact=historical_data.get(
                "median_impact"
            ),
            median_market_impact=historical_data.get(
                "median_market_impact"
            ),
            historical_events=historical_events,
        )

    # ---------------------------------------------------------
    # 7. Build P3 RiskInput
    # ---------------------------------------------------------

    risk_input = RiskInput(
        event=event,
        portfolio=portfolio,
        market=market,
        weather_analysis=weather_analysis,
        news_analysis=news_analysis,
        historical_analysis=historical_analysis,
        query=user_query,
    )

    # ---------------------------------------------------------
    # 8. Run real P3 engine
    # ---------------------------------------------------------

    risk_report = run_risk_engine(risk_input)

    # P3 returns a Pydantic model.
    if hasattr(risk_report, "model_dump"):
        return risk_report.model_dump()

    return risk_report