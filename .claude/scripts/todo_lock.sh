#!/usr/bin/env bash
set -euo pipefail

# Advisory lock for /todo, so two Claude Code sessions sharing the same checked-out
# .todos/ (the common case: two terminals/sessions in the same devcontainer) don't
# process the same TODO number at once.
#
# Locks are keyed by numeric *value*, not digit width — 055 and 0055 collide, same
# as how /todo itself resolves a TODO number to a file ("matched by value, not by
# digit width"). Implemented as a directory (mkdir is atomic: it fails if the
# directory already exists, so two near-simultaneous `acquire` calls can't both
# succeed), holding a single `since` file with a UTC timestamp.
#
# Usage:
#   todo_lock.sh check   <todos-dir> <NNN>   # 0 = free, 1 = locked (prints "since: ...")
#   todo_lock.sh acquire <todos-dir> <NNN>   # 0 = acquired, 1 = already locked (prints "since: ...")
#   todo_lock.sh release <todos-dir> <NNN>   # always 0, no error if not locked

action="${1:?usage: todo_lock.sh check|acquire|release <todos-dir> <NNN>}"
todos_dir="${2:?usage: todo_lock.sh check|acquire|release <todos-dir> <NNN>}"
number="${3:?usage: todo_lock.sh check|acquire|release <todos-dir> <NNN>}"

# 10# forces base-10 parsing, otherwise a leading zero (e.g. 055) is read as octal.
value=$((10#${number}))
lock_dir="${todos_dir}/.locks"
lock_path="${lock_dir}/${value}"

print_since() {
    [[ -f "${lock_path}/since" ]] && printf 'since: %s\n' "$(cat "${lock_path}/since")"
    return 0
}

case "${action}" in
    check)
        if [[ -d "${lock_path}" ]]; then
            print_since
            exit 1
        fi
        exit 0
        ;;
    acquire)
        mkdir -p "${lock_dir}"
        if mkdir "${lock_path}" 2>/dev/null; then
            date -u +%Y-%m-%dT%H:%M:%SZ >"${lock_path}/since"
            exit 0
        fi
        print_since
        exit 1
        ;;
    release)
        rm -rf "${lock_path}"
        exit 0
        ;;
    *)
        echo "Unknown action: ${action} (expected check|acquire|release)" >&2
        exit 1
        ;;
esac
