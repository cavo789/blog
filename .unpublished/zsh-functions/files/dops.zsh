# Master Docker Operations Menu
# Groups all custom docker utilities into a single selectable menu
function dops() {
    # Check dependencies
    if ! command -v fzf &> /dev/null; then
        echo "Error: fzf is required."
        return 1
    fi

    local selected_op

    # Define available commands with descriptions
    # Format: "Command: Description"
    local options=(
        "dex: Exec into a container"
        "dstop: Stop containers (batch)"
        "dlogs: View container logs"
        "dip: Inspect container IPs"
        "dnuke: Cleanup/Prune wizard"
    )

    # Use fzf to select an operation
    selected_op=$(printf "%s\n" "${options[@]}" | \
        fzf --height 30% --layout=reverse --header "Select Docker Operation" | \
        awk -F':' '{print $1}')

    # Execute the selected function if valid
    if [[ -n "$selected_op" ]]; then
        # Check if function exists before running
        if functions "$selected_op" > /dev/null; then
            eval "$selected_op"
        else
            echo "Error: Function '$selected_op' not found."
        fi
    fi
}
