"""Custom exceptions related to the rule loading and processing system."""

from pathlib import Path


class RuleError(Exception):
    """A base exception for errors originating from the RuleProvider."""


class MissingRuleFileError(RuleError):
    """Raised when a required rule file does not exist."""

    def __init__(self, path: Path) -> None:
        """Initializes the exception with the missing file path."""
        super().__init__(f"Required core rule file is MISSING: {path}")
        self.path: Path = path


class EmptyRuleFileError(RuleError):
    """Raised when a required rule file is empty."""

    def __init__(self, path: Path) -> None:
        """Initializes the exception with the empty file path."""
        super().__init__(f"Required core rule file is EMPTY: {path}")
        self.path: Path = path
