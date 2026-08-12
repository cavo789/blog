#!/bin/bash
# .devcontainer/scripts/interactive.sh
#
# Purpose: Dynamic interactive shell for the Docusaurus blog devcontainer.
# This script uses annotations to build a real-time cheatsheet.

BLOG_HOST_DIR="${HOST_PROJECT_DIR:-/opt/docusaurus}"

# --- COMMAND DEFINITIONS ---

# @cat Server
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
    if ! yarn docusaurus clear; then
        printf "❌ 'docusaurus clear' failed, see errors above.\n" >&2
        return 1
    fi

    printf "🚀 Starting Docusaurus on port %s...\n" "${port}"
    HTTPS=true SSL_CRT_FILE=localhost.pem SSL_KEY_FILE=localhost-key.pem \
        yarn docusaurus start --host 0.0.0.0 --port "${port}"
}

# @cat Server
# @cmd static
# @desc Build then serve the static site on port 3000 (HTTPS via VS Code)
function static() {
    local port=3000

    printf "🔄 Stopping any running Docusaurus dev server...\n"
    pkill -f "docusaurus start" 2>/dev/null || true
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

# @cat Server
# @cmd serve
# @desc Serve the already-built site on port 3001 (run 'build' first)
function serve() {
    yarn run serve --port 3001
}

# @cat Server
# @cmd reset
# @desc Kill whatever is running on port 3000, then restart the blog there
function reset() {
    local port=3000

    printf "🔎 Checking for a process on port %s...\n" "${port}"
    local pids
    pids=$(lsof -ti "tcp:${port}" 2>/dev/null) || true
    if [[ -n "${pids}" ]]; then
        printf "🔪 Killing process(es) on port %s: %s\n" "${port}" "${pids}"
        kill -9 ${pids} 2>/dev/null || true
    else
        printf "✅ Nothing is running on port %s.\n" "${port}"
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

    printf "🚀 Restarting the blog on port %s...\n" "${port}"
    start
}

# @cat Build
# @cmd build
# @desc Clear cache and build the blog as a static site
function build() {
    printf "🏗️  Building Docusaurus...\n"
    yarn docusaurus clear && yarn docusaurus build
}

# @cat Build
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

# @cat Build
# @cmd version
# @desc Show the current Docusaurus version
function version() {
    npx docusaurus -V
}

# @cat Quality Control
# @cmd check
# @desc Run all pre-commit hooks on every file
function check() {
    printf "🔍 Running pre-commit hooks...\n"
    pre-commit run --all-files --config .config/.pre-commit-config.yaml
}

# @cat Quality Control
# @cmd lint
# @desc Lint Markdown files with markdownlint (Docker)
function lint() {
    docker run --rm -it \
        --user "$(id -u):$(id -g)" \
        -v "${BLOG_HOST_DIR}:/md" \
        peterdavehello/markdownlint \
        markdownlint --fix --config .config/.markdownlint.json --ignore-path .config/.markdownlint_ignore .
}

# @cat Quality Control
# @cmd codelint
# @desc Lint JS/JSX and CSS with ESLint + stylelint
function codelint() {
    yarn lint
}

# @cat Quality Control
# @cmd spellcheck
# @desc Spell-check all blog content with cspell (Docker)
function spellcheck() {
    docker run --rm -it \
        --user "$(id -u):$(id -g)" \
        -v "${BLOG_HOST_DIR}:/src" -w /src \
        ghcr.io/streetsidesoftware/cspell:latest \
        lint . --unique --gitignore --quiet --no-progress --config .vscode/cspell.json
}

# @cat Content
# @cmd tags
# @desc Run the tags manager utility
function tags() {
    python3 .scripts/tags-manager.py "$@"
}

# @cat Content
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

# @cat Content
# @cmd faq
# @desc Find and prune bad "Ask my blog" questions (f.i. 'faq dinosaur' will retrieve questions and will prompt for deletion)
function faq() {
    node scripts/faq-edit.mjs "$@"
}

# @cat Content
# @cmd questions
# @desc Generate "Ask my blog" questions (one article, or --all for the whole corpus; requires Ollama)
function questions() {
    node scripts/generate-questions.mjs "$@"
}

# @cat Content
# @cmd ai-index
# @desc Push new/modified posts to the AnythingLLM 'blog' workspace
function ai-index() {
    .scripts/anythingllm-index.sh "$@"
}

# @cat Content
# @cmd ai-search
# @desc Ask the blog a question (ai-search which articles cover docker?)
function ai-search() {
    .scripts/anythingllm-search.sh "$@"
}

# @cat Workspace
# @cmd welcome
# @desc Show this dynamic cheatsheet
function welcome() {
    [ -t 1 ] && stty sane 2>/dev/null
    printf "\033[H\033[2J"

    echo -e "\033[1;34m📝  Docusaurus Blog — Dev Container\033[0m"
    echo -e "   Personal technical blog (Docker, WSL, Bash, PHP, AI, VS Code, …)\n"

    local script_path
    script_path=$(readlink -f "${BASH_SOURCE[0]}")

    awk '
        /^[ \t]*# @cat[ \t]+/ { sub(/^[ \t]*# @cat[ \t]+/, ""); cat = $0; next; }
        /^[ \t]*# @cmd[ \t]+/ { sub(/^[ \t]*# @cmd[ \t]+/, ""); cmd = $0; next; }
        /^[ \t]*# @desc[ \t]+/ {
            sub(/^[ \t]*# @desc[ \t]+/, ""); desc = $0;
            if (cat != "" && cmd != "") { printf "%s|%s|%s\n", cat, cmd, desc; }
        }
    ' "${script_path}" | sort -t'|' -k1,1 -k2,2 | awk -F'|' '
        {
            if ($1 != current_cat) {
                printf "\r\n\033[1;33m── %s ────────────────────────────────\033[0m\r\n", $1;
                current_cat = $1;
            }
            printf "  \033[1;32m%-20s\033[0m %s\r\n", $2, $3;
        }
    '

    echo -e "\n💡 \033[1;36mTip:\033[0m Use \033[4mcheck\033[0m before every commit to ensure code quality.\n"
}

alias ls='ls -alh --color=auto'

# Export functions for subshells
export -f start
export -f static
export -f serve
export -f reset
export -f build
export -f upgrade
export -f version
export -f check
export -f lint
export -f codelint
export -f spellcheck
export -f tags
export -f eli5
export -f faq
export -f questions
export -f ai-index
export -f ai-search
export -f welcome

# Display on startup
welcome
