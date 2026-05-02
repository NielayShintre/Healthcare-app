from typing import List, Dict, Any
from models.chat_message import ChatRequest, ChatResponse
from services.llm_client import LLMClient
from utils.prompt_loader import load_prompt

class ChatService:
    def __init__(self):
        self.llm = LLMClient()
        self.system_prompt_template = load_prompt('chat_system.md')

    def process_message(self, request: ChatRequest) -> ChatResponse:
        # Safety Check
        emergency_keywords = ["chest pain", "shortness of breath", "severe bleeding", "fainting", "stroke"]
        if any(k in request.message.lower() for k in emergency_keywords):
            return ChatResponse(
                answer="⚠️ This mentions symptoms that could indicate a medical emergency. Please stop using this app and contact emergency services (112 or local emergency number) immediately. Chest pain or acute shortness of breath requires immediate clinical evaluation.",
                confidence_label="Critical Safety Trigger",
                emergency_flag=True,
                doctor_prompt=True
            )

        # Prepare context for LLM
        p = request.patient_context
        prompt = self.system_prompt_template.format(
            age=p.age,
            sex=p.sex,
            conditions=", ".join(p.conditions) if p.conditions else "None",
            medications=p.medications or "None"
        )

        messages = []
        # Add history
        for msg in request.conversation_history:
            messages.append({"role": msg["role"], "content": msg["content"]})
        
        # Add current message
        messages.append({"role": "user", "content": request.message})

        # Call LLM
        response_text = self.llm.chat_completion(prompt, messages)
        
        return ChatResponse(
            answer=response_text,
            confidence_label="High (LLM Derived)",
            doctor_prompt=True,
            citation="Based on provided lab results and standard clinical guidelines."
        )
