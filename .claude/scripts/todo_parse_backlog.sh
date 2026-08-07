#!/usr/bin/env bash
set -euo pipefail

# Parses the flat .todos/ backlog into structured records for /todo-plan.
#
# Scans every .todos/*.md file (flat only — DONE/, PARTIAL/, BLOCKED/, UNNEEDED/,
# POSTPONED/ subfolders, plan.md, and 000_*-prefixed aggregate backlogs are never
# part of the flat queue) and extracts the header fields /todo-plan Phase 2 would
# otherwise parse by hand from N separate file reads: ID, title, priority
# (normalized to its first word, lowercased), batch, depends, and the raw Files
# bullet text (wrapped lines joined). Directory-set normalization and lot-building
# stay a judgment call for the caller — this script only removes the per-file
# reading and field-extraction busywork.
#
# Usage: todo_parse_backlog.sh [todos-dir]
#   todos-dir  defaults to ./.todos
#
# Output: one record per TODO, blank-line separated:
#   ID: <id>
#   FILE: <path>
#   TITLE: <title>
#   PRIORITY: <first word, lowercased, or (missing)>
#   BATCH: <declared batch, empty if not declared>
#   DEPENDS: <declared depends, empty if none/absent>
#   FILES: <raw bullet text, wrapped lines joined with a single space>
#   FLAGS: <comma-separated: missing-priority, missing-files, stale-status>
#   LOCKED: <UTC timestamp from .todos/.locks/<value>/since if a /todo run currently holds this
#            TODO (see todo_lock.sh), empty otherwise>

todos_dir="${1:-.todos}"

[[ -d "${todos_dir}" ]] || exit 0

shopt -s nullglob
for f in "${todos_dir}"/*.md; do
    base="$(basename "${f}")"
    [[ "${base}" == "plan.md" ]] && continue
    [[ "${base}" =~ ^000_ ]] && continue

    first_line="$(head -1 "${f}")"
    id="$(sed -E 's/^#[[:space:]]+([^[:space:]]+).*/\1/' <<<"${first_line}")"
    title="$(sed -E 's/^#[[:space:]]+[^[:space:]]+[[:space:]]*(—|-)[[:space:]]*//' <<<"${first_line}")"

    priority="$(grep -m1 -E '^- \*\*Priority\*\*:' "${f}" |
        sed -E 's/^- \*\*Priority\*\*:[[:space:]]*//' | awk '{print tolower($1)}' || true)"
    batch="$(grep -m1 -E '^- \*\*Batch\*\*:' "${f}" | sed -E 's/^- \*\*Batch\*\*:[[:space:]]*//' || true)"
    depends="$(grep -m1 -E '^- \*\*Depends\*\*:' "${f}" | sed -E 's/^- \*\*Depends\*\*:[[:space:]]*//' || true)"

    # The Files bullet wraps across lines until the next "- **Field**:" bullet or a blank line.
    files="$(awk '
        /^- \*\*Files\*\*:/ { sub(/^- \*\*Files\*\*:[ \t]*/, ""); printf "%s", $0; capture=1; next }
        capture && /^- \*\*/ { capture=0 }
        capture && /^[ \t]*$/ { capture=0 }
        capture { line=$0; sub(/^[ \t]+/, "", line); printf " %s", line }
    ' "${f}")"

    flags=()
    [[ -z "${priority}" ]] && flags+=("missing-priority")
    [[ -z "${files}" ]] && flags+=("missing-files")
    if grep -qm1 '^## Status' "${f}"; then
        flags+=("stale-status")
    fi
    flags_str=""
    [[ ${#flags[@]} -gt 0 ]] && flags_str="$(
        IFS=,
        echo "${flags[*]}"
    )"

    locked=""
    if [[ "${id}" =~ ^[0-9]+$ ]]; then
        lock_since_file="${todos_dir}/.locks/$((10#${id}))/since"
        [[ -f "${lock_since_file}" ]] && locked="$(cat "${lock_since_file}")"
    fi

    printf 'ID: %s\n' "${id}"
    printf 'FILE: %s\n' "${f}"
    printf 'TITLE: %s\n' "${title}"
    printf 'PRIORITY: %s\n' "${priority:-(missing)}"
    printf 'BATCH: %s\n' "${batch}"
    printf 'DEPENDS: %s\n' "${depends}"
    printf 'FILES: %s\n' "${files}"
    printf 'FLAGS: %s\n' "${flags_str}"
    printf 'LOCKED: %s\n' "${locked}"
    printf '\n'
done
