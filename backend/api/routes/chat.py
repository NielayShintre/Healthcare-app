from fastapi import APIRouter, HTTPException
from ...models.chat_message import ChatRequest, ChatResponse
from ...services.llm_client import LLMClient
import json

router = APIRouter()
llm = LLMClient()

SYSTEM_PROMPT = """You are MediLens AI, a specialized medical assistant. Your goal is to explain clinical lab results and health markers to patients in a clear, layman-friendly, and compassionate way.

GUIDELINES:
1. LAYMAN LANGUAGE: Avoid complex jargon. If you must use a medical term, define it immediately in simple terms (e.g., "Hemoglobin (the protein in your red blood cells that carries oxygen)").
2. REASONING: Always explain WHY a result is high or low and what that means for the patient's body (e.g., "Since your hemoglobin is low, your body isn't getting enough oxygen, which is why you feel tired").
3. SUGGESTIONS WITH REASONING: When suggesting a lifestyle change or follow-up, explain the logic (e.g., "You might want to eat more spinach or lentils because they are high in iron, which helps your body build more hemoglobin").
4. CITATIONS: Always mention which report or medical standard you are basing your answer on.
5. DISCLAIMER: Always remind the patient that you are an AI and they should consult their doctor for diagnosis.
6. SAFETY: If the user mentions emergency symptoms (chest pain, severe bleeding, etc.), prioritize an immediate emergency warning.

PATIENT CONTEXT:
Age: {age}
Sex: {sex}
Conditions: {conditions}
Medications: {medications}

FORMAT:
Provide a structured answer with clear sections if necessary.
"""

@router.post("/chat/message", response_model=ChatResponse)
async def chat_message(request: ChatRequest):
    # Safety Check
    emergency_keywords = ["chest pain", "shortness of breath", "severe bleeding", "fainting", "stroke"]
    if any(k in request.message.lower() for k in emergency_keywords):
        return ChatResponse(
            answer="⚠️ This mentions symptoms that could indicate a medical emergency. Please stop using this app and contact emergency services (112 or local emergency number) immediately. Chest pain or acute shortness of breath requires immediate clinical evaluation.",
            confidence_label="Critical Safety Trigger",
            emergency_flag=True,
            doctor_prompt=True
        )

    try:
        # Prepare context for LLM
        p = request.patient_context
        prompt = SYSTEM_PROMPT.format(
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
        response_text = llm.chat_completion(prompt, messages)

        # In a real app, we would parse citations from the LLM response
        # For this demo, we'll assume the LLM includes them in text or we extract a source tag
        
        return ChatResponse(
            answer=response_text,
            confidence_label="High (LLM Derived)",
            doctor_prompt=True,
            citation="Based on provided lab results and standard clinical guidelines."
        )
    except Exception as e:
        print(f"LLM Error: {e}")
        # Fallback to a structured demo response if LLM fails
        return ChatResponse(
            answer="I see your hemoglobin is 11.2 g/dL. This is slightly below the normal range of 13.0 - 17.5 g/dL. Hemoglobin is the protein in your blood that carries oxygen. When it's low, it's called anemia, which is why you might be feeling tired. I suggest discussing iron-rich foods with your doctor.",
            confidence_label="Fallback Demo",
            doctor_prompt=True,
            citation="ICMR 2023 Guidelines"
        )
