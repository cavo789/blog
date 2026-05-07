"""
Main application class that orchestrates the code review process.
"""

import os
import sys
from pathlib import Path
from typing import Final

from cli.ui import UIHelper
from core.analyzer import CodeAnalyzer
from core.config_loader import ConfigLoader
from core.exceptions import ConfigError, FileReadError, RuleError
from core.file_utils import read_file_content
from core.result_handler import ReviewResultHandler
from core.rules import RuleProvider
from core.types import AppConfig, GitStagingAnalyzerConfig, VerbosityLevel
from core.validator import CodeValidator
from infra.cache import CacheManager
from infra.git import GitManager
from infra.network_checker import NetworkChecker
from infra.ollama import OllamaClient


class CodeReviewApp:
    """The main application orchestrator."""

    def __init__(self) -> None:
        """Initializes the UI and prepares for service setup."""
        self.ui: Final[UIHelper] = UIHelper()
        # Services are initialized in `_setup_services` to keep __init__ clean.
        self.analyzer: CodeAnalyzer
        self.result_handler: ReviewResultHandler
        self.show_diff: bool

    def _gather_files(self) -> list[tuple[str, str, bool]]:
        """Gathers files from command-line arguments or Git staging area."""
        if len(sys.argv) > 1:
            return self._get_manual_files()
        return self._get_staged_files()

    def _get_manual_files(self) -> list[tuple[str, str, bool]]:
        """Reads files provided as command-line arguments."""
        files: list[tuple[str, str, bool]] = []
        for arg in sys.argv[1:]:
            target: Path = Path("/repo") / arg
            try:
                content: str = read_file_content(target)
                files.append((arg, content, True))  # True for force_analysis
            except FileReadError as exception:
                self.ui.print_fatal_error("File Not Found", str(exception))
                sys.exit(1)
        return files

    def _get_staged_files(self) -> list[tuple[str, str, bool]]:
        """Reads staged files from Git."""
        files: list[tuple[str, str, bool]] = []
        git: GitManager = GitManager()
        for name in git.get_staged_files():
            content: str = git.get_file_content(name)
            if content:
                files.append((name, content, False))
        return files

    def _setup_services(self) -> None:
        """Loads config and initializes all services (Composition Root)."""
        base_dir: Final[Path] = Path(__file__).resolve().parent.parent
        config_path: Final[Path] = base_dir / "config" / "settings.yaml"

        try:
            config: AppConfig = ConfigLoader.load(config_path)
        except ConfigError as e:
            self.ui.print_fatal_error("Configuration Error", str(e))
            sys.exit(1)

        # --- CORRECTION ---
        # "verbosity" is inside "runtime", so we access it via config["runtime"].
        if config["runtime"]["verbosity"]["show_config"]:
            info: str = f"{config['ollama']['model']} @ {config['ollama']['url']}"
            self.ui.print_configuration(info)

        if not NetworkChecker.is_service_available(config["ollama"]["url"]):
            self.ui.print_information("Ollama unreachable. Skipping AI review.", "yellow")
            sys.exit(0)

        client: OllamaClient = OllamaClient(config)

        cache_path: Path = Path("/app/.cache")
        cache_enabled: bool = config["runtime"]["cache_enabled"]
        cache: CacheManager = CacheManager(cache_path, cache_enabled)
        if cache_enabled and not cache.verify_permissions():
            self.ui.print_fatal_error(
                "Cache Permission Error",
                f"Directory '{cache_path}' not writable by UID {os.getuid()}.",
            )
            sys.exit(1)

        rules_dir: Path = base_dir / "config" / "rules"
        rule_provider: RuleProvider = RuleProvider(rules_dir)

        analyzer_cfg: GitStagingAnalyzerConfig = config["git_staging_analyzer"]
        self.analyzer = CodeAnalyzer(
            client,
            rule_provider,
            cache,
            set(ext.lstrip(".") for ext in analyzer_cfg["supported_extensions"]),
            set(fn.lower() for fn in analyzer_cfg["special_filenames"]),
            VerbosityLevel(config["runtime"]["verbosity"]["show_system_instructions"]),
        )

        self.result_handler = ReviewResultHandler(self.ui, CodeValidator())
        self.show_diff = config["runtime"]["verbosity"]["show_diff"]

    def run(self) -> None:
        """Main execution flow of the application."""
        self._setup_services()

        files_to_review: list[tuple[str, str, bool]] = self._gather_files()
        if not files_to_review:
            self.ui.print_information("No files to review.", "yellow")
            sys.exit(0)

        rejection_count: int = 0
        for name, content, force in files_to_review:
            try:
                review: str | None = self.analyzer.check_file(name, content, force_analysis=force)
                is_rejected: bool = self.result_handler.process(
                    review, name, content, self.show_diff
                )
                if is_rejected:
                    rejection_count += 1
            except RuleError as e:
                self.ui.print_fatal_error(f"Rule Error for {name}", str(e))
                sys.exit(1)

        if rejection_count > 0:
            self.ui.print_information(f"\nFAILED: {rejection_count} file(s) rejected.", "red")
            sys.exit(1)

        self.ui.print_information("\nPASSED: All files are clean.", "green")
