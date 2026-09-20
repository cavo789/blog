# Shared document-to-text extraction for ai-translate and ai-summarize.
# .pdf/.docx/.pptx/.xlsx/.html go through docling-convert (see /blog/docling)
# first; .md/.markdown/.txt files are read directly, no conversion needed.
#
# Leading underscore: loads after _ollama.zsh (still alphabetically before
# ai-summarize.zsh and ai-translate.zsh), so _ollama_query is always ready.

_ai_extract_text() {
  local file="$1"
  local ext="${file:e:l}"

  case "$ext" in
    md|markdown|txt)
      cat "$file"
      ;;
    pdf|docx|pptx|xlsx|html|htm)
      if ! command -v docling-convert >/dev/null 2>&1; then
        echo "_ai_extract_text: docling-convert not found — see /blog/docling to set it up" >&2
        return 1
      fi
      local dir filename base mdfile
      dir="${file:h}"
      filename="${file:t}"
      base="${filename%.*}"
      mdfile="${dir}/${base}.md"
      echo "→ Converting '$file' with docling-convert..." >&2
      ( cd "$dir" && docling-convert "$filename" >/dev/null 2>&1 ) || {
        echo "_ai_extract_text: docling-convert failed on '$file'" >&2
        return 1
      }
      cat "$mdfile"
      ;;
    *)
      echo "_ai_extract_text: unsupported extension .$ext (expected pdf/docx/pptx/xlsx/html/md/txt)" >&2
      return 1
      ;;
  esac
}
