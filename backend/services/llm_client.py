import os  # reload
from openai import OpenAI
from typing import List, Dict, Any

GOOGLE_AI_STUDIO_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/openai/"


class LLMClient:
    def __init__(self):
        self.openrouter_api_key = os.getenv("OPENROUTER_API_KEY")
        self.google_api_key = os.getenv("GOOGLE_API_KEY")
        self.openrouter_base_url = os.getenv("OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1")

        if not self.openrouter_api_key:
            raise ValueError("OPENROUTER_API_KEY is not set in .env")

        # Two pre-built clients — selected per request based on model prefix
        self.google_client = OpenAI(
            base_url=GOOGLE_AI_STUDIO_BASE_URL,
            api_key=self.google_api_key or "no-key",
        ) if self.google_api_key else None

        self.openrouter_client = OpenAI(
            base_url=self.openrouter_base_url,
            api_key=self.openrouter_api_key,
        )

        print("LLMClient initialized")

    def chat_completion(
        self, system_prompt: str, messages: List[Dict[str, str]], max_tokens: int = 4096
    ) -> str:
        # Always read model fresh so .env changes take effect after server reload
        model = os.getenv("MODEL_NAME")
        if not model:
            raise ValueError("MODEL_NAME is not set in .env")

        # Normalize roles: frontend sends 'ai', OpenAI spec requires 'assistant'
        normalized = [
            {"role": "assistant" if m["role"] == "ai" else m["role"], "content": m["content"]}
            for m in messages
        ]
        all_messages = [{"role": "system", "content": system_prompt}] + normalized

        # Routing: google/ models → Google AI Studio (AIzaSy key works here)
        #          all other models → OpenRouter (credits or other BYOK)
        if model.startswith("google/") and self.google_client:
            # Strip the 'google/' prefix — AI Studio uses bare model names
            ai_studio_model = model[len("google/"):]
            print(f"Routing to Google AI Studio — model: {ai_studio_model}")
            client = self.google_client
            model_id = ai_studio_model
            extra_headers = {}
        else:
            print(f"Routing to OpenRouter — model: {model}")
            client = self.openrouter_client
            model_id = model
            extra_headers = {
                "HTTP-Referer": "https://medilens.ai",
                "X-Title": "MediLens",
            }

        try:
            response = client.chat.completions.create(
                model=model_id,
                messages=all_messages,
                max_tokens=max_tokens,
                extra_headers=extra_headers,
            )
            return response.choices[0].message.content
        except Exception as e:
            print(f"LLM Error [{model_id}]: {e}")
            raise
