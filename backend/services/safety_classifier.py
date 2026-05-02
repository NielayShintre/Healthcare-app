import re
from typing import List, Optional, Dict
from ..models.marker import Marker, MarkerStatus

class SafetyClassifier:
    EMERGENCY_KEYWORDS = [
        "chest pain", "difficulty breathing", "shortness of breath", 
        "severe headache", "loss of consciousness", "facial drooping", 
        "arm weakness", "slurred speech", "suicidal", "kill myself", 
        "harm myself", "stroke", "heart attack"
    ]

    def classify_message(self, text: str) -> Dict[str, any]:
        text_lower = text.lower()
        for keyword in self.EMERGENCY_KEYWORDS:
            if keyword in text_lower:
                return {"is_emergency": True, "trigger_type": "text", "trigger_detail": keyword}
        return {"is_emergency": False, "trigger_type": None}

    def classify_report(self, markers: List[Marker]) -> Dict[str, any]:
        for marker in markers:
            if marker.status in [MarkerStatus.CRITICAL_HIGH, MarkerStatus.CRITICAL_LOW]:
                return {"is_emergency": True, "trigger_type": "lab_value", "trigger_detail": marker.name}
        return {"is_emergency": False, "trigger_type": None}
