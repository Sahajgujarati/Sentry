import requests
import os

class MarketProvider:
    def __init__(self):
        # Grabs the API key from your environment, or uses a default string
        self.api_key = os.getenv("ALPHA_VANTAGE_API_KEY", "demo")
        self.base_url = "https://www.alphavantage.co/query"

    def fetch_live_prices(self, tickers: list) -> dict:
        """
        Attempts to fetch real-time prices for a list of tickers.
        If the API fails, times out, or hits a rate limit, it raises an Exception.
        """
        assets = []
        
        for ticker in tickers:
            params = {
                "function": "GLOBAL_QUOTE",
                "symbol": ticker,
                "apikey": self.api_key
            }
            
            # 5-second timeout so the UI doesn't hang forever if the API is down
            response = requests.get(self.base_url, params=params, timeout=5)
            response.raise_for_status() 
            
            data = response.json()
            
            # Alpha Vantage returns an "Information" key when you hit the free-tier rate limit
            if "Information" in data or "Note" in data:
                raise Exception(f"API Rate limit hit for {ticker}")
                
            quote = data.get("Global Quote", {})
            if not quote:
                raise Exception(f"Missing quote data for {ticker}")
                
            # Normalize the messy API response into our clean format
            assets.append({
                "ticker": ticker,
                "current_price": float(quote.get("05. price", 0.0)),
                "change_1d": float(quote.get("09. change", 0.0))
            })
            
        return {
            "portfolio_id": "live-energy",
            "assets": assets
        }