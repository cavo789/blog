# .devcontainer/scripts/helpers/ollama.sh
#
# Category "Ollama" — ELI5 summaries and "Ask my blog" questions.
#
# Sourced by ../interactive.sh — no shebang, never executed directly.
# shellcheck shell=bash

# @cat Ollama
# @cmd eli5
# @desc ELI5 tips for a file or a folder — 'eli5' alone lists the actions, --backend ollama is free
function eli5() {
    local target="" all=0 backend="claude" extra=()

    # Bare `eli5` used to generate the WHOLE blog through the paid API — 806 files, ~8 $, one
    # typo away. `questions` alone has always printed its own help instead; the asymmetry was
    # the trap. The corpus-wide run is still one command, it is just spelled out: `eli5 --all`.
    if [[ $# -eq 0 ]]; then
        _eli5_help
        return 0
    fi

    # `--output`, `--locale` and `--backend` carry a value and must be listed here, not left to
    # the bare-flag branch: their value would then be read as the positional target, and
    # `eli5 <file> --backend ollama` would silently run against a folder named "ollama".
    # `--dir` is the bulk script's own spelling of that target, accepted so a command
    # copy/pasted from bulk-eli5.mjs's help still works here.
    while [[ $# -gt 0 ]]; do
        case "$1" in
            help | --help | -h)
                _eli5_help
                return 0
                ;;
            --all)
                all=1
                shift
                ;;
            --dir | --output | --locale | --backend)
                if [[ -z "${2:-}" ]]; then
                    printf "❌ %s needs a value.\n" "$1" >&2
                    return 1
                fi
                if [[ "$1" == "--dir" ]]; then
                    target="$2"
                else
                    if [[ "$1" == "--backend" ]]; then
                        backend="$2"
                    fi
                    extra+=("$1" "$2")
                fi
                shift 2
                ;;
            --*)
                extra+=("$1")
                shift
                ;;
            *)
                target="$1"
                shift
                ;;
        esac
    done

    if [[ -z "${target}" ]]; then
        if [[ "${all}" -eq 1 ]]; then
            target="blog"
        else
            printf "❌ eli5 needs a file, a folder, or --all for the whole blog.\n" >&2
            printf "   Run 'eli5' with no argument for the full list.\n" >&2
            return 1
        fi
    fi

    if [[ "${backend}" == "ollama" ]] && ! _eli5_ollama_up; then
        return 1
    fi

    # A file and a folder are two different scripts, and picking the wrong one is not a soft
    # failure: bulk-eli5.mjs readdir()s its --dir and dies with ENOTDIR on a file path. Routing
    # on the path is what makes `eli5 <file> --force` — what check-eli5-freshness.mjs prints for
    # a stale annotation — work as typed.
    if [[ -f "${target}" ]]; then
        node scripts/generate-eli5.mjs "${target}" "${extra[@]+"${extra[@]}"}"
    else
        node scripts/bulk-eli5.mjs --dir "${target}" "${extra[@]+"${extra[@]}"}"
    fi
}

# Fail on the missing daemon rather than on a fetch error 40 lines into a batch: --backend
# ollama is the flag you reach for to spend nothing, and finding out it was unreachable after
# the run is the one way it can still waste your time.
function _eli5_ollama_up() {
    local url="${OLLAMA_URL:-http://172.17.0.1:11434}"
    if curl -fsS --max-time 3 "${url}/api/tags" >/dev/null 2>&1; then
        return 0
    fi
    printf "❌ Ollama is not answering at %s.\n" "${url}" >&2
    printf "   Start it on the host, or set OLLAMA_URL to point elsewhere.\n" >&2
    return 1
}

