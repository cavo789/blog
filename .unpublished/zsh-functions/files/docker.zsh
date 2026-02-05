#!/usr/bin/env zsh

# ------------------------------------------------------------------------------
# DOCKER ZSH UTILITIES (Optimized Version)
# ------------------------------------------------------------------------------
# Description: Professional Docker workflow for Zsh with fzf integration.
# Maintainer: Gemini AI & User
# Usage:
#   1. Save to ~/.zsh/docker.zsh
#   2. Source in ~/.zshrc: [[ -f ~/.zsh/docker.zsh ]] && source ~/.zsh/docker.zsh
# ------------------------------------------------------------------------------

# --- Internal Helpers ---------------------------------------------------------

# Check for dependencies and Docker daemon status
_d_check_env() {
    for dep in "$@"; do
        if ! command -v "$dep" &> /dev/null; then
            echo -e "\033[0;31mError:\033[0m '$dep' is not installed."
            return 1
        fi
    done
    if ! docker info &> /dev/null; then
        echo -e "\033[0;31mError:\033[0m Docker daemon is not running."
        return 1
    fi
}

_d_print_cmd() {
    local color="\033[1;32m"
    [[ -n "$2" ]] && color="$2"
    echo -e "Command: ${color}$1\033[0m"
}

_d_has_running_containers() {
    if [[ -z "$(docker ps -q 2>/dev/null)" ]]; then
        echo "No running containers found."
        return 1
    fi
    return 0
}

# --- Main Functions (Alphabetical Order) --------------------------------------

# Interactive Docker Exec with Preview
function dex() {
    _d_check_env fzf docker || return 1
    _d_has_running_containers || return 0

    local fzf_out key selection container_id cmd_base
    local preview_cmd='docker inspect --format "{{.State.Status}} | IP: {{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}} | Created: {{.Created}}" {1}'

    fzf_out=$(docker ps --format "{{.ID}}\t{{.Names}}\t{{.Image}}" | \
        fzf --height 40% --layout=reverse --header "Enter: Run | Ctrl-E: Edit" \
            --preview "$preview_cmd" --preview-window=bottom:2:wrap \
            --expect=ctrl-e)

    [[ -z "$fzf_out" ]] && return 0

    key=$(head -n 1 <<< "$fzf_out")
    selection=$(tail -n +2 <<< "$fzf_out")
    container_id=$(awk '{print $1}' <<< "$selection")
    [[ -z "$container_id" ]] && return 0

    # Best-in-class check for shell availability
    cmd_base="docker exec -it $container_id /bin/bash"

    if [[ "$key" == "ctrl-e" ]]; then
        print -z "$cmd_base"
    else
        echo ""
        _d_print_cmd "$cmd_base"
        if ! eval "$cmd_base"; then
            local cmd_fallback="docker exec -it $container_id /bin/sh"
            echo -e "\n\033[0;33mBash failed. Retrying with sh...\033[0m"
            _d_print_cmd "$cmd_fallback" "\033[1;33m"
            eval "$cmd_fallback"
        fi
    fi
}

# Interactive Docker Logs via lnav
function dlogs() {
    _d_check_env fzf docker lnav || return 1
    _d_has_running_containers || return 0

    local fzf_out key selection container_id cmd_logs

    fzf_out=$(docker ps --format "{{.ID}}\t{{.Names}}\t{{.Image}}\t{{.Status}}" | \
        fzf --height 40% --layout=reverse --header "Enter: lnav | Ctrl-E: Edit" --expect=ctrl-e)

    [[ -z "$fzf_out" ]] && return 0

    key=$(head -n 1 <<< "$fzf_out")
    selection=$(tail -n +2 <<< "$fzf_out")
    container_id=$(awk '{print $1}' <<< "$selection")
    [[ -z "$container_id" ]] && return 0

    cmd_logs="docker logs -f --tail 500 $container_id 2>&1 | lnav"

    if [[ "$key" == "ctrl-e" ]]; then
        print -z "$cmd_logs"
    else
        echo ""
        _d_print_cmd "$cmd_logs" "\033[1;36m"
        eval "$cmd_logs"
    fi
}

