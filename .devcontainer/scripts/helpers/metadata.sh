# .devcontainer/scripts/helpers/metadata.sh
#
# Category "Metadata" — tags, front matter, internal links.
#
# Sourced by ../interactive.sh — no shebang, never executed directly.
# shellcheck shell=bash

# @cat Metadata
# @cmd tags
# @desc Run the tags manager utility
function tags() {
    python3 .scripts/tags-manager.py "$@"
}

# @cat Metadata
# @cmd yaml
# @desc Run the YAML front matter manager utility
function yaml() {
    python3 .scripts/yaml-manager.py "$@"
}

# @cat Metadata
# @cmd links
# @desc Internal-link opportunities — 'links' for corpus stats, 'links <path>' for one article
function links() {
    if [[ $# -eq 0 ]]; then
        node scripts/internal-link-opportunities.mjs --stats
    else
        node scripts/internal-link-opportunities.mjs --post "$@"
    fi
}
