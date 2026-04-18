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

def generate_pie_chart(path):
    counts = {}

    # Analyze files
    for root, dirs, files in os.walk(path):
        # Ignore hidden and heavy folders
        dirs[:] = [d for d in dirs if not d.startswith('.') and d != '__pycache__']

        for file in files:
            cat = get_category(file)
            counts[cat] = counts.get(cat, 0) + 1

    if not counts:
        return "pie title Empty or unreadable folder\n    \"None\" : 1"

    lines = ["pie title Project File Type Distribution"]

    for cat, count in counts.items():
        # Mermaid pie charts use raw numbers and automatically calculate percentages
        lines.append(f'    "{cat}" : {count}')

    return "\n".join(lines)

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("path", help="Folder to scan")
    parser.add_argument("-o", "--output", default="file_types_pie.png")
    args = parser.parse_args()

    # Ensure the path is absolute
    target_path = os.path.abspath(args.path)
    mmd_code = generate_pie_chart(target_path)

    with open("temp.mmd", "w", encoding='utf-8') as f:
        f.write(mmd_code)

    print(f"🔎 Analyzing {target_path}...")

    subprocess.run([
        "mmdc", "-i", "temp.mmd", "-o", args.output,
        "-p", "/app/puppeteer-config.json",
        "-c", "/app/mermaid-config.json",
        "--width", "1200",
        "--backgroundColor", "transparent"
    ], check=True)

    os.remove("temp.mmd")
    print(f"✨ Pie chart successfully generated in {args.output}")

if __name__ == "__main__":
    main()
