from typing import Any

from backend.data_platform.api.data_service import DataService
from backend.orchestrator.graph.state import AnalysisState


data_service = DataService()


def market_node(state: AnalysisState) -> dict[str, Any]:
    """
    Fetch market data through the P2 data platform.
    """

    market_response = data_service.get_market_data()

    # P2 demo data may contain:
    #
    # {
    #     "portfolio_id": "demo-energy",
    #     "assets": [...]
    # }
    #
    # while the existing P1 contract expects:
    #
    # {
    #     "XOM": {...},
    #     "CVX": {...}
    # }

    market_data = {}

    if "assets" in market_response:
        for asset in market_response.get("assets", []):
            ticker = asset.get("ticker")

            if not ticker:
                continue

            market_data[ticker] = {
                "price": asset.get(
                    "current_price"
                ),
                "change_1d": asset.get(
                    "change_1d",
                    0.0,
                ),
                "quantity": asset.get(
                    "quantity"
                ),
                "sector": asset.get(
                    "sector"
                ),
            }

    else:
        # Already-normalized P2 response
        market_data = market_response

    return {
        "market_data": market_data,
        "agent_trace": [
            {
                "agent": "market",
                "status": "completed",
                "source": "p2_data_platform",
            }
        ],
    }