from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import Base, engine
from app.core.config import settings
from app.rag.vector_store import rag_store

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("[ClimateGuard AI] Starting up...")
    Base.metadata.create_all(bind=engine)
    print("[ClimateGuard AI] Database tables created / verified.")
    try:
        rag_store.initialize()
        print("[ClimateGuard AI] RAG Knowledge Base initialized.")
    except Exception as e:
        print(f"[ClimateGuard AI] RAG initialization note: {e}")
    yield
    # Shutdown
    print("[ClimateGuard AI] Shutting down.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="A Multilingual, Location-Aware Climate Risk Information, Emergency Shelter & Preparedness Agent",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.api import (
    auth,
    weather,
    risk,
    chat,
    locations,
    alerts,
    checklists,
    emergency,
    admin,
    recommendations,
    trusted_contacts,
    helplines,
    safe_places,
    notifications
)

app.include_router(auth.router)
app.include_router(weather.router)
app.include_router(risk.router)
app.include_router(chat.router)
app.include_router(locations.router)
app.include_router(alerts.router)
app.include_router(checklists.router)
app.include_router(emergency.router)
app.include_router(admin.router)
app.include_router(recommendations.router)
app.include_router(trusted_contacts.router)
app.include_router(helplines.router)
app.include_router(safe_places.router)
app.include_router(notifications.router)

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "ClimateGuard AI",
        "version": settings.VERSION,
        "demo_mode": settings.DEMO_MODE,
        "features": [
            "live_location_awareness",
            "deterministic_risk_engine",
            "ai_rag_safety_guidance",
            "safe_places_discovery",
            "verified_government_helplines",
            "trusted_contacts_sos",
            "multilingual_7_languages",
            "offline_pwa_resilience"
        ]
    }

@app.get("/")
def root():
    return {
        "message": "Welcome to ClimateGuard AI API v2.0",
        "docs": "/docs",
        "health": "/api/health"
    }
