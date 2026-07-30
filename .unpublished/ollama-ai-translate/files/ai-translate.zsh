# ai-translate [text|file] [language] — translate text or a document into the
# given language (default: English). Accepts piped input, an inline string,
# a plain .md/.txt file, or an office document via the _ai_extract_text helper
# (requires _ai-docs.zsh from /blog/ollama-ai-docs).
#
# Usage:
#   echo "Bonjour le monde" | ai-translate [language]
#   ai-translate "Du texte ici"
#   ai-translate "Du texte ici" French
#   ai-translate file.pdf Dutch
#
# Set OLLAMA_TRANSLATE_LANG to change the default language permanently:
#   export OLLAMA_TRANSLATE_LANG=French

AI_COMMANDS[translate]="ai-translate [text|file] [language]  — translate text or a document locally (default: English)"
AI_PARAMS[translate]="file language"

ai-translate() {
  local lang text

  if [[ ! -t 0 ]]; then
    # Piped input: echo "text" | ai-translate [language]
    lang="${1:-${OLLAMA_TRANSLATE_LANG:-English}}"
    text=$(cat)
  elif [[ -f "${1:-}" ]]; then
    # File path: ai-translate <file> [language]
    if (( $+functions[_ai_extract_text] )); then
      text=$(_ai_extract_text "$1") || return 1
    else
      text=$(cat "$1")
    fi
    lang="${2:-${OLLAMA_TRANSLATE_LANG:-English}}"
  elif [[ -n "${1:-}" ]]; then
    # Inline text: ai-translate "some text" [language]
    text="$1"
    lang="${2:-${OLLAMA_TRANSLATE_LANG:-English}}"
  else
    print -u2 "Usage: ai-translate <text|file> [language]"
    print -u2 "       echo 'text' | ai-translate [language]"
    return 1
  fi

  _ollama_query "Translate the following text into ${lang}. Preserve any Markdown structure — headings, lists, tables, emphasis — if present. Output only the translated text, no preamble, no notes about the translation.

${text}"
}
