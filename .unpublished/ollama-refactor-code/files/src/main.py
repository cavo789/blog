import os
import re
import sys
from pathlib import Path
from typing import Final

from rich.text import Text

from cli.diff import DiffEngine
from cli.ui import UIHelper
from core.analyzer import CodeAnalyzer
from core.rules import RuleProvider
from core.types import AppConfig, RuntimeConfig, VerbosityConfig, VerbosityLevel
from infra.cache import CacheManager
from infra.git import GitManager
from infra.ollama import OllamaClient

# Global UI instance for standard output
UI: Final[UIHelper] = UIHelper()


def extract_fixed_code(text: str) -> str | None:
    """Extracts code between [FIXED_CODE] tags."""
    pattern: Final[str] = r"\[FIXED_CODE\](.*?)\[/FIXED_CODE\]"
    match: Final[re.Match[str] | None] = re.search(pattern, text, re.DOTALL)
    if match:
        code: str = match.group(1).strip()
        code = re.sub(r"^```[a-zA-Z]*\n|```$", "", code, flags=re.MULTILINE)
        return code.strip()
    return None


def process_review(analyzer: CodeAnalyzer, filename: str, content: str, show_diff: bool) -> bool:
    """Runs the AI review and prints stylized feedback."""
    review: Final[str | None] = analyzer.check_file(filename, content)

    if review and "REJECTED" in review.upper():
        UI.print_header(f"REJECTED: {filename}", "❌", "red")

        explanation: Final[str] = review.split("[FIXED_CODE]")[0].replace("REJECTED:", "")
        UI.print_analysis_results(explanation)

        fixed_code: Final[str | None] = extract_fixed_code(review)
        if fixed_code:
            UI.print_header("Refactored Source", "🛠️", "cyan")
            UI.print_code_block(fixed_code, filename)

            if show_diff:
                UI.print_header("Differential View", "Δ", "blue")

                # On récupère l'objet Text et on l'imprime via la console de l'UI
                diff_output: Final[Text] = DiffEngine.generate_colored_diff(
                    content, fixed_code, filename
                )
                UI.console.print(diff_output)

        return True

    UI.print_info(f"✔ {filename}: LGTM", "green")
    return False


def main() -> None:
    """Main execution flow with strict pathing and permissions."""
    base_dir: Final[Path] = Path(__file__).resolve().parent.parent
    config_path: Final[Path] = base_dir / "config" / "settings.yaml"
    rules_dir: Final[Path] = base_dir / "config" / "rules"

    # Path aligned with Docker volume mount for persistence
    cache_path: Final[Path] = Path("/app/.cache")

    client: Final[OllamaClient] = OllamaClient(str(config_path))
    config: Final[AppConfig] = client.config

    # Strict typing added here
    runtime_cfg: Final[RuntimeConfig] = config["runtime"]
    verbosity_cfg: Final[VerbosityConfig] = runtime_cfg["verbosity"]

    # 1. Start-up: Restoration of the Magenta Box
    if verbosity_cfg.get("show_config"):
        info_str: Final[str] = f"{config['ollama']['model']} @ {config['ollama']['url']}"
        UI.print_config(info_str)

    # 2. Cache Permissions
    is_cache_enabled: Final[bool] = runtime_cfg.get("cache_enabled", True)
    cache: Final[CacheManager] = CacheManager(cache_path, is_cache_enabled)

    if is_cache_enabled and not cache.verify_permissions():
        UI.print_fatal(
            "Cache Permission Error",
            f"The directory '{cache_path}' is NOT writable by UID {os.getuid()}.",
        )
        sys.exit(1)

    # 3. Connection Validation
    if not client.is_available():
        UI.print_info("Ollama unreachable. Skipping AI review.", "yellow")
        sys.exit(0)

    # 4. Analyzer Init
    level_name: Final[str] = verbosity_cfg.get("show_system_instructions", "name")
    verbosity_level: Final[VerbosityLevel] = VerbosityLevel(level_name)
    analyzer: Final[CodeAnalyzer] = CodeAnalyzer(
        client, RuleProvider(rules_dir), cache, verbosity_level
    )

    # 5. File Gathering
    git: Final[GitManager] = GitManager()
    files_to_review: list[tuple[str, str]] = []

    if len(sys.argv) > 1:
        for manual_arg in sys.argv[1:]:
            target: Path = Path("/repo") / manual_arg
            if target.exists() and target.is_file():
                files_to_review.append((manual_arg, target.read_text(encoding="utf-8")))
            else:
                # LOUD ERROR: The file doesn't exist
                UI.print_fatal(
                    "File Not Found", f"The manually specified file does not exist: {manual_arg}"
                )
                sys.exit(1)
    else:
        for staged_name in git.get_staged_files():
            staged_content: str = git.get_file_content(staged_name)
            if staged_content:
                files_to_review.append((staged_name, staged_content))

    if not files_to_review:
        sys.exit(0)

    # 6. Execute Reviews (No Final variables inside loop)
    rejection_count: int = 0
    diff_on: Final[bool] = verbosity_cfg.get("show_diff", True)

    for current_name, current_content in files_to_review:
        # Strict boolean typing enforced
        is_rejected: bool = process_review(analyzer, current_name, current_content, diff_on)
        if is_rejected:
            rejection_count += 1

    # 7. Outcome
    if rejection_count > 0:
        UI.print_info(f"\nFAILED: {rejection_count} file(s) rejected.", "red")
        sys.exit(1)

    UI.print_info("\nPASSED: All staged files are clean.", "green")


if __name__ == "__main__":
    main()
