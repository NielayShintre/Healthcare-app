from pydantic import BaseModel
from typing import Optional
from enum import Enum

class MarkerStatus(str, Enum):
    NORMAL = "normal"
    BORDERLINE = "borderline"
    HIGH = "high"
    LOW = "low"
    CRITICAL_HIGH = "critical_high"
    CRITICAL_LOW = "critical_low"

class SeverityTier(str, Enum):
    NORMAL = "normal"
    MILDLY_OUT_OF_RANGE = "mildly_out_of_range"
    SIGNIFICANTLY_OUT_OF_RANGE = "significantly_out_of_range"
    CRITICAL = "critical"

class Marker(BaseModel):
    name: str
    value: float
    unit: str
    lab_range_low: Optional[float] = None
    lab_range_high: Optional[float] = None
    adjusted_range_low: Optional[float] = None
    adjusted_range_high: Optional[float] = None
    status: MarkerStatus
    severity: SeverityTier
    delta_from_limit: float = 0.0
    source_label: Optional[str] = None
