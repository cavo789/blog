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
#    ./install-vscode-extensions.sh <container-name> <user-name>
#
# Remark
# ------
#
# "xxxxxxx" in "attached-container+xxxxxxx" is the result of the "xxd -p" command i.e. the
# hex dump representation of the container name (i.e. $(printf "${container-name}" | xxd -p)")

# cspell:ignore bosa

# Global variables

# The container name
CONTAINER_NAME=""

# The username inside the container; most probably "bosa"
OS_USERNAME=""

# The folder inside the container where the VSCODE binary will be added by vscode
VSCODE_FOLDER=""

# This is contains the full path to the vscode-server binary inside the container
# For instance "/home/bosa/.vscode-server/bin/91fa95bccb027ece6a968589bb1d662fa9c8e170/bin/code-server"
VSCODE_CLI=""

# The .devcontainer/devcontainer.json is located in the parent folder of the script
DEVCONTAINER_JSON_FILE="$(dirname -- "${BASH_SOURCE[0]}")/../.devcontainer/devcontainer.json"

# Show an error on the console (in red) and exit with a non zero exit code
function install::__error() {
    echo -e "\e[31;1mERROR - $*\e[0m" >&2
    exit 1
}

# Show a notice on the console (in red) and exit with a zero exit code
function install::__notice() {
    echo -e "\e[33;1mNOTICE - $*\e[0m" >&2
    return 0
}

# Make some assertions and exit with an error if one assertion fails
function install::__checks() {
    if [ -z "${CONTAINER_NAME}" ]; then
        install::__error "You've to provide the name of the container to use. " \
            "See the \"NAMES\" column when you run \"docker ps\" in the console."
    fi

    if [ -z "${OS_USERNAME}" ]; then
        install::__error "You've to provide the name of the user used inside the container. "
    fi

    # jq is required to parse the devcontainer.json file
    if ! command -v jq &>/dev/null; then
        install::__error "jq is not installed. " \
            "Please install it by running \"sudo apt-get update && sudo apt-get install -y jq\"."
    fi

    # Make sure there is a container with that name
    if ! docker ps --filter "name=${CONTAINER_NAME}" | grep -q "${CONTAINER_NAME}"; then
        install::__error "There is no container named ${CONTAINER_NAME}. Please make sure the name is correct."
    fi

    return 0
}

# Read the devcontainer.json file and return the list of extensions from the
# .customizations.vscode.extensions key.
function install::__getExtensions() {
    # Check if the devcontainer.json file exists
    if [ ! -f "${DEVCONTAINER_JSON_FILE}" ]; then
        install::__notice "The ${DEVCONTAINER_JSON_FILE} file is missing (so nothing to install)."
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
function install::__getAttachedName() {
    echo "attached-container+$(printf "${1}" | xxd -p)"
    return 0
}

# When VSCode will attach itself to the container, he'll need a specific amount of time to
# copy in the container some files under the vscode default folder. We've to wait until the
# "code-server" binary file is copied.
function install::__waitForVSCodeServer() {
    echo "⏳ Waiting for VS Code server to initialize in container '${CONTAINER_NAME}'..."

    # Set a timeout in seconds
    local -r TIMEOUT=60
    declare ELAPSED_TIME
    ELAPSED_TIME=0

    set +e
    # Loop and wait until the VSCode CLI is found or timeout is reached
    while [ $ELAPSED_TIME -lt $TIMEOUT ]; do
        # Run the command and capture the standard output (the full path) and exit code
        # We still need to run in a subshell with 'sh -c' to properly handle the wildcard
        VSCODE_CLI=$(docker exec "${CONTAINER_NAME}" sh -c "ls -d ${VSCODE_FOLDER}/bin/*/bin/code-server 2>/dev/null")
        EXIT_CODE=$?

        # Check the exit code. A 0 indicates success.
        if [ $EXIT_CODE -eq 0 ]; then
            # The command was successful, break the loop
            # echo "VSCode CLI found at: ${VSCODE_CLI}"
            break
        fi

        # The command failed, sleep for a second and increment the elapsed time
        sleep 1
        ELAPSED_TIME=$((ELAPSED_TIME + 1))
        echo "Waiting for VSCode CLI... (${ELAPSED_TIME}/${TIMEOUT}s)"
    done

    set -e

    [ -z "${VSCODE_CLI}" ] && install::__error "VS Code CLI not found. Cannot install extensions."

    echo "✅ VS Code server is ready"

    return 0
}

# As from now, once the vscode binary has been detected in the container, we can
# start to install desired extensions (if not yet present)
function install::__installExtensions() {
    local -r EXTENSION_DIR="${VSCODE_FOLDER}/extensions"

    # Get the list of extensions (as a single string) to install in the devcontainer
    local extensions_list
    extensions_list=$(install::__getExtensions)

    [ -z "${extensions_list}" ] && install::__notice "No extensions found in the devcontainer.json file."

    # Split the string into an array
    read -ra EXTENSIONS <<< "${extensions_list}"

    set +e
    # Install required extensions if not already present
    for extension in "${EXTENSIONS[@]}"; do

        # Run the command and capture grep's exit code
        docker exec "${CONTAINER_NAME}" sh -c "ls '${EXTENSION_DIR}' | grep -qi '${extension}'"
        exit_code=$?

        if [ $exit_code -eq 0 ]; then
            echo "✅ Extension '${extension}' is already installed."
        else
            echo "⚠️ Extension '${extension}' is not installed. Installing now..."

            # Very strange but ... It can happens the extension is not present in  folder
            #  ~/.vscode-server/extensions but IS MENTIONED in the  ~/.vscode-server/extensions/extensions.json
            # file due to "corruption". One way to solve this corruption is to uninstall the extension before
            # installing it (again)
            docker exec "${CONTAINER_NAME}" "${VSCODE_CLI}" --uninstall-extension "${extension}" &>/dev/null

            docker exec "${CONTAINER_NAME}" "${VSCODE_CLI}" --install-extension "${extension}" --force &>/dev/null
        fi
    done
    set -e

    return 0
}

function install::__main() {
    # We need to pass the name of the container (see the "NAMES" column when you run "docker ps" in the CLI)
    # This script will install VSCode extensions (for a devcontainer session) in a specific container.
    CONTAINER_NAME="${1:-}"

    # The username inside the container; most probably "bosa". Make sure to remove quotes
    OS_USERNAME="$(echo "${2:-bosa}" | tr -d '"')"

    VSCODE_FOLDER="/home/${OS_USERNAME}/.vscode-server"

    install::__checks
    install::__waitForVSCodeServer
    install::__installExtensions

    return 0
}

# shellcheck disable=SC2048,SC2086
install::__main $*
