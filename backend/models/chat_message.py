from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from .patient import PatientContext
from .report import ParsedReport

class ChatRequest(BaseModel):
    message: str
    patient_context: PatientContext
    reports: List[ParsedReport]
    conversation_history: List[Dict[str, str]]

class ChatResponse(BaseModel):
    answer: str
    source_tag: Optional[str] = None
    confidence_label: str
    doctor_prompt: bool = False
    citation: Optional[str] = None
    emergency_flag: bool = False
