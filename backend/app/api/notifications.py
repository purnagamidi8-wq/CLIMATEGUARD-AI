from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, NotificationPreference
from app.schemas import (
    NotificationPreferenceBase,
    NotificationPreferenceUpdate,
    NotificationPreferenceResponse,
)
from app.api.auth import get_current_user

router = APIRouter(prefix="/api/notifications", tags=["Notification Preferences"])

@router.get("/preferences", response_model=NotificationPreferenceResponse)
def get_notification_preferences(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current user notification and alert delivery preferences."""
    pref = db.query(NotificationPreference).filter(
        NotificationPreference.user_id == current_user.id
    ).first()
    
    if not pref:
        pref = NotificationPreference(
            user_id=current_user.id,
            browser_notifications=True,
            sound_alerts=True,
            vibration_alerts=True,
            min_severity="HIGH",
            monitored_hazards=["flood", "heatwave", "cyclone", "lightning", "drought", "wildfire"],
            quiet_hours_enabled=False
        )
        db.add(pref)
        db.commit()
        db.refresh(pref)

    return NotificationPreferenceResponse.model_validate(pref)

@router.put("/preferences", response_model=NotificationPreferenceResponse)
def update_notification_preferences(
    data: NotificationPreferenceUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update notification settings: sound, vibration, minimum severity, quiet hours."""
    pref = db.query(NotificationPreference).filter(
        NotificationPreference.user_id == current_user.id
    ).first()
    
    if not pref:
        pref = NotificationPreference(user_id=current_user.id)
        db.add(pref)

    if data.browser_notifications is not None: pref.browser_notifications = data.browser_notifications
    if data.sound_alerts is not None: pref.sound_alerts = data.sound_alerts
    if data.vibration_alerts is not None: pref.vibration_alerts = data.vibration_alerts
    if data.min_severity is not None: pref.min_severity = data.min_severity
    if data.monitored_hazards is not None: pref.monitored_hazards = data.monitored_hazards
    if data.quiet_hours_enabled is not None: pref.quiet_hours_enabled = data.quiet_hours_enabled
    if data.quiet_hours_start is not None: pref.quiet_hours_start = data.quiet_hours_start
    if data.quiet_hours_end is not None: pref.quiet_hours_end = data.quiet_hours_end

    db.commit()
    db.refresh(pref)
    return NotificationPreferenceResponse.model_validate(pref)
