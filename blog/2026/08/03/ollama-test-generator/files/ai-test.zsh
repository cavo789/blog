# ai-test <file> — generate (or complete) a unit test suite for a script using
# a local LLM. Detects Bash/PHP/Python from the extension, looks for an
# existing test file using each ecosystem's naming convention, and asks the
# model to either write a full suite or fill the coverage gaps only.
#
# The result is printed first, then offered for saving at the path its
# ecosystem expects, then optionally run inside a throw-away Docker container
# so no test runner has to be installed on the host.

AI_COMMANDS[test]="ai-test <file.sh|.php|.py>  — generate or complete a unit test suite"
AI_PARAMS[test]="file"

# Images used to run the generated suites. Overridable from ~/.zshrc.
: ${AI_TEST_BATS_IMAGE:=bats/bats:latest}
: ${AI_TEST_PHP_IMAGE:=php:8.4-cli}
: ${AI_TEST_PY_IMAGE:=python:3.14-slim}

# _ai_project_root <dir> <marker...> — walk up from <dir> until a folder
# containing one of the markers is found; print it, or <dir> when none matches.
# This is what keeps "src/Backup.php" from proposing "src/tests/…".
_ai_project_root() {
  local dir="${1:A}"
  shift
  local candidate="$dir" marker
  while [[ "$candidate" != "/" ]]; do
    for marker in "$@"; do
      if [[ -e "${candidate}/${marker}" ]]; then
        print -- "$candidate"
        return 0
      fi
    done
    candidate="${candidate:h}"
  done
  print -- "$dir"
}

# _ai_test_root <ext> <dir> — print the folder the "tests/" tree hangs from,
# using the marker file each ecosystem puts at the root of a project.
_ai_test_root() {
  local ext="$1" dir="$2"
  case "$ext" in
    sh|bash) _ai_project_root "$dir" .git ;;
    php)     _ai_project_root "$dir" composer.json .git ;;
    py)      _ai_project_root "$dir" pyproject.toml setup.py .git ;;
  esac
}

# _ai_test_target <ext> <root> <base> — print the conventional path where the
# generated suite belongs, following each ecosystem's own layout:
#   Bats   → tests/<name>.bats
#   Pest   → tests/Unit/<Name>Test.php   (PSR-4 style, next to composer.json)
#   Pytest → tests/test_<name>.py
_ai_test_target() {
  local ext="$1" root="$2" base="$3"
  case "$ext" in
    sh|bash) print -- "${root}/tests/${base}.bats" ;;
    php)     print -- "${root}/tests/Unit/${base}Test.php" ;;
    py)      print -- "${root}/tests/test_${base}.py" ;;
  esac
}

# _ai_relative_to <from_dir> <path> — print <path> as seen from <from_dir>.
# Used to tell the model how the test file will reach the code under test.
_ai_relative_to() {
  local from="${1:A}" to="${2:A}" rel

  if rel=$(realpath --relative-to="$from" "$to" 2>/dev/null); then
    print -- "$rel"
    return 0
  fi

  # Portable fallback: climb until "from" is a prefix of "to", counting the
  # hops as "../" segments.
  local common="$from" up=""
  while [[ "$to" != "${common}/"* && "$common" != "/" ]]; do
    common="${common:h}"
    up="../${up}"
  done
  print -- "${up}${to#${common}/}"
}

# _ai_test_bootstrap <ext> <file> <target> — print the paragraph that tells the
# model how the suite is going to load the code it is testing.
#
# This is the single most important part of the prompt. Without it the model
# writes a technically perfect suite that calls functions nobody ever sourced,
# and every test dies with "command not found" (exit code 127). The model can't
# guess it: it only ever sees the file *contents*, never the layout. Now that
# ai-test knows the exact path the suite will be saved at, it can dictate the
# bootstrap line instead of hoping.
_ai_test_bootstrap() {
  local ext="$1" file="$2" target="$3"
  local rel
  rel=$(_ai_relative_to "${target:h}" "$file")

  case "$ext" in
    sh|bash)
      cat <<EOT

IMPORTANT — the suite will be saved as "$(_ai_relpath "$target")". Bats runs every test in a fresh shell that has NOT loaded the file under test, so the suite MUST begin with a setup() function that sources it, exactly like this:

setup() {
  source "\$BATS_TEST_DIRNAME/${rel}"
}

