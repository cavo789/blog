"""Ollama LLM Client."""

import logging
import re
from typing import Final

import requests


class OllamaClient:
    """Dedicated client for LLM interaction."""
    
    def __init__(self, url: str, model: str, temperature: float = 0.0):
        self.url: Final[str] = f"{url}/api/generate"
        self.model: Final[str] = model
        self.temperature: Final[float] = temperature
        self.log = logging.getLogger("AI-Agent")

    def call(self, prompt: str, system_msg: str = "") -> str:
        """Sends a prompt to the Ollama API and returns the extracted code/text."""
        payload = {
            "model": self.model,
            "prompt": prompt,
            "stream": False,
            "system": system_msg,
            "options": {"temperature": self.temperature}
        }
        try:
            response = requests.post(self.url, json=payload, timeout=300)
            response.raise_for_status()
            text = response.json().get("response", "").strip()
            return self._extract_code(text)
        except requests.RequestException as e:
            self.log.error(f"Ollama API Connection Error: {e}")
            return ""

    def _extract_code(self, text: str) -> str:
        """Extracts code blocks from markdown or cleans up chatty LLM responses."""
        match = re.search(r"```(?:python)?(.*?)```", text, re.DOTALL)
        if match:
            return match.group(1).strip()
            
        # Fallback filter for common LLM conversational filler
        forbidden = ["Certainly", "Here is", "I've", "Explanation:"]
        lines = [l for l in text.splitlines() if not any(f in l for f in forbidden)]
        return "\n".join(lines).strip()