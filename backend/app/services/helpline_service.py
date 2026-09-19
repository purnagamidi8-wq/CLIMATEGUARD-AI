from typing import List, Dict, Any, Optional

class HelplineService:
    """
    Government & Emergency Helpline Directory Service.
    Maintains verified official emergency response numbers sourced from:
    - Ministry of Home Affairs (MHA), Government of India
    - National Disaster Management Authority (NDMA)
    - State Disaster Management Authorities (SDMA)
    - National Emergency Response Support System (ERSS - 112)
    """

    VERIFIED_HELPLINES = [
        {
            "id": 1,
            "name": "National Emergency Response Number (ERSS)",
            "number": "112",
            "service_type": "emergency",
            "scope": "National",
            "state": "All States & UTs",
            "district": None,
            "description": "Unified single emergency response number for Police, Fire, Ambulance, and Emergency Disaster Assistance across India.",
            "source_url": "https://112.gov.in (Ministry of Home Affairs, GoI)",
            "verified_at": "2026-01-15",
            "is_active": True,
            "is_toll_free": True
        },
        {
            "id": 2,
            "name": "NDRF Disaster Control Room (National)",
            "number": "1078",
            "service_type": "disaster",
            "scope": "National",
            "state": "All States & UTs",
            "district": None,
            "description": "National Disaster Response Force (NDRF) 24x7 HQ emergency deployment and flood/cyclone/landslide rescue hotline.",
            "source_url": "https://www.ndrf.gov.in",
            "verified_at": "2026-01-15",
            "is_active": True,
            "is_toll_free": True
        },
        {
            "id": 3,
            "name": "State Disaster Management Control Room (SDMA)",
            "number": "1070",
            "service_type": "disaster",
            "scope": "State",
            "state": "State Headquarters",
            "district": None,
            "description": "State-level emergency operations center for coordinating relief camps, evacuations, and disaster advisories.",
            "source_url": "https://ndma.gov.in",
            "verified_at": "2026-01-15",
            "is_active": True,
            "is_toll_free": True
        },
        {
            "id": 4,
            "name": "District Disaster Management Authority (DDMA)",
            "number": "1077",
            "service_type": "disaster",
            "scope": "District",
            "state": None,
            "district": "Local District Collectorate",
            "description": "District Magistrate / Collectorate Disaster Helpline for immediate local flood, storm, and shelter assistance.",
            "source_url": "https://ndma.gov.in",
            "verified_at": "2026-01-15",
            "is_active": True,
            "is_toll_free": True
        },
        {
            "id": 5,
            "name": "National Emergency Medical & Ambulance Service",
            "number": "108",
            "service_type": "medical",
            "scope": "National",
            "state": "All States & UTs",
            "district": None,
            "description": "Free 24x7 emergency medical dispatch, trauma resuscitation, and critical patient transport.",
            "source_url": "https://mohfw.gov.in",
            "verified_at": "2026-01-15",
            "is_active": True,
            "is_toll_free": True
        },
        {
            "id": 6,
            "name": "Fire & Emergency Rescue Services",
            "number": "101",
            "service_type": "fire",
            "scope": "National",
            "state": "All States & UTs",
            "district": None,
            "description": "Fire tenders, building evacuation, chemical hazard response, and flood de-watering assistance.",
            "source_url": "https://mha.gov.in",
            "verified_at": "2026-01-15",
            "is_active": True,
            "is_toll_free": True
        },
        {
            "id": 7,
            "name": "Police Control Room",
            "number": "100",
            "service_type": "police",
            "scope": "National",
            "state": "All States & UTs",
            "district": None,
            "description": "Law enforcement, public safety during disasters, road closures, and evacuation traffic routing.",
            "source_url": "https://mha.gov.in",
            "verified_at": "2026-01-15",
            "is_active": True,
            "is_toll_free": True
        },
        {
            "id": 8,
            "name": "Kisan Call Centre (Farmer Agricultural Advisory)",
            "number": "1551",
            "service_type": "weather",
            "scope": "National",
            "state": "All States & UTs",
            "district": None,
            "description": "Toll-free agricultural emergency guidance for crop protection, drought management, and livestock care during climate extremes.",
            "source_url": "https://agricoop.nic.in",
            "verified_at": "2026-01-15",
            "is_active": True,
            "is_toll_free": True
        },
        {
            "id": 9,
            "name": "National Women Disaster & Safety Helpline",
            "number": "1091",
            "service_type": "women",
            "scope": "National",
            "state": "All States & UTs",
            "district": None,
            "description": "Dedicated assistance for women and vulnerable individuals in emergency situations and relief centers.",
            "source_url": "https://wcd.nic.in",
            "verified_at": "2026-01-15",
            "is_active": True,
            "is_toll_free": True
        },
        {
            "id": 10,
            "name": "Childline National Emergency Helpline",
            "number": "1098",
            "service_type": "child",
            "scope": "National",
            "state": "All States & UTs",
            "district": None,
            "description": "24x7 emergency rescue and care for children separated or affected during natural disasters.",
            "source_url": "https://wcd.nic.in",
            "verified_at": "2026-01-15",
            "is_active": True,
            "is_toll_free": True
        }
    ]

    def get_helplines(
        self,
        service_type: Optional[str] = None,
        state: Optional[str] = None,
        search_query: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        results = list(self.VERIFIED_HELPLINES)

        if service_type and service_type != "all":
            results = [h for h in results if h["service_type"] == service_type]

        if search_query:
            q = search_query.lower()
            results = [
                h for h in results
                if q in h["name"].lower()
                or q in h["number"]
                or q in h["service_type"].lower()
                or q in (h["description"] or "").lower()
            ]

        return results

helpline_service = HelplineService()
