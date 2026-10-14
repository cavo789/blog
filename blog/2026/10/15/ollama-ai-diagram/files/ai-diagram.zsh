# ai-diagram <description>|<file> — turn a plain-English description, or an
# existing config/structure file, into a Mermaid diagram. Prints a fenced
# ```mermaid code block, ready to paste into a Markdown file (this blog
# already renders Mermaid natively).

AI_COMMANDS[diagram]="ai-diagram <description>|<file>  — turn a description or a config file into a Mermaid diagram"
AI_PARAMS[diagram]="text"

ai-diagram() {
  if [[ -z "$1" ]]; then
    echo 'Usage: ai-diagram "plain-English description"   or   ai-diagram <file>' >&2
    return 1
  fi

  local input hint

  if [[ -f "$1" ]]; then
    input=$(cat "$1")
    # Without these rules, a model turns every value it reads into a node of
    # its own: "postgres:16" or "8080:80" end up as boxes next to the services.
    hint="The input below is the file '$1'. Infer the most natural Mermaid diagram type from its content — a docker-compose.yaml suggests a graph of services and their links, a folder listing suggests a flowchart or tree, an OpenAPI spec suggests a sequence diagram. Follow these rules:
- one node per entity the file declares (a service, a table, a class, a job), labelled with its name and its key attributes, e.g. app[\"app · build · :8080\"];
- one edge per relationship the file states (depends_on, a foreign key, needs), from the entity to what it relies on;
- storage (a named volume, a database file) is a cylinder node, e.g. db_data[(\"db-data\")], linked from the entity that uses it;
- attributes (an image, a port, a type) appear only inside labels, never as nodes of their own;
- node ids use letters, digits and underscores only."
  else
    input="$*"
    hint="The input below is a plain-English description. Pick whichever Mermaid diagram type (flowchart, sequence, ER, class, state) best fits what is being described. Draw every branch the description states. Add a failure branch on your own only where a step is itself a check whose outcome decides what happens next (a validation, a login, a payment) — never for a plain action such as saving, sending or assigning something."
  fi

  local prompt="You are a Mermaid diagram expert. $hint

Output ONLY a fenced Mermaid code block — no explanation before or after it, no extra commentary, nothing outside the \`\`\`mermaid ... \`\`\` fence.

--- INPUT ---
$input"

  local diagram
  diagram=$(_ollama_query "$prompt") || return 1

  if [[ -z "$diagram" ]]; then
    echo "ai-diagram: the model returned an empty answer" >&2
    return 1
  fi

  # The prompt asks for the fence, but a model still adds a sentence before it
  # now and then. Keeping only the fenced lines and re-wrapping them makes the
  # output paste-ready every time, whatever the model wrapped around it.
  local code
  code=$(_ai_strip_fences "$diagram")

  print -r -- '```mermaid'
  print -r -- "$code"
  print -r -- '```'

  # A Ctrl+click preview on mermaid.live. "base64:" is one of the two formats
  # the editor reads from the URL hash — the JSON state, base64url-encoded — so
  # jq and coreutils are enough, no compression library. It goes to stderr:
  # stdout stays the bare Markdown block, even redirected to a file.
  local state
  state=$(jq -jcn --arg code "$code" '{code: $code}' | base64 | tr -d '\n=' | tr '+/' '-_')
  print -r -- "Preview: https://mermaid.live/edit#base64:${state}" >&2
}
