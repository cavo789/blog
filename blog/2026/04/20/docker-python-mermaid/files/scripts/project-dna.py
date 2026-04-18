import os
import argparse
import subprocess

def get_category(filename):
    ext = os.path.splitext(filename)[1].lower()
    name = filename.lower()

    if name == 'dockerfile' or ext == '.dockerfile': return '🐳 Docker'
    if ext in ['.py', '.sh', '.js', '.go']: return '💻 Code'
    if ext in ['.yaml', '.yml', '.json', '.conf', '.ini']: return '⚙️ Config'
    if ext in ['.md', '.txt', '.pdf']: return '📝 Doc'
    if ext in ['.png', '.jpg', '.svg', '.ico']: return '🎨 Assets'
    return '📄 Other'

def generate_dna(path):
    structure = {}

    # Analyze files
    for root, dirs, files in os.walk(path):
        # Ignore hidden and heavy folders
        dirs[:] = [d for d in dirs if not d.startswith('.') and d != '__pycache__']

        for file in files:
            cat = get_category(file)
            structure.setdefault(cat, set()).add(file)

    if not structure:
        return "mindmap\n  root(( 🧬 PROJECT DNA ))\n    (Empty or unreadable folder)"

    lines = ["mindmap", "  root(( 🧬 PROJECT DNA ))"]

    for cat, files in structure.items():
        lines.append(f"    {cat}")
        # Show max 6 files per category to avoid cluttering the image
        for i, f in enumerate(sorted(list(files))):
            if i >= 6:
                lines.append("      (...)")
                break
            # Clean special characters for Mermaid
            clean_name = f.replace('(', '').replace(')', '').replace('[', '').replace(']', '')
            lines.append(f"      ({clean_name})")

    return "\n".join(lines)

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("path", help="Folder to scan")
    parser.add_argument("-o", "--output", default="dna.png")
    args = parser.parse_args()

    # Ensure the path is absolute
    target_path = os.path.abspath(args.path)
    mmd_code = generate_dna(target_path)

    with open("temp.mmd", "w", encoding='utf-8') as f:
        f.write(mmd_code)

    print(f"🔎 Analyzing {target_path}...")

    subprocess.run([
        "mmdc", "-i", "temp.mmd", "-o", args.output,
        "-p", "/app/puppeteer-config.json",
        "-c", "/app/mermaid-config.json",
        "--width", "1200"
    ], check=True)

    os.remove("temp.mmd")
    print(f"✨ DNA successfully generated in {args.output}")

if __name__ == "__main__":
    main()
