# ai-summarize <file> [points] — summarize a document in N bullet points
# (default: 5), entirely locally. Accepts .pdf/.docx/.pptx/.xlsx/.html (via
# docling-convert) or plain .md/.txt files directly.

AI_COMMANDS[summarize]="ai-summarize <file> [points]  — summarize a document locally (default: 5 points)"

ai-summarize() {
  local file="$1"
  local points="${2:-5}"

  if [[ -z "$file" || ! -f "$file" ]]; then
    echo "Usage: ai-summarize <file> [number-of-points]" >&2
    return 1
  fi

  local text
  text=$(_ai_extract_text "$file") || return 1

  local prompt="Summarize the following document in exactly $points bullet points, written in the same language as the document. Prioritize decisions, numbers, deadlines and action items over generic description. Output only the bullet points, nothing else.

$text"

  _ollama_query "$prompt"
}
