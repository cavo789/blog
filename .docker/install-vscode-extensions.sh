#!/usr/bin/env bash
set -e

# This script automates the installation of VS Code extensions within a running Docker container
# for a remote development session. It reads the list of required extensions from a
# devcontainer.json file located in the parent directory.
#
# Usage:
#   ./install-vscode-extensions.sh <container-name>
#
# Arguments:
#   <container-name>    The name of the running Docker container where extensions will be installed.
#
# The script performs the following actions:
# 1. Validates that a container name is provided and that 'jq' is installed.
# 2. Checks if the specified container is currently running.
# 3. Reads the 'customizations.vscode.extensions' array from '.devcontainer/devcontainer.json'.
#    It gracefully handles cases where the file or the 'extensions' key is missing.
# 4. Compares the list of required extensions with those already installed in the container.
# 5. Installs any missing extensions using the 'code --install-extension' command.
#
# The script exits with a non-zero status code upon any error, and a zero status code on success.
#
# Why this script is needed?
# --------------------------
#
# This script is required when vscode is started on the command line using:
#    code --folder-uri vscode-remote://attached-container+xxxxxxx
# i.e. start VSCode and attach an existing container. In that specific situation, VSCode will not
# process the 'customizations.vscode.extensions' array from '.devcontainer/devcontainer.json' and
# thus will not install the extensions by itself (what he'll do if we attach the container using
# VSCode interface (devcontainer - attach container))
#
# How to use the script?
# ----------------------
#
# In a Linux console, run
#    code --folder-uri vscode-remote://attached-container+xxxxxxx
# immediately followed by
#    ./install-vscode-extensions.sh <container-name>
#
# Remark
# ------
#
# "xxxxxxx" in "attached-container+xxxxxxx" is the result of the "xxd -p" command i.e. the
# hex dump representation of the container name (i.e. $(printf "${container-name}" | xxd -p)")

# The .devcontainer/devcontainer.json is located in the parent folder of the script
DEVCONTAINER_JSON_FILE="$(dirname -- "${BASH_SOURCE[0]}")/../.devcontainer/devcontainer.json"

# Show an error on the console (in red) and exit with a non zero exit code
function __error() {
    echo -e "\e[31;1mERROR - $*\e[0m" >&2
    exit 1
}

# Show a notice on the console (in red) and exit with a zero exit code
function __notice() {
    echo -e "\e[33;1mNOTICE - $*\e[0m" >&2
    exit 0
}

# Make some assertions and exit with an error if one assertion fails
function __checks() {
    if [ -z "${CONTAINER_NAME}" ]; then
        __error "You've to provide the name of the container to use. " \
            "See the \"NAMES\" column when you run \"docker ps\" in the console."
    fi

    # jq is required to parse the devcontainer.json file
    if ! command -v jq &>/dev/null; then
        __error "jq is not installed. " \
            "Please install it by running \"sudo apt-get update && sudo apt-get install -y jq\"."
    fi

    # Make sure there is a container with that name
    if ! docker ps --filter "name=${CONTAINER_NAME}" | grep -q "${CONTAINER_NAME}"; then
        __error "There is no container named ${CONTAINER_NAME}. Please make sure the name is correct."
    fi

    return 0
}

# Read the devcontainer.json file and return the list of extensions from the
# .customizations.vscode.extensions key.
function __getExtensions() {
    # Check if the devcontainer.json file exists
    if [ ! -f "${DEVCONTAINER_JSON_FILE}" ]; then
        __notice "The ${DEVCONTAINER_JSON_FILE} file is missing (so nothing to install)."
    fi

    # Use jq to extract the extensions array from the devcontainer.json file
    # and store them in a Bash array.
    # The `.` at the beginning of the jq query is for the current directory.
    # The `-r` flag outputs raw strings without quotes.
    # The `tr` command is used to join the lines into a single string for the array.
    # The syntax "? // [] | .[]" will handle the situation when the extensions key is not present
    jq -r '.customizations.vscode.extensions? // [] | .[]' "${DEVCONTAINER_JSON_FILE}" | tr '\n' ' '

    return 0
}

# When running VSCode on the command line, we need to provide a "attached-container+xxxxx" string
# The xxxxx part is the result of the "xxd -p" command i.e. the hex dump representation of the name
# of the container
function __getAttachedName() {
    echo "attached-container+$(printf "${1}" | xxd -p)"
    return 0
}

function __installExtensions() {
    local -r CONTAINER_NAME="${1}"

    # Get the list of extensions (as a single string) to install in the devcontainer
    local extensions_list
    extensions_list=$(__getExtensions)

    [ -z "${extensions_list}" ] && __notice "No extensions found in the devcontainer.json file."

    # Split the string into an array
    read -ra EXTENSIONS <<< "${extensions_list}"

    # Needed by "make devcontainer"
    ATTACHED_CONTAINER_NAME=$(__getAttachedName "${CONTAINER_NAME}")

    # Get the list of already installed extensions in the container
    INSTALLED=$(code --list-extensions --remote "${ATTACHED_CONTAINER_NAME}" | sort | uniq)

    # And, finally, install required extensions (the ones from devcontainer.json) if not already present
    for extension in "${EXTENSIONS[@]}"; do
        if ! grep -qix "${extension}" <<< "${INSTALLED}"; then
            echo "Installing ${extension} in remote ${CONTAINER_NAME}..."
            code --install-extension "${extension}" --remote "${CONTAINER_NAME}"
        else
            echo "Already installed: ${extension}"
        fi
    done

    return 0
}

function __main() {
    # We need to pass the name of the container (see the "NAMES" column when you run "docker ps" in the CLI)
    # This script will install VSCode extensions (for a devcontainer session) in a specific container.
    CONTAINER_NAME="${1:-}"

    # Do some assertions and exit in case of failure
    __checks $*

    __installExtensions "${CONTAINER_NAME}"

    return 0
}

# shellcheck disable=SC2048,SC2086
__main $*
