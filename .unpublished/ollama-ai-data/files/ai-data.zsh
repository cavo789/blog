# ai-data <file.json|file.csv> — analyze a JSON or CSV file and suggest 5
# practical jq/awk commands tailored to its actual fields. Pick one via fzf;
# instead of running it for you, it's loaded into your command line with
# `print -z` so you can read it, edit it, and learn from it before hitting
# Enter yourself.

AI_COMMANDS[data]="ai-data <file.json|file.csv>  — suggest jq/awk commands tailored to this file"

ai-data() {
  local file="$1"

  if [[ -z "$file" || ! -f "$file" ]]; then
    echo "Usage: ai-data <file.json|file.csv>" >&2
    return 1
  fi

  local ext="${file:e:l}"
  local sample tool

  case "$ext" in
    json)
      tool="jq"
      if jq -e 'type == "array"' "$file" >/dev/null 2>&1; then
        sample=$(jq -c '.[0:3]' "$file")
      else
        sample=$(head -c 3000 "$file")
      fi
      ;;
    csv)
      if command -v mlr >/dev/null 2>&1; then
        tool="awk, or mlr (Miller — detected as installed, prefer it for group-by/aggregation)"
      else
        tool="awk (Miller not detected — stick to awk/sort/uniq idioms)"
      fi
      sample=$(head -n 6 "$file")
      ;;
    *)
      echo "ai-data: unsupported extension .$ext (expected .json or .csv)" >&2
      return 1
      ;;
  esac

  echo "→ Analyzing $file ($ext)..." >&2

  local prompt="You are a data analyst who writes $tool one-liners. Below is a sample of a $ext file — the field names and shapes are real, only the row count is truncated. Suggest exactly 5 practical, ready-to-run commands a reader would actually want on THIS file: filtering, extracting specific fields, counting, grouping. Reference the real filename '$file' in every command. Output exactly one command per line, in this exact format and nothing else — no numbering, no markdown fences:
COMMAND ||| one-line description of what it answers

--- SAMPLE ---
$sample"

  local suggestions
  suggestions=$(_ollama_query "$prompt") || return 1

  if [[ -z "$suggestions" ]]; then
    echo "ai-data: no suggestions returned" >&2
    return 1
  fi

  if ! command -v fzf >/dev/null 2>&1; then
    echo "$suggestions"
    return 0
  fi

  local picked
  picked=$(echo "$suggestions" | fzf --delimiter=' \|\|\| ' --with-nth=2 \
    --prompt="ai-data > " --height=40% --reverse)

  [[ -z "$picked" ]] && return 0

  local cmd="${picked%% \|\|\| *}"
  print -z "$cmd"
}
