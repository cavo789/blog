# ai-test <file> — generate (or complete) a unit test suite for a script using
# a local LLM. Detects Bash/PHP/Python from the extension, looks for an
# existing test file using each ecosystem's naming convention, and asks the
# model to either write a full suite or fill the coverage gaps only.
# Prints to stdout — nothing is ever written to disk.

AI_COMMANDS[test]="ai-test <file.sh|.php|.py>  — generate or complete a unit test suite"
AI_PARAMS[test]="file"

ai-test() {
  local file="$1"

  if [[ -z "$file" || ! -f "$file" ]]; then
    echo "Usage: ai-test <file.sh|file.php|file.py>" >&2
    return 1
  fi

  local ext="${file:e}"
  local lang framework bat_lang
  case "$ext" in
    sh|bash)  lang="Bash";   framework="Bats";   bat_lang="bash"   ;;
    php)      lang="PHP";    framework="Pest";   bat_lang="php"    ;;
    py)       lang="Python"; framework="Pytest"; bat_lang="python" ;;
    *)
      echo "ai-test: unsupported extension .$ext (expected .sh, .php or .py)" >&2
      return 1
      ;;
  esac

  local dir="${file:h}"
  local base="${file:t:r}"
  local existing=""

  case "$ext" in
    sh|bash)
      existing=$(find "$dir" "$dir/tests" -maxdepth 2 -iname "${base}.bats" 2>/dev/null | head -1)
      ;;
    php)
      existing=$(find "$dir" "$dir/tests" "$dir/Tests" -maxdepth 2 \
        -iregex ".*/${base}Test\.php" 2>/dev/null | head -1)
      ;;
    py)
      existing=$(find "$dir" "$dir/tests" -maxdepth 2 \
        \( -iname "test_${base}.py" -o -iname "${base}_test.py" \) 2>/dev/null | head -1)
      ;;
  esac

  local source_code
  source_code=$(<"$file")

  local prompt
  if [[ -n "$existing" ]]; then
    echo "→ Found existing tests: $existing — asking only for the coverage gaps." >&2
    local existing_tests
    existing_tests=$(<"$existing")
    prompt="You are a senior $lang test engineer. Below is a source file and its CURRENT $framework test suite. Compare them, identify every function, branch and edge case in the source that is NOT exercised by the current tests, and output ONLY the additional $framework test cases needed to reach 100% coverage. Do not repeat any existing test. Output raw $framework code only — no explanations, no markdown fences.

--- SOURCE: $file ---
$source_code

--- EXISTING TESTS: $existing ---
$existing_tests"
  else
    echo "→ No test file found for '$base' — generating a full $framework suite." >&2
    prompt="You are a senior $lang test engineer. Write a complete $framework test suite for the file below: happy path, edge cases, and error conditions. Output raw $framework code only — no explanations, no markdown fences.

--- SOURCE: $file ---
$source_code"
  fi

  local result
  result=$(_ollama_query "$prompt") || return 1

  if command -v bat >/dev/null 2>&1; then
    echo "$result" | bat --language="$bat_lang" --style=plain --paging=never --color=always
  else
    echo "$result"
  fi
}
