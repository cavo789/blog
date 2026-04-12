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
        def __init__(self, docstring: str, replace_existing: bool):
            self.docstring = docstring.strip('`"\'\n')
            self.replace_existing = replace_existing

        def leave_Module(self, original_node: cst.Module, updated_node: cst.Module) -> cst.Module:
            ds = cst.SimpleStatementLine([cst.Expr(cst.SimpleString(f'"""\n{self.docstring}\n"""'))])
            
            body = list(updated_node.body)
            # If we are forcing an overwrite, we pop the first element (the old docstring)
            if self.replace_existing and body:
                body = body[1:]
                
            return updated_node.with_changes(body=[ds] + body)

    def run(self, file_path: Path, code: str, force: bool = False) -> bool:
        tree = cst.parse_module(code)
        has_docstring = False

        if tree.body and isinstance(tree.body[0], cst.SimpleStatementLine):
            first_stmt = tree.body[0].body[0]
            if isinstance(first_stmt, cst.Expr) and isinstance(first_stmt.value, cst.SimpleString):
                has_docstring = True

        if has_docstring and not force:
            self.log.info(f"↷ Skipping docstring: Already exists. Use --force to overwrite.")
            return False

        prompt = (
            f"Write a 2-sentence module docstring for the following code. "
            f"DO NOT output Python code. DO NOT output imports or functions. "
            f"ONLY output the human-readable description.\n\n{code}"
        )
        ds = self.llm.call(prompt, "You are a technical writer. Output ONLY text.")

        if ds:
            if "import " in ds or "def " in ds:
                clean_lines = []
                for line in ds.splitlines():
                    if line.startswith(("import ", "def ", "class ", "logger")):
                        break
                    clean_lines.append(line)
                ds = "\n".join(clean_lines).strip()

            preview = ds[:100].replace('\n', ' ') + "..." if len(ds) > 100 else ds
            self.log.debug(f"Proposed Docstring: {preview}")

            modified = tree.visit(self._Transformer(ds, replace_existing=has_docstring))

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