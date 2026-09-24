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
