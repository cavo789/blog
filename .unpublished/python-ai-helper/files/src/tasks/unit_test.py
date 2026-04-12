"""Task for generating and executing unit tests."""

import logging
import os
import subprocess
from pathlib import Path

from core.llm import OllamaClient


class UnitTestTask:
    """Handles unit test generation and validation."""

    def __init__(self, llm: OllamaClient):
        self.llm = llm
        self.log = logging.getLogger("AI-Agent")

    def run(self, file_path: Path, code: str, run_tests: bool = False) -> bool:
        test_dir = file_path.parent / "tests"
        test_dir.mkdir(exist_ok=True)
        test_path = test_dir / f"test_{file_path.name}"

        prompt = (
            f"Generate a pytest file for the following code. "
            f"Import using 'from {file_path.stem} import *'.\n\n{code}"
        )
        test_code = self.llm.call(prompt, "Output ONLY raw Python code.")

        if test_code:
            # Clean Logging: Avoid dumping the whole file
            self.log.debug(f"✓ Generated unit test code ({len(test_code)} bytes).")
            test_path.write_text(test_code, encoding="utf-8")

            subprocess.run(["ruff", "format", str(test_path)], capture_output=True)
            subprocess.run(["ruff", "check", "--fix", str(test_path)], capture_output=True)

            if run_tests:
                self.log.debug(f"Executing Pytest for {test_path.name}...")
                
                env = os.environ.copy()
                env["PYTHONPATH"] = f"{file_path.parent}:{env.get('PYTHONPATH', '')}"
                env["PYTHONDONTWRITEBYTECODE"] = "1"

                res = subprocess.run(
                    ["pytest", "-v", "-p", "no:cacheprovider", str(test_path)],
                    capture_output=True,
                    text=True,
                    env=env,
                )

                if res.returncode == 0:
                    self.log.info(f"✓ Tests PASSED for {file_path.name}")
                    # Log the clean summary output from Pytest
                    self.log.debug(f"Pytest Output:\n{res.stdout.strip()}")
                else:
                    self.log.error(f"✗ Tests FAILED for {file_path.name}")
                    self.log.error(f"Pytest Output:\n{res.stdout.strip()}\n{res.stderr.strip()}")
                    return False

            return True

        return False