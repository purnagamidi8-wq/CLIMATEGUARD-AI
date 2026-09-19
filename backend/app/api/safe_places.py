from fastapi import APIRouter, Query
from app.schemas import SafePlaceResponse
from app.services.safe_places_service import safe_places_service
from typing import Optional

router = APIRouter(prefix="/api/safe-places", tags=["Nearby Protection & Safe Places"])

@router.get("/nearby", response_model=list[SafePlaceResponse])
async def get_nearby_safe_places(
    lat: float = Query(..., description="Latitude of active location"),
    lon: float = Query(..., description="Longitude of active location"),
    hazard_type: Optional[str] = Query(None, description="Active hazard (e.g. flood, heatwave, cyclone) for relevance ranking"),
    place_type: Optional[str] = Query(None, description="Filter: emergency_shelter, relief_camp, hospital, fire_station, police_station, all"),
    radius: float = Query(15.0, description="Search radius in kilometers")
):
    """
    Find nearby safe places, cyclone shelters, relief camps, hospitals, fire stations, and police stations.
    Ranks candidates using: Distance + Resource Type + Hazard Relevance + Verified Facilities.
    """
    places = await safe_places_service.get_nearby_safe_places(
        lat=lat,
        lon=lon,
        hazard_type=hazard_type,
        place_type=place_type,
        radius_km=radius
    )
    return [SafePlaceResponse.model_validate(p) for p in places]
