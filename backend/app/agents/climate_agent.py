from typing import Dict, Any, Optional, List
from app.core.config import settings
from app.services.weather_service import weather_service
from app.services.recommendation_service import recommendation_service
from app.services.safe_places_service import safe_places_service
from app.risk.engine import ClimateRiskEngine
from app.rag.vector_store import rag_store

risk_engine = ClimateRiskEngine()

SYSTEM_PROMPT = """You are ClimateGuard AI, an authoritative, empathetic, and safety-conscious climate risk and disaster preparedness AI agent.

Your role:
- Provide clear, actionable climate risk analysis, structured explanations, and life-saving preparedness recommendations.
- Answer user queries about active climate hazards (floods, heatwaves, cyclones, lightning, drought, wildfire).
- Adapt guidance to user profiles (farmer, student, elderly, business, general public).
- Deliver responses strictly in the requested target language (English, Telugu, Hindi, Tamil, Kannada, Malayalam, Marathi).
- Explicitly structure explanations into:
  1. ⚠️ Risk Assessment & Key Drivers (Why does this risk exist?)
  2. 📋 Immediate Action Checklist (What should you do step-by-step?)
  3. 🛡️ Nearby Protection & Shelter Advice (Where to seek safety?)
  4. 📞 Emergency Helpline & Source Citations (Who to contact?)

Critical Safety Guidelines:
- NEVER fabricate weather data or risk levels.
- NEVER claim absolute prediction certainty.
- Explicitly emphasize: "Always follow mandatory evacuation orders and official instructions from NDMA, IMD, and District Administration."
- Never translate emergency telephone numbers (e.g., keep 112, 108, 1078 as standard numbers).
- Clearly separate measured sensor data, deterministic calculated risk, and AI preparedness advice.
"""

LANGUAGE_NAMES = {
    "en": "English",
    "te": "Telugu (తెలుగు)",
    "hi": "Hindi (हिन्दी)",
    "ta": "Tamil (தமிழ்)",
    "kn": "Kannada (ಕನ್ನಡ)",
    "ml": "Malayalam (മലയാളം)",
    "mr": "Marathi (मराठी)"
}

