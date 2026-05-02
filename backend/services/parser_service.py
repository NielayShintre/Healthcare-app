import json
import re
from typing import Dict, Any
from .llm_client import LLMClient
from utils.prompt_loader import load_prompt

class ParserService:
    def __init__(self):
        self.llm = LLMClient()
        self.system_prompt_template = load_prompt('parser_system.md')

    def parse_lab_text(self, text: str) -> Dict[str, Any]:
        if not text.strip():
            return {"lab_name": "Unknown", "report_date": "Unknown", "markers": []}

        try:
            print(f"DEBUG: Sending text to LLM for parsing ({len(text)} chars)")
            response_text = self.llm.chat_completion(
                system_prompt=self.system_prompt_template,
                messages=[{"role": "user", "content": f"Parse this lab report text:\n\n{text}"}]
            )
            print(f"DEBUG: Raw LLM Response: {response_text[:500]}...")
            
            # Clean response text to ensure it's valid JSON
            json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
            if json_match:
                parsed = json.loads(json_match.group(0))
                print(f"DEBUG: Successfully parsed {len(parsed.get('markers', []))} markers")
                return parsed
            
            print("DEBUG: No JSON found in LLM response")
            raise Exception("AI failed to extract structured markers from the report text.")
        except Exception as e:
            print(f"DEBUG: LLM Parsing error: {e}")
            raise e
