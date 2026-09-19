import json
from typing import Dict, Any, List, Tuple
from pathlib import Path

CONFIG_PATH = Path(__file__).parent / 'thresholds.json'

class ClimateRiskEngine:
    """
    Transparent, Deterministic Risk Analysis Engine for ClimateGuard AI.
    Scores 0-100 across 6 hazards. Thresholds are configurable in thresholds.json.
    NOTE: These are prototype thresholds for demonstration. Not an official warning system.
    """

    def __init__(self):
        with open(CONFIG_PATH, 'r', encoding='utf-8') as f:
            self.config = json.load(f)

    def get_risk_level(self, score: float) -> str:
        if score >= 75.0:
            return 'SEVERE'
        elif score >= 50.0:
            return 'HIGH'
        elif score >= 25.0:
            return 'MODERATE'
        return 'LOW'

    def evaluate_flood(self, weather: Dict[str, Any]) -> Dict[str, Any]:
        score = 0.0
        factors = []
        rain = weather.get('rain', 0.0) or weather.get('precipitation', 0.0) or 0.0
        daily = weather.get('daily', {})
        rain_sum = 0.0
        if daily and 'precipitation_sum' in daily and daily['precipitation_sum']:
            rain_sum = daily['precipitation_sum'][0] if daily['precipitation_sum'] else 0.0

        if rain >= 50.0:
            score += 50.0
            factors.append(f"Very heavy current rainfall of {rain} mm")
        elif rain >= 25.0:
            score += 35.0
            factors.append(f"Heavy rainfall of {rain} mm")
        elif rain >= 10.0:
            score += 20.0
            factors.append(f"Moderate rainfall of {rain} mm")

        if rain_sum >= 100.0:
            score += 40.0
            factors.append(f"Cumulative 24h heavy rain forecast of {rain_sum} mm")
        elif rain_sum >= 50.0:
            score += 25.0
            factors.append(f"Significant 24h rainfall forecast of {rain_sum} mm")

        soil = weather.get('soil_moisture', 0.20) or 0.20
        if soil >= 0.40:
            score += 15.0
            factors.append(f"Saturated soil moisture level of {round(soil, 2)}")

        score = min(100.0, round(score, 1))
        level = self.get_risk_level(score)
        if not factors:
            factors.append("No significant rainfall or runoff detected")
        explanation = f"Flood risk is {level} (based on {rain} mm current rainfall and {rain_sum} mm 24h forecast sum)"
        return {'hazard_type': 'flood', 'risk_score': score, 'risk_level': level, 'factors': factors, 'explanation': explanation, 'main_metrics': {'current_rain_mm': rain, 'forecast_24h_mm': rain_sum, 'soil_moisture': soil}}

    def evaluate_heatwave(self, weather: Dict[str, Any]) -> Dict[str, Any]:
        score = 0.0
        factors = []
        temp = weather.get('temperature', 25.0) or 25.0
        feels = weather.get('feels_like', temp) or temp
        uv_index = weather.get('uv_index', 5.0)

        if temp >= 44.0:
            score += 50.0
            factors.append(f"Extremely high temperature {round(temp, 1)} C")
        elif temp >= 40.0:
            score += 35.0
            factors.append(f"Severe heat of {round(temp, 1)} C")
        elif temp >= 37.0:
            score += 20.0
            factors.append(f"Moderate high temperature of {round(temp, 1)} C")

        if feels >= 45.0:
            score += 40.0
            factors.append(f"Dangerous heat index (feels like {round(feels, 1)} C)")
        elif feels >= 40.0:
            score += 20.0
            factors.append(f"High heat index (feels like {round(feels, 1)} C)")

        if uv_index and uv_index >= 10.0:
            score += 15.0
            factors.append(f"Extreme UV radiation index of {round(uv_index, 1)}")

        score = min(100.0, round(score, 1))
        level = self.get_risk_level(score)
        if not factors:
            factors.append("Temperature within normal comfort range")
        explanation = f"Heatwave risk is {level} (Temperature: {temp} C, Feels Like: {feels} C)"
        return {'hazard_type': 'heatwave', 'risk_score': score, 'risk_level': level, 'factors': factors, 'explanation': explanation, 'main_metrics': {'temperature_c': temp, 'feels_like_c': feels, 'uv_index': uv_index}}

    def evaluate_cyclone(self, weather: Dict[str, Any]) -> Dict[str, Any]:
        score = 0.0
        factors = []
        wind_speed = weather.get('wind_speed', 0.0) or 0.0
        wind_gust = weather.get('wind_gust', wind_speed * 1.2) or wind_speed * 1.2

        if wind_speed >= 90.0:
            score += 60.0
            factors.append(f"Severe storm-force winds of {round(wind_speed, 1)} km/h")
        elif wind_speed >= 65.0:
            score += 45.0
            factors.append(f"Gale-force winds of {round(wind_speed, 1)} km/h")
        elif wind_speed >= 45.0:
            score += 25.0
            factors.append(f"Strong breeze of {round(wind_speed, 1)} km/h")

        if wind_gust and wind_gust >= 105.0:
            score += 30.0
            factors.append(f"Dangerous wind gusts exceeding {round(wind_gust, 1)} km/h")

        score = min(100.0, round(score, 1))
        level = self.get_risk_level(score)
        if not factors:
            factors.append("Calm or light wind conditions")
        explanation = f"Storm/Cyclone risk is {level} (Wind Speed: {wind_speed} km/h)"
        return {'hazard_type': 'cyclone', 'risk_score': score, 'risk_level': level, 'factors': factors, 'explanation': explanation, 'main_metrics': {'wind_speed_kmh': wind_speed, 'wind_gust_kmh': wind_gust}}

    def evaluate_lightning(self, weather: Dict[str, Any]) -> Dict[str, Any]:
        score = 0.0
        factors = []
        wmo_code = weather.get('weather_code', 0) or 0

        if wmo_code in [96, 99]:
            score += 80.0
            factors.append("Severe thunderstorm with hail in progress")
        elif wmo_code == 95:
            score += 60.0
            factors.append("Active thunderstorm and lightning activity")
        elif wmo_code in [80, 81, 82, 85, 86]:
            score += 25.0
            factors.append("Rain showers with convective potential")

        score = min(100.0, round(score, 1))
        level = self.get_risk_level(score)
        if not factors:
            factors.append("No active convective storm activity")
        explanation = f"Lightning risk is {level} (WMO Code: {wmo_code})"
        return {'hazard_type': 'lightning', 'risk_score': score, 'risk_level': level, 'factors': factors, 'explanation': explanation, 'main_metrics': {'weather_code': wmo_code}}

    def evaluate_drought(self, weather: Dict[str, Any]) -> Dict[str, Any]:
        score = 0.0
        factors = []
        rain = weather.get('precipitation', 0.0) or weather.get('rain', 0.0) or 0.0
        soil = weather.get('soil_moisture', 0.15) or 0.15
        temp = weather.get('temperature', 25.0) or 25.0

        if rain == 0.0 and soil < 0.08:
            score += 65.0
            factors.append("Acute soil moisture deficit with no precipitation")
        elif rain == 0.0 and soil < 0.15:
            score += 35.0
            factors.append("Moderate soil moisture depletion")

        if temp >= 38.0:
            score += 25.0
            factors.append("Prolonged high evapotranspiration rates")

        score = min(100.0, round(score, 1))
        level = self.get_risk_level(score)
        if not factors:
            factors.append("Adequate soil moisture and precipitation")
        explanation = f"Drought risk is {level} (Soil moisture: {soil})"
        return {'hazard_type': 'drought', 'risk_score': score, 'risk_level': level, 'factors': factors, 'explanation': explanation, 'main_metrics': {'soil_moisture': soil, 'precipitation_mm': rain, 'temperature_c': temp}}

    def evaluate_wildfire(self, weather: Dict[str, Any]) -> Dict[str, Any]:
        score = 0.0
        factors = []
        temp = weather.get('temperature', 25.0) or 25.0
        humidity = weather.get('humidity', 50) or 50
        wind = weather.get('wind_speed', 10.0) or 10.0

        if temp >= 36.0 and humidity <= 20.0 and wind >= 25.0:
            score += 75.0
            factors.append("Combination of scorching heat, ultra-low humidity, and strong winds")
        elif temp >= 32.0 and humidity <= 30.0:
            score += 40.0
            factors.append("Dry conditions favoring fire spread")

        score = min(100.0, round(score, 1))
        level = self.get_risk_level(score)
        if not factors:
            factors.append("Humid or mild atmospheric state")
        explanation = f"Wildfire risk is {level} (Humidity: {humidity}%, Temp: {temp} C)"
        return {'hazard_type': 'wildfire', 'risk_score': score, 'risk_level': level, 'factors': factors, 'explanation': explanation, 'main_metrics': {'temperature_c': temp, 'humidity_pct': humidity, 'wind_speed_kmh': wind}}

    def assess_all(self, weather: Dict[str, Any]) -> List[Dict[str, Any]]:
        current = weather.get('current', weather)
        current['daily'] = weather.get('daily', {})
        return [
            self.evaluate_flood(current),
            self.evaluate_heatwave(current),
            self.evaluate_cyclone(current),
            self.evaluate_lightning(current),
            self.evaluate_drought(current),
            self.evaluate_wildfire(current)
        ]
