from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, Location
from app.schemas import LocationCreate, LocationResponse
from app.api.auth import get_current_user
from app.services.location_service import location_service

router = APIRouter(prefix="/api/locations", tags=["Locations"])

@router.get("/search")
async def search_location(q: str = Query(..., min_length=2)):
    results = await location_service.search_city(q)
    return {"results": results}

@router.get("/reverse")
async def reverse_geocode(lat: float = Query(...), lon: float = Query(...)):
    result = await location_service.reverse_geocode(lat, lon)
    return result

@router.get("/", response_model=list[LocationResponse])
def get_saved_locations(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    locations = db.query(Location).filter(Location.user_id == current_user.id).all()
    return [LocationResponse.model_validate(loc) for loc in locations]

@router.post("/", response_model=LocationResponse)
def save_location(data: LocationCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    loc = Location(user_id=current_user.id, name=data.name, latitude=data.latitude, longitude=data.longitude, city=data.city, state=data.state, country=data.country, is_default=data.is_default)
    db.add(loc)
    db.commit()
    db.refresh(loc)
    return LocationResponse.model_validate(loc)

@router.delete("/{location_id}")
def delete_location(location_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    loc = db.query(Location).filter(Location.id == location_id, Location.user_id == current_user.id).first()
    if not loc:
        raise HTTPException(status_code=404, detail="Location not found")
    db.delete(loc)
    db.commit()
    return {"message": "Location deleted"}
