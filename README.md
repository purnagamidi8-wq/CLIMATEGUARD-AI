# ClimateGuard AI — Advanced Climate Risk & Preparedness Agent

**A Multilingual, Location-Aware Climate Risk Information, Emergency Shelter & Preparedness Platform**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Python 3.10+](https://img.shields.io/badge/python-3.10+-blue.svg)](https://www.python.org/)
[![React 19](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-green.svg)](https://fastapi.tiangolo.com/)

---

## 🌟 Overview

**ClimateGuard AI** is a location-aware AI safety assistant that tells people:
> **What is happening, why it matters, what they should do, where they can seek protection, and whom they can contact — even when connectivity is limited.**

### 🚨 Core Philosophy: Detect → Analyze → Explain → Recommend → Protect → Connect

---

## ✨ Upgraded Features

### 1. 🌐 Online + Offline Alert System (PWA & IndexedDB)
- **Offline Resilience**: Automatically caches weather data, risk assessments, emergency contacts, safe shelters, and government helplines in **IndexedDB** & **Service Worker**.
- **Real-Time Network Awareness**: Live status pill (`🟢 ONLINE` / `🟠 OFFLINE — Showing last synchronized info at ...`).
- **Web App Manifest**: Full PWA installability across desktop and mobile devices.

### 2. 📍 Live Active Location & Continuous Tracking
- **Geolocation API**: Auto-detects coordinates via GPS (`navigator.geolocation.watchPosition`).
- **Reverse Geocoding**: Resolves city, district, and state with OpenStreetMap Nominatim and offline Indian city fallback.
- **Location Pipeline**: Active location dynamically drives weather, 6-hazard risk calculations, nearby shelters, AI context, and emergency map layers.

### 3. 🛡️ Nearby Protection & Safe Place Discovery
- **Multi-Hazard Shelter Engine**: Discovers cyclone shelters, relief camps, district hospitals, fire stations, and police control centers within 15 km.
- **Relevance Ranking**: Ranks candidates using **Distance + Resource Type + Hazard Relevance + Availability**.
- **1-Tap Navigation**: Open Google Maps directions with estimated walking and driving times.

### 4. 👥 Emergency Contact Enrollment & SOS Trigger
- **Trusted Contacts Directory**: Enroll family, friends, doctors, and neighbors with relationship and priority tags.
- **🚨 SOS Emergency Dispatch**: One-tap trigger generates emergency broadcast payloads, maps links with active coordinates, and initiates 112 emergency calls.
- **Share Location**: Instant WhatsApp, SMS, or clipboard copy with coordinates, risk level, and timestamp.

### 5. 🏛️ Government Emergency Helpline Directory
- **Verified Official Numbers**: National Emergency **112**, NDRF Disaster Helpline **1078**, State SDMA **1070**, District DDMA **1077**, Ambulance **108**, Fire **101**, Police **100**, Kisan Call Center **1551**, Women Safety **1091**, Childline **1098**.
- Sourced from Ministry of Home Affairs (MHA) & NDMA.

### 6. 🗣️ 7-Language Multilingual Localization
- **Supported Languages**:
  1. English (`en`)
  2. Telugu / తెలుగు (`te`)
  3. Hindi / हिन्दी (`hi`)
  4. Tamil / தமிழ் (`ta`)
  5. Kannada / ಕನ್ನಡ (`kn`)
  6. Malayalam / മലയാളം (`ml`)
  7. Marathi / मराठी (`mr`)
- Clean JSON dictionary architecture in `frontend/src/i18n/`.
- AI agent responses formulated in native script for all 7 languages.

### 7. 🖥️ Professional 3-Panel Redesign
- **Left Panel**: Active location status, GPS tracking toggle, navigation links, quick risk summary, emergency tools.
- **Center Working Area**: Climate scenario simulator, live weather card, multi-hazard gauges (0-100), Recharts threat distributions, nearby shelters carousel, and educational visual guides.
- **Right Panel**: AI safety assistant, active alerts, 1-tap **Call 112** speed dial, SOS broadcast, trusted contacts list.

### 8. 🎛️ 7 Interactive Demo Scenarios
1. 🌊 **Flood Emergency** (55mm/hr rain, saturated soil, severe risk 90/100)
2. 🌡️ **Extreme Heat** (45.2°C ambient, 49.5°C feels-like, UV 13)
3. 🌀 **Cyclone & Gale** (105 km/h winds, 145 km/h gusts)
4. ⚡ **Severe Lightning Storm** (Thunderstorm with heavy hail, WMO Code 99)
5. 🌾 **Drought Spell** (0mm rain, 0.04 soil moisture deficit)
6. 🔥 **Wildfire Hazard** (41°C, 14% humidity, high wind)
7. ☀️ **Normal Weather** (Mild 28.5°C baseline)

---

## 🏗️ Architecture

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                             FRONTEND (React 19 + Vite)                      │
│                                                                             │
│  ┌───────────────────────┬─────────────────────────┬─────────────────────┐  │
│  │ LEFT PANEL            │ CENTER MAIN AREA        │ RIGHT PANEL         │  │
│  │ • Active Location     │ • Scenario Simulator    │ • AI Assistant      │  │
│  │ • GPS Tracker Toggle  │ • Live Weather Card     │ • Active Warnings   │  │
│  │ • Main Navigation     │ • 6 Risk Gauges (0-100) │ • 1-Tap Call 112    │  │
│  │ • Quick Risk Summary  │ • Recharts Threat Chart │ • SOS Broadcast     │  │
│  │ • Quick Actions       │ • Nearby Shelters       │ • Helplines Drawer  │  │
│  │                       │ • Visual Demo Guides    │ • Trusted Contacts  │  │
│  └───────────────────────┴─────────────────────────┴─────────────────────┘  │
│                                                                             │
│  Offline Resilience: Service Worker • IndexedDB Cache • Manifest.json       │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ HTTP REST APIs
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          FASTAPI BACKEND (Python 3.10+)                     │
│                                                                             │
│  API Layer (14 Routers):                                                    │
│  /auth • /weather • /risk • /chat • /locations • /alerts • /checklists     │
│  /emergency • /admin • /recommendations • /trusted-contacts • /helplines   │
│  /safe-places • /notifications                                             │
│                                                                             │
│  Services & Intelligence:                                                   │
│  • ClimateRiskEngine: Deterministic 0-100 scoring across 6 hazards          │
│  • SafePlacesService: Distance + Resource Type + Hazard Relevance ranking   │
│  • HelplineService: Verified MHA/NDMA emergency numbers directory           │
│  • ClimateAgent: Gemini API + RAG Safety Knowledge Base (ChromaDB)          │
│  • WeatherService: Open-Meteo live API + 7 simulated demo scenarios        │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### 1. Backend

```bash
cd backend
# Windows:
venv\Scripts\activate
# Start FastAPI server
uvicorn app.main:app --reload --port 8000
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## 🔒 Privacy & Data Ethics

- Location access requires explicit user permission.
- Emergency SOS notifications and location sharing are triggered **only by explicit user action**.
- No real-time GPS coordinates are leaked or transmitted to third parties.
- Works 100% in **Demo Mode** without external API keys or tracking.

---

## ⚖️ Disclaimer

*ClimateGuard AI is an educational project and demonstration prototype. It does not replace official meteorological warnings or emergency directives issued by the National Disaster Management Authority (NDMA), India Meteorological Department (IMD), or local administration.*
