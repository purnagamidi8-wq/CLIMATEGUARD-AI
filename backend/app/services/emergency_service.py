import httpx
from typing import List, Dict, Any

class EmergencyService:
    """Find nearby emergency resources using OpenStreetMap Overpass API."""

    OVERPASS_URL = "https://overpass-api.de/api/interpreter"
    HEADERS = {"User-Agent": "ClimateGuardAI/1.0"}

    FALLBACK_DATA = [
        {"id": 1, "name": "District Government Hospital", "type": "hospital", "phone": "108", "location": {"lat": 17.6868, "lon": 83.2185}},
        {"id": 2, "name": "City Fire Station", "type": "fire_station", "phone": "101", "location": {"lat": 17.6900, "lon": 83.2200}},
        {"id": 3, "name": "Central Police Station", "type": "police", "phone": "100", "location": {"lat": 17.6880, "lon": 83.2150}},
    ]

    async def find_nearby(self, lat: float, lon: float, radius_m: int = 5000) -> Dict[str, Any]:
        query = f"""
        [out:json][timeout:15];
        (
          nwr["amenity"="hospital"](around:{radius_m},{lat},{lon});
          nwr["amenity"="fire_station"](around:{radius_m},{lat},{lon});
          nwr["amenity"="police"](around:{radius_m},{lat},{lon});
        );
        out center tags;
        """
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                resp = await client.post(self.OVERPASS_URL, data={"data": query}, headers=self.HEADERS)
                if resp.status_code != 200:
                    return {"resources": self._adjust_fallback(lat, lon), "source": "fallback", "note": "Live data temporarily unavailable"}
                elements = resp.json().get("elements", [])
                if not elements:
                    return {"resources": self._adjust_fallback(lat, lon), "source": "fallback", "note": "No resources found in range"}

                resources = []
                for el in elements:
                    tags = el.get("tags", {})
                    elat = el.get("lat") or (el.get("center", {}) or {}).get("lat")
                    elon = el.get("lon") or (el.get("center", {}) or {}).get("lon")
                    if elat and elon:
                        resources.append({
                            "id": el.get("id"),
                            "name": tags.get("name", "Unnamed Facility"),
                            "type": tags.get("amenity", "unknown"),
                            "phone": tags.get("phone") or tags.get("contact:phone", "N/A"),
                            "location": {"lat": elat, "lon": elon}
                        })
                return {"resources": resources[:15], "source": "OpenStreetMap", "note": "Live data from OSM Overpass API"}
        except Exception as e:
            print(f"Overpass API error: {e}")
            return {"resources": self._adjust_fallback(lat, lon), "source": "fallback", "note": "Live data temporarily unavailable"}

    def _adjust_fallback(self, lat: float, lon: float) -> List[Dict[str, Any]]:
        import copy
        adjusted = copy.deepcopy(self.FALLBACK_DATA)
        for r in adjusted:
            r["location"]["lat"] = lat + (r["location"]["lat"] - 17.6868)
            r["location"]["lon"] = lon + (r["location"]["lon"] - 83.2185)
        return adjusted

emergency_service = EmergencyService()
