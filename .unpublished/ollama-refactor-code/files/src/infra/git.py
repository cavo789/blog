import os
import subprocess
from typing import Final


class GitManager:
    @staticmethod
    def _run_git(args: list[str]) -> str:
        """Runs git commands with a writable HOME to allow .gitconfig locking."""
        env: Final[dict[str, str]] = os.environ.copy()
        env["HOME"] = "/tmp"
        res: Final[subprocess.CompletedProcess[str]] = subprocess.run(
            args, capture_output=True, text=True, check=False, env=env
        )
        return res.stdout.strip()

    @staticmethod
    def get_staged_files() -> list[str]:
        """Returns list of staged filenames after ensuring safe.directory."""
        GitManager._run_git(["git", "config", "--global", "--add", "safe.directory", "/repo"])
        output: Final[str] = GitManager._run_git(
            ["git", "-C", "/repo", "diff", "--cached", "--name-only"]
        )
        return [f for f in output.split("\n") if f]

    @staticmethod
    def get_file_content(filename: str) -> str:
        """Retrieves content of a staged file."""
        return GitManager._run_git(["git", "-C", "/repo", "show", f":{filename}"])
