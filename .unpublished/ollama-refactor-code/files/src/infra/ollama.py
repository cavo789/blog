import sys
from typing import Any, Final, cast

import requests
import yaml

from core.types import AppConfig


class OllamaClient:
    """Ollama API client with strict type safety."""

    def __init__(self, config_path: str) -> None:
        try:
            with open(config_path, encoding="utf-8") as file:
                data: Any = yaml.safe_load(file)
                self.config: Final[AppConfig] = cast(AppConfig, data)
        except (OSError, yaml.YAMLError, KeyError) as error:
            print(f"Critical error loading config: {error}")
            sys.exit(1)

    def is_available(self) -> bool:
        """Health check for the Ollama service."""
        try:
            url: Final[str] = f"{self.config['ollama']['url']}/api/tags"
            response: requests.Response = requests.get(url, timeout=5)
            return bool(response.status_code == 200)
        except requests.RequestException:
            return False

    def analyze_code(self, system_prompt: str, code_content: str) -> str:
        """Sends code to the LLM and returns the raw response string."""
        payload: Final[dict[str, Any]] = {
            "model": self.config["ollama"]["model"],
            "system": system_prompt,
            "prompt": f"Analyze this file content:\n\n{code_content}",
            "stream": False,
        }

        try:
            url: Final[str] = f"{self.config['ollama']['url']}/api/generate"
            response: requests.Response = requests.post(
                url, json=payload, timeout=self.config["runtime"]["timeout"]
            )
            response.raise_for_status()
            result: Final[dict[str, Any]] = response.json()
            return str(result.get("response", ""))
        except (requests.RequestException, KeyError) as error:
            return f"AI communication error: {error}"
