import pytest
import sys
import os

# Add backend directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.risk.engine import ClimateRiskEngine
from app.services.safe_places_service import safe_places_service
from app.services.helpline_service import helpline_service
from app.services.weather_service import weather_service

@pytest.fixture
def risk_engine():
    return ClimateRiskEngine()

def test_risk_level_thresholds(risk_engine):
    assert risk_engine.get_risk_level(15) == "LOW"
    assert risk_engine.get_risk_level(35) == "MODERATE"
    assert risk_engine.get_risk_level(65) == "HIGH"
    assert risk_engine.get_risk_level(85) == "SEVERE"

def test_flood_risk_evaluation(risk_engine):
    # Test severe flood
    weather = {
        "precipitation": 60.0,
        "rain": 60.0,
        "soil_moisture": 0.45,
        "daily": {"precipitation_sum": [120.0]}
    }
    result = risk_engine.evaluate_flood(weather)
    assert result["hazard_type"] == "flood"
    assert result["risk_level"] in ["HIGH", "SEVERE"]
    assert result["risk_score"] >= 75.0
    assert len(result["factors"]) > 0

def test_heatwave_risk_evaluation(risk_engine):
    # Test severe heatwave
    weather = {
        "temperature": 45.5,
        "feels_like": 49.0,
        "uv_index": 12.0
    }
    result = risk_engine.evaluate_heatwave(weather)
    assert result["hazard_type"] == "heatwave"
    assert result["risk_level"] in ["HIGH", "SEVERE"]
    assert result["risk_score"] >= 75.0

def test_cyclone_risk_evaluation(risk_engine):
    # Test cyclone winds
    weather = {
        "wind_speed": 105.0,
        "wind_gust": 145.0
    }
    result = risk_engine.evaluate_cyclone(weather)
    assert result["hazard_type"] == "cyclone"
    assert result["risk_level"] == "SEVERE"
    assert result["risk_score"] >= 75.0

def test_all_hazards_assessment(risk_engine):
    weather = {
        "temperature": 28.0,
        "feels_like": 30.0,
        "humidity": 60,
        "wind_speed": 12.0,
        "wind_gust": 18.0,
        "precipitation": 0.0,
        "rain": 0.0,
        "weather_code": 2,
        "soil_moisture": 0.20,
        "daily": {"precipitation_sum": [0.0]}
    }
    hazards = risk_engine.assess_all(weather)
    assert len(hazards) == 6
    types = [h["hazard_type"] for h in hazards]
    assert "flood" in types
    assert "heatwave" in types
    assert "cyclone" in types
    assert "lightning" in types
    assert "drought" in types
    assert "wildfire" in types

def test_government_helplines():
    helplines = helpline_service.get_helplines()
    assert len(helplines) >= 8
    numbers = [h["number"] for h in helplines]
    assert "112" in numbers  # Unified emergency
    assert "1078" in numbers # NDRF
    assert "108" in numbers  # Ambulance
    assert "101" in numbers  # Fire

    # Test search filter
    ndrf_res = helpline_service.get_helplines(search_query="NDRF")
    assert len(ndrf_res) >= 1
    assert ndrf_res[0]["number"] == "1078"

@pytest.mark.asyncio
async def test_safe_places_ranking():
    lat, lon = 17.6868, 83.2185
    places = await safe_places_service.get_nearby_safe_places(lat, lon, hazard_type="flood", radius_km=15.0)
    assert len(places) > 0
    # Places should have distance_km and estimated travel times
    first = places[0]
    assert "distance_km" in first
    assert "estimated_time_walk_min" in first
    assert "estimated_time_drive_min" in first
    assert first["distance_km"] <= 15.0

def test_weather_demo_scenarios():
    scenarios = ["flood", "heatwave", "cyclone", "lightning", "drought", "wildfire", "normal"]
    for sc in scenarios:
        data = weather_service._get_demo_data(17.6868, 83.2185, scenario=sc)
        assert data["current"]["data_mode"] == "DEMO"
        assert "temperature" in data["current"]
        assert "humidity" in data["current"]
        assert len(data["daily"]["dates"]) == 7
