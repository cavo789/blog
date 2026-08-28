#!/bin/bash
# .devcontainer/scripts/interactive.sh
#
# Purpose: Dynamic interactive shell for the Docusaurus blog devcontainer.
# This script uses annotations to build a real-time cheatsheet.

# --- COMMAND DEFINITIONS ---

# @cat 1 Server
# @cmd start
# @desc Clear cache and (re)start the Docusaurus dev server on port 3000 (HTTPS)
function start() {
    local port=3000

    printf "🔄 Stopping any running Docusaurus dev server...\n"
    pkill -f "docusaurus start" 2>/dev/null || true

    local pids
    pids=$(lsof -ti "tcp:${port}" 2>/dev/null) || true
    if [[ -n "${pids}" ]]; then
        kill -9 ${pids} 2>/dev/null || true
    fi

    local tries=0
    while lsof -i "tcp:${port}" >/dev/null 2>&1; do
        tries=$((tries + 1))
        if [[ "${tries}" -gt 10 ]]; then
            printf "❌ Port %s is still in use after 10s, aborting.\n" "${port}" >&2
            printf "   See what's holding it with: lsof -i tcp:%s\n" "${port}" >&2
            return 1
        fi
        sleep 1
    done

    printf "🧹 Clearing Docusaurus cache...\n"
    # `yarn clear`, not `yarn docusaurus clear` directly — the package.json script also wipes
    # .docusaurus-dev/ (see below), which the bare CLI command doesn't know about.
    if ! yarn clear; then
        printf "❌ 'yarn clear' failed, see errors above.\n" >&2
        return 1
    fi

    printf "🚀 Starting Docusaurus on port %s...\n" "${port}"
    # DOCUSAURUS_GENERATED_FILES_DIR_NAME keeps this dev server's codegen (.docusaurus-dev/)
    # separate from a `yarn build`'s (.docusaurus/) — sharing one folder let a concurrent
    # build corrupt an already-running dev server's compile (README.md has the full story).
    HTTPS=true SSL_CRT_FILE=localhost.pem SSL_KEY_FILE=localhost-key.pem \
        DOCUSAURUS_GENERATED_FILES_DIR_NAME=.docusaurus-dev \
        yarn docusaurus start --host 0.0.0.0 --port "${port}"
}

# @cat 1 Server
# @cmd static
# @desc Build the blog and serve the static site on port 3001 (HTTPS via VS Code) — leaves the dev server on 3000 alone
function static() {
    local port=3001

    printf "🔄 Stopping any running static server on port %s...\n" "${port}"
    pkill -f "docusaurus serve" 2>/dev/null || true

    local pids
    pids=$(lsof -ti "tcp:${port}" 2>/dev/null) || true
    if [[ -n "${pids}" ]]; then
        kill -9 ${pids} 2>/dev/null || true
    fi

    local tries=0
    while lsof -i "tcp:${port}" >/dev/null 2>&1; do
        tries=$((tries + 1))
        if [[ "${tries}" -gt 10 ]]; then
            printf "❌ Port %s is still in use after 10s, aborting.\n" "${port}" >&2
            printf "   See what's holding it with: lsof -i tcp:%s\n" "${port}" >&2
            return 1
        fi
        sleep 1
    done

    printf "🏗️  Building Docusaurus...\n"
    if ! yarn docusaurus clear; then
        printf "❌ 'docusaurus clear' failed, see errors above.\n" >&2
        return 1
    fi
    if ! yarn docusaurus build; then
        printf "❌ 'docusaurus build' failed, see errors above.\n" >&2
        return 1
    fi

    printf "🌐 Serving built site on https://localhost:%s ...\n" "${port}"
    yarn docusaurus serve --host 0.0.0.0 --port "${port}"
}

# @cat 2 Maintenance
# @cmd build
# @desc Clear cache and build the blog as a static site
function build() {
    printf "🏗️  Building Docusaurus...\n"
    yarn docusaurus clear && yarn docusaurus build
}

# @cat 2 Maintenance
# @cmd upgrade
# @desc Upgrade Docusaurus core and all plugins to their latest version
function upgrade() {
    printf "⬆️  Upgrading Docusaurus packages...\n"
    yarn upgrade && yarn upgrade \
        @docusaurus/core@latest \
        @docusaurus/plugin-ideal-image@latest \
        @docusaurus/plugin-sitemap@latest \
        @docusaurus/preset-classic@latest \
        @docusaurus/theme-search-algolia@latest \
        @docusaurus/module-type-aliases@latest \
        @docusaurus/types@latest
}

