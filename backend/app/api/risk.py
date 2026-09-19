from fastapi import APIRouter, Query
from app.services.weather_service import weather_service
from app.risk.engine import ClimateRiskEngine
from datetime import datetime

router = APIRouter(prefix="/api/risk", tags=["Risk Assessment"])
risk_engine = ClimateRiskEngine()

@router.get("/assess")
async def assess_risk(lat: float = Query(...), lon: float = Query(...), demo: bool = Query(False), scenario: str = Query("flood")):
    try:
        weather_data = await weather_service.get_weather(lat, lon, demo_mode=demo, scenario=scenario)
        hazards = risk_engine.assess_all(weather_data)
        scores = [h["risk_score"] for h in hazards]
        overall_score = round(max(scores) if scores else 0, 1)
        overall_level = risk_engine.get_risk_level(overall_score)
        data_mode = weather_data.get("current", {}).get("data_mode", "LIVE")
        return {
            "location": weather_data.get("location", {"lat": lat, "lon": lon}),
            "overall_risk_level": overall_level,
            "overall_risk_score": overall_score,
            "hazards": hazards,
            "data_source": weather_data.get("current", {}).get("data_source", "Open-Meteo"),
            "data_mode": data_mode,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        return {"error": "Risk assessment temporarily unavailable.", "detail": str(e)}

@router.get("/methodology")
def get_methodology():
    return {
        "system": "ClimateGuard AI Deterministic Risk Engine v1.0",
        "score_range": "0-100",
        "levels": {"LOW": "0-24", "MODERATE": "25-49", "HIGH": "50-74", "SEVERE": "75-100"},
        "hazards_analyzed": ["flood", "heatwave", "cyclone", "lightning", "drought", "wildfire"],
        "note": "These are prototype thresholds for educational demonstration. Not an official government warning system.",
        "data_sources": ["Open-Meteo (free, no API key)", "OpenWeatherMap (optional)"],
        "methodology": "Risk = Weather Factor + Hazard Factor + Exposure Factor. Each hazard uses specific meteorological parameters normalized to 0-100 scale."
    }
