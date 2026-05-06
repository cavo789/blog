from enum import StrEnum
from typing import TypedDict


class VerbosityLevel(StrEnum):
    """Available verbosity levels for console output."""

    NONE = "none"
    NAME = "name"
    FULL = "full"


class VerbosityConfig(TypedDict):
    """Configuration for verbosity settings."""

    show_config: bool
    show_system_instructions: str
    show_full_source: bool
    show_diff: bool


class OllamaConfig(TypedDict):
    """Ollama API settings."""

    model: str
    url: str


class RuntimeConfig(TypedDict):
    """Application runtime settings."""

    timeout: int
    cache_enabled: bool
    verbosity: VerbosityConfig


class AppConfig(TypedDict):
    """Global configuration structure matching settings.yaml."""

    ollama: OllamaConfig
    runtime: RuntimeConfig
