import re
from pathlib import Path
from typing import Any, Final

import yaml

from core.exceptions import EmptyRuleFileError, MissingRuleFileError
from core.file_utils import get_file_extension

PatternRule = tuple[re.Pattern[str], str]


class RuleProvider:
    """Handles retrieval and validation of code review rules."""

    def __init__(self, rules_path: Path) -> None:
        """Initializes the provider with the base path for rules."""
        self.rules_path: Final[Path] = rules_path
        self.patterns: Final[list[PatternRule]] = self._load_patterns()

    def _load_patterns(self) -> list[PatternRule]:
        """Loads and compiles regex patterns from patterns.yaml."""
        patterns_file: Final[Path] = self.rules_path / "patterns.yaml"
        if not patterns_file.exists():
            return []

        try:
            with patterns_file.open("r", encoding="utf-8") as f:
                data: Any = yaml.safe_load(f)
                config_patterns: list[dict[str, str]] = data.get("patterns", [])

                compiled: list[PatternRule] = []
                for item in config_patterns:
                    pattern: re.Pattern[str] = re.compile(item["regex"])
                    rule_path: str = item["rule"]
                    compiled.append((pattern, rule_path))
                return compiled
        except (yaml.YAMLError, KeyError, FileNotFoundError):
            return []

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
                raise MissingRuleFileError(file_path)

            content: str = file_path.read_text(encoding="utf-8").strip()
            if not content:
                raise EmptyRuleFileError(file_path)

            parts.append(content)

        return "\n\n".join(parts)

    def get_specific_rules(self, filename: str) -> tuple[str, Path | None]:
        """
        Retrieves rules specific to the file type or name.
        Returns the content and the path of the found rule file.
        """
        for pattern, rule_file in self.patterns:
            if pattern.match(filename):
                rule_path: Path = self.rules_path / rule_file
                if rule_path.exists():
                    content: str = rule_path.read_text(encoding="utf-8").strip()
                    return content, rule_path

        name_lower: Final[str] = filename.lower()
        extension: Final[str] = get_file_extension(filename)

        potential_paths: Final[list[Path]] = [
            self.rules_path / "files" / f"{name_lower}.txt",
            self.rules_path / "templates" / f"{name_lower}.txt",
            self.rules_path / "ext" / f"{extension}.txt",
            self.rules_path / "default.txt",  # Fallback rule
        ]

        for rule_path in potential_paths:
            if rule_path.exists():
                content = rule_path.read_text(encoding="utf-8").strip()
                return content, rule_path

        return "", None
