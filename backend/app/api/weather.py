from fastapi import APIRouter, Query
from app.services.weather_service import weather_service

router = APIRouter(prefix="/api/weather", tags=["Weather"])

@router.get("/current")
async def get_current_weather(lat: float = Query(...), lon: float = Query(...), demo: bool = Query(False), scenario: str = Query("flood")):
    try:
        data = await weather_service.get_weather(lat, lon, demo_mode=demo, scenario=scenario)
        return data
    except Exception as e:
        return {"error": "Live climate data is temporarily unavailable.", "detail": str(e), "current": {"data_mode": "ERROR"}}

@router.get("/forecast")
async def get_forecast(lat: float = Query(...), lon: float = Query(...), demo: bool = Query(False)):
    try:
        data = await weather_service.get_weather(lat, lon, demo_mode=demo)
        return {"hourly": data.get("hourly", {}), "daily": data.get("daily", {}), "data_mode": data.get("current", {}).get("data_mode", "LIVE")}
    except Exception as e:
        return {"error": "Forecast data temporarily unavailable.", "detail": str(e)}
