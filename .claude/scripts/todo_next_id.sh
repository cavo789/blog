#!/usr/bin/env bash
set -euo pipefail

# Prints the next .todos/ backlog ID, zero-padded.
#
# Scans every *.md under the given directory and its subfolders (DONE/,
# PARTIAL/, BLOCKED/, UNNEEDED/, POSTPONED/, ...), extracts the leading digit
# run of each filename regardless of a status prefix, and prints max + 1.
# Existing 3-digit IDs and new wider ones coexist fine — only the numeric
# value is compared, never the string width.
#
# The prefix is stripped by matching "everything up to the first digit",
# not by enumerating specific prefix words/separators — so it copes with a
# one-word prefix (DONE_, PARTIAL-), a multi-word one (WONT_DO_, wont-do-),
# or no prefix at all, uniformly. A digit run elsewhere in the filename
# (a year, an HTTP status code, ...) is never mistaken for the ID, because
# only the run immediately following that first stripped prefix is captured.
#
# Usage: todo_next_id.sh [todos-dir] [width]
#   todos-dir  defaults to ./.todos
#   width      zero-padding width for the printed ID, defaults to 4

todos_dir="${1:-.todos}"
width="${2:-4}"

max=0
if [[ -d "${todos_dir}" ]]; then
    highest="$(find "${todos_dir}" -type f -name '*.md' -printf '%f\n' |
        sed -nE 's/^[^0-9]*0*([0-9]{3,}).*/\1/p' |
        sort -n | tail -1)"
    [[ -n "${highest}" ]] && max="${highest}"
fi

# 10# forces base-10 parsing, otherwise a leading zero (e.g. 020) is read as octal
printf "%0${width}d\n" $((10#${max} + 1))
