import httpx
from typing import List, Dict, Any, Optional

FALLBACK_CITIES = [
    {"name": "Visakhapatnam", "state": "Andhra Pradesh", "country": "India", "lat": 17.6868, "lon": 83.2185},
    {"name": "Hyderabad", "state": "Telangana", "country": "India", "lat": 17.3850, "lon": 78.4867},
    {"name": "Vijayawada", "state": "Andhra Pradesh", "country": "India", "lat": 16.5062, "lon": 80.6480},
    {"name": "Chennai", "state": "Tamil Nadu", "country": "India", "lat": 13.0827, "lon": 80.2707},
    {"name": "Mumbai", "state": "Maharashtra", "country": "India", "lat": 19.0760, "lon": 72.8777},
    {"name": "Delhi", "state": "Delhi", "country": "India", "lat": 28.7041, "lon": 77.1025},
    {"name": "Kolkata", "state": "West Bengal", "country": "India", "lat": 22.5726, "lon": 88.3639},
    {"name": "Bengaluru", "state": "Karnataka", "country": "India", "lat": 12.9716, "lon": 77.5946},
    {"name": "Tirupati", "state": "Andhra Pradesh", "country": "India", "lat": 13.6288, "lon": 79.4192},
    {"name": "Guntur", "state": "Andhra Pradesh", "country": "India", "lat": 16.3067, "lon": 80.4365},
]


class LocationService:
    """Geocoding and reverse geocoding via Nominatim with fallback."""

    NOMINATIM_URL = "https://nominatim.openstreetmap.org"
    HEADERS = {"User-Agent": "ClimateGuardAI/1.0 (student-project)"}

    async def search_city(self, query: str) -> List[Dict[str, Any]]:
        # Try Nominatim first
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.get(
                    f"{self.NOMINATIM_URL}/search",
                    params={"q": query, "format": "json", "limit": 5, "countrycodes": "in"},
                    headers=self.HEADERS,
                )
                if resp.status_code == 200:
                    results = resp.json()
                    if results:
                        return [
                            {
                                "name": item.get("display_name", "").split(",")[0],
                                "display_name": item.get("display_name", ""),
                                "latitude": float(item.get("lat", 0)),
                                "longitude": float(item.get("lon", 0)),
                                "country": "India",
                            }
                            for item in results
                        ]
        except Exception as e:
            print(f"Nominatim search error: {e}")

        # Fallback to local cities
        query_lower = query.lower()
        matches = [c for c in FALLBACK_CITIES if query_lower in c["name"].lower() or query_lower in c["state"].lower()]
        return [
            {
                "name": c["name"],
                "display_name": f"{c['name']}, {c['state']}, {c['country']}",
                "latitude": c["lat"],
                "longitude": c["lon"],
                "country": c["country"],
            }
            for c in (matches if matches else FALLBACK_CITIES[:5])
        ]

    async def reverse_geocode(self, lat: float, lon: float) -> Dict[str, Any]:
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.get(
                    f"{self.NOMINATIM_URL}/reverse",
                    params={"lat": lat, "lon": lon, "format": "json", "zoom": 10},
                    headers=self.HEADERS,
                )
                if resp.status_code == 200:
                    data = resp.json()
                    address = data.get("address", {})
                    return {
                        "name": address.get("city") or address.get("town") or address.get("village") or data.get("display_name", "").split(",")[0],
                        "display_name": data.get("display_name", ""),
                        "latitude": lat,
                        "longitude": lon,
                        "city": address.get("city") or address.get("town") or address.get("village", ""),
                        "state": address.get("state", ""),
                        "country": address.get("country", "India"),
                    }
        except Exception as e:
            print(f"Reverse geocode error: {e}")

        # Fallback: find nearest known city
        nearest = self._get_fallback_city(lat, lon)
        return {
            "name": nearest["name"],
            "display_name": f"{nearest['name']}, {nearest['state']}, {nearest['country']}",
            "latitude": lat,
            "longitude": lon,
            "city": nearest["name"],
            "state": nearest["state"],
            "country": nearest["country"],
        }

    def _get_fallback_city(self, lat: float, lon: float) -> Dict[str, Any]:
        best = FALLBACK_CITIES[0]
        best_dist = float("inf")
        for city in FALLBACK_CITIES:
            dist = (city["lat"] - lat) ** 2 + (city["lon"] - lon) ** 2
            if dist < best_dist:
                best_dist = dist
                best = city
        return best


location_service = LocationService()
