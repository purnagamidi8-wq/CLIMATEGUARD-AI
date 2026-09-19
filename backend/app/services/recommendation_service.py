from typing import List, Dict, Any

RECOMMENDATIONS = {
    "flood": {
        "general": ["Avoid low-lying roads and flooded areas", "Keep your phone charged and emergency numbers saved", "Protect important documents in waterproof bags", "Store drinking water and emergency food supplies", "Monitor official weather warnings from IMD", "Follow evacuation instructions from local authorities"],
        "farmer": ["Monitor field drainage systems and clear waterways", "Move livestock to higher ground if flooding is expected", "Protect stored grain and agricultural inputs from water damage", "Follow local agricultural advisory from the district office", "Avoid working near swollen rivers or streams"],
        "student": ["Avoid flooded routes while travelling to college", "Keep study materials and electronics in waterproof storage", "Stay indoors during heavy rainfall", "Follow school/college closure announcements", "Keep emergency contacts readily available"],
        "elderly": ["Stay on upper floors if in a flood-prone area", "Keep essential medicines in a waterproof bag", "Have a trusted neighbor or caregiver check on you", "Avoid walking through any standing water", "Keep a torch and whistle accessible"],
        "business": ["Protect inventory from possible water exposure", "Back up digital records and critical business data", "Prepare for temporary business disruption", "Ensure employee safety plans are communicated", "Check flood insurance coverage"]
    },
    "heatwave": {
        "general": ["Stay hydrated - drink water regularly even if not thirsty", "Avoid unnecessary outdoor exposure during 11 AM to 4 PM", "Wear light, loose-fitting clothing", "Check on vulnerable neighbors and elderly relatives", "Use ORS (Oral Rehydration Solution) if feeling dehydrated"],
        "farmer": ["Schedule farm work for early morning or late evening", "Ensure adequate water supply for livestock and irrigation", "Use shade nets to protect crops from extreme heat", "Take frequent breaks in shaded areas", "Watch for signs of heat exhaustion in workers"],
        "student": ["Carry a water bottle at all times", "Avoid prolonged outdoor sports during peak heat", "Wear a cap or hat when outdoors", "Report any dizziness or nausea to teachers immediately", "Use sunscreen if spending time outdoors"],
        "elderly": ["Stay in the coolest room of the house", "Drink water every 20 minutes even without thirst", "Avoid tea, coffee, and alcohol during extreme heat", "Keep wet towels to cool yourself", "Contact a doctor if experiencing confusion or rapid heartbeat"],
        "business": ["Ensure workplace cooling systems are functional", "Provide drinking water stations for employees and customers", "Consider flexible working hours during extreme heat", "Reduce outdoor work requirements during peak hours", "Monitor employee health for heat-related symptoms"]
    },
    "cyclone": {
        "general": ["Secure loose outdoor objects that could become projectiles", "Charge all mobile devices and power banks", "Prepare an emergency kit with water, food, and medicines", "Stay indoors away from windows during the storm", "Follow official evacuation orders immediately if issued"],
        "farmer": ["Harvest mature crops before the cyclone arrives if possible", "Secure farm equipment and livestock shelters", "Drain excess water from fields to prevent waterlogging", "Stock animal feed for at least 3 days", "Do not venture out during the eye of the storm"],
        "student": ["Stay at home during cyclone warnings", "Keep emergency supplies in your room", "Stay away from windows and glass doors", "Follow school closure announcements", "Help family members prepare the house"],
        "elderly": ["Move to a safe room away from windows", "Keep emergency medicines easily accessible", "Ensure hearing aids and glasses are secured", "Have a neighbor or caregiver assigned to check on you", "Keep a battery-powered radio for updates"],
        "business": ["Protect valuable equipment and inventory", "Backup critical digital data to cloud storage", "Communicate closure plans to employees in advance", "Check insurance coverage for wind and storm damage", "Plan for business continuity after the storm"]
    },
    "lightning": {
        "general": ["Move indoors immediately when thunder is heard", "Avoid open fields, hilltops, and isolated trees", "Stay away from metal objects and water bodies", "Do not use landline phones during thunderstorms", "Wait 30 minutes after last thunder before going outside"],
        "farmer": ["Stop all outdoor farm work immediately", "Do not shelter under isolated trees", "Move away from metal fences and equipment", "Seek shelter in a substantial building", "Keep livestock away from metal structures"],
        "student": ["Move indoors from sports fields immediately", "Avoid using electronic devices connected to wall outlets", "Stay away from windows during thunderstorms", "Follow teacher instructions for indoor shelter", "Do not use umbrellas with metal tips outdoors"],
        "elderly": ["Stay indoors during thunderstorms", "Unplug sensitive electronic equipment", "Avoid bathing or using water taps during lightning", "Stay away from concrete walls", "Keep emergency lighting ready"],
        "business": ["Install and maintain lightning protection systems", "Unplug sensitive equipment or use surge protectors", "Keep employees indoors during active thunderstorms", "Have backup power systems in place", "Avoid outdoor deliveries during storms"]
    },
    "drought": {
        "general": ["Conserve water - fix leaks and reduce usage", "Use stored or filtered water for drinking", "Avoid wasteful water practices", "Monitor local water supply advisories", "Report water scarcity issues to local authorities"],
        "farmer": ["Implement drip irrigation to conserve water", "Choose drought-resistant crop varieties", "Mulch soil to reduce evaporation", "Monitor soil moisture levels regularly", "Follow agricultural department advisories on water management"],
        "student": ["Practice water conservation at home and school", "Report water wastage to authorities", "Learn about rainwater harvesting", "Reduce shower time and water usage", "Help spread awareness about drought conditions"],
        "elderly": ["Store extra drinking water at home", "Stay hydrated even during mild weather", "Use water-efficient cooking methods", "Keep backup water containers filled", "Coordinate with neighbors for water sharing if needed"],
        "business": ["Audit and reduce commercial water consumption", "Install water-efficient fixtures", "Develop a water contingency plan", "Explore water recycling options", "Communicate conservation measures to staff"]
    },
    "wildfire": {
        "general": ["Monitor official wildfire warnings and advisories", "Prepare an evacuation bag with essentials", "Create defensible space around your property", "Know your evacuation routes", "Follow emergency instructions from authorities"],
        "farmer": ["Clear dry vegetation around farm buildings", "Have water tanks and pumps ready for firefighting", "Create firebreaks around crop fields", "Monitor fire weather conditions daily", "Coordinate with local fire department for farm protection"],
        "student": ["Stay indoors when air quality is poor due to smoke", "Wear N95 masks if smoke is visible", "Follow school air quality advisories", "Keep windows and doors closed during smoke events", "Report any small fires immediately"],
        "elderly": ["Stay indoors with windows closed during poor air quality", "Use air purifiers if available", "Keep rescue medications accessible", "Have an evacuation plan with assistance arranged", "Monitor health for breathing difficulties"],
        "business": ["Develop a fire evacuation and continuity plan", "Maintain fire extinguishers and safety equipment", "Train employees on fire safety procedures", "Protect outdoor inventory from fire exposure", "Review fire insurance coverage"]
    }
}

