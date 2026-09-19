# ClimateGuard AI — System Architecture

> Last Updated: September 2026 (Post Advanced-Upgrade)

---

## Overview

ClimateGuard AI is a multilingual, location-aware climate risk information and emergency preparedness platform built as a student/hackathon demonstration project. It consists of a React 18 + Vite PWA frontend, a FastAPI backend, a SQLite database (PostgreSQL-ready), and a Gemini AI agent enhanced with RAG.

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend Framework | React 18 + Vite 8 |
| UI Styling | Tailwind CSS 4 |
| Charts | Recharts |
| Maps | Leaflet + react-leaflet 5 |
| State / Context | React Context API |
| Offline Storage | IndexedDB (via custom offlineStorage.js) |
| PWA | Web App Manifest + Service Worker (sw.js) |
| Backend Framework | FastAPI (Python 3.10+) |
| ORM | SQLAlchemy |
| Validation | Pydantic v2 |
| Database | SQLite (PostgreSQL-ready) |
| AI Agent | Google Gemini 2.0 Flash (google-genai SDK) |
| Vector Store | ChromaDB (in-process, all-MiniLM-L6-v2) |
| Weather Data | Open-Meteo (no API key required) |
| Geocoding | Nominatim (OpenStreetMap) |
| Emergency Facilities | OSM Overpass API |
| Auth | JWT (python-jose) + bcrypt |

---

## Frontend Architecture

```
frontend/
├── index.html                   ← PWA manifest link, theme-color, og meta
├── public/
│   ├── manifest.json            ← PWA Web App Manifest
│   ├── sw.js                    ← Service Worker (network-first + cache)
│   └── images/                  ← 7 SVG hazard illustration assets
│       ├── flood-preparedness.svg
│       ├── heatwave-safety.svg
│       ├── cyclone-safety.svg
│       ├── lightning-safety.svg
│       ├── drought-preparedness.svg
│       ├── wildfire-safety.svg
│       └── normal-weather.svg
└── src/
    ├── main.jsx                 ← Entry point + service worker registration
    ├── App.jsx                  ← Router + global modals + MobileNav
    ├── i18n/                    ← Translation dictionaries (7 languages)
    │   ├── en.json  hi.json  te.json  ta.json  kn.json  ml.json  mr.json
    ├── contexts/
    │   ├── AuthContext.jsx      ← JWT auth + updateProfile
    │   ├── LanguageContext.jsx  ← 7-language i18n + t() hook
    │   ├── LocationContext.jsx  ← GPS watchPosition + reverse geocoding
    │   └── OfflineContext.jsx   ← Online/offline state + last sync time
    ├── services/
    │   ├── api.js               ← Axios client + all API endpoint wrappers
    │   └── offlineStorage.js    ← IndexedDB wrapper (get/set/clear by key)
    ├── components/
    │   ├── layout/
    │   │   ├── Navbar.jsx       ← SOS button, 7-lang selector, online pill
    │   │   ├── Sidebar.jsx      ← Location panel, nav links, risk summary
    │   │   ├── RightPanel.jsx   ← AI assistant, alerts, 112 speed dial
    │   │   └── MobileNav.jsx    ← Sticky bottom bar with floating SOS
    │   ├── offline/
    │   │   └── OfflineBanner.jsx← Offline status bar with last-sync time
    │   ├── emergency/
    │   │   ├── SOSModal.jsx     ← SOS location sharing + 112 dial
    │   │   ├── HelplinesModal.jsx← Searchable 10-helpline directory
    │   │   ├── TrustedContactsModal.jsx ← Contact CRUD + SOS trigger
    │   │   └── ShareLocationModal.jsx ← WhatsApp/SMS location share
    │   ├── risk/
    │   │   └── DemoScenarioSelector.jsx ← 7 scenario buttons (dev demo)
    │   └── map/
    │       └── SafePlacesDrawer.jsx ← Shelter list with directions
    └── pages/
        ├── Landing.jsx          ← Hero + features grid
        ├── Login.jsx            ← JWT login form (multilingual)
        ├── Register.jsx         ← Registration + 7-language selection
        ├── Dashboard.jsx        ← 3-panel layout: Sidebar | Main | Right
        ├── RiskMap.jsx          ← Leaflet + safe place markers + drawers
        ├── Chat.jsx             ← AI agent chat with structured cards
        ├── Alerts.jsx           ← Active/history alert tabs
        ├── Checklists.jsx       ← Hazard-specific NDMA checklists
        ├── Profile.jsx          ← Language + notification preferences
        └── Methodology.jsx      ← Risk scoring explainer + disclaimer
```

