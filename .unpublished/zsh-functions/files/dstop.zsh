# Multi-select Docker Stop
# - Features: Select multiple containers using TAB, stops them in batch.
# - Safety: Returns early if no containers are running.
function dstop() {
    # Dependency check
    if ! command -v fzf &> /dev/null; then
        echo "Error: fzf is required for this function."
        return 1
    fi

    # Check for running containers first to avoid empty fzf prompt
    if [[ -z "$(docker ps -q)" ]]; then
        echo "No running containers found."
        return 0
    fi

    local container_ids

    # -m enables multi-selection (TAB key)
    container_ids=$(docker ps --format "{{.ID}}\t{{.Names}}\t{{.Status}}" | \
        fzf -m --height 40% --layout=reverse --header "TAB: Select multiple | Enter: Stop selected" | \
        awk '{print $1}')

    # Exit if user cancels fzf (ESC)
    if [[ -z "$container_ids" ]]; then
        return 0
    fi

    # Replace newlines with spaces to form a single command line
    local target_ids
    target_ids=$(echo "$container_ids" | tr '\n' ' ')

    echo -e "\nStopping containers: \033[1;31m${target_ids}\033[0m"

    # Execute stop on all selected IDs
    docker stop $(echo "$target_ids")
}
