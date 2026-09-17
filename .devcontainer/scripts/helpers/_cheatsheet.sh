# .devcontainer/scripts/helpers/_cheatsheet.sh
#
# The cheatsheet engine — `welcome()` and the double awk that turns the
# @cat/@cmd/@desc annotations of every sibling module into the startup screen.
#
# Sourced by ../interactive.sh — no shebang, never executed directly.
# shellcheck shell=bash

# welcome — redraw this cheatsheet. Deliberately un-annotated (no @cat/@cmd), so it
# doesn't get its own one-line section; it's pointed at from the Tip line instead.
function welcome() {
    [ -t 1 ] && stty sane 2>/dev/null
    printf "\033[H\033[2J"

    # The annotations live in the sibling modules, not in this file — scanning
    # ${BASH_SOURCE[0]} the way this used to would now print an empty cheatsheet.
    # The launcher exports the directory; the fallback keeps `welcome` working if
    # this module is ever sourced on its own (and keeps `set -o nounset` happy,
    # which docker-entrypoint.sh runs under).
    local scripts_dir
    scripts_dir="${INTERACTIVE_SCRIPTS_DIR:-$(dirname "$(readlink -f "${BASH_SOURCE[0]}")")/..}"

    # Docusaurus version, read straight from the installed package manifest — no
    # `npx`/`node` spawn, so it stays cheap enough to print on every shell startup.
    local docusaurus_version="" pkg
    pkg="${scripts_dir}/../../node_modules/@docusaurus/core/package.json"
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
    ' "${scripts_dir}"/helpers/*.sh | sort -t'|' -k1,1 -k2,2 | awk -F'|' '
        {
            if ($1 != current_cat) {
                printf "\r\n\033[1;33m── %s ────────────────────────────────\033[0m\r\n", $1;
                current_cat = $1;
            }
            printf "  \033[1;32m%-16s\033[0m %s\r\n", $2, $3;
        }
    '

    echo -e "\n💡 \033[1;36mTip:\033[0m \033[4mcheck\033[0m before every commit, \033[4mrun_ci all\033[0m before every push (adds lint + a full prod build).  \033[4mwelcome\033[0m redraws this list.\n"
}