# Selective Docker Cleanup Wizard (Zsh Array Optimized)
function dnuke() {
    _d_check_env docker || return 1
    echo -e "\033[1;34m=== Docker Cleanup Wizard ===\033[0m"

    # 1. Containers
    local -a containers=("${(f)$(docker ps -a -f "status=exited" -q)}")
    if [[ ${#containers[@]} -gt 0 && -n "${containers[*]}" ]]; then
        echo -e "\n\033[1;33m[Containers]\033[0m Found stopped containers:"
        docker ps -a -f "status=exited" --format "table {{.Names}}\t{{.Status}}\t{{.Image}}"
        _d_print_cmd "docker rm ${containers[*]}"
        read -k 1 "reply?Execute? (y/N): " && echo ""
        [[ "$reply" =~ ^[Yy]$ ]] && docker rm "${containers[@]}"
    fi

    # 2. Images
    local -a images=("${(f)$(docker images -f "dangling=true" -q)}")
    if [[ ${#images[@]} -gt 0 && -n "${images[*]}" ]]; then
        echo -e "\n\033[1;33m[Images]\033[0m Found dangling images:"
        docker images -f "dangling=true"
        _d_print_cmd "docker rmi ${images[*]}"
        read -k 1 "reply?Execute? (y/N): " && echo ""
        [[ "$reply" =~ ^[Yy]$ ]] && docker rmi "${images[@]}"
    fi

    # 3. Volumes
    local -a volumes=("${(f)$(docker volume ls -qf dangling=true)}")
    if [[ ${#volumes[@]} -gt 0 && -n "${volumes[*]}" ]]; then
        echo -e "\n\033[1;33m[Volumes]\033[0m Found unused volumes:"
        docker volume ls -f dangling=true
        _d_print_cmd "docker volume rm ${volumes[*]}"
        read -k 1 "reply?Execute? (y/N): " && echo ""
        [[ "$reply" =~ ^[Yy]$ ]] && docker volume rm "${volumes[@]}"
    fi

    # 4. Build Cache
    echo -e "\n\033[1;33m[Build Cache]\033[0m Checking cache size..."
    docker system df | grep "Build Cache"
    _d_print_cmd "docker builder prune"
    read -k 1 "reply?Prune cache? (y/N): " && echo ""
    [[ "$reply" =~ ^[Yy]$ ]] && docker builder prune

    echo -e "\n\033[1;32mCleanup finished.\033[0m"
}

# Master Operations Menu
function dops() {
    _d_check_env fzf || return 1

    local options=(
        "dex: Exec into a container"
        "dlogs: View logs with lnav"
        "dnuke: Cleanup wizard"
        "dstop: Stop containers (batch)"
    )

    local selected_op=$(printf "%s\n" "${options[@]}" | \
        fzf --height 30% --layout=reverse --header "Select Operation" | \
        awk -F':' '{print $1}')

    if [[ -n "$selected_op" ]]; then
        if functions "$selected_op" > /dev/null; then
            "$selected_op"
        else
            echo "Error: Function '$selected_op' not found."
        fi
    fi
}

# Batch Stop Containers with Info Preview
function dstop() {
    _d_check_env fzf docker || return 1
    _d_has_running_containers || return 0

    local container_ids
    local preview_cmd='docker ps -f "id={1}" --format "Image: {{.Image}} | Status: {{.Status}}"'

    container_ids=$(docker ps --format "{{.ID}}\t{{.Names}}\t{{.Status}}" | \
        fzf -m --height 40% --layout=reverse --header "TAB: Select | Enter: Stop" \
            --preview "$preview_cmd" --preview-window=bottom:1:wrap | \
        awk '{print $1}')

    [[ -z "$container_ids" ]] && return 0

    local -a target_ids=("${(f)container_ids}")
    echo ""
    _d_print_cmd "docker stop ${target_ids[*]}" "\033[1;31m"
    docker stop "${target_ids[@]}"
}

# --- Initialization & Reminders -----------------------------------------------

alias d='dops'

if [[ -o interactive ]]; then
    echo -e "\033[1;30mDocker Utils loaded:\033[0m"
    echo -e "  \033[0;36mdex\033[0m   (exec)   \033[0;36mdlogs\033[0m (logs/lnav)    \033[0;36mdstop\033[0m (stop)"
    echo -e "  \033[0;36mdnuke\033[0m (clean)  \033[0;36mdops\033[0m  (menu/alias \033[1;32md\033[0m)"
fi
