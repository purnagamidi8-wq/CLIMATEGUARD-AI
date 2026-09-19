from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, Alert
from app.schemas import AlertResponse
from app.api.auth import get_current_user
from app.services.alert_service import alert_service
from app.services.weather_service import weather_service
from app.risk.engine import ClimateRiskEngine
from datetime import datetime
from typing import Optional

router = APIRouter(prefix="/api/alerts", tags=["Alerts"])
risk_engine = ClimateRiskEngine()

@router.get("/", response_model=list[AlertResponse])
def get_user_alerts(
    current_user: User = Depends(get_current_user),
    include_dismissed: bool = Query(False),
    db: Session = Depends(get_db)
):
    """Retrieve active in-app alerts for authenticated user."""
    query = db.query(Alert).filter(Alert.user_id == current_user.id)
    if not include_dismissed:
        query = query.filter(Alert.is_dismissed == False)
    alerts = query.order_by(Alert.created_at.desc()).limit(30).all()
    return [AlertResponse.model_validate(a) for a in alerts]

@router.get("/history", response_model=list[AlertResponse])
def get_alert_history(
    current_user: User = Depends(get_current_user),
    hazard_type: Optional[str] = Query(None),
    severity: Optional[str] = Query(None),
    limit: int = Query(50),
    db: Session = Depends(get_db)
):
    """Retrieve full historical log of disaster risk alerts."""
    query = db.query(Alert).filter(Alert.user_id == current_user.id)
    if hazard_type:
        query = query.filter(Alert.hazard_type == hazard_type)
    if severity:
        query = query.filter(Alert.severity == severity)
    
    alerts = query.order_by(Alert.created_at.desc()).limit(limit).all()
    return [AlertResponse.model_validate(a) for a in alerts]

@router.get("/check")
async def check_alerts(
    lat: float = Query(...),
    lon: float = Query(...),
    demo: bool = Query(False),
    scenario: str = Query("flood")
):
    """
    Generate live alerts for specific location coordinates based on risk evaluation.
    Distinguishes official warning guidance from ClimateGuard AI Risk Assessment.
    """
    weather_data = await weather_service.get_weather(lat, lon, demo_mode=demo, scenario=scenario)
    hazards = risk_engine.assess_all(weather_data)
    alerts = alert_service.generate_alerts(hazards)
    return {
        "alerts": alerts,
        "total": len(alerts),
        "data_mode": weather_data.get("current", {}).get("data_mode", "LIVE"),
        "timestamp": datetime.utcnow().isoformat()
    }

@router.put("/{alert_id}/read")
def mark_alert_read(
    alert_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    alert = db.query(Alert).filter(Alert.id == alert_id, Alert.user_id == current_user.id).first()
    if alert:
        alert.is_read = True
        db.commit()
    return {"message": "Alert marked as read"}

@router.put("/{alert_id}/dismiss")
def dismiss_alert(
    alert_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    alert = db.query(Alert).filter(Alert.id == alert_id, Alert.user_id == current_user.id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    alert.is_dismissed = True
    db.commit()
    return {"message": "Alert dismissed from active view"}
