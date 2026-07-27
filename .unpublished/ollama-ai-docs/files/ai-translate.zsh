# ai-translate <file> [language] — translate a document into the given
# language (default: French), entirely locally. Accepts .pdf/.docx/.pptx/
# .xlsx/.html (via docling-convert) or plain .md/.txt files directly.

AI_COMMANDS[translate]="ai-translate <file> [language]  — translate a document locally (default: French)"

ai-translate() {
  local file="$1"
  local lang="${2:-French}"

  if [[ -z "$file" || ! -f "$file" ]]; then
    echo "Usage: ai-translate <file> [target-language]" >&2
    return 1
  fi

  local text
  text=$(_ai_extract_text "$file") || return 1

  local prompt="Translate the following document into $lang. Preserve the Markdown structure exactly — headings, lists, tables, emphasis. Output only the translated document, no commentary and no notes about the translation.

$text"

  _ollama_query "$prompt"
}
