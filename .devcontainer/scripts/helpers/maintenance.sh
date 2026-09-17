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
    printf "🔍 Running pre-commit hooks...\n"
    pre-commit run --all-files --config .config/.pre-commit-config.yaml
}

# @cat Maintenance
# @cmd format
# @desc Auto-fix formatting with Prettier (fixes what the pre-commit hook flags)
function format() {
    yarn format
}
