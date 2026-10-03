import requests

class WeatherProvider:
    def __init__(self):
        # Open-Meteo free marine/weather endpoint (no API key required)
        self.base_url = "https://api.open-meteo.com/v1/forecast"

    def fetch_live_weather(self, lat: float = 25.0, lon: float = -90.0) -> dict:
        """
        Fetches current weather for coordinates (default: Central Gulf of Mexico).
        Converts wind speed and parameters into storm severity estimates.
        """
        params = {
            "latitude": lat,
            "longitude": lon,
            "current": ["wind_speed_10m", "surface_pressure"],
            "wind_speed_unit": "mph"
        }
        
        response = requests.get(self.base_url, params=params, timeout=5)
        response.raise_for_status()
        data = response.json()
        
        current = data.get("current", {})
        wind_speed = current.get("wind_speed_10m", 0.0)
        
        # Categorize wind speeds into hurricane severity
        if wind_speed >= 130:
            severity = 4
            event_type = "hurricane"
        elif wind_speed >= 111:
            severity = 3
            event_type = "hurricane"
        elif wind_speed >= 74:
            severity = 1
            event_type = "hurricane"
        else:
            severity = 1
            event_type = "tropical_disturbance"

        return {
            "event_type": event_type,
            "location": "Gulf of Mexico",
            "severity": severity,
            "severity_score": round(min(wind_speed / 150.0, 1.0), 2),
            "wind_speed_mph": wind_speed,
            "affected_regions": ["Texas", "Louisiana"],
            "affected_sectors": ["Energy"]
        }