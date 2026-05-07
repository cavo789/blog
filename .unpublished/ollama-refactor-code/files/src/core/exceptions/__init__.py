"""Exports custom application exceptions for cleaner imports."""

from .config import ConfigError
from .files import DirectoryAccessError, FileReadError, FileWriteError
from .ollama import OllamaError
from .rules import EmptyRuleFileError, MissingRuleFileError, RuleError

__all__ = [
    "ConfigError",
    "DirectoryAccessError",
    "EmptyRuleFileError",
    "FileReadError",
    "FileWriteError",
    "MissingRuleFileError",
    "OllamaError",
    "RuleError",
]
