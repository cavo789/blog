def generate_flow(nodes):
    """Generates a Mermaid flowchart from a list of names."""
    mermaid = ["flowchart LR"]
    for i, name in enumerate(nodes):
        mermaid.append(f'    node{i}["{name}"]')
        if i > 0:
            mermaid.append(f"    node{i-1} --> node{i}")

    # We output "asis" Markdown so Quarto interprets it as a block
    print("\n```{mermaid}\n")
    print("\n".join(mermaid))
    print("\n```\n")
