# Foundation file for every "ai-*" function in this series. Named with a
# leading underscore: the ~/.zsh/fns/*.zsh loader sources files in
# alphabetical order, and "_" sorts before any letter — so this file is
# always loaded first, no matter how many ai-* functions get added later.
#
# Provides:
#   - _ollama_check       reachability guard for Ollama
#   - _ollama_query       shared HTTP client (curl + jq)
#   - _ai_strip_fences    removes the Markdown fences models add anyway
#   - _ai_bat             resolves "bat" vs Debian's "batcat"
#   - _ai_confirm         yes/no prompt
#   - _git_staged_diff    validated staged-diff fetcher (shared by pre-commit functions)
#   - AI_COMMANDS         registry each ai-* function adds itself to
#   - AI_PARAMS           registry of interactive parameter types (file/language/number/text/none)
#   - _ai_prompt_*        FZF/read helpers for interactive argument collection
#   - ai                  entry-point dispatcher / interactive menu

typeset -gA AI_COMMANDS
typeset -gA AI_PARAMS

# ---------------------------------------------------------------------------
# Ollama helpers
# ---------------------------------------------------------------------------

# _ollama_check — verify that the Ollama daemon is reachable.
# Fails loudly so callers can bail early rather than watching curl hang.
_ollama_check() {
  local host="${OLLAMA_HOST:-http://localhost:11434}"
  if ! curl --silent --max-time 2 "${host}/api/tags" >/dev/null 2>&1; then
    echo "ollama: cannot reach ${host} — is the Ollama container running?" >&2
    return 1
  fi
}

# _ollama_query <prompt> — send a prompt to the local model and print the response.
# Assumes Ollama is reachable; call _ollama_check first if you need an early guard.
_ollama_query() {
  local prompt="$1"
  local model="${OLLAMA_MODEL:-qwen3-coder:30b}"
  local host="${OLLAMA_HOST:-http://localhost:11434}"

  _ollama_check || return 1

  # The prompt is piped into jq rather than passed with "--arg": Linux caps a
  # single argv entry at 128 KB (MAX_ARG_STRLEN), and a large staged diff or a
  # long source file sails straight through that ceiling — jq then dies with
  # "argument list too long". "-R -s" slurps stdin as one raw string, which jq
  # escapes exactly like --arg would.
  print -r -- "$prompt" \
    | jq -Rs --arg model "$model" '{model: $model, prompt: ., stream: false}' \
    | curl --silent "${host}/api/generate" --data-binary @- \
    | jq -r '.response // empty'
}

# ---------------------------------------------------------------------------
# Output helpers
# ---------------------------------------------------------------------------

