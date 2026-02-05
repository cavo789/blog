# Interactive Docker Exec
# - Features: Lists running containers, command visibility, bash/sh fallback.
# - Keybindings:
#   * Enter: Execute immediately.
#   * Ctrl-E: Edit command in current buffer before execution.
function dex() {
    # Dependency check
    if ! command -v fzf &> /dev/null; then
        echo "Error: fzf is required for this function."
        return 1
    fi

    # Check for running containers to avoid empty prompt
    if [[ -z "$(docker ps -q)" ]]; then
        echo "No running containers found."
        return 0
    fi

    local fzf_out
    local key
    local selection
    local container_id
    local cmd_base

    # 1. Get container selection and key press
    # --expect=ctrl-e allows detecting if the user wants to edit
    fzf_out=$(docker ps --format "{{.ID}}\t{{.Names}}\t{{.Image}}" | \
        fzf --height 40% --layout=reverse --header "Enter: Run | Ctrl-E: Edit command" --expect=ctrl-e)

    # If user cancelled (Esc), exit
    if [[ -z "$fzf_out" ]]; then
        return 0
    fi

    # 2. Parse output (Line 1 is the key, subsequent lines are the selection)
    key=$(head -n 1 <<< "$fzf_out")
    selection=$(tail -n +2 <<< "$fzf_out")
    container_id=$(awk '{print $1}' <<< "$selection")

    if [[ -z "$container_id" ]]; then
        return 0
    fi

    # 3. Construct the base command
    cmd_base="docker exec -it $container_id /bin/bash"

    # 4. Handle modes based on key pressed
    if [[ "$key" == "ctrl-e" ]]; then
        # Edit Mode: Push to Zsh buffer stack for editing
        print -z "$cmd_base"
    else
        # Run Mode: Show command and execute with fallback
        echo -e "\nRunning: \033[1;32m${cmd_base}\033[0m"

        if ! eval "$cmd_base"; then
            local cmd_fallback="docker exec -it $container_id /bin/sh"
            echo -e "\nBash failed. Retrying with sh:"
            echo -e "Running: \033[1;33m${cmd_fallback}\033[0m"
            eval "$cmd_fallback"
        fi
    fi
}
