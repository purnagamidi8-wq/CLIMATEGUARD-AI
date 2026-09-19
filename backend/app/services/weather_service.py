import httpx
from typing import Dict, Any, Optional
from app.core.config import settings

WMO_CODES = {
    0: "Clear sky", 1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast",
    45: "Foggy", 48: "Depositing rime fog",
    51: "Light drizzle", 53: "Moderate drizzle", 55: "Dense drizzle",
    56: "Light freezing drizzle", 57: "Dense freezing drizzle",
    61: "Slight rain", 63: "Moderate rain", 65: "Heavy rain",
    66: "Light freezing rain", 67: "Heavy freezing rain",
    71: "Slight snow", 73: "Moderate snow", 75: "Heavy snow",
    77: "Snow grains",
    80: "Slight rain showers", 81: "Moderate rain showers", 82: "Violent rain showers",
    85: "Slight snow showers", 86: "Heavy snow showers",
    95: "Thunderstorm", 96: "Thunderstorm with slight hail", 99: "Thunderstorm with heavy hail",
}

DEMO_SCENARIOS = {
    "flood": {
        "temperature": 27.5, "feels_like": 31.0, "humidity": 94, "wind_speed": 35.0,
        "wind_gust": 58.0, "wind_direction": 210, "precipitation": 55.0, "rain": 55.0,
        "weather_code": 65, "weather_text": "Heavy continuous rainfall", "pressure": 996,
        "uv_index": 1.5, "soil_moisture": 0.48, "data_source": "Demo Scenario - Flood", "data_mode": "DEMO",
        "daily_precipitation_sum": [135.0, 95.0, 65.0, 40.0, 20.0, 10.0, 5.0],
    },
    "heatwave": {
        "temperature": 45.2, "feels_like": 49.5, "humidity": 18, "wind_speed": 14.0,
        "wind_gust": 22.0, "wind_direction": 280, "precipitation": 0.0, "rain": 0.0,
        "weather_code": 0, "weather_text": "Blistering clear sky - Extreme Heat", "pressure": 1004,
        "uv_index": 13.0, "soil_moisture": 0.05, "data_source": "Demo Scenario - Heatwave", "data_mode": "DEMO",
        "daily_precipitation_sum": [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
    },
    "cyclone": {
        "temperature": 26.5, "feels_like": 30.5, "humidity": 92, "wind_speed": 105.0,
        "wind_gust": 145.0, "wind_direction": 90, "precipitation": 75.0, "rain": 75.0,
        "weather_code": 82, "weather_text": "Violent rain storm with gale-force winds", "pressure": 978,
        "uv_index": 1.0, "soil_moisture": 0.52, "data_source": "Demo Scenario - Cyclone", "data_mode": "DEMO",
        "daily_precipitation_sum": [180.0, 120.0, 80.0, 30.0, 15.0, 5.0, 2.0],
    },
    "lightning": {
        "temperature": 29.0, "feels_like": 34.0, "humidity": 85, "wind_speed": 42.0,
        "wind_gust": 70.0, "wind_direction": 150, "precipitation": 28.0, "rain": 28.0,
        "weather_code": 99, "weather_text": "Severe thunderstorm with lightning & heavy hail", "pressure": 999,
        "uv_index": 3.0, "soil_moisture": 0.32, "data_source": "Demo Scenario - Lightning", "data_mode": "DEMO",
        "daily_precipitation_sum": [45.0, 25.0, 10.0, 5.0, 0.0, 0.0, 0.0],
    },
    "drought": {
        "temperature": 39.5, "feels_like": 41.0, "humidity": 22, "wind_speed": 18.0,
        "wind_gust": 25.0, "wind_direction": 310, "precipitation": 0.0, "rain": 0.0,
        "weather_code": 1, "weather_text": "Prolonged dry spell - severe moisture deficit", "pressure": 1010,
        "uv_index": 9.5, "soil_moisture": 0.04, "data_source": "Demo Scenario - Drought", "data_mode": "DEMO",
        "daily_precipitation_sum": [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
    },
    "wildfire": {
        "temperature": 41.0, "feels_like": 42.5, "humidity": 14, "wind_speed": 38.0,
        "wind_gust": 55.0, "wind_direction": 45, "precipitation": 0.0, "rain": 0.0,
        "weather_code": 1, "weather_text": "High fire risk conditions (High Temp + Low Humidity + Wind)", "pressure": 1007,
        "uv_index": 11.0, "soil_moisture": 0.03, "data_source": "Demo Scenario - Wildfire", "data_mode": "DEMO",
        "daily_precipitation_sum": [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
    },
    "normal": {
        "temperature": 28.5, "feels_like": 30.0, "humidity": 55, "wind_speed": 12.0,
        "wind_gust": 18.0, "wind_direction": 180, "precipitation": 0.0, "rain": 0.0,
        "weather_code": 2, "weather_text": "Partly cloudy - Mild conditions", "pressure": 1013,
        "uv_index": 6.0, "soil_moisture": 0.22, "data_source": "Demo Scenario - Normal", "data_mode": "DEMO",
        "daily_precipitation_sum": [0.0, 2.0, 0.0, 1.0, 0.0, 0.0, 0.0],
    },
}

class WeatherService:
    """Fetch weather data from Open-Meteo API with demo mode fallback."""

    OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast"

    async def get_weather(self, lat: float, lon: float, demo_mode: bool = False, scenario: str = "flood") -> Dict[str, Any]:
        if demo_mode or settings.DEMO_MODE:
            return self._get_demo_data(lat, lon, scenario)
        try:
            return await self._fetch_live(lat, lon)
        except Exception as e:
            print(f"Live weather fetch failed: {e}. Falling back to demo scenario '{scenario}'.")
            return self._get_demo_data(lat, lon, scenario)

    async def _fetch_live(self, lat: float, lon: float) -> Dict[str, Any]:
        params = {
            "latitude": lat,
            "longitude": lon,
            "current": "temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,weather_code,wind_speed_10m,wind_direction_10m,wind_gusts_10m,surface_pressure",
            "hourly": "temperature_2m,precipitation_probability,precipitation,wind_speed_10m",
            "daily": "temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code,uv_index_max",
            "timezone": "auto",
            "forecast_days": 7,
        }
        async with httpx.AsyncClient(timeout=12.0) as client:
            resp = await client.get(self.OPEN_METEO_URL, params=params)
            resp.raise_for_status()
            data = resp.json()

        current_data = data.get("current", {})
        hourly_data = data.get("hourly", {})
        daily_data = data.get("daily", {})

        uv_max = daily_data.get("uv_index_max", [5.0])
        uv_index = uv_max[0] if uv_max else 5.0

        from datetime import datetime
        current = {
            "temperature": current_data.get("temperature_2m", 25.0),
            "feels_like": current_data.get("apparent_temperature", 25.0),
            "humidity": current_data.get("relative_humidity_2m", 50),
            "wind_speed": current_data.get("wind_speed_10m", 10.0),
            "wind_gust": current_data.get("wind_gusts_10m", 15.0),
            "wind_direction": current_data.get("wind_direction_10m", 180),
            "precipitation": current_data.get("precipitation", 0.0),
            "rain": current_data.get("rain", 0.0),
            "weather_code": current_data.get("weather_code", 0),
            "weather_text": WMO_CODES.get(current_data.get("weather_code", 0), "Unknown"),
            "pressure": current_data.get("surface_pressure"),
            "uv_index": uv_index,
            "soil_moisture": 0.20,
            "data_source": "Open-Meteo",
            "data_mode": "LIVE",
            "timestamp": datetime.utcnow().isoformat(),
        }

        hourly = {
            "times": (hourly_data.get("time") or [])[:24],
            "temperatures": (hourly_data.get("temperature_2m") or [])[:24],
            "precipitation_probabilities": (hourly_data.get("precipitation_probability") or [])[:24],
            "precipitations": (hourly_data.get("precipitation") or [])[:24],
            "wind_speeds": (hourly_data.get("wind_speed_10m") or [])[:24],
        }

        daily = {
            "dates": daily_data.get("time", []),
            "temp_max": daily_data.get("temperature_2m_max", []),
            "temp_min": daily_data.get("temperature_2m_min", []),
            "precipitation_sum": daily_data.get("precipitation_sum", []),
            "weather_codes": daily_data.get("weather_code", []),
        }

        return {
            "location": {"lat": lat, "lon": lon},
            "current": current,
            "hourly": hourly,
            "daily": daily,
        }

    def _get_demo_data(self, lat: float, lon: float, scenario: str = "flood") -> Dict[str, Any]:
        from datetime import datetime
        scenario_key = scenario.lower() if scenario and scenario.lower() in DEMO_SCENARIOS else "flood"
        scene = DEMO_SCENARIOS[scenario_key]
        current = dict(scene)
        precip_sums = current.pop("daily_precipitation_sum", [50.0, 30.0, 20.0, 10.0, 5.0, 2.0, 0.0])
        current["timestamp"] = datetime.utcnow().isoformat()

        hourly = {
            "times": [f"2026-09-18T{h:02d}:00" for h in range(24)],
            "temperatures": [round(current["temperature"] + (h % 5 - 2) * 0.8, 1) for h in range(24)],
            "precipitation_probabilities": [min(100, max(0, int(current["humidity"] + (h % 10 - 5)))) for h in range(24)],
            "precipitations": [round(max(0, current["precipitation"] / 12 + (h % 3 - 1)), 1) for h in range(24)],
            "wind_speeds": [round(max(0, current["wind_speed"] + (h % 6 - 3)), 1) for h in range(24)],
        }

        daily = {
            "dates": ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5", "Day 6", "Day 7"],
            "temp_max": [round(current["temperature"] + (i * 0.5), 1) for i in range(7)],
            "temp_min": [round(current["temperature"] - 6 + (i * 0.3), 1) for i in range(7)],
            "precipitation_sum": precip_sums,
            "weather_codes": [current["weather_code"]] * 7,
        }

        return {
            "location": {"lat": lat, "lon": lon},
            "current": current,
            "hourly": hourly,
            "daily": daily,
        }

weather_service = WeatherService()
