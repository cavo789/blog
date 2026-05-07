import hashlib
from pathlib import Path
from typing import Any, Final

from core.exceptions import DirectoryAccessError, FileWriteError
from core.file_utils import ensure_writable_directory, read_json_file, write_json_file


class CacheManager:
    """Manages AI response caching with strict writability verification."""

    def __init__(self, cache_dir: Path, enabled: bool = True) -> None:
        self.cache_dir: Final[Path] = cache_dir
        self.enabled: Final[bool] = enabled

    def verify_permissions(self) -> bool:
        """
        Ensures the cache directory is existing and writable.
        Returns False if the directory cannot be used for caching.
        """
        if not self.enabled:
            return True

        try:
            ensure_writable_directory(self.cache_dir)
        except DirectoryAccessError:
            return False

        return True

    def generate_key(self, filename: str, content: str, prompt: str) -> str:
        """Generates a unique SHA256 key based on content and rules."""
        unique_string: Final[str] = f"{filename}:{content}:{prompt}"
        return hashlib.sha256(unique_string.encode("utf-8")).hexdigest()

    def get(self, key: str) -> str | None:
        """Retrieves a cached response from the filesystem."""
        if not self.enabled:
            return None

        cache_file: Final[Path] = self.cache_dir / f"{key}.json"
        data: dict[str, Any] | None = read_json_file(cache_file)
        if data is None:
            return None

        response_value: Any = data.get("response")
        if isinstance(response_value, str):
            return response_value
        return None

    def set(self, key: str, response: str) -> None:
        """Persists an AI response to the cache directory."""
        if not self.enabled:
            return

        cache_file: Final[Path] = self.cache_dir / f"{key}.json"
        payload: Final[dict[str, str]] = {"response": response}

        try:
            write_json_file(cache_file, payload)
        except FileWriteError:
            # Silently fail on write errors, as per the original logic.
            # Permissions were already verified at startup.
            pass
