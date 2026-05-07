from typing import Any, Final

import requests

from core.exceptions import OllamaError
from core.types import AppConfig, OllamaConfig, RuntimeConfig
from infra.network_checker import NetworkChecker


class OllamaClient:
    """Ollama API client with strict type safety."""

    def __init__(self, config: AppConfig) -> None:
        """Initializes the client with the necessary configuration."""
        self.ollama_config: Final[OllamaConfig] = config["ollama"]
        self.runtime_config: Final[RuntimeConfig] = config["runtime"]

    def is_available(self) -> bool:
        """Health check for the Ollama service."""
        result: bool = NetworkChecker.is_service_available(self.ollama_config["url"])
        return result

    def analyze_code(self, system_prompt: str, code_content: str) -> str:
        """Sends code to the LLM and returns the raw response string."""
        payload: Final[dict[str, Any]] = {
            "model": self.ollama_config["model"],
            "system": system_prompt,
            "prompt": f"Analyze this file content:\n\n{code_content}",
            "stream": False,
        }

        try:
            url: Final[str] = f"{self.ollama_config['url']}/api/generate"

            response: requests.Response = requests.post(
                url, json=payload, timeout=self.runtime_config["timeout"]
            )
            response.raise_for_status()
            result: Final[dict[str, Any]] = response.json()
            return str(result.get("response", ""))
        except requests.RequestException as error:
            raise OllamaError(f"AI communication error: {error}") from error