class ClimateAgent:
    """AI Climate Agent with Gemini integration and robust rule-based fallback."""

    def __init__(self):
        self.gemini_available = False
        self.client = None
        self._init_gemini()

    def _init_gemini(self):
        if settings.GEMINI_API_KEY:
            try:
                from google import genai
                self.client = genai.Client(api_key=settings.GEMINI_API_KEY)
                self.gemini_available = True
                print("Gemini AI Agent initialized successfully with model:", settings.GEMINI_MODEL)
            except Exception as e:
                print(f"Gemini initialization note: {e}. Running with comprehensive rule-based safety engine.")
                self.gemini_available = False

    async def chat(
        self,
        message: str,
        location: Optional[Dict] = None,
        language: str = "en",
        profile_type: str = "general"
    ) -> Dict[str, Any]:
        # Gather live contextual intelligence
        weather_data = None
        hazards = []
        rag_context = []
        recommendations = []
        nearby_safe_places = []
        sources = ["NDMA India Safety Guidelines", "IMD Advisory"]

        lat = location.get("latitude") if location else 17.6868
        lon = location.get("longitude") if location else 83.2185
        loc_name = location.get("name") if location else "your active location"

        try:
            weather_data = await weather_service.get_weather(lat, lon)
            hazards = risk_engine.assess_all(weather_data)
            
            top_hazard = max(hazards, key=lambda h: h["risk_score"]) if hazards else None
            top_hazard_type = top_hazard["hazard_type"] if top_hazard else "flood"
            
            # Fetch nearby shelters
            nearby_safe_places = await safe_places_service.get_nearby_safe_places(
                lat=lat, lon=lon, hazard_type=top_hazard_type, radius_km=15.0
            )

            # Recommendations for all elevated risks
            elevated = [h for h in hazards if h["risk_level"] in ["MODERATE", "HIGH", "SEVERE"]]
            if not elevated and top_hazard:
                elevated = [top_hazard]

            for eh in elevated:
                rec = recommendation_service.get_recommendations(
                    eh["hazard_type"], profile_type, eh["risk_level"], language
                )
                recommendations.append(rec)
        except Exception as e:
            print(f"Context gathering error: {e}")

        # Semantic search in RAG Knowledge Base
        try:
            rag_context = rag_store.search(
                message, language=language if language in ["en", "te", "hi"] else None, n_results=3
            )
            for ctx in rag_context:
                if ctx.get("source"):
                    sources.append(ctx["source"])
        except Exception as e:
            print(f"RAG search error: {e}")

        sources = list(set(sources))

        if self.gemini_available:
            return await self._gemini_response(
                message, weather_data, hazards, rag_context, recommendations,
                nearby_safe_places, language, profile_type, sources, loc_name
            )
        else:
            return self._fallback_response(
                message, weather_data, hazards, rag_context, recommendations,
                nearby_safe_places, language, profile_type, sources, loc_name
            )

    async def _gemini_response(
        self, message, weather_data, hazards, rag_context, recommendations,
        nearby_safe_places, language, profile_type, sources, loc_name
    ):
        from google.genai import types
        context_parts = [SYSTEM_PROMPT]

        lang_name = LANGUAGE_NAMES.get(language, "English")
        context_parts.append(
            f"\nLANGUAGE INSTRUCTION: You must formulate the ENTIRE response in {lang_name}. "
            f"Use the native script of {lang_name} for all text. Keep numbers (112, 108, km/h, mm, °C) standard and readable."
        )

        context_parts.append(f"\nUser Active Location: {loc_name}")
        context_parts.append(f"User Profile: {profile_type}")

        if weather_data:
            curr = weather_data.get("current", {})
            context_parts.append(
                f"\nLive Meteorological Conditions: Temperature={curr.get('temperature')}°C, "
                f"Feels Like={curr.get('feels_like')}°C, Humidity={curr.get('humidity')}%, "
                f"Rainfall={curr.get('rain', 0)}mm, Wind={curr.get('wind_speed')}km/h (Gusts: {curr.get('wind_gust')}km/h), "
                f"Condition={curr.get('weather_text')}, Mode={curr.get('data_mode', 'LIVE')}"
            )

        if hazards:
            hazard_summary = "; ".join([f"{h['hazard_type'].upper()}: {h['risk_level']} (Score: {h['risk_score']}/100, Factors: {', '.join(h.get('factors', []))})" for h in hazards])
            context_parts.append(f"\nCalculated Risk Assessments: {hazard_summary}")

        if nearby_safe_places:
            places_summary = "; ".join([f"{p['name']} ({p['place_type']}, {p.get('distance_km')}km away, Phone: {p.get('contact_phone')})" for p in nearby_safe_places[:4]])
            context_parts.append(f"\nNearby Verified Shelters & Medical Centers: {places_summary}")

        if rag_context:
            context_parts.append("\nKnowledge Base Safety Guidance:")
            for ctx in rag_context[:3]:
                context_parts.append(f"- {ctx['content']} [Source: {ctx.get('source')}]")

        context_parts.append(f"\nUser Question: {message}")

        try:
            response = self.client.models.generate_content(
                model=settings.GEMINI_MODEL,
                contents="\n".join(context_parts),
                config=types.GenerateContentConfig(temperature=0.2, max_output_tokens=1500)
            )
            resp_text = response.text or "I am ready to assist you with climate safety and emergency information."
        except Exception as e:
            print(f"Gemini generation error: {e}. Switching to rule-based engine.")
            return self._fallback_response(
                message, weather_data, hazards, rag_context, recommendations,
                nearby_safe_places, language, profile_type, sources, loc_name
            )

        hazards_detected = [h["hazard_type"] for h in hazards if h["risk_level"] in ["MODERATE", "HIGH", "SEVERE"]]
        rec_texts = []
        for r in recommendations:
            rec_texts.extend(r.get("actions", [])[:3])

        return {
            "response": resp_text,
            "language": language,
            "sources": sources,
            "hazards_detected": hazards_detected,
            "recommendations": rec_texts[:6],
            "safe_places": nearby_safe_places[:4]
        }

    def _fallback_response(
        self, message, weather_data, hazards, rag_context, recommendations,
        nearby_safe_places, language, profile_type, sources, loc_name
    ):
        parts = []
        hazards_detected = []
        rec_texts = []

        # Header with Location
        parts.append(f"📍 Location: {loc_name}")
        if weather_data:
            curr = weather_data.get("current", {})
            parts.append(f"🌡️ Weather: {curr.get('weather_text', 'Active')} | Temp: {curr.get('temperature')}°C (Feels {curr.get('feels_like')}°C) | Rain: {curr.get('rain', 0)}mm | Wind: {curr.get('wind_speed')} km/h")

        # 1. Risk Assessment Section
        high_risks = [h for h in hazards if h["risk_level"] in ["HIGH", "SEVERE"]]
        moderate_risks = [h for h in hazards if h["risk_level"] == "MODERATE"]
        hazards_detected = [h["hazard_type"] for h in high_risks + moderate_risks]

        if high_risks:
            parts.append("\n⚠️ ELEVATED CLIMATE RISK DETECTED:")
            for hr in high_risks:
                parts.append(f"• 🔴 {hr['hazard_type'].upper()} ({hr['risk_level']} - Score: {hr['risk_score']}/100)")
                parts.append(f"  Reason: {hr['explanation']}")
                for factor in hr.get("factors", []):
                    parts.append(f"  - {factor}")
        elif moderate_risks:
            parts.append("\n🟡 MODERATE HAZARD ADVISORY:")
            for mr in moderate_risks:
                parts.append(f"• {mr['hazard_type'].upper()}: {mr['risk_level']} (Score: {mr['risk_score']}/100)")
        else:
            parts.append("\n🟢 ALL HAZARDS CURRENTLY AT LOW RISK.")

        # 2. Actionable Recommendations
        if recommendations:
            parts.append(f"\n📋 RECOMMENDED ACTIONS (Tailored for {profile_type.title()}):")
            for rec in recommendations:
                for i, act in enumerate(rec.get("actions", [])[:4], 1):
                    parts.append(f"  {i}. {act}")
                    rec_texts.append(act)

        # 3. Nearby Safe Places & Shelters
        if nearby_safe_places:
            parts.append("\n🛡️ NEARBY PROTECTION & SHELTERS:")
            for sp in nearby_safe_places[:3]:
                dist_str = f"{sp.get('distance_km')} km" if sp.get('distance_km') else "Nearby"
                walk_str = f"🚶 ~{sp.get('estimated_time_walk_min')} min" if sp.get('estimated_time_walk_min') else ""
                phone_str = f" | 📞 {sp.get('contact_phone')}" if sp.get('contact_phone') else ""
                parts.append(f"• {sp['name']} ({dist_str} {walk_str}{phone_str})")

        # 4. Emergency Contacts & Helplines
        parts.append("\n🚨 EMERGENCY HELPLINES (India-wide Toll Free):")
        parts.append("• 112 : Unified Emergency Services (Police / Fire / Ambulance)")
        parts.append("• 1078 : NDRF Disaster Control Room")
        parts.append("• 1070 : State Disaster Management Authority")
        parts.append("• 108  : Emergency Ambulance")

        parts.append("\nℹ️ Note: Always obey official evacuation orders and emergency broadcasts from IMD and NDMA.")

        return {
            "response": "\n".join(parts),
            "language": language,
            "sources": sources,
            "hazards_detected": hazards_detected,
            "recommendations": rec_texts[:6],
            "safe_places": nearby_safe_places[:4]
        }

climate_agent = ClimateAgent()
