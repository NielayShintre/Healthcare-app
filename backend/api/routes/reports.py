from fastapi import APIRouter, UploadFile, File, HTTPException
from datetime import datetime
from typing import List
from ...models.report import ParsedReport
from ...models.marker import Marker, MarkerStatus, SeverityTier

router = APIRouter()

@router.post("/reports/upload", response_model=ParsedReport)
async def upload_report(file: UploadFile = File(...)):
    # This would normally call the parser and range engine services
    # For demo purposes, returning synthetic data
    markers = [
        Marker(
            name="Hemoglobin",
            value=11.2,
            unit="g/dL",
            lab_range_low=13.0,
            lab_range_high=17.5,
            adjusted_range_low=13.0,
            adjusted_range_high=17.5,
            status=MarkerStatus.LOW,
            severity=SeverityTier.MILDLY_OUT_OF_RANGE,
            delta_from_limit=-1.8,
            source_label="ICMR 2023"
        )
    ]
    
    return ParsedReport(
        lab_name="Apollo Diagnostics (Demo)",
        report_date="2024-04-15",
        report_type="Blood Work",
        markers=markers,
        upload_timestamp=datetime.now(),
        raw_text="Demo report content",
        has_critical_values=False,
        critical_markers=[]
    )
