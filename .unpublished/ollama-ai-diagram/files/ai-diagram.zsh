# ai-diagram <description>|<file> — turn a plain-English description, or an
# existing config/structure file, into a Mermaid diagram. Prints a fenced
# ```mermaid code block, ready to paste into a Markdown file (this blog
# already renders Mermaid natively).

AI_COMMANDS[diagram]="ai-diagram <description>|<file>  — turn a description or a config file into a Mermaid diagram"

ai-diagram() {
  if [[ -z "$1" ]]; then
    echo 'Usage: ai-diagram "plain-English description"   or   ai-diagram <file>' >&2
    return 1
  fi

  local input hint

  if [[ -f "$1" ]]; then
    input=$(cat "$1")
    hint="The input below is the file '$1'. Infer the most natural Mermaid diagram type from its content — a docker-compose.yaml suggests a graph of services and their links, a folder listing suggests a flowchart or tree, an OpenAPI spec suggests a sequence diagram."
  else
    input="$*"
    hint="The input below is a plain-English description. Pick whichever Mermaid diagram type (flowchart, sequence, ER, class, state) best fits what is being described."
  fi

  local prompt="You are a Mermaid diagram expert. $hint Output ONLY a fenced Mermaid code block — no explanation before or after it, no extra commentary, nothing outside the \`\`\`mermaid ... \`\`\` fence.

--- INPUT ---
$input"

  _ollama_query "$prompt"
}
