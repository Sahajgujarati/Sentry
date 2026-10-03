class HistoricalProvider:
    def __init__(self):
        # A larger mock database of historical events to search against
        self.mock_database = [
            {"event_id": "h_2021", "event_type": "hurricane", "location": "Gulf of Mexico", "severity": 4, "market_impact": -0.064, "sector": "Energy"},
            {"event_id": "h_2018", "event_type": "hurricane", "location": "Gulf Coast", "severity": 3, "market_impact": -0.052, "sector": "Energy"},
            {"event_id": "h_2005", "event_type": "hurricane", "location": "Gulf of Mexico", "severity": 5, "market_impact": -0.081, "sector": "Energy"},
            {"event_id": "eq_2011", "event_type": "earthquake", "location": "Japan", "severity": 9, "market_impact": -0.045, "sector": "Technology"},
            {"event_id": "pr_2020", "event_type": "pandemic", "location": "Global", "severity": 5, "market_impact": -0.250, "sector": "All"}
        ]

    def search_similar_events(self, event_type: str, sector: str, min_severity: int = 3) -> dict:
        """
        Simulates vector database retrieval by filtering historical events 
        matching the target criteria.
        """
        matches = []
        
        for event in self.mock_database:
            if event["event_type"] == event_type and event["sector"] == sector and event["severity"] >= min_severity:
                matches.append(event)
                
        if not matches:
            raise Exception("No historical matches found for given criteria.")
            
        return {
            "query": f"{event_type} affecting {sector}",
            "matches": matches,
            "match_count": len(matches)
        }