from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship as orm_relationship
from datetime import datetime
from app.database.session import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    preferred_language = Column(String(10), default="en")
    profile_type = Column(String(50), default="general")
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    locations = orm_relationship("Location", back_populates="user", cascade="all, delete-orphan")
    alerts = orm_relationship("Alert", back_populates="user", cascade="all, delete-orphan")
    checklists = orm_relationship("Checklist", back_populates="user", cascade="all, delete-orphan")
    chat_messages = orm_relationship("ChatMessage", back_populates="user", cascade="all, delete-orphan")
    trusted_contacts = orm_relationship("TrustedContact", back_populates="user", cascade="all, delete-orphan")
    notification_preference = orm_relationship("NotificationPreference", back_populates="user", uselist=False, cascade="all, delete-orphan")

class Location(Base):
    __tablename__ = "locations"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    name = Column(String(150), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    city = Column(String(100), nullable=True)
    state = Column(String(100), nullable=True)
    district = Column(String(100), nullable=True)
    country = Column(String(100), default="India")
    is_default = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = orm_relationship("User", back_populates="locations")
    risk_assessments = orm_relationship("RiskAssessment", back_populates="location", cascade="all, delete-orphan")
    alerts = orm_relationship("Alert", back_populates="location", cascade="all, delete-orphan")

class RiskAssessment(Base):
    __tablename__ = "risk_assessments"
    id = Column(Integer, primary_key=True, index=True)
    location_id = Column(Integer, ForeignKey("locations.id", ondelete="SET NULL"), nullable=True)
    hazard_type = Column(String(50), nullable=False)
    risk_score = Column(Float, nullable=False)
    risk_level = Column(String(20), nullable=False)
    factors = Column(JSON, nullable=True)
    raw_weather = Column(JSON, nullable=True)
    data_source = Column(String(50), default="Open-Meteo")
    data_timestamp = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    location = orm_relationship("Location", back_populates="risk_assessments")
    recommendations = orm_relationship("Recommendation", back_populates="risk_assessment", cascade="all, delete-orphan")

class Recommendation(Base):
    __tablename__ = "recommendations"
    id = Column(Integer, primary_key=True, index=True)
    risk_assessment_id = Column(Integer, ForeignKey("risk_assessments.id", ondelete="CASCADE"), nullable=True)
    profile_type = Column(String(50), default="general")
    language = Column(String(10), default="en")
    recommendation_text = Column(Text, nullable=False)
    source = Column(String(150), default="NDMA Guidelines")
    created_at = Column(DateTime, default=datetime.utcnow)
    
    risk_assessment = orm_relationship("RiskAssessment", back_populates="recommendations")

class Alert(Base):
    __tablename__ = "alerts"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    location_id = Column(Integer, ForeignKey("locations.id", ondelete="CASCADE"), nullable=True)
    hazard_type = Column(String(50), nullable=False)
    severity = Column(String(20), nullable=False)
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    language = Column(String(10), default="en")
    is_read = Column(Boolean, default=False)
    is_dismissed = Column(Boolean, default=False)
    source_feed = Column(String(100), default="ClimateGuard AI Assessment")
    recommended_actions = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = orm_relationship("User", back_populates="alerts")
    location = orm_relationship("Location", back_populates="alerts")

class Checklist(Base):
    __tablename__ = "checklists"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    hazard_type = Column(String(50), nullable=False)
    items = Column(JSON, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    user = orm_relationship("User", back_populates="checklists")

class ChatMessage(Base):
    __tablename__ = "chat_messages"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    session_id = Column(String(100), index=True, nullable=True)
    role = Column(String(50), nullable=False)
    message = Column(Text, nullable=False)
    metadata_json = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = orm_relationship("User", back_populates="chat_messages")

class KnowledgeDocument(Base):
    __tablename__ = "knowledge_documents"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    source = Column(String(150), nullable=False)
    hazard_type = Column(String(50), nullable=False)
    language = Column(String(10), default="en")
    content = Column(Text, nullable=False)
    metadata_json = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class TrustedContact(Base):
    __tablename__ = "trusted_contacts"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(100), nullable=False)
    relationship = Column(String(50), nullable=False)  # Parent, Spouse, Sibling, Friend, Doctor, Neighbor
    phone = Column(String(20), nullable=False)
    email = Column(String(255), nullable=True)
    priority = Column(Integer, default=1)  # 1: High, 2: Medium, 3: Standard
    notify_on_alert = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = orm_relationship("User", back_populates="trusted_contacts")

class GovernmentHelpline(Base):
    __tablename__ = "government_helplines"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    number = Column(String(30), nullable=False)
    service_type = Column(String(50), nullable=False)  # emergency, disaster, medical, fire, police, women, child, weather
    scope = Column(String(20), default="National")  # National, State, District
    state = Column(String(100), nullable=True)
    district = Column(String(100), nullable=True)
    description = Column(Text, nullable=True)
    source_url = Column(String(255), default="Ministry of Home Affairs / NDMA")
    verified_at = Column(String(50), default="2026-01-15")
    is_active = Column(Boolean, default=True)
    is_toll_free = Column(Boolean, default=True)

class SafePlace(Base):
    __tablename__ = "safe_places"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    place_type = Column(String(50), nullable=False)  # emergency_shelter, relief_camp, cyclone_shelter, hospital, fire_station, police_station, elevated_ground
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    address = Column(String(255), nullable=True)
    city = Column(String(100), nullable=True)
    state = Column(String(100), nullable=True)
    capacity = Column(Integer, nullable=True)
    current_occupancy = Column(Integer, nullable=True)
    contact_phone = Column(String(30), nullable=True)
    facilities = Column(JSON, nullable=True)  # ["First Aid", "Clean Drinking Water", "Emergency Power", "Food Packets"]
    hazard_suitability = Column(JSON, nullable=True)  # ["flood", "cyclone", "heatwave"]
    is_verified = Column(Boolean, default=True)
    is_open = Column(Boolean, default=True)
    source = Column(String(100), default="OpenStreetMap / Local Administration")
    created_at = Column(DateTime, default=datetime.utcnow)

class NotificationPreference(Base):
    __tablename__ = "notification_preferences"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    browser_notifications = Column(Boolean, default=True)
    sound_alerts = Column(Boolean, default=True)
    vibration_alerts = Column(Boolean, default=True)
    min_severity = Column(String(20), default="HIGH")  # MODERATE, HIGH, SEVERE
    monitored_hazards = Column(JSON, default=lambda: ["flood", "heatwave", "cyclone", "lightning", "drought", "wildfire"])
    quiet_hours_enabled = Column(Boolean, default=False)
    quiet_hours_start = Column(String(10), default="22:00")
    quiet_hours_end = Column(String(10), default="06:00")
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    user = orm_relationship("User", back_populates="notification_preference")