function _eli5_help() {
    # A literal format string we own, reused for every row (shellcheck's SC2059 warns about
    # variables here — it is safe precisely because no caller input ever reaches it).
    local fmt="  \033[1;32m%-34s\033[0m %s\n"
    printf "\n\033[1;34m🧠  ELI5 annotations\033[0m — the line-by-line explanations under a <Snippet>.\n"
    printf "\033[2mOne sidecar per source file and per locale, written next to the code it explains.\033[0m\n"

    printf "\n\033[1;33m── Generate ──────────────────────────────\033[0m\n"
    printf "${fmt}" "eli5 <file>" "one source file"
    printf "${fmt}" "eli5 <folder>" "every snippet under it — f.i. eli5 blog/2026/07"
    printf "${fmt}" "eli5 --all" "the whole blog (806 files — quotes its price first)"
    printf "${fmt}" "eli5 <file> --locale fr" "the French sidecar of that file"
    printf "  \033[2mAn existing sidecar is skipped unless you pass --force.\033[0m\n"

    printf "\n\033[1;33m── Who writes it ─────────────────────────\033[0m\n"
    printf "${fmt}" "--backend claude" "default — Haiku, ~\$0.01 per file, known quality"
    printf "${fmt}" "--backend ollama" "local model, free, no API key needed"
    printf "  \033[2mBoth write the real sidecar. The local one is measurably thinner: it drops the\033[0m\n"
    printf "  \033[2mlanguage idioms a junior trips on, and its coverage swings from run to run.\033[0m\n"
    printf "  \033[2mUse it to iterate on the prompt for free; regenerate with Claude before publishing.\033[0m\n"
    printf "  \033[2mThe sidecar records which model wrote it, and \033[0m\033[4myarn eli5:check\033[0m\033[2m lists every published\033[0m\n"
    printf "  \033[2mone a local model produced — so a local pass can never be forgotten in the corpus.\033[0m\n"

    printf "\n\033[1;33m── Filters ───────────────────────────────\033[0m\n"
    printf "${fmt}" "--force" "redo a sidecar that already exists"
    printf "${fmt}" "--dry-run" "list what would be generated, call nothing"
    printf "${fmt}" "--locale <code>" "which language the prose is written in (default: en)"
    printf "${fmt}" "--output <path>" "write elsewhere than the default sidecar name"

    printf "\n\033[1;33m── Check ─────────────────────────────────\033[0m\n"
    printf "${fmt}" "yarn eli5:check" "which sidecars are stale, and which snippets have none"

    printf "\n💡 \033[1;36mTip:\033[0m reworking the prompt? \033[4meli5 blog/2026/07 --backend ollama --force\033[0m costs nothing.\n\n"
}

# @cat Ollama
# @cmd faq
# @desc Prune bad "Ask my blog" questions by keyword (e.g. faq dinosaur)
function faq() {
    node scripts/faq-edit.mjs "$@"
}

