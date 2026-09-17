#!/usr/bin/env bash
#
# Live progress of a `questions --locale <code> --all` run started elsewhere (another terminal,
# nohup, overnight). Reads the filesystem only — it never talks to Ollama and never writes,
# so it is safe to run alongside the generation.
#
# Usage: watch -n 30 .claude/scripts/questions_progress.sh [locale]

set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/../.."

locale="${1:-fr}"

node scripts/generate-questions.mjs --locale "${locale}" --all --dry-run | head -2

# --dry-run processes (this script's own, or another watch pane) must not read as a generation.
running="$(pgrep -af 'generate-questions\.mjs' | grep -v -- '--dry-run' || true)"
if [[ -n "${running}" ]]; then
    pid="$(awk 'NR==1 {print $1}' <<<"${running}")"
    printf '▶  Running — PID %s, started %s ago\n' "${pid}" "$(ps -o etime= -p "${pid}" | tr -d ' ')"
else
    printf '⏹  No generation running\n'
fi

printf '\nLast finished:\n'
find "i18n/${locale}/docusaurus-plugin-content-blog" -name 'index.md.questions.json' \
    -printf '%TH:%TM %p\n' |
    sort -r | head -5 |
    sed "s#i18n/${locale}/docusaurus-plugin-content-blog/##; s#/index.md.questions.json##; s#^#  #"
