import os
import re
import sys
from pathlib import Path
from typing import Final

"""
Main entry point for the AI Code Reviewer application.
This script initializes and runs the main application logic.
"""

from app import CodeReviewApp


def main() -> None:
    """Main orchestrator for the AI Code Reviewer."""
    # 1. Environment and Path setup
    debug_mode: Final[bool] = os.getenv("AI_REVIEWER_DEBUG", "0") == "1"
    current_file_path: Final[Path] = Path(__file__).resolve()
    base_path: Final[Path] = current_file_path.parent.parent

    config_file: Final[Path] = base_path / "config" / "settings.yaml"
    rules_path: Final[Path] = base_path / "config" / "rules"

    # 2. Check if the rules directory exists (Added from yesterday's discussion)
    if not rules_path.exists() or not rules_path.is_dir():
        print(f"\033[91mError: Rules directory not found at {rules_path}\033[0m")
        sys.exit(1)

    # 3. Initialize Ollama Client
    client: Final[OllamaClient] = OllamaClient(str(config_file), debug=debug_mode)

    # 4. Connection check
    if not client.is_available():
        print("\033[93mOllama not found or offline; skipping AI review.\033[0m")
        sys.exit(0)

    # 5. Initialize Analyzer with the rules folder (instead of a single file)
    analyzer: Final[CodeAnalyzer] = CodeAnalyzer(client, rules_path, debug=debug_mode)

    files_to_review: list[tuple[str, str]] = []

    # Case 1: Manual Mode (arguments passed to docker run)
    if len(sys.argv) > 1:
        print("--- Manual AI Review Mode ---")
        for file_arg in sys.argv[1:]:
            # We assume the file is relative to /repo in the container
            path: Path = Path("/repo") / file_arg
            if path.exists() and path.is_file():
                files_to_review.append((file_arg, path.read_text(encoding="utf-8")))
            else:
                print(f"\033[91mFile not found: {file_arg}\033[0m")

    # Case 2: Git Hook Mode (staged files)
    else:
        git: Final[GitManager] = GitManager()
        staged_files: list[str] = git.get_staged_files()
        if not staged_files:
            sys.exit(0)

        print(f"--- Git Pre-commit AI Review ({len(staged_files)} files) ---")
        for f_name in staged_files:
            content: str = git.get_file_content(f_name)
            if content:
                files_to_review.append((f_name, content))

    # 6. Execution of the reviews
    if not files_to_review:
        print("\033[93mNo valid files found for review.\033[0m")
        sys.exit(0)

    rejection_count: int = 0
    for f_name, f_content in files_to_review:
        is_rejected: bool = process_review(analyzer, f_name, f_content)
        if is_rejected:
            rejection_count += 1

    # 7. Exit logic
    if rejection_count > 0:
        print(f"\n\033[91mFAILED: {rejection_count} file(s) did not pass the AI review.\033[0m")
        print("Use 'git commit --no-verify' to bypass if necessary.")
        sys.exit(1)

    print("\n\033[92mPASSED: All files are clean.\033[0m")
    sys.exit(0)


if __name__ == "__main__":
    main()
