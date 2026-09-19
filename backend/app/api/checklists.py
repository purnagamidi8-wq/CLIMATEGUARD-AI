from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, Checklist
from app.schemas import ChecklistUpdateRequest
from app.api.auth import get_current_user
from datetime import datetime

router = APIRouter(prefix="/api/checklists", tags=["Preparedness Checklists"])

DEFAULT_CHECKLISTS = {
    "flood": [
        {"id": 1, "text": "Charge mobile phone and power banks", "completed": False},
        {"id": 2, "text": "Store 3 days of drinking water", "completed": False},
        {"id": 3, "text": "Protect important documents in waterproof bags", "completed": False},
        {"id": 4, "text": "Keep medicines and first aid kit accessible", "completed": False},
        {"id": 5, "text": "Prepare emergency contacts list", "completed": False},
        {"id": 6, "text": "Identify evacuation routes", "completed": False},
        {"id": 7, "text": "Keep torch with fresh batteries", "completed": False},
        {"id": 8, "text": "Monitor official IMD weather warnings", "completed": False},
    ],
    "heatwave": [
        {"id": 1, "text": "Stock up on ORS packets and water", "completed": False},
        {"id": 2, "text": "Prepare light, cotton clothing", "completed": False},
        {"id": 3, "text": "Identify cool shelters or AC facilities", "completed": False},
        {"id": 4, "text": "Check on elderly neighbors and relatives", "completed": False},
        {"id": 5, "text": "Keep wet towels and ice packs ready", "completed": False},
        {"id": 6, "text": "Plan outdoor activities before 10 AM", "completed": False},
    ],
    "cyclone": [
        {"id": 1, "text": "Secure loose outdoor objects", "completed": False},
        {"id": 2, "text": "Board up or tape windows", "completed": False},
        {"id": 3, "text": "Charge all electronic devices", "completed": False},
        {"id": 4, "text": "Stock food, water, and medicines for 3 days", "completed": False},
        {"id": 5, "text": "Prepare emergency evacuation bag", "completed": False},
        {"id": 6, "text": "Know your nearest cyclone shelter", "completed": False},
        {"id": 7, "text": "Keep battery-powered radio ready", "completed": False},
    ],
    "lightning": [
        {"id": 1, "text": "Identify safe indoor locations", "completed": False},
        {"id": 2, "text": "Install surge protectors for electronics", "completed": False},
        {"id": 3, "text": "Plan to avoid open areas during storms", "completed": False},
        {"id": 4, "text": "Keep rubber-soled shoes accessible", "completed": False},
    ],
    "drought": [
        {"id": 1, "text": "Fix water leaks at home", "completed": False},
        {"id": 2, "text": "Store emergency water supply", "completed": False},
        {"id": 3, "text": "Install water-saving fixtures", "completed": False},
        {"id": 4, "text": "Plan water rationing schedule", "completed": False},
        {"id": 5, "text": "Set up rainwater harvesting if possible", "completed": False},
    ],
    "wildfire": [
        {"id": 1, "text": "Clear dry vegetation around home", "completed": False},
        {"id": 2, "text": "Prepare N95 masks for smoke", "completed": False},
        {"id": 3, "text": "Pack an evacuation go-bag", "completed": False},
        {"id": 4, "text": "Know your evacuation routes", "completed": False},
        {"id": 5, "text": "Keep fire extinguisher accessible", "completed": False},
    ],
}

@router.get("/")
def get_checklists(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    checklists = db.query(Checklist).filter(Checklist.user_id == current_user.id).all()
    if not checklists:
        result = {}
        for hazard, items in DEFAULT_CHECKLISTS.items():
            cl = Checklist(user_id=current_user.id, hazard_type=hazard, items=items)
            db.add(cl)
            result[hazard] = items
        db.commit()
        return result
    return {cl.hazard_type: cl.items for cl in checklists}

@router.put("/toggle")
def toggle_checklist_item(data: ChecklistUpdateRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    cl = db.query(Checklist).filter(Checklist.user_id == current_user.id, Checklist.hazard_type == data.hazard_type).first()
    if not cl:
        items = DEFAULT_CHECKLISTS.get(data.hazard_type, [])
        cl = Checklist(user_id=current_user.id, hazard_type=data.hazard_type, items=items)
        db.add(cl)
        db.commit()
        db.refresh(cl)

    items = cl.items
    for item in items:
        if item["id"] == data.item_id:
            item["completed"] = data.completed
            break
    cl.items = items
    cl.updated_at = datetime.utcnow()
    db.commit()
    return {"hazard_type": data.hazard_type, "items": items}
