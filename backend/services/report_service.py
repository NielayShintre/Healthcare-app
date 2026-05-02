from datetime import datetime
import time
from fastapi import UploadFile
from models.report import ParsedReport
from models.marker import Marker, MarkerStatus, SeverityTier
from services.parser_service import ParserService
from services.document_extractor import DocumentExtractor

class ReportService:
    def __init__(self):
        self.parser = ParserService()
        self.extractor = DocumentExtractor()

    async def process_uploaded_file(self, file: UploadFile) -> ParsedReport:
        content = await file.read()
        
        # Extract text based on file type
        raw_text = ""
        if file.content_type == "application/pdf":
            raw_text = self.extractor.extract_text_from_pdf(content)
        else:
            # Fallback for images or plain text
            raw_text = content.decode('utf-8', errors='ignore')

        # Parse text into markers
        parsed_data = self.parser.parse_lab_text(raw_text)
        
        markers = []
        for m in parsed_data.get("markers", []):
            # Map string status to Enum
            status_map = {
                "Low": MarkerStatus.LOW,
                "High": MarkerStatus.HIGH,
                "Normal": MarkerStatus.NORMAL,
                "Borderline": MarkerStatus.BORDERLINE,
                "Critically Low": MarkerStatus.CRITICAL_LOW,
                "Critically High": MarkerStatus.CRITICAL_HIGH
            }
            
            # Extract and normalize status
            raw_status = m.get("status", "Normal")
            status = status_map.get(raw_status, MarkerStatus.NORMAL)
            
            markers.append(
                Marker(
                    name=m.get("name", "Unknown"),
                    value=float(m.get("value", 0.0)),
                    unit=m.get("unit", ""),
                    lab_range_low=float(m.get("range_low", 0.0)),
                    lab_range_high=float(m.get("range_high", 0.0)),
                    adjusted_range_low=float(m.get("range_low", 0.0)),
                    adjusted_range_high=float(m.get("range_high", 0.0)),
                    status=status,
                    severity=SeverityTier.NORMAL if status == MarkerStatus.NORMAL else SeverityTier.MILDLY_OUT_OF_RANGE,
                    delta_from_limit=0.0,
                    source_label="Extracted"
                )
            )
        
        # Generate a unique ID for the report
        report_id = str(int(time.time() * 1000))
        
        return ParsedReport(
            id=report_id,
            lab_name=parsed_data.get("lab_name", "Unknown Lab"),
            report_date=parsed_data.get("report_date", datetime.now().strftime("%Y-%m-%d")),
            report_type="Blood Work",
            markers=markers,
            upload_timestamp=datetime.now(),
            raw_text=raw_text[:1000], 
            has_critical_values=any(m.status in [MarkerStatus.CRITICAL_LOW, MarkerStatus.CRITICAL_HIGH] for m in markers),
            critical_markers=[m.name for m in markers if m.status in [MarkerStatus.CRITICAL_LOW, MarkerStatus.CRITICAL_HIGH]]
        )