Without that setup(), every single test fails with "command not found". Use it as written, and put any per-test fixtures after the source line.

Use ONLY plain Bash assertions: [ ... ] or [[ ... ]]. Do NOT use the bats-assert helpers (assert_success, assert_failure, assert_output, refute_output, ...): they come from an optional library that is not loaded here, and every test calling them fails with "command not found".

Do not hard-code any value that depends on the current date. If the code computes something from today's date, compute the expected value the same way inside the test instead of writing a literal.
EOT
      ;;
    py)
      cat <<EOT

IMPORTANT — the suite will be saved as "$(_ai_relpath "$target")" and pytest is run with the project root on PYTHONPATH. Import the module under test directly, with "import ${file:t:r}" or "from ${file:t:r} import ...". Do not manipulate sys.path and do not use relative imports.
EOT
      ;;
    php)
      local namespace class="${file:t:r}"
      namespace=$(grep -m1 -E '^[[:space:]]*namespace[[:space:]]' "$file" 2>/dev/null \
        | sed -E 's/^[[:space:]]*namespace[[:space:]]+//; s/[[:space:]]*;.*$//')
      if [[ -n "$namespace" ]]; then
        cat <<EOT

IMPORTANT — the suite will be saved as "$(_ai_relpath "$target")". The class under test is ${namespace}\\${class} and is autoloaded by Composer, so reference it with a "use ${namespace}\\${class};" statement. Do not require the file manually.
EOT
      else
        cat <<EOT

IMPORTANT — the suite will be saved as "$(_ai_relpath "$target")". The file under test declares no namespace, so load it explicitly with: require_once __DIR__ . '/${rel}';
EOT
      fi
      ;;
  esac
}

# _ai_test_lint_existing <ext> <file> — warn about a suite that is already
# broken before we add anything to it.
#
# The classic one: a Bats file calling assert_success / assert_output without
# ever loading bats-assert. Those helpers are an optional library, so every
# such test dies with "command not found" — and since gap-fill mode asks the
# model to match the existing style, the new cases inherit the breakage.
_ai_test_lint_existing() {
  local ext="$1" file="$2"

  [[ "$ext" == sh || "$ext" == bash ]] || return 0

  if grep -qE '(^|[^[:alnum:]_])(assert|refute)_[a-z]' "$file" 2>/dev/null \
    && ! grep -qE 'load[[:space:]].*bats-(assert|support)' "$file" 2>/dev/null; then
    echo "→ Warning: $(_ai_relpath "$file") calls bats-assert helpers but never loads them." >&2
    echo "  Those tests already fail with 'command not found'; add to setup():" >&2
    echo "    load '/usr/lib/bats/bats-support/load'" >&2
    echo "    load '/usr/lib/bats/bats-assert/load'" >&2
  fi
}

