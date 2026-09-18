# .devcontainer/scripts/helpers/ollama.sh
#
# Category "Ollama" — ELI5 summaries and "Ask my blog" questions.
#
# Sourced by ../interactive.sh — no shebang, never executed directly.
# shellcheck shell=bash

# @cat Ollama
# @cmd eli5
# @desc Generate ELI5 tips — whole blog, a folder (eli5 blog/2026/07) or one source file
function eli5() {
    local target="" extra=()

    # `--output` carries a value and belongs to the single-file script; `--dir` is the bulk
    # script's own spelling of the positional target, accepted so a command copy/pasted from
    # bulk-eli5.mjs's help still works here.
    while [[ $# -gt 0 ]]; do
        case "$1" in
            --dir | --output)
                if [[ -z "${2:-}" ]]; then
                    printf "❌ %s needs a value.\n" "$1" >&2
                    return 1
                fi
                if [[ "$1" == "--dir" ]]; then
                    target="$2"
                else
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

    [[ -n "${target}" ]] || target="blog"

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

# @cat Ollama
# @cmd faq
# @desc Prune bad "Ask my blog" questions by keyword (e.g. faq dinosaur)
function faq() {
    node scripts/faq-edit.mjs "$@"
}

# @cat Ollama
# @cmd questions
# @desc "Ask my blog" questions — type 'questions' alone to see the actions (review, list, status, progress)
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
        progress)
            shift
            # Live view of a bulk run started elsewhere — another terminal, or nohup overnight.
            # Reads the filesystem only (the --dry-run underneath never calls Ollama), so it is
            # safe to open, close and reopen while the generation keeps going.
            local interval=30
            if [[ "${1:-}" == "--interval" ]]; then
                if [[ -z "${2:-}" ]]; then
                    printf "Usage: questions progress [--interval <sec>] [locale]\n" >&2
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
                "${script}" "${1:-fr}"
                return
            fi
            watch -n "${interval}" "${script} ${1:-fr}"
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
            printf "${fmt}" "questions progress" "live screen: what a running --all batch has left"
            printf "${fmt}" "questions review --locale fr" "review the French corpus instead"
            printf "  \033[2m<post> = a path, a folder or just a slug — f.i. 'new-year-2024'\033[0m\n"
            printf "  \033[2m--locale works on review, status and list. Each corpus is reviewed on its own:\033[0m\n"
            printf "  \033[2mvalidating the English questions says nothing about the French ones.\033[0m\n"

            printf "\n\033[1;33m── Review filters ────────────────────────\033[0m\n"
            printf "${fmt}" "--stale" "only articles edited since generation"
            printf "${fmt}" "--all" "re-review articles already validated"
            printf "${fmt}" "--tag <slug>" "only one mainTag"
            printf "${fmt}" "--limit <n>" "stop the queue after n articles"
            printf "${fmt}" "--locale <code>" "which corpus to review (default: en)"

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
            printf "  \033[2mFrench uses a different model (code-quality); English uses task-tiny.\033[0m\n"

            printf "\n\033[1;33m── Inside a review ───────────────────────\033[0m\n"
            printf "  \033[1;32mEnter\033[0m keep & mark reviewed   \033[1;32m1 3 7\033[0m delete   \033[1;32ma\033[0m add   \033[1;32me N\033[0m edit\n"
            printf "  \033[1;32mr\033[0m regenerate   \033[1;32mx\033[0m exclude for good   \033[1;32ms\033[0m skip   \033[1;32mq\033[0m quit   \033[1;32m?\033[0m help\n"

            printf "\n💡 \033[1;36mTip:\033[0m ten free minutes? \033[4mquestions review\033[0m picks up where you left off.\n\n"
            ;;
        *)
            node scripts/generate-questions.mjs "$@"
            ;;
    esac
}
