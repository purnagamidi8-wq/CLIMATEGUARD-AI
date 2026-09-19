from fastapi import APIRouter, Query
from app.schemas import HelplineResponse
from app.services.helpline_service import helpline_service
from typing import Optional

router = APIRouter(prefix="/api/helplines", tags=["Government Helplines"])

@router.get("/", response_model=list[HelplineResponse])
def list_government_helplines(
    service_type: Optional[str] = Query(None, description="Filter by service type: emergency, disaster, medical, fire, police, weather, women, child"),
    state: Optional[str] = Query(None, description="Filter by state name"),
    q: Optional[str] = Query(None, description="Search term for name or number")
):
    """
    Search and retrieve official verified Government and Disaster Management Helplines.
    Sources include Ministry of Home Affairs (MHA), NDMA, SDMA, and ERSS (112).
    """
    results = helpline_service.get_helplines(service_type=service_type, state=state, search_query=q)
    return [HelplineResponse.model_validate(h) for h in results]

@router.get("/emergency-quick")
def quick_emergency_numbers():
    """Returns top prioritized emergency numbers for 1-tap dial buttons."""
    return [
        {"name": "National Emergency (ERSS)", "number": "112", "type": "All Services", "icon": "🚨"},
        {"name": "NDRF Disaster Control", "number": "1078", "type": "Disaster Rescue", "icon": "🌊"},
        {"name": "State Disaster Control", "number": "1070", "type": "State SDMA", "icon": "🏛️"},
        {"name": "Ambulance / Medical", "number": "108", "type": "Medical Emergency", "icon": "🚑"},
        {"name": "Fire & Rescue", "number": "101", "type": "Fire", "icon": "🚒"},
        {"name": "Police Control", "number": "100", "type": "Police", "icon": "👮"},
        {"name": "Kisan Call Centre", "number": "1551", "type": "Farmer Advisory", "icon": "🌾"},
    ]