# @cat Ollama
# @cmd questions
# @desc "Ask my blog" questions, generated by local Ollama (not AnythingLLM) — 'questions' alone lists the actions
function questions() {
    local action="${1:-}"

    case "${action}" in
        review)
            shift
            # Resumable, post-by-post review. Progress lives in each .questions.json
            # ("reviewed" / "excluded"), so stopping and coming back another day is the
            # normal way to use it.
            node scripts/questions-review.mjs "$@"
            ;;
        list | show)
            shift
            if [[ $# -eq 0 ]]; then
                printf "Usage: questions list <post>   (path, folder or slug — f.i. 'new-year-2024')\n" >&2
                return 1
            fi
            node scripts/questions-review.mjs --list "$@"
            ;;
        status)
            shift
            node scripts/questions-review.mjs --status "$@"
            ;;
        triage)
            shift
            # Unattended counterpart of `review`: an Ollama judge moves unanswered and duplicate
            # questions to the sidecar's "rejected" list (never deleted, --restore puts them
            # back). Stamped per article, so a second run skips everything already triaged.
            node scripts/questions-triage.mjs "$@"
            ;;
        progress)
            shift
            # Live view of whatever generation is running — any locale, started elsewhere
            # (another terminal, nohup overnight). The script finds the process and reads its
            # own options; the --dry-run underneath never calls Ollama, so it is safe to open,
            # close and reopen while the generation keeps going.
            local interval=30
            if [[ "${1:-}" == "--interval" ]]; then
                if [[ -z "${2:-}" ]]; then
                    printf "Usage: questions progress [--interval <sec>]\n" >&2
                    return 1
                fi
                interval="$2"
                shift 2
            fi
            # watch runs its command from the caller's cwd, which is not necessarily the
            # project — resolve the script to an absolute path before handing it over.
            local script=".claude/scripts/questions_progress.sh"
            [[ -x "${script}" ]] || script="/opt/docusaurus/.claude/scripts/questions_progress.sh"
            if ! command -v watch >/dev/null 2>&1; then
                printf "watch is not installed - printing a single snapshot instead.\n" >&2
                "${script}"
                return
            fi
            watch -n "${interval}" "${script}"
            ;;
        "" | help | --help | -h)
            # A literal format string we own, reused for every row (shellcheck's SC2059
            # warns about variables here — it is safe precisely because no caller input
            # ever reaches it).
            local fmt="  \033[1;32m%-32s\033[0m %s\n"
            printf "\n\033[1;34m❓  \"Ask my blog\" questions\033[0m — written by Ollama, validated by you.\n"
            printf "\033[2mLifecycle: generate once per article → review when you have ten minutes → live on the site.\033[0m\n"
            printf "\033[2mThe questions go live as soon as they are generated; reviewing is how you fix them, not how you publish them.\033[0m\n"

            printf "\n\033[1;33m── Review ────────────────────────────────\033[0m\n"
            printf "${fmt}" "questions review" "review post by post, resumes where you stopped"
            printf "${fmt}" "questions review <post>" "review one precise article"
            printf "${fmt}" "questions list <post>" "just print one article's questions"
            printf "${fmt}" "questions status" "how many reviewed, left, excluded, stale"
            printf "${fmt}" "questions progress" "live screen of the running generation (any locale)"
            printf "${fmt}" "questions review --locale fr" "review the French corpus instead"
            printf "${fmt}" "questions triage [<path>]" "automatic review by an Ollama judge — rejects, never deletes"
            printf "${fmt}" "questions triage --restore <post>" "put an article's rejected questions back"
            printf "  \033[2m<post> = a path, a folder or just a slug — f.i. 'new-year-2024'\033[0m\n"
            printf "  \033[2mWith AnythingLLM running, each question is marked: \033[0m\033[1;32m●\033[0m\033[2m this article answers it best,\033[0m\n"
            printf "  \033[1;33m◐\033[0m\033[2m a close article ranks higher, \033[0m\033[1;31m○\033[0m\033[2m generic — another article answers it better.\033[0m\n"
            printf "  \033[2m--locale works on review, status and list. Each corpus is reviewed on its own:\033[0m\n"
            printf "  \033[2mvalidating the English questions says nothing about the French ones.\033[0m\n"

            printf "\n\033[1;33m── Review filters ────────────────────────\033[0m\n"
            printf "${fmt}" "--stale" "only articles edited since generation"
            printf "${fmt}" "--all" "re-review articles already validated"
            printf "${fmt}" "--tag <slug>" "only one mainTag"
            printf "${fmt}" "--limit <n>" "stop the queue after n articles"
            printf "${fmt}" "--locale <code>" "which corpus to review (default: en)"
            printf "${fmt}" "--generic" "only articles with ○ generic questions (AnythingLLM, ~2 min scan)"
            printf "${fmt}" "--no-ai" "no AnythingLLM marks"

            printf "\n\033[1;33m── Generate (needs Ollama) ───────────────\033[0m\n"
            printf "${fmt}" "questions <article>" "generate for one English article"
            printf "${fmt}" "questions --all" "generate for the whole English corpus"
            printf "${fmt}" "questions --locale fr <article>" "one translated article, questions in French"
            printf "${fmt}" "questions --locale fr --all" "every eligible translated article"
            printf "  \033[2mEnglish and French are two separate corpora. Without --locale, --all only ever\033[0m\n"
            printf "  \033[2mtouches blog/ — it will not generate a single French question.\033[0m\n"

            printf "\n\033[1;33m── Generate filters ──────────────────────\033[0m\n"
            printf "${fmt}" "--dry-run" "list what would be generated, call nothing"
            printf "${fmt}" "--limit <n>" "stop after n articles — judge the output first"
            printf "${fmt}" "--force" "redo articles that are already up to date"
            printf "${fmt}" "--pause <sec>" "idle between articles (default: 30) — cooler GPU, --pause 0 to disable"
            printf "  \033[2mAn article edited since its last generation is redone without --force.\033[0m\n"
            printf "  \033[2mBoth locales use code-quality (thinking): ~30-36 s per article.\033[0m\n"

            printf "\n\033[1;33m── Inside a review ───────────────────────\033[0m\n"
            printf "  \033[1;32mEnter\033[0m keep & mark reviewed   \033[1;32m1 3 7\033[0m delete   \033[1;32ma\033[0m add   \033[1;32me N\033[0m edit\n"
            printf "  \033[1;32mg\033[0m delete the ○ generic ones   \033[1;32mr\033[0m regenerate   \033[1;32mx\033[0m exclude for good   \033[1;32ms\033[0m skip   \033[1;32mq\033[0m quit   \033[1;32m?\033[0m help\n"

            printf "\n💡 \033[1;36mTip:\033[0m ten free minutes? \033[4mquestions review\033[0m picks up where you left off.\n\n"
            ;;
        *)
            node scripts/generate-questions.mjs "$@"
            ;;
    esac
}