# _ai_test_run <ext> <root> <relative_test_path> — offer to run the suite in a
# disposable container. Nothing is installed on the host and the container is
# removed on exit; only the project folder is mounted.
_ai_test_run() {
  local ext="$1" root="$2" rel="$3"

  if ! command -v docker >/dev/null 2>&1; then
    echo "→ Docker not available — skipping the test run." >&2
    return 0
  fi

  _ai_confirm "→ Run the suite now, in Docker?" || return 0

  case "$ext" in
    sh|bash)
      # The working directory is a scratch folder *inside* the container, not
      # the mounted project. Any test that calls the code under test with a
      # default "current directory" destination then writes its artifacts to a
      # path that disappears with --rm, instead of littering the repository
      # with half-cleaned-up files. Tests that need real files on disk use
      # $BATS_TEST_DIRNAME, which still points into /code.
      docker run --rm --user "$(id -u):$(id -g)" \
        --volume "${root}:/code" --workdir /tmp \
        "$AI_TEST_BATS_IMAGE" "/code/${rel}"
      ;;
    php)
      if [[ ! -x "${root}/vendor/bin/pest" ]]; then
        echo "ai-test: ${root}/vendor/bin/pest not found — run 'composer install' first." >&2
        return 1
      fi
      docker run --rm --user "$(id -u):$(id -g)" \
        --volume "${root}:/code" --workdir /code \
        "$AI_TEST_PHP_IMAGE" vendor/bin/pest "$rel"
      ;;
    py)
      # Runs as root so "pip install" can reach the system site-packages; the
      # two cache flags are what stop it from leaving root-owned folders behind.
      # PYTHONPATH=/code is what makes a plain "import backup" work from
      # tests/test_backup.py, so the suite needs no sys.path gymnastics.
      docker run --rm --env PYTHONDONTWRITEBYTECODE=1 --env PYTHONPATH=/code \
        --volume "${root}:/code" --workdir /code \
        "$AI_TEST_PY_IMAGE" \
        sh -c "pip install --quiet --root-user-action=ignore pytest && pytest -p no:cacheprovider '${rel}'"
      ;;
  esac
}

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
  local root target
  root=$(_ai_test_root "$ext" "$dir")
  target=$(_ai_test_target "$ext" "$root" "$base")
  local existing=""

  case "$ext" in
    sh|bash)
      existing=$(find "$dir" "$dir/tests" "$root/tests" -maxdepth 2 \
        -iname "${base}.bats" 2>/dev/null | head -1)
      ;;
    php)
      existing=$(find "$dir" "$dir/tests" "$root/tests" -maxdepth 3 \
        -iregex ".*/${base}Test\.php" 2>/dev/null | head -1)
      ;;
    py)
      existing=$(find "$dir" "$dir/tests" "$root/tests" -maxdepth 2 \
        \( -iname "test_${base}.py" -o -iname "${base}_test.py" \) 2>/dev/null | head -1)
      ;;
  esac

  local source_code
  source_code=$(<"$file")

  local prompt
  if [[ -n "$existing" ]]; then
    echo "→ Found existing tests: $(_ai_relpath "$existing") — asking only for the coverage gaps." >&2
    _ai_test_lint_existing "$ext" "$existing"
    local existing_tests
    existing_tests=$(<"$existing")
    prompt="You are a senior $lang test engineer. Below is a source file and its CURRENT $framework test suite. Compare them, identify every function, branch and edge case in the source that is NOT exercised by the current tests, and output ONLY the additional $framework test cases needed to reach 100% coverage. Do not repeat any existing test. Output raw $framework code only — no explanations, no markdown fences.

The new cases are appended to the existing file, so they inherit its setup/fixtures: do not repeat them. Use only constructs and helpers that already appear in the current suite, and do not hard-code any value derived from today's date.

--- SOURCE: $file ---
$source_code

--- EXISTING TESTS: $existing ---
$existing_tests"
  else
    echo "→ No test file found for '$base' — generating a full $framework suite." >&2
    local bootstrap
    bootstrap=$(_ai_test_bootstrap "$ext" "$file" "$target")
    prompt="You are a senior $lang test engineer. Write a complete $framework test suite for the file below: happy path, edge cases, and error conditions. Output raw $framework code only — no explanations, no markdown fences.
${bootstrap}

--- SOURCE: $file ---
$source_code"
  fi

  local result
  result=$(_ollama_query "$prompt") || return 1

  # The prompt says "no markdown fences"; models add them anyway often enough
  # that stripping is the only reliable way to get paste-ready code.
  result=$(_ai_strip_fences "$result")

  if [[ -z "$result" ]]; then
    echo "ai-test: the model returned an empty response." >&2
    return 1
  fi

  local bat_bin
  if bat_bin=$(_ai_bat); then
    print -r -- "$result" \
      | "$bat_bin" --language="$bat_lang" --style=plain --paging=never --color=always
  else
    print -r -- "$result"
  fi

  # --- Save --------------------------------------------------------------
  echo

  local shown
  if [[ -n "$existing" ]]; then
    shown=$(_ai_relpath "$existing")
    _ai_confirm "→ Append these cases to ${shown}?" || { echo "→ Not saved."; return 0; }
    print -r -- "" >> "$existing"
    print -r -- "$result" >> "$existing"
    echo "→ Appended to ${shown}"
    target="$existing"
  else
    shown=$(_ai_relpath "$target")
    if [[ -e "$target" ]]; then
      _ai_confirm "→ ${shown} already exists. Overwrite it?" || { echo "→ Not saved."; return 0; }
    else
      _ai_confirm "→ Save this suite as ${shown}?" || { echo "→ Not saved."; return 0; }
    fi
    mkdir -p "${target:h}"
    print -r -- "$result" > "$target"
    echo "→ Written to ${shown}"
  fi

  # --- Run ---------------------------------------------------------------
  local abs_target="${target:A}"
  _ai_test_run "$ext" "$root" "${abs_target#${root}/}"
}
