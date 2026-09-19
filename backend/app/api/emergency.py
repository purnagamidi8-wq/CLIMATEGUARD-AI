from fastapi import APIRouter, Query
from app.services.emergency_service import emergency_service

router = APIRouter(prefix="/api/emergency-resources", tags=["Emergency Resources"])

@router.get("/")
async def get_emergency_resources(lat: float = Query(...), lon: float = Query(...), radius: int = Query(5000)):
    result = await emergency_service.find_nearby(lat, lon, radius)
    return result
