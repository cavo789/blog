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
# @cmd spam
# @desc Block a Bluesky spammer — prints the moderation list URL to open in the browser
function spam() {
    echo "Open the Bluesky moderation list and add the spammer's handle:"
    echo "  https://bsky.app/profile/avonture.be/lists/3mvz3v7vaqg2r"
    echo ""
    echo "Changes take effect on the next page load (no deploy needed)."
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