### 3-Panel Dashboard Layout

```
┌──────────────────────────────────────────────────────────────────────┐
│                            Navbar (top)                              │
│          [Language] [Online●] [🆘 SOS] [☎ Helplines] [Profile]      │
├───────────────┬──────────────────────────┬───────────────────────────┤
│  Sidebar      │   Main Content           │   Right Panel             │
│  (w-72)       │   (flex-1)               │   (w-80)                  │
│               │                          │                           │
│ 📍 Location   │ 🌊 Hazard Illustration   │ 🤖 AI Quick Chat          │
│ GPS Toggle    │ WeatherCard              │ Response Cards            │
│               │ Risk Gauges (6)          │ SafePlaces Cards          │
│ Nav Links     │ Forecast Charts          │                           │
│ Dashboard     │ Demo Scenario Selector   │ 🔔 Alert Feed             │
│ Map           │                          │ Active Alerts             │
│ Chat          │                          │ Dismiss Buttons           │
│ Alerts        │                          │                           │
│ Checklists    │                          │ ☎ 112 Speed Dial          │
│               │                          │                           │
├───────────────┴──────────────────────────┴───────────────────────────┤
│          MobileNav (md:hidden — sticky bottom bar)                   │
│   [🏠 Home] [🗺️ Map]  [🆘 SOS]  [🤖 AI]  [🔔 Alerts]              │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Backend Architecture

```
backend/
├── app/
│   ├── main.py                  ← FastAPI app + 14 router mounts + CORS
│   ├── core/
│   │   ├── config.py            ← Settings (env vars, GEMINI_API_KEY, etc.)
│   │   └── security.py          ← JWT encode/decode, bcrypt hash
│   ├── models/
│   │   └── __init__.py          ← 11 SQLAlchemy models (see below)
│   ├── schemas/
│   │   └── __init__.py          ← 25+ Pydantic v2 schemas
│   ├── api/                     ← 14 FastAPI Routers
│   │   ├── auth.py              ← /api/auth/* — login, register, me
│   │   ├── weather.py           ← /api/weather/* — current, forecast
│   │   ├── risk.py              ← /api/risk/* — assess, history
│   │   ├── alerts.py            ← /api/alerts/* — list, history, dismiss
│   │   ├── chat.py              ← /api/chat/* — AI agent endpoint
│   │   ├── checklists.py        ← /api/checklists/* — get, toggle
│   │   ├── profile.py           ← /api/profile/* — get, update
│   │   ├── trusted_contacts.py  ← /api/trusted-contacts/* — CRUD + SOS
│   │   ├── helplines.py         ← /api/helplines/* — directory + quick
│   │   ├── safe_places.py       ← /api/safe-places/* — nearby query
│   │   ├── notifications.py     ← /api/notifications/* — prefs GET/PUT
│   │   ├── users.py             ← /api/users/*
│   │   ├── locations.py         ← /api/locations/*
│   │   └── recommendations.py  ← /api/recommendations/*
│   ├── services/
│   │   ├── weather_service.py   ← Open-Meteo fetch + 7 demo scenarios
│   │   ├── risk_engine.py       ← Deterministic threshold risk scoring
│   │   ├── ai_service.py        ← Gemini API wrapper
│   │   ├── rag_service.py       ← ChromaDB indexing + similarity search
│   │   ├── geocoding_service.py ← Nominatim reverse geocoding
│   │   ├── alert_service.py     ← Alert generation + persistence
│   │   ├── safe_places_service.py ← Overpass API + fallback seed data
│   │   ├── helpline_service.py  ← 10 verified government helplines
│   │   └── emergency_service.py ← SOS trigger + contact notification
│   └── agents/
│       └── climate_agent.py     ← Gemini agent with 7-language prompting
├── tests/
│   └── test_climate_system.py   ← 8/8 pytest unit tests
└── requirements.txt
```

### Database Models (11 SQLAlchemy Tables)

| Model | Purpose |
|-------|---------|
| `User` | Authentication, language preference, profile type |
| `Location` | Saved user locations with coordinates |
| `WeatherData` | Cached weather observations |
| `RiskAssessment` | Historical risk score records |
| `Alert` | Generated hazard alerts |
| `ChecklistItem` | NDMA preparedness checklist items per hazard type |
| `UserChecklistProgress` | Per-user checklist completion state |
| `Recommendation` | AI-generated personalized recommendations |
| `TrustedContact` | Emergency contacts for SOS notifications |
| `GovernmentHelpline` | 10 verified helplines (112, 1078, 1070, etc.) |
| `SafePlace` | Discovered emergency shelters/hospitals |
| `NotificationPreference` | Per-user alert channel preferences |

---

## API Route Map (20+ Endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | System health check |
| POST | `/api/auth/register` | New user registration |
| POST | `/api/auth/login` | JWT token generation |
| GET | `/api/auth/me` | Current user profile |
| GET | `/api/weather/current` | Live weather data |
| GET | `/api/weather/forecast` | 7-day forecast |
| POST | `/api/risk/assess` | Full risk assessment |
| GET | `/api/risk/history` | Historical risk records |
| GET | `/api/alerts/active` | Current active alerts |
| GET | `/api/alerts/history` | Dismissed/past alerts |
| POST | `/api/alerts/{id}/dismiss` | Dismiss an alert |
| POST | `/api/chat/message` | AI agent conversation |
| GET | `/api/checklists` | All checklists for user |
| POST | `/api/checklists/toggle` | Toggle checklist item |
| GET | `/api/safe-places/nearby` | Nearby shelters (Overpass) |
| GET | `/api/helplines` | All government helplines |
| GET | `/api/helplines/emergency-quick` | Top-5 speed dial numbers |
| GET | `/api/trusted-contacts` | User's emergency contacts |
| POST | `/api/trusted-contacts` | Add new contact |
| POST | `/api/trusted-contacts/sos` | Trigger SOS to all contacts |
| GET/PUT | `/api/notifications/preferences` | Alert preferences |

---

## Data Flow

```
User Device (Browser)
      │
      ▼
LocationContext (GPS/Permission)
      │ coordinates
      ▼
api.js → /api/risk/assess
      │
      ▼
FastAPI Backend
  weather_service.py
    ├─ Open-Meteo API (live weather)
    │   └─ temperature, wind, precipitation, soil moisture, UV, WMO code
    └─ Demo Scenario Override (7 scenarios)
         │
         ▼
  risk_engine.assess_all()
    ├─ flood_score()
    ├─ heatwave_score()
    ├─ cyclone_score()
    ├─ lightning_score()
    ├─ drought_score()
    └─ wildfire_score()
         │ top hazard identified
         ▼
  safe_places_service.get_nearby()
    ├─ Overpass API (hospitals, shelters, fire, police)
    └─ Fallback seed data (Visakhapatnam)
         │
         ▼
  climate_agent.py (Gemini 2.0 Flash)
    ├─ RAG context: ChromaDB similarity search on NDMA docs
    ├─ Safe places context injected
    └─ 7-language structured prompt → Why/What/Where/Who sections
         │
         ▼
Frontend Rendering
  Dashboard (3-panel) ← WeatherCard + 6 RiskGauges + Forecast charts
  RiskMap ← Leaflet markers for each safe place
  Chat ← Structured response with source citations
  Alerts ← Active + history tabs
  Checklists ← NDMA-verified per-hazard checklist
```

---

## Multilingual Support (7 Languages)

| Code | Language | Script |
|------|----------|--------|
| `en` | English | Latin |
| `hi` | Hindi | Devanagari |
| `te` | Telugu | Telugu script |
| `ta` | Tamil | Tamil script |
| `kn` | Kannada | Kannada script |
| `ml` | Malayalam | Malayalam script |
| `mr` | Marathi | Devanagari |

Language selection is persisted in `localStorage`. The AI agent is prompted in the user's chosen language. All UI strings are driven by `t('key')` from `LanguageContext`.

---

## PWA / Offline Architecture

- **`manifest.json`** — Installable web app with `standalone` display and blue theme
- **`sw.js`** — Service worker: network-first for API calls, stale-while-revalidate for static assets
- **`offlineStorage.js`** — IndexedDB wrapper for caching last weather/risk/alerts data
- **`OfflineContext.jsx`** — Tracks `navigator.onLine`, fires events on connect/disconnect
- **`OfflineBanner.jsx`** — Sticky notification bar when device is offline

---

## Emergency Features

| Feature | Implementation |
|---------|---------------|
| SOS Button | Navbar (all screens) + MobileNav floating button |
| SOS Modal | Location capture + 112 speed dial + contact notification |
| Helplines Directory | 10 NDMA/MHA-verified numbers with tel: links |
| Safe Places | Overpass API + distance-ranked results |
| Trusted Contacts | CRUD via `/api/trusted-contacts` |
| Alert Sound | Preference stored (audio playback: future enhancement) |

---

## Running Locally

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
# Create backend/.env with GEMINI_API_KEY=your_key
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# Opens at http://localhost:5173/
```

### Tests
```bash
cd backend
venv\Scripts\python -m pytest tests/ -v
# 8/8 tests pass
```
