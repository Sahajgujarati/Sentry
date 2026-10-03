import json
import os
import sys
from pathlib import Path

# 1. Resolve the absolute path to the project root
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent.parent
DEMO_DATA_DIR = PROJECT_ROOT / "data" / "demo"

# 2. Add the project root to the Python path so imports work perfectly
sys.path.append(str(PROJECT_ROOT))

# 3. Change to an absolute import instead of a relative (..) import
from backend.data_platform.providers.market_provider import MarketProvider
from backend.data_platform.providers.weather_provider import WeatherProvider
from backend.data_platform.providers.news_provider import NewsProvider
from backend.data_platform.providers.historical_provider import HistoricalProvider
class DataService:
    def __init__(self, use_demo_mode=False):
        """
        Notice use_demo_mode is now False by default!
        We want to try the real API first.
        """
        self.use_demo_mode = use_demo_mode
        self.market_provider = MarketProvider()
        self.weather_provider = WeatherProvider()
        self.news_provider = NewsProvider()
        self.historical_provider = HistoricalProvider()

    def _read_demo_file(self, filename: str) -> dict:
        filepath = DEMO_DATA_DIR / filename
        try:
            with open(filepath, 'r') as file:
                return json.load(file)
        except Exception:
            return {}

    def get_market_data(self) -> dict:
        """
        The critical fallback pattern:
        1. Try to get live data.
        2. If ANYTHING fails (rate limit, timeout, no wifi), instantly return demo data.
        """
        if self.use_demo_mode:
            return self._read_demo_file("market.json")
            
        try:
            print("Attempting to fetch live market data...")
            # We will test with just two tickers to avoid hitting limits too fast
            live_data = self.market_provider.fetch_live_prices(["XOM", "CVX"])
            print("Live data fetch successful!")
            return live_data
            
        except Exception as e:
            # THIS is what makes your platform hackathon-proof
            print(f"Live API Failed ({e}). Falling back to demo data.")
            return self._read_demo_file("market.json")

    # Keep your get_news, get_weather, and get_historical_events the exact same for now
    def get_news(self, query: str = "Gulf hurricane energy") -> dict:
        if self.use_demo_mode:
            return self._read_demo_file("news.json")
            
        try:
            print(f"Attempting to fetch live news data for: '{query}'...")
            live_data = self.news_provider.fetch_live_news(query)
            print("Live news fetch successful!")
            return live_data
        except Exception as e:
            print(f"Live News API Failed ({e}). Falling back to demo data.")
            return self._read_demo_file("news.json")

    def get_weather(self, location: str = "Gulf of Mexico") -> dict:
        if self.use_demo_mode:
            return self._read_demo_file("weather.json")

        try:
            print("Attempting to fetch live weather data...")
            # Gulf of Mexico coordinates approx: 25.0 N, -90.0 W
            live_data = self.weather_provider.fetch_live_weather(lat=25.0, lon=-90.0)
            print("Live weather fetch successful!")
            return live_data
        except Exception as e:
            print(f"Live Weather API Failed ({e}). Falling back to demo data.")
            return self._read_demo_file("weather.json")

    def get_historical_events(self, event_type: str = "hurricane", sector: str = "Energy") -> dict:
        if self.use_demo_mode:
            return self._read_demo_file("historical.json")
            
        try:
            print(f"Attempting to search historical database for {event_type} / {sector}...")
            live_data = self.historical_provider.search_similar_events(event_type, sector)
            print("Historical search successful!")
            return live_data
        except Exception as e:
            print(f"Historical Retrieval Failed ({e}). Falling back to demo data.")
            return self._read_demo_file("historical.json")

if __name__ == "__main__":
    service = DataService()
    print("\n--- MARKET DATA ---")
    print(json.dumps(service.get_market_data(), indent=2))
    
    print("\n--- WEATHER DATA ---")
    print(json.dumps(service.get_weather(), indent=2))
    
    print("\n--- NEWS DATA ---")
    print(json.dumps(service.get_news(), indent=2))
    
    print("\n--- HISTORICAL DATA ---")
    print(json.dumps(service.get_historical_events(event_type="hurricane", sector="Energy"), indent=2))