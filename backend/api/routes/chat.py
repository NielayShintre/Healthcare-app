from fastapi import APIRouter, HTTPException
from ...models.chat_message import ChatRequest, ChatResponse

router = APIRouter()

@router.post("/chat/message", response_model=ChatResponse)
async def chat_message(request: ChatRequest):
    # This would normally run safety classifier then call LLM
    # For demo purposes, returning a structured response
    
    # Check for safety triggers (simulated)
    if "chest pain" in request.message.lower():
        return ChatResponse(
            answer="⚠️ This seems like it could be a medical emergency. Please contact emergency services (112) immediately.",
            confidence_label="High",
            emergency_flag=True,
            doctor_prompt=True
        )
    
    return ChatResponse(
        answer="I see your hemoglobin is slightly low at 11.2 g/dL. This might explain some fatigue if you are feeling any. It's best to discuss this with your doctor to see if iron supplements are needed.",
        source_tag="Based on your Apollo Diagnostics report from April 2024",
        confidence_label="Directly from report",
        doctor_prompt=True,
        citation="Per ICMR 2023 guidelines on anemia thresholds."
    )
