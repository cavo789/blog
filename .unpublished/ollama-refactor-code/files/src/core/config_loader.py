# FILE: src/core/config_loader.py (REMPLACER LE CONTENU)

"""
Handles loading and validation of the application's configuration from a YAML file.
"""

from pathlib import Path
from typing import Any, cast

import yaml

from core.exceptions.config import ConfigError
from core.types import AppConfig


class ConfigLoader:
    """Loads the application configuration from a YAML file."""

    @staticmethod
    def load(config_path: Path) -> AppConfig:
        """
        Loads, parses, and validates the configuration file.

        Args:
            config_path: The path to the settings.yaml file.

        Returns:
            A TypedDict (AppConfig) representing the configuration.

        Raises:
            ConfigError: If the file is not found, cannot be parsed, or is invalid.
        """
        try:
            with open(config_path, encoding="utf-8") as file:
                data: Any = yaml.safe_load(file)
                # Cast to the TypedDict to ensure structure is recognized by mypy
                return cast(AppConfig, data)
        except FileNotFoundError as e:
            raise ConfigError(f"Configuration file not found: {config_path}") from e
        except (yaml.YAMLError, KeyError, TypeError) as e:
            raise ConfigError(f"Error parsing configuration file {config_path}: {e}") from e
