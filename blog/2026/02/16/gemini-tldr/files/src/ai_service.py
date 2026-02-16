import os
import time
import logging
from typing import Final
from google import genai
from google.genai import types
from google.genai.errors import ClientError

class AIService:
    """
    Handles interactions with the Google Gen AI SDK (v1.0+).
    Includes retry logic for rate limits (429).
    """

    # Let's switch to the standard Flash 2.0.
    # It often has a more stable pool than the 'Lite' or 'Preview' versions.
    _MODEL_NAME: Final[str] = "gemini-2.0-flash"

    def __init__(self, api_key: str | None) -> None:
        if not api_key:
            raise ValueError("API Key is missing. Check your .env file.")

        self._client = genai.Client(api_key=api_key)

    def generate_tldr(self, content: str) -> str:
        """
        Generates a concise TL;DR summary using Gemini.
        Includes exponential backoff for 429 Resource Exhausted errors.
        """
        prompt: str = (
            "You are an expert technical editor. "
            "Read the following article content and generate a 'TL;DR' summary. "
            "The summary must be concise (max 3 sentences) and written in the same language as the article. "
            "Do NOT use blockquotes (>), markdown formatting, or introductory text. "
            "Just provide the raw summary text.\n\n"
            f"Content:\n{content}"
        )

        max_retries = 5
        base_delay = 5  # Start with 5 seconds

        for attempt in range(max_retries):
            try:
                response = self._client.models.generate_content(
                    model=self._MODEL_NAME,
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        temperature=0.3,
                    )
                )

                if not response.text:
                    raise RuntimeError("Empty response from Gemini API.")

                return response.text.strip().lstrip(">").strip()

            except ClientError as e:
                # Check if it is a Quota/Rate Limit error (429)
                if e.code == 429:
                    if attempt == max_retries - 1:
                        raise RuntimeError(f"Max retries exceeded after 429 error: {e}") from e

                    # Calculate wait time: 5s, 10s, 20s, 40s...
                    wait_time = base_delay * (2 ** attempt)
                    print(f"\n   ⏳ Quota hit (429). Waiting {wait_time}s before retry {attempt + 1}/{max_retries}...")
                    time.sleep(wait_time)
                else:
                    # If it's another error (400, 404, 500), crash immediately
                    raise RuntimeError(f"AI Generation failed: {e}") from e

            except Exception as e:
                raise RuntimeError(f"Unexpected error: {e}") from e

        raise RuntimeError("Failed to generate TL;DR after retries.")
