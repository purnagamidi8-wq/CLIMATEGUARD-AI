from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional, List, Dict, Any
from datetime import datetime

# --- Auth & User Schemas ---
class UserBase(BaseModel):
    name: str
    email: EmailStr
    preferred_language: str = "en"
    profile_type: str = "general"

class UserRegister(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(UserBase):
    id: int
    is_admin: bool
    created_at: datetime

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class UserUpdate(BaseModel):
    name: Optional[str] = None
    preferred_language: Optional[str] = None
    profile_type: Optional[str] = None

# --- Location Schemas ---
class LocationBase(BaseModel):
    name: str
    latitude: float
    longitude: float
    city: Optional[str] = None
    state: Optional[str] = None
    district: Optional[str] = None
    country: str = "India"
    is_default: bool = False

class LocationCreate(LocationBase):
    pass

class LocationResponse(LocationBase):
    id: int
    user_id: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True

# --- Weather Schemas ---
class WeatherCurrent(BaseModel):
    temperature: float
    feels_like: float
    humidity: int
    wind_speed: float
    wind_gust: Optional[float] = None
    wind_direction: Optional[int] = None
    precipitation: float
    rain: Optional[float] = 0.0
    weather_code: int
    weather_text: str
    pressure: Optional[int] = None
    uv_index: Optional[float] = None
    soil_moisture: Optional[float] = None
    data_source: str = "Open-Meteo"
    data_mode: str = "LIVE"
    timestamp: str

class WeatherForecastHourly(BaseModel):
    times: List[str]
    temperatures: List[float]
    precipitation_probabilities: List[int]
    precipitations: List[float]
    wind_speeds: List[float]

class WeatherForecastDaily(BaseModel):
    dates: List[str]
    temp_max: List[float]
    temp_min: List[float]
    precipitation_sum: List[float]
    weather_codes: List[int]

class WeatherFullResponse(BaseModel):
    location: Dict[str, Any]
    current: WeatherCurrent
    hourly: WeatherForecastHourly
    daily: WeatherForecastDaily

# --- Risk Schemas ---
class HazardRiskDetail(BaseModel):
    hazard_type: str
    risk_score: float
    risk_level: str
    factors: List[str]
    explanation: str
    main_metrics: Dict[str, Any]

class RiskAssessmentResponse(BaseModel):
    location: Dict[str, Any]
    overall_risk_level: str
    overall_risk_score: float
    hazards: List[HazardRiskDetail]
    data_source: str
    data_mode: str
    timestamp: str

# --- Recommendation Schemas ---
class RecommendationItem(BaseModel):
    hazard_type: str
    profile_type: str
    language: str
    actions: List[str]
    summary: str
    source: str
    priority: str

# --- Checklist Schemas ---
class ChecklistItemSchema(BaseModel):
    id: int
    text: str
    completed: bool = False

class ChecklistResponse(BaseModel):
    hazard_type: str
    items: List[ChecklistItemSchema]
    updated_at: datetime

class ChecklistUpdateRequest(BaseModel):
    hazard_type: str
    item_id: int
    completed: bool

# --- Alert Schemas ---
class AlertResponse(BaseModel):
    id: int
    hazard_type: str
    severity: str
    title: str
    message: str
    language: str
    is_read: bool
    is_dismissed: bool = False
    source_feed: Optional[str] = "ClimateGuard AI Assessment"
    recommended_actions: Optional[List[str]] = None
    created_at: datetime

    class Config:
        from_attributes = True

# --- Chat Schemas ---
class ChatRequest(BaseModel):
    message: str
    location: Optional[Dict[str, Any]] = None
    language: Optional[str] = "en"
    profile_type: Optional[str] = "general"
    session_id: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    language: str
    sources: List[str]
    hazards_detected: List[str]
    recommendations: List[str]
    safe_places: Optional[List[Dict[str, Any]]] = None
    session_id: Optional[str] = None

# --- Trusted Contacts Schemas ---
class TrustedContactBase(BaseModel):
    name: str
    relationship: str
    phone: str
    email: Optional[EmailStr] = None
    priority: int = 1
    notify_on_alert: bool = True

    @field_validator('email', mode='before')
    @classmethod
    def sanitize_email(cls, v):
        if v == "" or (isinstance(v, str) and not v.strip()):
            return None
        return v

class TrustedContactCreate(TrustedContactBase):
    pass

class TrustedContactUpdate(BaseModel):
    name: Optional[str] = None
    relationship: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    priority: Optional[int] = None
    notify_on_alert: Optional[bool] = None

    @field_validator('email', mode='before')
    @classmethod
    def sanitize_email(cls, v):
        if v == "" or (isinstance(v, str) and not v.strip()):
            return None
        return v

class TrustedContactResponse(TrustedContactBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class SOSRequest(BaseModel):
    latitude: float
    longitude: float
    location_name: Optional[str] = "Current Location"
    current_risk: Optional[str] = "HIGH"
    hazard_type: Optional[str] = "general"
    custom_message: Optional[str] = None

class SOSResponse(BaseModel):
    status: str
    alert_id: str
    notified_contacts_count: int
    emergency_call_number: str = "112"
    shareable_url: str
    timestamp: str
    message: str

# --- Government Helpline Schemas ---
class HelplineResponse(BaseModel):
    id: int
    name: str
    number: str
    service_type: str
    scope: str
    state: Optional[str] = None
    district: Optional[str] = None
    description: Optional[str] = None
    source_url: str
    verified_at: str
    is_active: bool
    is_toll_free: bool

    class Config:
        from_attributes = True

# --- Safe Place Schemas ---
class SafePlaceResponse(BaseModel):
    id: int
    name: str
    place_type: str
    latitude: float
    longitude: float
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    capacity: Optional[int] = None
    current_occupancy: Optional[int] = None
    contact_phone: Optional[str] = None
    facilities: Optional[List[str]] = None
    hazard_suitability: Optional[List[str]] = None
    is_verified: bool
    is_open: bool
    distance_km: Optional[float] = None
    estimated_time_walk_min: Optional[int] = None
    estimated_time_drive_min: Optional[int] = None
    source: str

    class Config:
        from_attributes = True

# --- Notification Preference Schemas ---
class NotificationPreferenceBase(BaseModel):
    browser_notifications: bool = True
    sound_alerts: bool = True
    vibration_alerts: bool = True
    min_severity: str = "HIGH"
    monitored_hazards: List[str] = ["flood", "heatwave", "cyclone", "lightning", "drought", "wildfire"]
    quiet_hours_enabled: bool = False
    quiet_hours_start: str = "22:00"
    quiet_hours_end: str = "06:00"

class NotificationPreferenceUpdate(BaseModel):
    browser_notifications: Optional[bool] = None
    sound_alerts: Optional[bool] = None
    vibration_alerts: Optional[bool] = None
    min_severity: Optional[str] = None
    monitored_hazards: Optional[List[str]] = None
    quiet_hours_enabled: Optional[bool] = None
    quiet_hours_start: Optional[str] = None
    quiet_hours_end: Optional[str] = None

class NotificationPreferenceResponse(NotificationPreferenceBase):
    id: int
    user_id: int
    updated_at: datetime

    class Config:
        from_attributes = True
