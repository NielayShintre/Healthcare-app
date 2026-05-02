import fitz  # PyMuPDF
import re
from typing import List, Optional

class ReportParser:
    def extract_text(self, file_bytes: bytes) -> str:
        doc = fitz.open(stream=file_bytes, filetype="pdf")
        text = ""
        for page in doc:
            text += page.get_text()
        return text

    def sanitize_for_injection(self, text: str) -> str:
        # Basic sanitization for prompt injection patterns
        patterns = [
            r"ignore previous instructions",
            r"you are now",
            r"system:",
            r"user:",
            r"assistant:"
        ]
        sanitized = text
        for pattern in patterns:
            sanitized = re.sub(pattern, "[REDACTED]", sanitized, flags=re.IGNORECASE)
        return sanitized
