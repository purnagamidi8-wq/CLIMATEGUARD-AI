from typing import List, Dict, Any
from datetime import datetime

class AlertService:
    """Generate alerts when risk thresholds are exceeded."""

    def generate_alerts(self, hazards: List[Dict[str, Any]], location_name: str = "your area") -> List[Dict[str, Any]]:
        alerts = []
        for h in hazards:
            if h["risk_level"] in ["HIGH", "SEVERE"]:
                alert = {
                    "hazard_type": h["hazard_type"],
                    "severity": h["risk_level"],
                    "title": f"{h['risk_level']} {h['hazard_type'].replace('_', ' ').title()} Risk Alert",
                    "message": f"{h['explanation']}. Please take necessary precautions for {location_name}.",
                    "factors": h.get("factors", []),
                    "timestamp": datetime.utcnow().isoformat()
                }
                alerts.append(alert)
        return alerts

alert_service = AlertService()
