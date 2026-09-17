#!/usr/bin/env bash
# One build at a time. Refuses to start if another docusaurus build is already running —
# a concurrent `yarn clear` wipes the output the other process is still writing, producing
# ENOENT errors that look like code bugs. Happened three times in one session.
set -uo pipefail

# Match the real build process, not any shell whose command line happens to contain the words
# "docusaurus build" — including this script's own invocation, which self-refused on the first
# try. The node binary is always launched as `node …/node_modules/.bin/docusaurus build`.
BUILD_PATTERN='node_modules/\.bin/docusaurus build'

# Keep only PIDs whose executable is node: a shell waiting in
# `while pgrep -f "node_modules/.bin/docusaurus build"` carries the pattern in its own command
# line, matched itself, and blocked every later build (15 such loops were once found stuck).
running=""
for pid in $(pgrep -f "${BUILD_PATTERN}" 2>/dev/null); do
    [[ "$(cat "/proc/${pid}/comm" 2>/dev/null)" == "node" ]] && running+="${pid} "
done

if [[ -n "${running// /}" ]]; then
    printf "REFUS : un build tourne déjà (PID %s). Attendre sa fin.\n" "${running}" >&2
    exit 2
fi

log="${1:?usage: safebuild.sh <logfile>}"
cd /opt/docusaurus || exit 1

yarn clear > /dev/null 2>&1
start=$(date +%s)
yarn build > "${log}" 2>&1
rc=$?
printf "BUILD_EXIT=%d SECONDS=%d\n" "${rc}" "$(( $(date +%s) - start ))"
exit "${rc}"
