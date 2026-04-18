import yaml
import argparse
import subprocess
import os

def get_emoji(name):
    name = name.lower()
    if any(x in name for x in ['db', 'postgres', 'sql', 'redis', 'cache']):
        return "🗄️"
    if any(x in name for x in ['nginx', 'proxy', 'gateway', 'api']):
        return "🌐"
    if 'auth' in name:
        return "🔐"
    return "📦"

def generate_mindmap(compose_path):
    with open(compose_path, 'r') as f:
        data = yaml.safe_load(f)

    lines = ["mindmap", "  root(( 🏗️ INFRASTRUCTURE ))"]

    lines.append("    Services")
    for name, config in data.get('services', {}).items():
        emoji = get_emoji(name)
        lines.append(f"      ({emoji} {name})")

        if 'depends_on' in config:
            for dep in config['depends_on']:
                lines.append(f"        {{{{ 🔗 {dep} }}}}")

    lines.append("    Networks")
    for net in data.get('networks', {}).keys():
        lines.append(f"      ) {net} (")

    lines.append("    Volumes")
    for vol in data.get('volumes', {}).keys():
        lines.append(f"      [{vol}]")

    return "\n".join(lines)

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("input", help="compose.yaml file")
    parser.add_argument("-o", "--output", default="infra_map.png")
    parser.add_argument("--style", default="/app/mermaid-config.json")
    args = parser.parse_args()

    mmd_code = generate_mindmap(args.input)
    with open("temp.mmd", "w") as f:
        f.write(mmd_code)

    print("🚀 Generating Pro diagram...")

    cmd = [
        "mmdc",
        "-i", "temp.mmd",
        "-o", args.output,
        "--width", "1600",
        "-p", "/app/puppeteer-config.json",
        "--backgroundColor", "transparent"
    ]

    if os.path.exists(args.style):
        cmd.extend(["-c", args.style])

    subprocess.run(cmd, check=True)
    os.remove("temp.mmd")
    print(f"✨ Done! Image: {args.output}")

if __name__ == "__main__":
    main()
