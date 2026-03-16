import os
from collections import Counter
from pathlib import Path

def render_extension_pie(directory="."):
    """Scans the directory and generates a Mermaid pie chart of file types."""
    p = Path(directory)

    ignored_folders = {'.git', '.quarto', '__pycache__', 'node_modules'}

    extensions = []
    for f in p.rglob('*'):
        if f.is_file() and not any(part in ignored_folders for part in f.parts):
            ext = f.suffix.lower() if f.suffix else "No extension"
            extensions.append(ext)

    stats = Counter(extensions)

    mermaid = ["pie title Project File Distribution"]
    for ext, count in stats.items():
        label = ext.replace('.', '').upper() if ext.startswith('.') else ext
        mermaid.append(f'    "{label}" : {count}')

    print("\n```{mermaid}")
    print("\n".join(mermaid))
    print("```\n")
