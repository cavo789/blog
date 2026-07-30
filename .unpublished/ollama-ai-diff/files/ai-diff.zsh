# ai-diff <file> [other-file] — explain what changed between two versions of
# a file FUNCTIONALLY (intent and effect), not as a line-by-line transcript.
#
# One argument: compares the working copy of <file> against its last commit
# (needs to be inside a git repo). Two arguments: compares any two files
# directly — via _ai_extract_text, so .docx/.pdf/.pptx/.xlsx/.html work too,
# not just plain text or code.

AI_COMMANDS[diff]="ai-diff <file> [other-file]  — explain what changed, functionally (default: vs last commit)"
AI_PARAMS[diff]="file"

ai-diff() {
  local file1="$1"
  local file2="$2"
  local old_text new_text label_old label_new

  if [[ -z "$file1" ]]; then
    echo "Usage: ai-diff <file> [other-file]   (one arg = compare against the last git commit)" >&2
    return 1
  fi

  if [[ -n "$file2" ]]; then
    if [[ ! -f "$file1" || ! -f "$file2" ]]; then
      echo "ai-diff: both files must exist" >&2
      return 1
    fi
    old_text=$(_ai_extract_text "$file1") || return 1
    new_text=$(_ai_extract_text "$file2") || return 1
    label_old="$file1"
    label_new="$file2"
  else
    if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
      echo "ai-diff: not inside a git repository — pass a second file to compare directly" >&2
      return 1
    fi
    if ! git cat-file -e "HEAD:$file1" 2>/dev/null; then
      echo "ai-diff: '$file1' has no committed version yet (new file?)" >&2
      return 1
    fi
    old_text=$(git show "HEAD:$file1" 2>/dev/null)
    new_text=$(cat "$file1")
    label_old="$file1 (last commit)"
    label_new="$file1 (working copy)"
  fi

  if [[ "$old_text" == "$new_text" ]]; then
    echo "ai-diff: no difference between the two versions." >&2
    return 0
  fi

  local prompt="Compare these two versions of a document or piece of code and explain WHAT CHANGED FUNCTIONALLY — the intent and effect of the change, not a line-by-line transcript. Group related changes together. Skip purely cosmetic changes (whitespace, reordering with no effect) unless nothing else changed. 4-8 bullet points, most significant change first. Output only the bullet points.

--- OLD VERSION ($label_old) ---
$old_text

--- NEW VERSION ($label_new) ---
$new_text"

  _ollama_query "$prompt"
}
