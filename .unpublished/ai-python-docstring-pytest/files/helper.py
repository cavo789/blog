"""Module for handling file operations with logging and error handling.
This module provides functions to read from and write to text files, get file information,
list files by extension, and safely delete files. Each function includes detailed logging
to help diagnose issues during file operations."""

import logging
from pathlib import Path
from typing import Final

logger: Final = logging.getLogger(__name__)


def read_text_content(file_path: Path) -> str:
    try:
        return file_path.read_text(encoding="utf-8")
    except FileNotFoundError:
        logger.error("File not found at %s", file_path)
        raise
    except IOError as e:
        logger.error("Failed to read file %s: %s", file_path, e)
        raise


def write_text_content(file_path: Path, content: str, append: bool = False) -> None:
    try:
        file_path.parent.mkdir(parents=True, exist_ok=True)
        mode: str = "a" if append else "w"
        with file_path.open(mode=mode, encoding="utf-8") as file:
            file.write(content)
    except IOError as e:
        logger.error("Could not write to %s: %s", file_path, e)
        raise


def get_file_info(file_path: Path) -> dict[str, int | float]:
    if not file_path.is_file():
        raise FileNotFoundError(f"No file found at {file_path}")

    stats = file_path.stat()
    return {"size_bytes": stats.st_size, "modified_at": stats.st_mtime}


def list_files_by_extension(directory: Path, extension: str) -> list[Path]:
    if not directory.is_dir():
        return []

    ext: str = extension if extension.startswith(".") else f".{extension}"
    return [
        path for path in directory.iterdir() if path.is_file() and path.suffix == ext
    ]


def safe_delete(file_path: Path) -> bool:
    try:
        if file_path.exists():
            file_path.unlink()
            return True
        return False
    except OSError as e:
        logger.error("Error deleting file %s: %s", file_path, e)
        return False
