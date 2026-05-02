from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from .marker import Marker

class ParsedReport(BaseModel):
    lab_name: str
    report_date: str
    report_type: str
    markers: List[Marker]
    upload_timestamp: datetime
    raw_text: str
    has_critical_values: bool
    critical_markers: List[str]
