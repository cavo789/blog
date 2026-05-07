"""Core logic for orchestrating file analysis with Ollama."""

import sys
from typing import Final

from cli.ui import UIHelper
from core.exceptions import OllamaError, RuleError
from core.file_utils import get_file_extension
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
        supported_extensions: set[str],
        special_filenames: set[str],
        verbosity: VerbosityLevel = VerbosityLevel.NAME,
    ) -> None:
        """Initialize the analyzer with required services."""
        self.client: Final[OllamaClient] = client
        self.rule_provider: Final[RuleProvider] = rule_provider
        self.cache: Final[CacheManager] = cache
        self.verbosity: Final[VerbosityLevel] = verbosity
        self.supported_extensions: Final[set[str]] = supported_extensions
        self.special_filenames: Final[set[str]] = special_filenames

    def _should_analyze(self, filename: str) -> bool:
        """Determine if a file should be analyzed based on configuration."""
        name_lower: Final[str] = filename.lower()

        if any(special in name_lower for special in self.special_filenames):
            return True

        extension: Final[str] = get_file_extension(filename)
        return extension in self.supported_extensions

    def _build_prompt(self, filename: str) -> str:
        """Constructs the full AI prompt from base and specific rules."""
        try:
            base_rules: Final[str] = self.rule_provider.get_base_rules()
            specific_content, specific_path = self.rule_provider.get_specific_rules(filename)
        except RuleError as exception:
            UI.print_fatal_error("Rule System Error", str(exception))
            sys.exit(1)

        prompt_parts: list[str] = [base_rules]
        if specific_content and specific_path:
            display_path: str = str(specific_path).replace("/app/", "")
            prompt_parts.append(f"SPECIFIC RULES FROM: [{display_path}]\n{specific_content}")
        return "\n\n".join(prompt_parts).strip()

    def _check_cache(self, key: str, filename: str) -> str | None:
        """Checks for a cached response and returns it if found."""
        cached_response: Final[str | None] = self.cache.get(key)
        if cached_response is not None:
            UI.print_section_header(f"CACHE HIT: {filename}", "💾", "cyan")
            return cached_response
        return None

    def _display_prompt_context(self, filename: str, prompt: str) -> None:
        """Displays the prompt context based on the verbosity level."""
        if self.verbosity == VerbosityLevel.NONE:
            return
        UI.print_section_header(f"PROMPT CONTEXT: {filename}", "🧠", "blue")
        if self.verbosity == VerbosityLevel.FULL:
            UI.print_markdown_block(prompt)

    def _execute_ai_analysis(self, key: str, filename: str, content: str, prompt: str) -> str:
        """Executes the AI analysis for a cache miss."""
        UI.print_information(f"🤖 AI MISS: Analyzing {filename}...", "yellow")
        try:
            response: str = self.client.analyze_code(prompt, content)
            self.cache.set(key, response)
            return response
        except OllamaError as e:
            UI.print_fatal_error(f"AI Analysis Failed for '{filename}'", str(e))
            sys.exit(1)

    def check_file(self, filename: str, content: str, force_analysis: bool = False) -> str | None:
        """Orchestrates the file analysis process."""
        if not force_analysis and not self._should_analyze(filename):
            return None

        prompt: Final[str] = self._build_prompt(filename)
        key: Final[str] = self.cache.generate_key(filename, content, prompt)

        cached_result: str | None = self._check_cache(key, filename)
        if cached_result is not None:
            return cached_result

        self._display_prompt_context(filename, prompt)
        return self._execute_ai_analysis(key, filename, content, prompt)
