import json
import os
from typing import Tuple, List, Optional
from ..models.marker import MarkerStatus, SeverityTier

class RangeEngine:
    def __init__(self, ranges_path: str, critical_path: str):
        with open(ranges_path, 'r') as f:
            self.ranges = json.load(f)
        with open(critical_path, 'r') as f:
            self.critical_thresholds = json.load(f)

    def evaluate_marker(self, name: str, value: float, unit: str, sex: str, age: int) -> Tuple[MarkerStatus, SeverityTier, float, str]:
        # Find matching range
        matching_range = None
        for r in self.ranges:
            if r["marker"].lower() == name.lower() and r["sex"].lower() == sex.lower():
                if r["age_min"] <= age <= r["age_max"]:
                    matching_range = r
                    break
        
        if not matching_range:
            return MarkerStatus.NORMAL, SeverityTier.NORMAL, 0.0, "No reference range found"

        low = matching_range["lower"]
        high = matching_range["upper"]
        source = f"{matching_range['source']} {matching_range.get('source_year', '')}"

        # Check critical first
        critical = self.critical_thresholds.get(name)
        if critical:
            c_low = critical.get("critical_low")
            c_high = critical.get("critical_high")
            if c_low is not None and value < c_low:
                return MarkerStatus.CRITICAL_LOW, SeverityTier.CRITICAL, value - c_low, source
            if c_high is not None and value > c_high:
                return MarkerStatus.CRITICAL_HIGH, SeverityTier.CRITICAL, value - c_high, source

        # Normal/Borderline/High/Low
        if value < low:
            delta = value - low
            severity = SeverityTier.SIGNIFICANTLY_OUT_OF_RANGE if delta < -0.2 * low else SeverityTier.MILDLY_OUT_OF_RANGE
            return MarkerStatus.LOW, severity, delta, source
        elif value > high:
            delta = value - high
            severity = SeverityTier.SIGNIFICANTLY_OUT_OF_RANGE if delta > 0.2 * high else SeverityTier.MILDLY_OUT_OF_RANGE
            return MarkerStatus.HIGH, severity, delta, source
        else:
            # Check for borderline (within 10% of limits)
            if value < low + 0.1 * (high - low):
                return MarkerStatus.BORDERLINE, SeverityTier.NORMAL, 0.0, source
            if value > high - 0.1 * (high - low):
                return MarkerStatus.BORDERLINE, SeverityTier.NORMAL, 0.0, source
            return MarkerStatus.NORMAL, SeverityTier.NORMAL, 0.0, source
