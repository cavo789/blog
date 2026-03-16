import yaml
import re
from pathlib import Path

def render_project_arch():
    compose_path = Path("compose.yaml")
    docker_path = Path("Dockerfile")

    parent_image = "Unknown"
    volume_mapping = "Unknown"
    exposed_port = "Unknown"
    cmd = "Unknown"

    if docker_path.exists():
        content = docker_path.read_text()
        from_match = re.search(r"FROM\s+(.+)", content)
        if from_match:
            parent_image = from_match.group(1).strip()

    if compose_path.exists():
        with open(compose_path, 'r') as f:
            data = yaml.safe_load(f)
            svc = data.get('services', {}).get('docs', {})
            volumes = svc.get('volumes', ['?'])
            volume_mapping = volumes[0].split(":")[0] if ":" in volumes[0] else volumes[0]
            ports = svc.get('ports', ['?'])
            exposed_port = str(ports[0])
            cmd = svc.get('command', 'sleep infinity')

    mermaid = [
        "flowchart TD",
        "    classDef host fill:#f9f9f9,stroke:#333,stroke-dasharray: 5 5",
        "    classDef container fill:#e1f5fe,stroke:#01579b,stroke-width:2px",
        "    classDef image fill:#fff3e0,stroke:#e65100,stroke-width:1px",
        "",
        '    HostFolder["📁 Local Folder"]',
        '    UserBrowser["🌐 Web Browser"]',
        f'    BaseImage(["📦 Parent Image: {parent_image}"]):::image',
        '    subgraph WritingDoc ["🚀 Documentation Container"]',
        '        QuartoEngine{"Quarto Engine"}',
        '        PythonEngine[["🐍 Python Helpers"]]',
        '    end',
        '    class WritingDoc container',
        "",
        '    HostFolder -- "Mount" --> WritingDoc',
        '    BaseImage -- "Extends" --> WritingDoc',
        '    WritingDoc -- "HTTP" --> UserBrowser'
    ]

    print("\n```{mermaid}")
    print("\n".join(mermaid))
    print("```\n")
