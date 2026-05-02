from fastapi import APIRouter, HTTPException
from models.chat_message import ChatRequest, ChatResponse
from services.chat_service import ChatService

router = APIRouter()
chat_service = ChatService()

@router.post("/chat/message", response_model=ChatResponse)
async def chat_message(request: ChatRequest):
    try:
        return chat_service.process_message(request)
    except Exception as e:
        print(f"Chat Service Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
