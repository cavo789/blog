import hashlib
import json
from pathlib import Path
from typing import Final


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
            # Create directory if it doesn't exist
            self.cache_dir.mkdir(parents=True, exist_ok=True)

            # Performance test: Try to write and then remove a canary file
            canary_file: Final[Path] = self.cache_dir / ".write_test"
            canary_file.write_text("test", encoding="utf-8")
            canary_file.unlink()
            return True
        except (OSError, PermissionError):
            return False

    def generate_key(self, filename: str, content: str, prompt: str) -> str:
        """Generates a unique SHA256 key based on content and rules."""
        unique_string: Final[str] = f"{filename}:{content}:{prompt}"
        return hashlib.sha256(unique_string.encode("utf-8")).hexdigest()

    def get(self, key: str) -> str | None:
        """Retrieves a cached response from the filesystem."""
        if not self.enabled:
            return None

        cache_file: Final[Path] = self.cache_dir / f"{key}.json"
        if not cache_file.exists():
            return None

        try:
            raw_data: Final[str] = cache_file.read_text(encoding="utf-8")
            data: Final[dict[str, str]] = json.loads(raw_data)
            return data.get("response")
        except (json.JSONDecodeError, OSError):
            return None

    def set(self, key: str, response: str) -> None:
        """Persists an AI response to the cache directory."""
        if not self.enabled:
            return

        cache_file: Final[Path] = self.cache_dir / f"{key}.json"
        try:
            payload: Final[str] = json.dumps({"response": response}, indent=2)
            cache_file.write_text(payload, encoding="utf-8")
        except OSError:
            # Silently fail on write errors during execution
            # since we verified at startup.
            pass
