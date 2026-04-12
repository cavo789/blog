"""AI-powered Maintenance Agent for Python projects."""

import argparse
import os
import subprocess
import sys
import requests
import libcst as cst
import tempfile
import re
from pathlib import Path

OLLAMA_URL = os.getenv("OLLAMA_URL", "http://host.docker.internal:11434")

def call_ollama(prompt: str, model: str, system_instruction: str = "") -> str:
    """Sends a request to the local Ollama instance."""
    payload = {
        "model": model,
        "prompt": prompt,
        "stream": False,
        "system": system_instruction,
        "options": {"temperature": 0.0}
    }
    response = requests.post(f"{OLLAMA_URL}/api/generate", json=payload, timeout=300)
    text = response.json().get("response", "").strip()

    # Priority 1: Extract block if LLM uses markdown
    match = re.search(r"```(?:python)?(.*?)```", text, re.DOTALL)
    if match:
        return match.group(1).strip()

    # Priority 2: If no markdown, aggressively filter common chatbot chatter
    forbidden = ["Thank you", "I'm sorry", "It looks like", "Explanation:", "Please provide", "**", "Here is"]
    lines = [l for l in text.splitlines() if not any(f in l for f in forbidden) and l.strip()]

    # Priority 3: Only return lines that look like Python code
    return "\n".join(lines).strip()

def validate_code_safety(code: str) -> bool:
    """Formats and lints code."""
    formatted = subprocess.run(["ruff", "format", "--stdin-filename", "temp.py"], input=code, capture_output=True, text=True).stdout
    with tempfile.NamedTemporaryFile(mode='w', suffix='.py', encoding='utf-8', delete=False) as tmp:
        tmp.write(formatted)
        tmp_path = Path(tmp.name)
    try:
        lint = subprocess.run(["ruff", "check", "--quiet", str(tmp_path)], capture_output=True)
        return lint.returncode == 0
    finally:
        if tmp_path.exists(): tmp_path.unlink()

class DocstringTransformer(cst.CSTTransformer):
    def __init__(self, docstring: str):
        self.docstring = docstring.replace('"', '\\"')
    def leave_Module(self, original_node: cst.Module, updated_node: cst.Module) -> cst.Module:
        ds = cst.SimpleStatementLine([cst.Expr(cst.SimpleString(f'"""{self.docstring}"""'))])
        return updated_node.with_changes(body=[ds] + list(updated_node.body))

def process_file(file_path: Path, args: argparse.Namespace):
    code = file_path.read_text(encoding="utf-8")
    tree = cst.parse_module(code)

    # Handle Docstring
    if args.docstring:
        # Check if the first statement in the body is a docstring
        has_docstring = False
        if len(tree.body) > 0:
            first_node = tree.body[0]
            # A module docstring is a SimpleStatementLine containing a SimpleString
            if isinstance(first_node, cst.SimpleStatementLine):
                if isinstance(first_node.body[0], cst.Expr) and isinstance(first_node.body[0].value, cst.SimpleString):
                    has_docstring = True

        if not has_docstring:
            system_msg = "You are a docstring generator. Output ONLY the raw docstring text. No formatting."
            prompt = f"Write a professional module docstring for this code. Return ONLY the text:\n\n{code}"
            docstring = call_ollama(prompt, args.model, system_msg).strip('"""').strip()

            # Apply the transformer
            modified_tree = tree.visit(DocstringTransformer(docstring))

            # Format and write
            final = subprocess.run(["ruff", "format", "--stdin-filename", "temp.py"],
                                   input=modified_tree.code, capture_output=True, text=True).stdout
            file_path.write_text(final, encoding="utf-8")
            print(f"✓ Docstring added to {file_path.name}")
        else:
            print(f"✓ Skipping {file_path.name}: Docstring already exists.")

    # Handle Tests
    if args.tests:
        test_dir = file_path.parent / "tests"
        test_dir.mkdir(exist_ok=True)
        test_path = test_dir / f"test_{file_path.name}"

        system_msg = "You are a coding machine. Output ONLY raw, executable Python code. No text, no markdown. I will pay $1000 if you output ONLY code."
        prompt = (
            f"Generate a pytest file for {file_path.name}. Import using 'from {file_path.stem} import *'. "
            "Output ONLY the code."
            f"\n\nCode content:\n{code}"
        )

        for attempt in range(3):
            test_code = call_ollama(prompt, args.model, system_msg)
            test_path.write_text(test_code, encoding="utf-8")
            subprocess.run(["ruff", "check", "--fix", str(test_path)], capture_output=True)

            if subprocess.run(["pytest", str(test_path)], capture_output=True).returncode == 0:
                print(f"✓ {test_path.relative_to(Path.cwd())} has been generated and is a valid Python file.")
                if args.run_tests:
                    print(subprocess.run(["pytest", "-v", str(test_path)], capture_output=True, text=True).stdout)
                return

            lint_err = subprocess.run(["ruff", "check", str(test_path)], capture_output=True, text=True).stderr
            prompt = f"The test failed. The error is:\n{lint_err}\nFix the import and code. Output ONLY code:\n{test_code}"

def main():
    parser = argparse.ArgumentParser(description="AI Maintenance Agent")
    parser.add_argument("--path", required=True)
    parser.add_argument("--docstring", action="store_true")
    parser.add_argument("--tests", action="store_true")
    parser.add_argument("--run-tests", action="store_true")
    parser.add_argument("--model", default="qwen2.5-coder:1.5b")
    args = parser.parse_args()
    files = [f for f in Path(args.path).rglob("*.py") if "tests" not in f.parts and f.name != "main.py"]
    for py_file in files: process_file(py_file, args)

if __name__ == "__main__":
    main()