# @cat 2 Maintenance
# @cmd check
# @desc Run all pre-commit hooks on every file
function check() {
    printf "🔍 Running pre-commit hooks...\n"
    pre-commit run --all-files --config .config/.pre-commit-config.yaml
}

# @cat 2 Maintenance
# @cmd verify
# @desc Full gate before push/deploy: pre-commit + lint + prod build. Green here = green in CI.
function verify() {
    printf '\n\033[1;34m▶ 1/3  pre-commit\033[0m (whitespace, markdownlint, typos, eslint, prettier, freshness)\n'
    if ! pre-commit run --all-files --config .config/.pre-commit-config.yaml; then
        printf '\033[1;31m❌ verify: pre-commit failed\033[0m\n' >&2
        return 1
    fi

    printf '\n\033[1;34m▶ 2/3  yarn lint\033[0m (eslint, stylelint, tsc --noEmit, snippet sources)\n'
    if ! yarn lint; then
        printf '\033[1;31m❌ verify: yarn lint failed\033[0m\n' >&2
        return 1
    fi
    if ! yarn format:check; then
        printf '\033[1;31m❌ verify: prettier check failed — run  format  to auto-fix\033[0m\n' >&2
        return 1
    fi

    # `yarn clear` (not `yarn docusaurus clear`): the package.json script also
    # wipes .docusaurus-dev/, so a stale MDX cache can't mask a regression here.
    printf '\n\033[1;34m▶ 3/3  production build\033[0m (MDX compile + broken links/anchors)\n'
    if ! { yarn clear && yarn build; }; then
        printf '\033[1;31m❌ verify: build failed\033[0m\n' >&2
        return 1
    fi

    printf '\n\033[1;32m✅ verify passed — matches quality.yml + the deploy gate. Safe to commit, push, deploy.\033[0m\n'
}

# @cat 2 Maintenance
# @cmd format
# @desc Auto-fix formatting with Prettier (fixes what the pre-commit hook flags)
function format() {
    yarn format
}

# @cat 3 Metadata
# @cmd tags
# @desc Run the tags manager utility
function tags() {
    python3 .scripts/tags-manager.py "$@"
}

# @cat 3 Metadata
# @cmd yaml
# @desc Run the YAML front matter manager utility
function yaml() {
    python3 .scripts/yaml-manager.py "$@"
}

# @cat 3 Metadata
# @cmd links
# @desc Internal-link opportunities — 'links' for corpus stats, 'links <path>' for one article
function links() {
    if [[ $# -eq 0 ]]; then
        node scripts/internal-link-opportunities.mjs --stats
    else
        node scripts/internal-link-opportunities.mjs --post "$@"
    fi
}

# @cat 4 Ollama
# @cmd eli5
# @desc Generate ELI5 tips (whole blog, or: eli5 blog/2026/07)
function eli5() {
    local dir="blog"
    local extra=()
    for arg in "$@"; do
        case "${arg}" in
            --*) extra+=("${arg}") ;;
            *) dir="${arg}" ;;
        esac
    done
    node scripts/bulk-eli5.mjs --dir "${dir}" "${extra[@]+"${extra[@]}"}"
}

# @cat 4 Ollama
# @cmd faq
# @desc Prune bad "Ask my blog" questions by keyword (e.g. faq dinosaur)
function faq() {
    node scripts/faq-edit.mjs "$@"
}

