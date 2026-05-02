import os
import httpx
from dotenv import load_dotenv

load_dotenv("backend/.env")

key = os.getenv("GOOGLE_API_KEY")
if not key:
    print("GOOGLE_API_KEY not found in backend/.env")
    exit(1)

print(f"Testing key: {key[:5]}...{key[-5:]}")

url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={key}"

data = {
    "contents": [{
        "parts": [{"text": "Say hello world"}]
    }]
}

response = httpx.post(url, json=data)
print(f"Status: {response.status_code}")
print(f"Response: {response.text}")
