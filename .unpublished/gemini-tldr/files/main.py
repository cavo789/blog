# How to run:
#
# 1. Ensure you have Docker installed.
# 2. Place your Gemini API key in a .env file at the root of your blog:
#    GEMINI_API_KEY=your_actual_api_key_here
# 3. Start a terminal, go to your blog and run the following command,
#    docker run -it --rm -v ${PWD}:/app -w /app python sh -c "pip install google-genai python-dotenv  > /dev/null 2>&1 && /bin/bash"
# 4. Inside the container, run:
#    python .scripts/python_tldr/main.py <path-to-markdown-file-or-directory>
#
# Examples:
#    Process the entire blog directory:
#       python .scripts/python_tldr/main.py blog/
#
#    Process a specific year i.e. all posts from 2026:
#       python .scripts/python_tldr/main.py blog/2026/
#
#    Process a specific year and month i.e. all posts from January 2026:
#       python .scripts/python_tldr/main.py blog/2026/01
#
#    Process a single blog post:
#       python .scripts/python_tldr/main.py blog/2026/01/05

import argparse
import os
import sys
from pathlib import Path
from typing import List, Final
from dotenv import load_dotenv

# --- PATH PATCH ---
# Ensures 'src' module is found regardless of execution context
BASE_DIR = Path(__file__).resolve().parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))
# ------------------

try:
    from src.ai_service import AIService
    from src.file_manager import FileManager
except ImportError as e:
    print(f"❌ Configuration Error: Could not import internal modules.\nDetails: {e}")
    sys.exit(1)

def process_single_file(file_path: Path, ai_service: AIService) -> str:
    """
    Processes a single markdown file: reads, checks for existence, generates TL;DR, and injects.
    Returns a status string for logging.
    """
    try:
        file_manager = FileManager(file_path)
        content = file_manager.read_content()

        # 1. Skip if already exists
        if file_manager.has_tldr(content):
            return "SKIPPED (Exists)"

        # 2. Generate
        print(f"   Generating summary for {file_path.name}...")
        tldr = ai_service.generate_tldr(content)

        # 3. Inject
        file_manager.inject_tldr(content, tldr)
        return "SUCCESS"

    except Exception as e:
        return f"ERROR: {e}"

def main() -> None:
    """Main execution entry point."""
    load_dotenv(dotenv_path=BASE_DIR / ".env")
    if not os.getenv("GEMINI_API_KEY"):
        load_dotenv() # Fallback

    parser = argparse.ArgumentParser(description="Inject AI-generated TL;DR into markdown files recursively.")
    parser.add_argument("path", type=Path, help="Path to a markdown file or a directory containing markdown files.")
    args = parser.parse_args()

    target_path: Path = args.path
    if not target_path.is_absolute():
        target_path = Path.cwd() / target_path

    if not target_path.exists():
        print(f"❌ Error: Path not found: {target_path}")
        sys.exit(1)

    # Validate API Key
    api_key: str | None = os.getenv("GEMINI_API_KEY")
    if not api_key:
        print("❌ Error: GEMINI_API_KEY not found.")
        sys.exit(1)

    # Initialize AI Service once (reused for all files)
    try:
        ai_service = AIService(api_key)
    except Exception as e:
        print(f"❌ Error initializing AI Service: {e}")
        sys.exit(1)

    # Collect files to process
    files_to_process: List[Path] = []

    if target_path.is_file():
        if target_path.suffix.lower() == ".md":
            files_to_process.append(target_path)
    elif target_path.is_dir():
        # Recursive search for all .md files
        print(f"📂 Scanning directory: {target_path} ...")
        files_to_process = list(target_path.rglob("*.md"))

    if not files_to_process:
        print("⚠️  No Markdown files found to process.")
        sys.exit(0)

    print(f"🔍 Found {len(files_to_process)} file(s). Starting processing...\n")

    # Stats counters
    stats = {"SUCCESS": 0, "SKIPPED": 0, "ERROR": 0}

    for i, file_path in enumerate(files_to_process):
        print(f"📄 Processing [{i+1}/{len(files_to_process)}]: {file_path.name}...", end="", flush=True)

        status = process_single_file(file_path, ai_service)

        if "SKIPPED" in status:
            stats["SKIPPED"] += 1
            print(f"\r⚠️  {file_path.name}: {status}")
            # Pas besoin de dormir si on a sauté le fichier
        elif "ERROR" in status:
            stats["ERROR"] += 1
            print(f"\r❌ {file_path.name}: {status}")
            # En cas d'erreur 429, on pourrait vouloir attendre plus,
            # mais ici on continue simplement.
        else:
            stats["SUCCESS"] += 1
            print(f"\r✅ {file_path.name}: Injected successfully.")

    # Final Summary
    print("\n" + "="*30)
    print("       BATCH COMPLETE")
    print("="*30)
    print(f"✅ Injected: {stats['SUCCESS']}")
    print(f"⏭️  Skipped:  {stats['SKIPPED']}")
    print(f"❌ Failed:   {stats['ERROR']}")
    print("="*30)

if __name__ == "__main__":
    main()
