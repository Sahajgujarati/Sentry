import requests
import os
from datetime import datetime

class NewsProvider:
    def __init__(self):
        # Grabs the API key from your environment, or uses a dummy key
        self.api_key = os.getenv("NEWS_API_KEY", "demo")
        self.base_url = "https://newsapi.org/v2/everything"

    def fetch_live_news(self, query: str = "Gulf hurricane energy") -> dict:
        """
        Attempts to fetch live news articles matching the query.
        Raises an exception if the API key is invalid or rate limited.
        """
        params = {
            "q": query,
            "apiKey": self.api_key,
            "language": "en",
            "sortBy": "relevancy",
            "pageSize": 3
        }
        
        response = requests.get(self.base_url, params=params, timeout=5)
        response.raise_for_status()
        
        data = response.json()
        
        if data.get("status") != "ok":
            raise Exception(f"News API Error: {data.get('message', 'Unknown error')}")
            
        articles = []
        for item in data.get("articles", []):
            articles.append({
                "title": item.get("title", ""),
                "source": item.get("source", {}).get("name", "Unknown Source"),
                "published_at": item.get("publishedAt", datetime.utcnow().isoformat()),
                "summary": item.get("description", ""),
                "sector": "Energy" # Auto-tagged based on our query
            })
            
        if not articles:
            raise Exception("No relevant news articles found for query.")
            
        return {
            "articles": articles
        }