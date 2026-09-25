# .devcontainer/scripts/helpers/maintenance.sh
#
# Category "Maintenance" — build, upgrade, and the pre-commit gate.
#
# Sourced by ../interactive.sh — no shebang, never executed directly.
# shellcheck shell=bash

# @cat Maintenance
# @cmd build
# @desc Clear cache and build the blog as a static site
function build() {
    printf "🏗️  Building Docusaurus...\n"
    yarn docusaurus clear && yarn docusaurus build
}

# @cat Maintenance
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

# @cat Maintenance
# @cmd check
# @desc Run all pre-commit hooks on every file
function check() {
    # Format first so ELI5/translation freshness hashes are computed against the
    # final formatted content — avoids a stale→eli5 --force→format→stale cycle.
    printf "🖌️  Auto-formatting (Prettier) before hook run...\n"
    yarn format || return 1
    printf "🔍 Running pre-commit hooks...\n"
    pre-commit run --all-files --config .config/.pre-commit-config.yaml
}

# @cat Maintenance
# @cmd format
# @desc Auto-fix formatting with Prettier (fixes what the pre-commit hook flags)
function format() {
    yarn format
}

# @cat Maintenance
# @cmd snippets
# @desc Lint the code files the blog publishes under blog/**/files/ — 'snippets help' lists the actions
function snippets() {
    local action="${1:-}"

    case "${action}" in
        help | --help | -h)
            _snippets_help
            return 0
            ;;
        stats)
            shift
            yarn snippets:stats "$@"
            ;;
        exclude | unexclude)
            yarn snippets:lint "--${action}" "$@"
            ;;
        judge)
            shift
            # Pass 2 (TODO 0137): the obsolescence judge, ~9 s per file on the local GPU.
            # Resumable by construction — every verdict is written to .snippet-lint.json as it
            # lands, and a later run only picks up what has no verdict yet.
            yarn snippets:lint --judge-only "$@"
            ;;
        "")
            yarn snippets:lint
            ;;
        -*)
            # A leading FLAG, not a path. Passing it through `--only` is what used to happen and
            # it silently turned `snippets --force` into `--only --force`, a path filter matching
            # nothing — the same swallowed-value trap the `eli5` helper documents.
            yarn snippets:lint "$@"
            ;;
        *)
            # A path: everything after it is forwarded untouched.
            yarn snippets:lint --only "$@"
            ;;
    esac
}

function _snippets_help() {
    # A literal format string we own, reused for every row (shellcheck's SC2059 warns about
    # variables here — it is safe precisely because no caller input ever reaches it).
    local fmt="  \033[1;32m%-34s\033[0m %s\n"
    printf "\n\033[1;34m🔍  Snippet lint\033[0m — the ~1000 code files the blog publishes under blog/**/files/.\n"
    printf "\033[2mTwo passes: linters answer 'is it valid?', the judge answers 'is it still true?'.\033[0m\n"

    printf "\n\033[1;33m── Pass 1 — linters (fast, blocking) ─────\033[0m\n"
    printf "${fmt}" "snippets" "incremental run over the whole corpus (~27 s cold)"
    printf "${fmt}" "snippets <path>" "one file or one folder — f.i. snippets blog/2026/09"
    printf "${fmt}" "snippets stats" "coverage table per file type, lints nothing"
    printf "  \033[2m6 linters in containers, fed by stdin. Only a changed file is re-analysed.\033[0m\n"
    printf "  \033[2mExits 1 on an \033[0m\033[1;31merror\033[0m\033[2m; warnings never block.\033[0m\n"

    printf "\n\033[1;33m── Pass 2 — the judge (slow, advisory) ───\033[0m\n"
    printf "${fmt}" "snippets judge" "review the whole corpus for obsolescence (~1.4 h)"
    printf "${fmt}" "snippets judge --judge-limit 50" "cut it into sittings"
    printf "${fmt}" "snippets judge --only <path>" "one article or folder"
    printf "  \033[2mFinds what no linter sees: docker-compose v1, apt-key add, MAINTAINER —\033[0m\n"
    printf "  \033[2mfiles that are perfectly valid and simply out of date.\033[0m\n"
    printf "  \033[2mSafe to stop and rerun: each verdict is saved as it lands, and a later run\033[0m\n"
    printf "  \033[2mpicks up only what has no verdict yet. Never changes the exit code.\033[0m\n"
    printf "  \033[2mNeeds Ollama; skipped silently under CI or OLLAMA_DISABLE=1.\033[0m\n"

    printf "\n\033[1;33m── Triage ────────────────────────────────\033[0m\n"
    printf "${fmt}" "snippets exclude <path> --reason \"…\"" "stop linting one file, on the record"
    printf "${fmt}" "snippets unexclude <path>" "put it back"
    printf "  \033[2mA reason is mandatory: the exclusion list is read by whoever wonders why.\033[0m\n"

    printf "\n\033[1;33m── Flags ─────────────────────────────────\033[0m\n"
    printf "${fmt}" "--force" "re-analyse everything, ignore stored hashes"
    printf "${fmt}" "--ci" "published articles only, exit 1 on error"
    printf "${fmt}" "--json" "machine-readable findings"
    printf "${fmt}" "--quiet" "no progress output"

    printf "\n💡 \033[1;36mTip:\033[0m \033[4msnippets\033[0m before a commit, \033[4msnippets judge\033[0m when you have an evening.\n\n"
}


# @cat Maintenance
# @cmd install_php
# @desc Install PHP CLI + start a local web server on port 8080 — temporary, not persisted across rebuilds
function install_php() {
    local port=8080
    local repo_root
    repo_root="$(realpath "${INTERACTIVE_SCRIPTS_DIR}/../../")"
    local static_dir="${repo_root}/static"
    local logfile="/tmp/php-server-${port}.log"

    # ── Step 1 : install PHP if missing ────────────────────────────────────
    if command -v php &>/dev/null; then
        printf "✅ PHP %s déjà installé.\n" "$(php -r 'echo PHP_VERSION;')"
    else
        printf "📦 Installation de PHP CLI (temporaire — perdu au prochain rebuild)...\n"
        sudo apt-get update -qq || { printf "❌ apt-get update a échoué\n" >&2; return 1; }
        sudo apt-get install -y php-cli || { printf "❌ Installation de php-cli a échoué\n" >&2; return 1; }
        printf "✅ PHP %s installé.\n" "$(php -r 'echo PHP_VERSION;')"
    fi

    # ── Step 2 : start the built-in web server if not already running ───────
    if lsof -i ":${port}" -sTCP:LISTEN &>/dev/null; then
        printf "ℹ️  Serveur PHP déjà actif sur le port %s.\n" "${port}"
    else
        php -S "0.0.0.0:${port}" -t "${static_dir}" >"${logfile}" 2>&1 &
        local pid=$!
        sleep 0.4  # let the socket bind before checking
        if ! lsof -i ":${port}" -sTCP:LISTEN &>/dev/null; then
            printf "❌ Le serveur PHP n'a pas démarré (PID %s). Logs : %s\n" "${pid}" "${logfile}" >&2
            return 1
        fi
        printf "🚀 Serveur PHP démarré (PID %s) — logs : %s\n" "${pid}" "${logfile}"
    fi

    # ── Step 3 : print where to go ──────────────────────────────────────────
    printf "\n"
    printf "  Ouvre dans le navigateur :\n"
    printf "\n"
    printf "    👉  http://localhost:%s/img/\n" "${port}"
    printf "\n"
    printf "  Pour arrêter le serveur :\n"
    printf "\n"
    printf "    pkill -f 'php -S'\n"
    printf "\n"
}
