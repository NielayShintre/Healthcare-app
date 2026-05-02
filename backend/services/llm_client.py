import os
from openai import OpenAI
from typing import List, Dict, Any

class LLMClient:
    def __init__(self):
        self.api_key = os.getenv("OPENROUTER_API_KEY")
        self.base_url = os.getenv("OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1")
        self.model = os.getenv("MODEL_NAME", "anthropic/claude-3-sonnet")
        self.client = OpenAI(
            base_url=self.base_url,
            api_key=self.api_key,
        )

    def chat_completion(self, system_prompt: str, messages: List[Dict[str, str]], max_tokens: int = 4096) -> str:
        all_messages = [{"role": "system", "content": system_prompt}] + messages
        
        response = self.client.chat.completions.create(
            model=self.model,
            messages=all_messages,
            max_tokens=max_tokens,
            extra_headers={
                "HTTP-Referer": "https://medilens.ai", # Optional, for OpenRouter rankings
                "X-Title": "MediLens", # Optional
            }
        )
        return response.choices[0].message.content
