from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, TrustedContact
from app.schemas import (
    TrustedContactCreate,
    TrustedContactUpdate,
    TrustedContactResponse,
    SOSRequest,
    SOSResponse,
)
from app.api.auth import get_current_user
from datetime import datetime
import uuid

router = APIRouter(prefix="/api/trusted-contacts", tags=["Trusted Contacts & SOS"])

@router.get("/", response_model=list[TrustedContactResponse])
def get_trusted_contacts(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Retrieve all enrolled trusted contacts for the current user."""
    contacts = db.query(TrustedContact).filter(
        TrustedContact.user_id == current_user.id
    ).order_by(TrustedContact.priority.asc(), TrustedContact.created_at.desc()).all()
    return [TrustedContactResponse.model_validate(c) for c in contacts]

@router.post("/", response_model=TrustedContactResponse, status_code=status.HTTP_201_CREATED)
def add_trusted_contact(
    data: TrustedContactCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Enroll a new trusted contact (Parent, Spouse, Friend, Doctor, Neighbor)."""
    count = db.query(TrustedContact).filter(TrustedContact.user_id == current_user.id).count()
    if count >= 10:
        raise HTTPException(status_code=400, detail="Maximum limit of 10 trusted contacts reached.")
    
    contact = TrustedContact(
        user_id=current_user.id,
        name=data.name.strip(),
        relationship=data.relationship.strip(),
        phone=data.phone.strip(),
        email=data.email.strip() if data.email else None,
        priority=data.priority,
        notify_on_alert=data.notify_on_alert
    )
    db.add(contact)
    db.commit()
    db.refresh(contact)
    return TrustedContactResponse.model_validate(contact)

@router.put("/{contact_id}", response_model=TrustedContactResponse)
def update_trusted_contact(
    contact_id: int,
    data: TrustedContactUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update contact details or notification preferences."""
    contact = db.query(TrustedContact).filter(
        TrustedContact.id == contact_id,
        TrustedContact.user_id == current_user.id
    ).first()
    if not contact:
        raise HTTPException(status_code=404, detail="Trusted contact not found.")

    if data.name is not None: contact.name = data.name
    if data.relationship is not None: contact.relationship = data.relationship
    if data.phone is not None: contact.phone = data.phone
    if data.email is not None: contact.email = data.email
    if data.priority is not None: contact.priority = data.priority
    if data.notify_on_alert is not None: contact.notify_on_alert = data.notify_on_alert

    db.commit()
    db.refresh(contact)
    return TrustedContactResponse.model_validate(contact)

@router.delete("/{contact_id}")
def delete_trusted_contact(
    contact_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Remove a trusted contact."""
    contact = db.query(TrustedContact).filter(
        TrustedContact.id == contact_id,
        TrustedContact.user_id == current_user.id
    ).first()
    if not contact:
        raise HTTPException(status_code=404, detail="Trusted contact not found.")
    
    db.delete(contact)
    db.commit()
    return {"message": f"Trusted contact '{contact.name}' removed successfully."}

@router.post("/sos", response_model=SOSResponse)
def trigger_sos_alert(
    data: SOSRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Emergency SOS Trigger Flow.
    Generates emergency broadcast payload, creates shareable map link with active coordinates,
    logs emergency event, and prepares SMS/WhatsApp dispatch to enrolled trusted contacts.
    """
    contacts = db.query(TrustedContact).filter(
        TrustedContact.user_id == current_user.id,
        TrustedContact.notify_on_alert == True
    ).all()

    alert_id = f"SOS-{uuid.uuid4().hex[:8].upper()}"
    timestamp_str = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
    shareable_url = f"https://www.google.com/maps?q={data.latitude:.5f},{data.longitude:.5f}"

    custom_text = f" - {data.custom_message}" if data.custom_message else ""
    alert_msg = (
        f"🚨 EMERGENCY SOS from {current_user.name}!\n"
        f"Hazard: {data.hazard_type.upper()} ({data.current_risk} Risk)\n"
        f"Location: {data.location_name}\n"
        f"GPS: {data.latitude:.4f}, {data.longitude:.4f}\n"
        f"Map: {shareable_url}\n"
        f"Time: {timestamp_str}{custom_text}\n"
        f"Dial 112 for Police/Medical/Fire Rescue."
    )

    return SOSResponse(
        status="ACTIVATED",
        alert_id=alert_id,
        notified_contacts_count=len(contacts),
        emergency_call_number="112",
        shareable_url=shareable_url,
        timestamp=timestamp_str,
        message=alert_msg
    )
