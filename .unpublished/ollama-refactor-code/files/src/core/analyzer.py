"""Core logic for orchestrating file analysis with Ollama."""

import sys
from typing import Final

from cli.ui import UIHelper
from core.rules import RuleProvider
from core.types import VerbosityLevel
from infra.cache import CacheManager
from infra.ollama import OllamaClient

UI: Final[UIHelper] = UIHelper()


class CodeAnalyzer:
    """Analyzes source code by combining rules and managing cache."""

    def __init__(
        self,
        client: OllamaClient,
        rule_provider: RuleProvider,
        cache: CacheManager,
        verbosity: VerbosityLevel = VerbosityLevel.NAME,
    ) -> None:
        """Initialize the analyzer with required services."""
        self.client: Final[OllamaClient] = client
        self.rule_provider: Final[RuleProvider] = rule_provider
        self.cache: Final[CacheManager] = cache
        self.verbosity: Final[VerbosityLevel] = verbosity

    def _should_analyze(self, filename: str) -> bool:
        """Determine if a file should be analyzed based on its extension."""
        valid_exts: Final[set[str]] = {".py", ".php", ".sh", ".js", ".ts", ".yaml", ".json"}
        is_docker: Final[bool] = any(x in filename.lower() for x in ["docker", "compose"])
        ext: Final[str] = f".{filename.split('.')[-1]}" if "." in filename else ""
        return ext in valid_exts or is_docker

    def check_file(self, filename: str, content: str) -> str | None:
        """Prepare instructions and trigger AI review."""
        if not self._should_analyze(filename):
            return None

        base: Final[str] = self.rule_provider.get_base_rules()
        spec: Final[str] = self.rule_provider.get_specific_rules(filename)
        prompt: Final[str] = f"{base}\n\nSPECIFIC RULES:\n{spec}".strip()

        if not prompt:
            UI.print_fatal("Rules Missing", f"No rules found for {filename}")
            sys.exit(1)

        key: Final[str] = self.cache.generate_key(filename, content, prompt)
        cached: Final[str | None] = self.cache.get(key)

        if cached:
            UI.print_header(f"CACHE HIT: {filename}", "💾", "cyan")
            return cached

        if self.verbosity != VerbosityLevel.NONE:
            UI.print_header(f"PROMPT CONTEXT: {filename}", "🧠", "blue")
            if self.verbosity == VerbosityLevel.FULL:
                UI.print_info(prompt, "blue", bold=False)

        UI.print_info(f"🤖 AI MISS: Analyzing {filename}...", "yellow")
        response: Final[str] = self.client.analyze_code(prompt, content)
        self.cache.set(key, response)
        return response
