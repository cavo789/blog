#!/bin/bash
# .devcontainer/scripts/interactive.sh
#
# Purpose: Dynamic interactive shell for the Docusaurus blog devcontainer.
# This script uses annotations to build a real-time cheatsheet.
#
# It is the launcher only: the commands themselves live one per category in
# helpers/, and the cheatsheet engine that renders them lives in
# helpers/_cheatsheet.sh. Adding a command means adding it to the matching
# module with its @cat/@cmd/@desc annotations — nothing here has to change
# except its `export -f` line below.

# --- MODULE LOADING ---

# This exact file is loaded from two different places, and they are not the same
# directory: docker-entrypoint.sh sources /usr/local/bin/interactive.sh (copied into
# the image by the Dockerfile), while devcontainer.json's postCreateCommand sources
# /opt/docusaurus/.devcontainer/scripts/interactive.sh (the bind-mounted file, so an
# edit is live without a rebuild). Resolving helpers/ relative to THIS file is what
# makes both work; a hardcoded path would break whichever one it doesn't name.
INTERACTIVE_SCRIPTS_DIR="$(cd "$(dirname "$(readlink -f "${BASH_SOURCE[0]}")")" && pwd)"
export INTERACTIVE_SCRIPTS_DIR

# The modules have no load-time dependency on each other — they only define
# functions — so alphabetical glob order is fine. The `-r` guard keeps a shell
# from dying on an unmatched glob, which matters because docker-entrypoint.sh
# sources this file under `set -o errexit`.
for _module in "${INTERACTIVE_SCRIPTS_DIR}"/helpers/*.sh; do
    [[ -r "${_module}" ]] || continue
    # shellcheck source=/dev/null
    source "${_module}"
done
unset _module

alias ls='ls -alh --color=auto'

# --- PUBLIC SURFACE ---

# Export functions for subshells. Kept centralised here rather than spread across
# the modules: this list IS the public surface of the cheatsheet, and one place to
# read it beats eight.
export -f start
export -f start_fr
export -f static
export -f build
export -f upgrade
export -f check
export -f format
export -f install_php
export -f tags
export -f yaml
export -f spam
export -f links
export -f translate
export -f eli5
export -f faq
export -f questions
export -f ai-index
export -f ai-search
export -f ai-index-fr
export -f ai-search-fr
export -f run_ci
export -f _run_ci_links
export -f welcome

# Display on startup
welcome
