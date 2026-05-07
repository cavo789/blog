"""Utilities for file and path manipulations."""

import json
from pathlib import Path
from typing import Any, Final, cast

from core.exceptions import DirectoryAccessError, FileReadError, FileWriteError


def get_file_extension(filename: str) -> str:
    """
    Safely extract a file's extension in lowercase without the leading dot.

    Uses pathlib for robustness, correctly handling edge cases like:
    - 'main.py' -> 'py'
    - 'archive.tar.gz' -> 'gz'
    - '.bashrc' -> ''
    - 'Dockerfile' -> ''
    - 'file.' -> ''

    Args:
        filename: The name of the file.

    Returns:
        The lowercase extension string, or an empty string if none exists.
    """
    if not filename:
        return ""

    return Path(filename).suffix.lstrip(".").lower()


def ensure_writable_directory(directory_path: Path) -> None:
    """
    Ensures a directory exists and is writable.

    Creates the directory if it doesn't exist. Then, it performs a test
    by writing and deleting a temporary file to confirm permissions.

    Args:
        directory_path: The path to the directory to check.

    Raises:
        DirectoryAccessError: If the directory cannot be created or is not writable.
    """
    try:
        directory_path.mkdir(parents=True, exist_ok=True)
        canary_file: Final[Path] = directory_path / ".write_test"
        canary_file.write_text("test", encoding="utf-8")
        canary_file.unlink()
    except (OSError, PermissionError) as exception:
        raise DirectoryAccessError(
            f"Directory '{directory_path}' is not writable. Reason: {exception}"
        ) from exception


def read_file_content(path: Path) -> str:
    """
    Reads the content of a file with robust error handling.

    Args:
        path: The Path object pointing to the file.

    Returns:
        The file content as a string.

    Raises:
        FileReadError: If the file cannot be found or read.
    """
    if not path.is_file():
        raise FileReadError(f"File Not Found: The specified path is not a file: {path}")
    try:
        return path.read_text(encoding="utf-8")
    except (OSError, UnicodeDecodeError) as exception:
        raise FileReadError(f"Failed to Read File: {path}. Reason: {exception}") from exception


def read_json_file(path: Path) -> dict[str, Any] | None:
    """
    Safely reads and decodes a JSON file.

    Args:
        path: The path to the JSON file.

    Returns:
        The decoded JSON as a dictionary, or None if the file does not
        exist, cannot be read, or contains invalid JSON.
    """
    # This is a non-exceptional case for a cache miss. If the file doesn't
    # exist, we simply return None without raising an error.
    if not path.exists():
        return None

    try:
        content: str = read_file_content(path)

        parsed_data: Any = json.loads(content)

        if isinstance(parsed_data, dict):
            return cast(dict[str, Any], parsed_data)

        return None
    except json.JSONDecodeError:
        return None  # The content was not valid JSON.


def write_json_file(path: Path, data: dict[str, Any]) -> None:
    """
    Writes a dictionary to a file in JSON format.

    Args:
        path: The path to the output file.
        data: The dictionary to serialize and write.

    Raises:
        FileWriteError: If the file cannot be written due to permissions
                        or other OS-level issues.
    """
    try:
        payload: str = json.dumps(data, indent=2)
        path.write_text(payload, encoding="utf-8")
    except OSError as exception:
        raise FileWriteError(f"Failed to write to file '{path}': {exception}") from exception