# @cat 4 Ollama
# @cmd questions
# @desc "Ask my blog" questions — type 'questions' alone to see the actions (review, list, status)
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
        "" | help | --help | -h)
            # A literal format string we own, reused for every row (shellcheck's SC2059
            # warns about variables here — it is safe precisely because no caller input
            # ever reaches it).
            local fmt="  \033[1;32m%-30s\033[0m %s\n"
            printf "\n\033[1;34m❓  \"Ask my blog\" questions\033[0m — written by Ollama, validated by you.\n"

            printf "\n\033[1;33m── Review ────────────────────────────────\033[0m\n"
            printf "${fmt}" "questions review" "review post by post, resumes where you stopped"
            printf "${fmt}" "questions review <post>" "review one precise article"
            printf "${fmt}" "questions list <post>" "just print one article's questions"
            printf "${fmt}" "questions status" "how many reviewed, left, excluded, stale"
            printf "  \033[2m<post> = a path, a folder or just a slug — f.i. 'new-year-2024'\033[0m\n"

            printf "\n\033[1;33m── Review filters ────────────────────────\033[0m\n"
            printf "${fmt}" "--stale" "only articles edited since generation"
            printf "${fmt}" "--all" "re-review articles already validated"
            printf "${fmt}" "--tag <slug>" "only one mainTag"
            printf "${fmt}" "--limit <n>" "stop the queue after n articles"

            printf "\n\033[1;33m── Generate (needs Ollama) ───────────────\033[0m\n"
            printf "${fmt}" "questions <article> [--force]" "generate for one article"
            printf "${fmt}" "questions --all [--force]" "generate for the whole corpus"

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

# @cat 5 AnythingLLM
# @cmd ai-index
# @desc Push new/modified posts to the AnythingLLM 'blog' workspace
function ai-index() {
    .scripts/anythingllm-index.sh "$@"
}

# @cat 5 AnythingLLM
# @cmd ai-search
# @desc Ask the blog a question (ai-search which articles cover docker?)
function ai-search() {
    .scripts/anythingllm-search.sh "$@"
}

# welcome — redraw this cheatsheet. Deliberately un-annotated (no @cat/@cmd), so it
# doesn't get its own one-line section; it's pointed at from the Tip line instead.
function welcome() {
    [ -t 1 ] && stty sane 2>/dev/null
    printf "\033[H\033[2J"

    local script_path
    script_path=$(readlink -f "${BASH_SOURCE[0]}")

    # Docusaurus version, read straight from the installed package manifest — no
    # `npx`/`node` spawn, so it stays cheap enough to print on every shell startup.
    local docusaurus_version="" pkg
    pkg="$(dirname "${script_path}")/../../node_modules/@docusaurus/core/package.json"
    if [[ -f "${pkg}" ]]; then
        docusaurus_version=$(grep -m1 '"version"' "${pkg}" \
            | sed -E 's/.*"version"[[:space:]]*:[[:space:]]*"([^"]+)".*/\1/')
    fi

    if [[ -n "${docusaurus_version}" ]]; then
        echo -e "\033[1;34m📝  Docusaurus Blog — Dev Container\033[0m  \033[2m·  Docusaurus v${docusaurus_version}\033[0m"
    else
        echo -e "\033[1;34m📝  Docusaurus Blog — Dev Container\033[0m"
    fi
    echo -e "   Personal technical blog (Docker, WSL, Bash, PHP, AI, VS Code, …)\n"

    awk '
        /^[ \t]*# @cat[ \t]+/ { sub(/^[ \t]*# @cat[ \t]+/, ""); cat = $0; next; }
        /^[ \t]*# @cmd[ \t]+/ { sub(/^[ \t]*# @cmd[ \t]+/, ""); cmd = $0; next; }
        /^[ \t]*# @desc[ \t]+/ {
            sub(/^[ \t]*# @desc[ \t]+/, ""); desc = $0;
            if (cat != "" && cmd != "") { printf "%s|%s|%s\n", cat, cmd, desc; }
        }
    ' "${script_path}" | sort -t'|' -k1,1n -k2,2 | awk -F'|' '
        {
            # @cat carries a leading sort digit ("2 Maintenance") — strip it for display.
            header = $1; sub(/^[0-9]+[ \t]+/, "", header);
            if (header != current_cat) {
                printf "\r\n\033[1;33m── %s ────────────────────────────────\033[0m\r\n", header;
                current_cat = header;
            }
            printf "  \033[1;32m%-16s\033[0m %s\r\n", $2, $3;
        }
    '

    echo -e "\n💡 \033[1;36mTip:\033[0m \033[4mcheck\033[0m before every commit, \033[4mverify\033[0m before every push (adds lint + a full prod build).  \033[4mwelcome\033[0m redraws this list.\n"
}

alias ls='ls -alh --color=auto'

# Export functions for subshells
export -f start
export -f static
export -f build
export -f upgrade
export -f check
export -f verify
export -f format
export -f tags
export -f yaml
export -f links
export -f eli5
export -f faq
export -f questions
export -f ai-index
export -f ai-search
export -f welcome

# Display on startup
welcome
