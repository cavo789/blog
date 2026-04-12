"""Elite AI Maintenance Agent - Main Orchestrator."""

import argparse
import os
import time
from pathlib import Path
from typing import Any, List

import yaml

from core.docstring import DocstringTask
from core.llm import OllamaClient
from core.logger import AgentLogger
from tasks.unit_test import UnitTestTask


class AgentOrchestrator:
    """Orchestrates the maintenance tasks across targeted Python files."""

    def __init__(self, config: dict[str, Any], args: argparse.Namespace):
        self.config: dict[str, Any] = config
        self.args: argparse.Namespace = args
        self.log = AgentLogger.setup(args.verbose or config.get("verbose", False))

        self.model: str = args.model or config.get("model", "qwen2.5-coder:7b")
        ollama_url: str = os.getenv(
            "OLLAMA_URL", config.get("ollama", {}).get("url", "http://host.docker.internal:11434")
        )

        self.llm = OllamaClient(url=ollama_url, model=self.model)

    def _get_target_files(self, root: Path) -> List[Path]:
        if root.is_file():
            if root.suffix != ".py":
                self.log.warning(f"Processing {root.name} despite missing .py extension.")
            return [root]

        if root.is_dir():
            return [
                f
                for f in root.rglob("*.py")
                if "tests" not in f.parts and f.name != "main.py"
            ]

        self.log.error(f"Path does not exist: {root}")
        return []

    def execute(self) -> None:
        start_time = time.time()
        
        root_path = Path(self.args.path).resolve()
        files = self._get_target_files(root_path)

        if not files:
            self.log.warning("No valid Python files found to process.")
            return

        force_flag = self.args.force or self.config.get("force", False)

        for py_file in files:
            display_name = py_file.name if root_path.is_file() else py_file.relative_to(root_path)
            self.log.info(f"--- Analyzing {display_name} ---")

            try:
                code = py_file.read_text(encoding="utf-8")

                if self.args.docstring or self.config.get("tasks", {}).get("docstring"):
                    if DocstringTask(self.llm).run(py_file, code, force=force_flag):
                        self.log.info(f"✓ Docstring updated: {py_file.name}")

                if self.args.tests or self.config.get("tasks", {}).get("tests"):
                    run_tests_flag = self.args.run_tests or self.config.get("tasks", {}).get("run_tests", False)
                    if UnitTestTask(self.llm).run(py_file, code, run_tests=run_tests_flag, force=force_flag):
                        self.log.info(f"✓ Test generation completed: {py_file.name}")

            except Exception as e:
                self.log.error(f"Failed to process {py_file.name}: {e}")

        # Calculate and display execution time
        elapsed = time.time() - start_time
        mins, secs = divmod(elapsed, 60)
        time_str = f"{int(mins)}m {secs:.2f}s" if mins > 0 else f"{secs:.2f}s"
        self.log.info(f"Done. Total Execution Time: {time_str}")


def main() -> None:
    """CLI Entrypoint."""
    parser = argparse.ArgumentParser(description="Elite AI Maintenance Agent")
    parser.add_argument("--path", required=True, help="Directory or single file")
    parser.add_argument("--config", default="/app/agent.yaml", help="Path to config file")
    parser.add_argument("--docstring", action="store_true")
    parser.add_argument("--tests", action="store_true")
    parser.add_argument("--run-tests", action="store_true")
    parser.add_argument("--model", type=str)
    parser.add_argument("--verbose", action="store_true")
    parser.add_argument("--force", action="store_true", help="Overwrite existing assets")
    args = parser.parse_args()

    config_path = Path(args.config)
    config: dict[str, Any] = {}
    
    if config_path.exists():
        with open(config_path, "r", encoding="utf-8") as f:
            config = yaml.safe_load(f) or {}

    AgentOrchestrator(config, args).execute()


if __name__ == "__main__":
    main()