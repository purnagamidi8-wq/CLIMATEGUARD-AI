from fastapi import APIRouter, Query
from app.services.weather_service import weather_service
from app.services.recommendation_service import recommendation_service
from app.risk.engine import ClimateRiskEngine

router = APIRouter(prefix="/api/recommendations", tags=["Recommendations"])
risk_engine = ClimateRiskEngine()

@router.get("/")
async def get_recommendations(lat: float = Query(...), lon: float = Query(...), profile_type: str = Query("general"), language: str = Query("en"), demo: bool = Query(False)):
    weather_data = await weather_service.get_weather(lat, lon, demo_mode=demo)
    hazards = risk_engine.assess_all(weather_data)
    recs = recommendation_service.get_all_recommendations(hazards, profile_type, language)
    return {"recommendations": recs, "data_mode": weather_data.get("current", {}).get("data_mode", "LIVE")}