class RecommendationService:
    def get_recommendations(self, hazard_type: str, profile_type: str = "general", risk_level: str = "LOW", language: str = "en") -> Dict[str, Any]:
        hazard_recs = RECOMMENDATIONS.get(hazard_type, RECOMMENDATIONS.get("flood", {}))
        profile_recs = hazard_recs.get(profile_type, hazard_recs.get("general", []))

        if risk_level in ["LOW"]:
            actions = profile_recs[:3]
            priority = "Low"
        elif risk_level in ["MODERATE"]:
            actions = profile_recs[:4]
            priority = "Medium"
        elif risk_level in ["HIGH"]:
            actions = profile_recs[:5]
            priority = "High"
        else:
            actions = profile_recs
            priority = "Urgent"

        summary = f"{hazard_type.replace('_', ' ').title()} preparedness actions for {profile_type} profile"
        source = "NDMA / IMD Safety Guidelines"

        return {
            "hazard_type": hazard_type,
            "profile_type": profile_type,
            "language": language,
            "actions": actions,
            "summary": summary,
            "source": source,
            "priority": priority
        }

    def get_all_recommendations(self, hazards: list, profile_type: str = "general", language: str = "en") -> list:
        results = []
        for h in hazards:
            rec = self.get_recommendations(h["hazard_type"], profile_type, h.get("risk_level", "LOW"), language)
            results.append(rec)
        return results

recommendation_service = RecommendationService()
