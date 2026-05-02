import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv("backend/.env")
key = os.getenv("GOOGLE_API_KEY")
genai.configure(api_key=key)

print("Available models:")
for m in genai.list_models():
    if 'generateContent' in m.supported_generation_methods:
        print(m.name)
