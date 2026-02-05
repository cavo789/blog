# Interactive Docker Logs Viewer (Powered by lnav)
# - Features: Syntax highlighting, log filtering, and smart navigation.
# - Dependencies: docker, fzf, lnav.
# - Keybindings:
#   * Enter: Run immediately via lnav.
#   * Ctrl-E: Edit command.
function dlogs() {
    # Check for fzf (required for selection)
    if ! command -v fzf &> /dev/null; then
        echo "Error: fzf is required for this function."
        return 1
    fi

    # Check for lnav (required for viewing)
    if ! command -v lnav &> /dev/null; then
        echo -e "\033[0;31mError: lnav is not installed.\033[0m"
        echo -e "lnav is required for advanced log navigation."
        echo -e "Install it using:"
        echo -e "  - Ubuntu/Debian: \033[1msudo apt install lnav\033[0m"
        echo -e "  - macOS: \033[1mbrew install lnav\033[0m"
        return 1
    fi

    # Check for running containers
    if [[ -z "$(docker ps -q)" ]]; then
        echo "No running containers found."
        return 0
    fi

    local fzf_out
    local key
    local selection
    local container_id
    local cmd_logs

    # Select container
    fzf_out=$(docker ps --format "{{.ID}}\t{{.Names}}\t{{.Image}}\t{{.Status}}" | \
        fzf --height 40% --layout=reverse --header "Enter: Logs (lnav) | Ctrl-E: Edit command" --expect=ctrl-e)

    if [[ -z "$fzf_out" ]]; then
        return 0
    fi

    # Parse output
    key=$(head -n 1 <<< "$fzf_out")
    selection=$(tail -n +2 <<< "$fzf_out")
    container_id=$(awk '{print $1}' <<< "$selection")

    if [[ -z "$container_id" ]]; then
        return 0
    fi

    # Construct command:
    # We use -f to follow, and pipe to lnav.
    # lnav automatically detects the format and provides navigation.
    cmd_logs="docker logs -f --tail 500 $container_id 2>&1 | lnav"

    if [[ "$key" == "ctrl-e" ]]; then
        print -z "$cmd_logs"
    else
        echo -e "\nRunning: \033[1;36m${cmd_logs}\033[0m"
        eval "$cmd_logs"
    fi
}