# _ai_strip_fences <text> — return only the code, without the Markdown fences.
#
# Every prompt in this series ends with "no markdown fences" and models still
# wrap their answer in ```language … ``` often enough that the output can't be
# piped or pasted as-is. When at least one fence is present, only the fenced
# regions are kept (which also drops the "Here is your test suite:" preamble);
# when there is none, the text is returned untouched.
_ai_strip_fences() {
  local text="$1"

  if [[ "$text" != *'```'* ]]; then
    print -r -- "$text"
    return 0
  fi

  print -r -- "$text" | awk '
    /^[[:space:]]*```/ { inside = !inside; next }
    inside             { print }
  '
}

# _ai_bat — print the name of the "bat" binary installed on this machine, if any.
# Debian and Ubuntu ship the package as "batcat" because the "bat" name was
# already taken by bacula-console-qt, so both spellings have to be probed.
_ai_bat() {
  local candidate
  for candidate in bat batcat; do
    if command -v "$candidate" >/dev/null 2>&1; then
      print -- "$candidate"
      return 0
    fi
  done
  return 1
}

# _ai_relpath <path> — print <path> relative to the current folder when it sits
# below it. Purely cosmetic: it keeps prompts readable instead of asking
# "Save as /home/christophe/projects/…/tests/backup.bats?".
_ai_relpath() {
  local path="${1:A}"
  print -- "${path#${PWD}/}"
}

# _ai_confirm <question> — ask a yes/no question; return 0 only on an explicit yes.
_ai_confirm() {
  local answer
  print -n "${1} [y/N] "
  read -r answer
  [[ "$answer" == [yY]* ]]
}

# ---------------------------------------------------------------------------
# Git helpers
# ---------------------------------------------------------------------------

# _git_staged_diff <caller> — validate the git context and return the staged diff.
# Handles three early-exit cases (not a repo, nothing staged, oversized diff)
# so every pre-commit function gets them for free without repeating the guards.
#
# Past AI_DIFF_MAX_CHARS the full diff is *not* returned: a diff of several
# hundred kilobytes overflows the model's context window, and the answer that
# comes back is worse than the one you get from a summary. The fallback keeps
# the shape of the change — per-file stat, plus the file and hunk headers,
# which carry the enclosing function names git puts after each "@@" — and
# drops the line-by-line content.
_git_staged_diff() {
  local caller="${1:-ai}"
  local max="${AI_DIFF_MAX_CHARS:-12000}"

  if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    echo "${caller}: not inside a git repository" >&2
    return 1
  fi

  local diff
  diff=$(git diff --staged)

  if [[ -z "$diff" ]]; then
    echo "${caller}: nothing staged — run 'git add' first" >&2
    return 1
  fi

  # "print -r" everywhere below: without it, print expands escape sequences and
  # a literal \n or \t inside the diff would come back mangled.
  if (( ${#diff} <= max )); then
    print -r -- "$diff"
    return 0
  fi

  echo "${caller}: staged diff is large (${#diff} chars) — sending a structural summary instead of the full diff. Commit in smaller chunks for a more precise answer." >&2

  local summary
  summary="$(git diff --staged --stat)

--- FILE AND HUNK HEADERS ONLY (full diff omitted, ${#diff} chars) ---
$(print -r -- "$diff" | grep -E '^(diff --git|new file|deleted file|rename (from|to)|@@)')"

  # Even the summary can exceed the ceiling on a very wide change.
  if (( ${#summary} > max )); then
    summary="${summary[1,$max]}
[…summary truncated…]"
  fi

  print -r -- "$summary"
}

# ---------------------------------------------------------------------------
# Interactive argument helpers (used by the ai() dispatcher)
# ---------------------------------------------------------------------------

# _ai_prompt_file [label] — open an fzf file picker; print the chosen path.
_ai_prompt_file() {
  local label="${1:-Select a file:}"
  local bat_bin preview='cat {}'
  bat_bin=$(_ai_bat) && preview="${bat_bin} --color=always {} 2>/dev/null || cat {}"

  if command -v fd >/dev/null 2>&1; then
    fd --type f | fzf --prompt="${label} " --height=50% --reverse --preview="$preview"
  else
    find . -type f | fzf --prompt="${label} " --height=50% --reverse --preview="$preview"
  fi
}

# _ai_prompt_language — open an fzf language picker; print the chosen language.
_ai_prompt_language() {
  printf '%s\n' English French Dutch German Spanish Italian Portuguese Japanese Chinese Korean \
    | fzf --prompt='Target language: ' --height=40% --reverse
}

# _ai_prompt_number [label] — read a positive integer; print it (or nothing on Enter, which
# lets the caller fall back to its own default). Returns 1 only on invalid input.
_ai_prompt_number() {
  local label="${1:-Number (Enter for default):}"
  print -n "${label} "
  local n
  read n
  if [[ -z "$n" ]]; then
    return 0
  fi
  if [[ ! "$n" =~ ^[1-9][0-9]*$ ]]; then
    echo "Expected a positive integer." >&2
    return 1
  fi
  print -- "$n"
}

# _ai_prompt_text [label] — read a free-form string; print it. Returns 1 if empty.
_ai_prompt_text() {
  local label="${1:-Input:}"
  print -n "${label} "
  local t
  read t
  if [[ -z "$t" ]]; then
    echo "No input given." >&2
    return 1
  fi
  print -- "$t"
}

# ---------------------------------------------------------------------------
# Entry-point dispatcher
# ---------------------------------------------------------------------------

# ai              → interactive fzf menu of every registered ai-* command
# ai <cmd> [args] → dispatch straight to ai-<cmd> [args]
#
# When opened via the fzf menu, each command's declared AI_PARAMS type triggers
# a secondary picker before the command runs:
#   file     → fzf file picker (fd + preview if available)
#   language → fzf language list
#   number   → read prompt, empty input uses the command's own default
#   text     → read prompt, required
#   none     → run the command directly (it collects its own input)
# Space-separated values declare multiple parameters in order, e.g. "file language".
ai() {
  local cmd="$1"

  # Direct dispatch: ai <cmd> [args]
  if [[ -n "$cmd" && "$cmd" != "help" && "$cmd" != "list" ]]; then
    if (( ${+AI_COMMANDS[$cmd]} )); then
      shift
      "ai-${cmd}" "$@"
      return
    fi
    echo "ai: unknown command '${cmd}'" >&2
    echo >&2
  fi

  # Interactive menu
  if ! command -v fzf >/dev/null 2>&1; then
    echo "Available ai commands:"
    for key in ${(ok)AI_COMMANDS}; do
      printf "  ai %-10s %s\n" "$key" "$AI_COMMANDS[$key]"
    done
    return
  fi

  local picked
  picked=$(
    for key in ${(ok)AI_COMMANDS}; do
      printf '%s\t%s\n' "$key" "$AI_COMMANDS[$key]"
    done \
      | fzf --delimiter='\t' --with-nth=2 --prompt='ai > ' --height=40% --reverse \
      | cut -f1
  )
  [[ -z "$picked" ]] && return

  # Collect arguments interactively based on AI_PARAMS declaration
  local -a args=()
  local param_type
  for param_type in ${(s: :)${AI_PARAMS[$picked]:-none}}; do
    case "$param_type" in
      file)
        local f
        f=$(_ai_prompt_file "File for ai-${picked}:") || return 1
        args+=("$f")
        ;;
      language)
        local l
        l=$(_ai_prompt_language) || return 1
        args+=("$l")
        ;;
      number)
        local n
        n=$(_ai_prompt_number) || return 1
        [[ -n "$n" ]] && args+=("$n")
        ;;
      text)
        local t
        t=$(_ai_prompt_text) || return 1
        args+=("$t")
        ;;
      none) ;;
    esac
  done

  "ai-${picked}" "${args[@]}"
}
