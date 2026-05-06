import sys
from pathlib import Path
from typing import Final


class RuleProvider:
    """Handles retrieval and validation of code review rules."""

    def __init__(self, rules_path: Path) -> None:
        self.rules_path: Final[Path] = rules_path

    def get_base_rules(self) -> str:
        """
        Aggregates global and format rules.
        Exits with a loud error if core rules are missing.
        """
        parts: list[str] = []
        required_files: Final[list[str]] = ["global.txt", "output_format.txt"]

        for file_name in required_files:
            file_path: Path = self.rules_path / file_name
            if not file_path.exists():
                print("\n\033[1m\033[41m FATAL ERROR \033[0m")
                print(f"\033[91mRequired core rule file is MISSING: {file_path}\033[0m")
                print("\033[91mThe AI cannot review code without these instructions.\033[0m\n")
                sys.exit(1)

            content: str = file_path.read_text(encoding="utf-8").strip()
            if not content:
                print("\n\033[1m\033[41m FATAL ERROR \033[0m")
                print(f"\033[91mRequired core rule file is EMPTY: {file_path}\033[0m")
                sys.exit(1)

            parts.append(content)

        return "\n\n".join(parts)

    def get_specific_rules(self, filename: str) -> str:
        """Retrieves rules specific to the file type or name."""
        name_lower: Final[str] = filename.lower()
        extension: Final[str] = Path(filename).suffix.lstrip(".").lower()

        potential_paths: Final[list[Path]] = [
            self.rules_path / "files" / f"{name_lower}.txt",
            self.rules_path / "templates" / f"{name_lower}.txt",
            self.rules_path / "ext" / f"{extension}.txt",
        ]

        for rule_path in potential_paths:
            if rule_path.exists():
                return rule_path.read_text(encoding="utf-8").strip()
        return ""
