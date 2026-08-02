#!/usr/bin/env bash
# greet.sh — ask for a name and a language, then print the greeting.

# normalize_name <name> — trim the surrounding spaces and capitalize the first
# letter, so " christophe " and "Christophe" end up as the same thing.
normalize_name() {
  local name="$1"

  # Strip leading, then trailing whitespace — pure parameter expansion, no
  # external command involved.
  name="${name#"${name%%[![:space:]]*}"}"
  name="${name%"${name##*[![:space:]]}"}"

  if [[ -z "$name" ]]; then
    echo "Error: no name given" >&2
    return 1
  fi

  echo "${name^}"
}

# greet <name> [lang] — print the greeting line. The language defaults to
# English and is case-insensitive.
greet() {
  local name="$1"
  local lang="${2:-en}"

  local clean
  clean=$(normalize_name "$name") || return 1

  case "${lang,,}" in
    en) echo "Hello ${clean}!" ;;
    fr) echo "Bonjour ${clean} !" ;;
    nl) echo "Hallo ${clean}!" ;;
    *)
      echo "Error: unsupported language '${lang}' (expected en, fr or nl)" >&2
      return 1
      ;;
  esac
}

main() {
  local name lang
  read -rp "What is your first name? " name
  read -rp "Which language (en/fr/nl)? " lang
  greet "$name" "$lang"
}

# Only run main() when the script is executed, never when it is sourced —
# this is what lets a test suite load the functions without triggering the
# interactive prompts.
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
  main "$@"
fi
