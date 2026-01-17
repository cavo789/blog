import os
from dotenv import load_dotenv
from google import genai

load_dotenv()
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

print("Available models:")
for model in client.models.list(config={"page_size": 100}):
    print(f"- {model.name}")
