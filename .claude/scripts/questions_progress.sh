#!/usr/bin/env bash
#
# Live progress of a `questions --locale <code> --all` run started elsewhere (another terminal,
# nohup, overnight). Reads the filesystem only — it never talks to Ollama and never writes,
# so it is safe to run alongside the generation.
#
# Usage: questions progress          (or: watch -n 30 .claude/scripts/questions_progress.sh [locale])
#
# Output is deliberately plain ASCII: the devcontainer has no locale set (LANG is empty), and
# `watch` silently drops every non-ASCII glyph there — emoji, em dashes and "x" multiplication
# signs all came out as holes in the author's terminal.

set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/../.."

locale="${1:-fr}"
# The devcontainer runs on UTC, the author does not: an unqualified "19:42" next to a 21:42 wall
# clock reads as a two-hour stall. Every time below is printed in this zone and labelled with it.
zone="${TZ:-Europe/Brussels}"
blog_dir="i18n/${locale}/docusaurus-plugin-content-blog"

# The eligibility module is the same one the generator uses, so "left" here can never drift from
# what the run will actually do.
counts="$(node --input-type=module -e "
  import { questionCandidates } from './scripts/lib/i18n-eligibility.mjs';
  const { eligible, skipped } = questionCandidates(process.cwd(), '${locale}');
  const fresh = skipped.filter((s) => s.reason === 'localized sidecar already fresh').length;
  console.log(JSON.stringify({ left: eligible.length, done: fresh }));
")"
left="$(jq -r .left <<<"${counts}")"
done_count="$(jq -r .done <<<"${counts}")"
total=$((left + done_count))

# Average over what this corpus actually measured (sidecars written before durationMs existed
# simply do not count), so the estimate tracks the machine rather than a hardcoded guess.
avg_seconds="$(find "${blog_dir}" -name 'index.md.questions.json' -exec jq -s -r \
    '[.[] | select(.durationMs) | .durationMs] | if length == 0 then 0 else (add / length / 1000 | floor) end' {} + \
    2>/dev/null || echo 0)"

# A running batch carries its own --pause on its command line; honour it in the forecast.
running="$(pgrep -af 'generate-questions\.mjs' | grep -v -- '--dry-run' || true)"
pause=30
[[ "${running}" =~ --pause[[:space:]]+([0-9]+) ]] && pause="${BASH_REMATCH[1]}"

printf '\n  Ask my blog - "%s" questions %s\n' "${locale}" "$(TZ="${zone}" date '+%H:%M') ${zone}"
printf '  ============================================================\n\n'

percent=0
[[ "${total}" -gt 0 ]] && percent=$((done_count * 100 / total))
filled=$((percent * 40 / 100))
bar="$(printf '%*s' "${filled}" '' | tr ' ' '#')$(printf '%*s' $((40 - filled)) '' | tr ' ' '.')"
printf '  [%s] %s%%\n' "${bar}" "${percent}"
printf '  %s done, %s LEFT TO DO, %s total\n\n' "${done_count}" "${left}" "${total}"

if [[ "${left}" -gt 0 && "${avg_seconds}" -gt 0 ]]; then
    remaining=$((left * (avg_seconds + pause)))
    printf '  At %ss per article (+%ss pause): %sh %02dm left, ending around %s %s\n' \
        "${avg_seconds}" "${pause}" "$((remaining / 3600))" "$(((remaining % 3600) / 60))" \
        "$(TZ="${zone}" date -d "+${remaining} seconds" '+%H:%M')" "${zone}"
fi

if [[ -n "${running}" ]]; then
    pid="$(awk 'NR==1 {print $1}' <<<"${running}")"
    printf '  RUNNING: PID %s, up %s\n' "${pid}" "$(ps -o etime= -p "${pid}" | tr -d ' ')"
else
    printf '  STOPPED: no generation process is running\n'
fi

# Sorted on the sidecar's own `generated` field, never on the file's mtime: opening a sidecar in
# an editor, or any tool rewriting it, moves the mtime hours after the model actually wrote it --
# which made a 25-minute gap appear out of nowhere.
printf '\n  Last generated\n'
now="$(date +%s)"
find "${blog_dir}" -name 'index.md.questions.json' \
    -exec jq -r '[.generated, (.durationMs // 0), input_filename] | @tsv' {} + |
    sort -r | head -5 |
    while IFS=$'\t' read -r generated duration file; do
        article="${file#"${blog_dir}"/}"
        took="-"
        [[ "${duration}" != "0" ]] && took="$((duration / 1000))s"
        printf '    %s  %6s ago  %5s  %s\n' \
            "$(TZ="${zone}" date -d "${generated}" '+%H:%M')" \
            "$((($(date +%s) - $(date -d "${generated}" +%s)) / 60))m" \
            "${took}" "${article%/index.md.questions.json}"
    done
printf '\n'
