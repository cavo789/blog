#!/usr/bin/env bash
#
# Live progress of whatever `questions` generation is running right now — any locale, with or
# without --force, started from another terminal or with nohup. Nothing is hardcoded: the run is
# found with pgrep and its own command line says what it is doing.
#
#   done  = sidecars of that locale whose `generated` is later than the process start
#   left  = what `generate-questions.mjs --dry-run`, given the run's own options, would still do
#           (--dry-run never calls Ollama and never writes, so this is safe beside the run)
#   speed = the mean `durationMs` of THIS run's sidecars — the model it actually uses, on this
#           machine, today — never a corpus-wide average that mixes older models
#
# Usage: questions progress          (or: watch -n 30 .claude/scripts/questions_progress.sh)
#
# Output is deliberately plain ASCII: the devcontainer has no locale set (LANG is empty), and
# `watch` silently drops every non-ASCII glyph there — emoji, em dashes and "x" multiplication
# signs all came out as holes in the author's terminal.

set -o nounset
set -o errexit
set -o pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/../.."

# The devcontainer runs on UTC, the author does not: an unqualified "19:42" next to a 21:42 wall
# clock reads as a two-hour stall. Every time below is printed in this zone and labelled with it.
zone="${TZ:-Europe/Brussels}"

# ── Find the run ─────────────────────────────────────────────────────────────

# /proc/<pid>/cmdline keeps each argument separate (NUL-delimited), which pgrep -a does not.
pid=""
args=()
for candidate in $(pgrep -f 'generate-questions\.mjs' || true); do
    [[ -r "/proc/${candidate}/cmdline" ]] || continue
    mapfile -t candidate_args < <(tr '\0' '\n' <"/proc/${candidate}/cmdline")
    [[ " ${candidate_args[*]} " == *" --dry-run "* ]] && continue
    [[ "${candidate_args[0]}" == node* || "${candidate_args[0]}" == */node ]] || continue
    pid="${candidate}"
    args=("${candidate_args[@]:2}") # drop "node" and the script path
    break
done

printf '\n  Ask my blog - question generation   %s\n' "$(TZ="${zone}" date '+%H:%M') ${zone}"
printf '  ============================================================\n\n'

if [[ -z "${pid}" ]]; then
    printf '  No generation is running.\n'
    printf '  Start one with: questions --all   (or: questions --locale fr --all)\n\n'
    exit 0
fi

# ── Read its options ─────────────────────────────────────────────────────────

locale="en"
force=false
bulk=false
pause=30
dry_run_args=()
for ((i = 0; i < ${#args[@]}; i++)); do
    case "${args[i]}" in
        --locale) locale="${args[i + 1]:-en}" ;;
        --pause) pause="${args[i + 1]:-30}" ;;
        --force) force=true ;;
        --all) bulk=true ;;
    esac
    # Everything that changes WHAT the run does goes to the dry run; --pause only changes when.
    case "${args[i]}" in
        --locale | --dir | --limit) dry_run_args+=("${args[i]}" "${args[i + 1]:-}") ;;
        --all | --force) dry_run_args+=("${args[i]}") ;;
    esac
done

if [[ "${locale}" == "en" ]]; then
    sidecar_root="blog"
else
    sidecar_root="i18n/${locale}/docusaurus-plugin-content-blog"
fi

elapsed="$(ps -o etimes= -p "${pid}" | tr -d ' ')"
started_epoch=$(($(date +%s) - elapsed))

printf '  RUNNING: PID %s, locale "%s"%s, up %dh %02dm (started %s %s)\n' \
    "${pid}" "${locale}" "$([[ "${force}" == true ]] && printf ', --force' || true)" \
    "$((elapsed / 3600))" "$(((elapsed % 3600) / 60))" \
    "$(TZ="${zone}" date -d "@${started_epoch}" '+%H:%M')" "${zone}"

# ── What this run has written ────────────────────────────────────────────────

# jq's fromdateiso8601 rejects fractional seconds, which every `generated` carries.
this_run="$(find "${sidecar_root}" -name 'index.md*.questions.json' -exec jq -r \
    --argjson since "${started_epoch}" '
        select(.generated) |
        (.generated | sub("\\.[0-9]+Z$"; "Z") | fromdateiso8601) as $at |
        select($at >= $since) |
        [.generated, (.durationMs // 0), input_filename] | @tsv' {} + |
    sort -r)"
done_count=0
[[ -n "${this_run}" ]] && done_count="$(wc -l <<<"${this_run}")"

if [[ "${bulk}" != true ]]; then
    printf '\n  Single article run - nothing to count; it ends when that article is written.\n\n'
    exit 0
fi

# ── What it still has to do ──────────────────────────────────────────────────

# The generator's own dry run, so "left" can never drift from what the run will actually do.
# With --force it lists every article again, the ones already redone included; without it,
# those are skipped already and the list is exactly what remains.
planned="$(node scripts/generate-questions.mjs "${dry_run_args[@]}" --dry-run 2>/dev/null |
    grep -c '\[GENERATE\]' || true)"
if [[ "${force}" == true ]]; then
    total="${planned}"
    left=$((planned - done_count))
    ((left < 0)) && left=0
else
    left="${planned}"
    total=$((planned + done_count))
fi

percent=0
[[ "${total}" -gt 0 ]] && percent=$((done_count * 100 / total))
filled=$((percent * 40 / 100))
bar="$(printf '%*s' "${filled}" '' | tr ' ' '#')$(printf '%*s' $((40 - filled)) '' | tr ' ' '.')"
printf '\n  [%s] %s%%\n' "${bar}" "${percent}"
printf '  %s done, %s LEFT TO DO, %s total\n\n' "${done_count}" "${left}" "${total}"

avg_seconds=0
if [[ -n "${this_run}" ]]; then
    avg_seconds="$(awk -F'\t' '$2 > 0 { sum += $2; n++ } END { print (n ? int(sum / n / 1000) : 0) }' \
        <<<"${this_run}")"
fi

if [[ "${left}" -gt 0 && "${avg_seconds}" -gt 0 ]]; then
    remaining=$((left * (avg_seconds + pause)))
    printf '  At %ss per article (+%ss pause): %sh %02dm left, ending around %s %s\n' \
        "${avg_seconds}" "${pause}" "$((remaining / 3600))" "$(((remaining % 3600) / 60))" \
        "$(TZ="${zone}" date -d "+${remaining} seconds" '+%H:%M')" "${zone}"
elif [[ "${left}" -gt 0 ]]; then
    printf '  No article finished yet in this run - the estimate appears after the first one.\n'
fi

# Sorted on the sidecar's own `generated` field, never on the file's mtime: opening a sidecar in
# an editor, or any tool rewriting it, moves the mtime hours after the model actually wrote it.
if [[ -n "${this_run}" ]]; then
    printf '\n  Last generated\n'
    now="$(date +%s)"
    head -5 <<<"${this_run}" |
        while IFS=$'\t' read -r generated duration file; do
            article="${file#"${sidecar_root}"/}"
            took="-"
            [[ "${duration}" != "0" ]] && took="$((duration / 1000))s"
            printf '    %s  %6s ago  %5s  %s\n' \
                "$(TZ="${zone}" date -d "${generated}" '+%H:%M')" \
                "$(((now - $(date -d "${generated}" +%s)) / 60))m" \
                "${took}" "${article%/index.md*.questions.json}"
        done
fi
printf '\n'
