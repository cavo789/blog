"""Custom YAML dumpers and representers."""

import io
from typing import Any
import oyaml as yaml

def custom_list_representer(dumper: yaml.SafeDumper, data: list[Any]) -> yaml.nodes.SequenceNode:
    """Forces Python lists to be represented in YAML flow style: [item1, item2]."""
    return dumper.represent_sequence('tag:yaml.org,2002:seq', data, flow_style=True)

def custom_string_representer(dumper: yaml.SafeDumper, data: str) -> yaml.nodes.ScalarNode:
    """Prevents PyYAML from folding long strings into multi-line blocks."""
    if '\n' in data:
        return dumper.represent_scalar('tag:yaml.org,2002:str', data, style='|')
    return dumper.represent_scalar('tag:yaml.org,2002:str', data, style='')

# Register custom representers
yaml.add_representer(list, custom_list_representer, Dumper=yaml.SafeDumper)
yaml.add_representer(str, custom_string_representer, Dumper=yaml.SafeDumper)

def generate_markdown_file_content(metadata: dict[str, Any], content: str) -> str:
    """Generates the final file content string preserving YAML formatting."""
    output = io.StringIO()
    yaml.dump(
        metadata,
        output,
        Dumper=yaml.SafeDumper,
        default_flow_style=False,
        allow_unicode=True,
        width=4096
    )
    yaml_output: str = output.getvalue()
    return f"---\n{yaml_output}---\n{content}"
