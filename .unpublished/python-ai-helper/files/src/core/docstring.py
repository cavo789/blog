import logging
import subprocess
from pathlib import Path

import libcst as cst

from core.llm import OllamaClient


class DocstringTask:
    """Handles automatic docstring generation using LibCST."""

    def __init__(self, llm: OllamaClient):
        self.llm = llm
        self.log = logging.getLogger("AI-Agent")

    class _Transformer(cst.CSTTransformer):
        def __init__(self, docstring: str):
            # Clean up residual quotes
            self.docstring = docstring.strip('`"\'\n')

        def leave_Module(self, original_node: cst.Module, updated_node: cst.Module) -> cst.Module:
            ds = cst.SimpleStatementLine([cst.Expr(cst.SimpleString(f'"""\n{self.docstring}\n"""'))])
            return updated_node.with_changes(body=[ds] + list(updated_node.body))

    def run(self, file_path: Path, code: str) -> bool:
        tree = cst.parse_module(code)

        if tree.body and isinstance(tree.body[0], cst.SimpleStatementLine):
            first_stmt = tree.body[0].body[0]
            if isinstance(first_stmt, cst.Expr) and isinstance(first_stmt.value, cst.SimpleString):
                return False

        # Optimized Prompt: Strictly forbid code generation
        prompt = (
            f"Write a 2-sentence module docstring for the following code. "
            f"DO NOT output Python code. DO NOT output imports or functions. "
            f"ONLY output the human-readable description.\n\n{code}"
        )
        ds = self.llm.call(prompt, "You are a technical writer. Output ONLY text.")

        if ds:
            # Failsafe: If the LLM hallucinates and includes code, truncate it.
            if "import " in ds or "def " in ds:
                self.log.warning("LLM hallucinated code. Truncating to text only.")
                clean_lines = []
                for line in ds.splitlines():
                    if line.startswith(("import ", "def ", "class ", "logger")):
                        break
                    clean_lines.append(line)
                ds = "\n".join(clean_lines).strip()

            # Clean logging: Only show a preview
            preview = ds[:100].replace('\n', ' ') + "..." if len(ds) > 100 else ds
            self.log.debug(f"Proposed Docstring: {preview}")

            modified = tree.visit(self._Transformer(ds))

            try:
                final_code = subprocess.run(
                    ["ruff", "format", "-"],
                    input=modified.code,
                    text=True,
                    capture_output=True,
                    check=True,
                ).stdout

                file_path.write_text(final_code, encoding="utf-8")
                return True

            except subprocess.CalledProcessError as e:
                self.log.error(f"Formatting failed on {file_path.name}. Ruff Exit Code: {e.returncode}")
                self.log.error(f"Ruff STDERR: {e.stderr.strip()}")
                return False

        return False