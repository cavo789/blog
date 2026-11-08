#!/usr/bin/env bash
# .devcontainer/scripts/welcome.sh
# Sourced by ~/.bashrc: prints a cheatsheet in every new terminal
# and defines the project's commands. Sourced, so no `set -e` here.

# --- The project's commands ---------------------------------------------

# @cmd serve   Start the dev server on http://localhost:3000
serve() { yarn start --host 0.0.0.0 --port 3000; }

# @cmd check   Run the full quality gate (lint, format, build)
check() { yarn lint && yarn format:check && yarn build; }

# @cmd db      Open a SQL shell in the database container
db() { docker exec -it blog-db psql --username=postgres; }

alias ll='ls -alF'

# --- The cheatsheet -----------------------------------------------------

welcome() {
  local script="${BASH_SOURCE[0]}"

  printf '\n\e[1;36m👋 Welcome to the %s project\e[0m\n\n' "${PROJECT_NAME:-blog}"
  printf 'Available commands:\n\n'

  # Every "# @cmd name  description" line above becomes one cheatsheet row
  sed -n 's/^# @cmd \([^ ]*\) *\(.*\)$/\1\t\2/p' "${script}" |
    while IFS=$'\t' read -r name description; do
      printf '  \e[1;33m%-8s\e[0m %s\n' "${name}" "${description}"
    done

  printf '\nType \e[1mwelcome\e[0m to see this list again.\n\n'
}

welcome
