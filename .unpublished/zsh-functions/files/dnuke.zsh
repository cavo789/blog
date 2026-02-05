# Docker Cleanup Wizard (Version 2.0 - Robust & Transparent)
# - Safety: Uses Zsh arrays to handle IDs safely.
# - Transparency: Displays the exact command and asks for confirmation.
function dnuke() {
    echo -e "\033[1;34m=== Docker Cleanup Wizard ===\033[0m"

    # 1. Stopped Containers
    # Use (f) to split by newline into an array
    local -a exited_containers
    exited_containers=("${(f)$(docker ps -a -f "status=exited" -q)}")

    if [[ ${#exited_containers[@]} -gt 0 && -n "${exited_containers[*]}" ]]; then
        echo -e "\n\033[1;33m[Containers]\033[0m Found stopped containers:"
        docker ps -a -f "status=exited" --format "table {{.Names}}\t{{.Status}}\t{{.Image}}"

        local cmd_rm="docker rm ${exited_containers[*]}"
        echo -e "Command: \033[1;32m$cmd_rm\033[0m"

        read -k 1 "reply?Execute this command? (y/N): "
        echo ""
        [[ "$reply" =~ ^[Yy]$ ]] && docker rm "${exited_containers[@]}"
    else
        echo -e "\n[Containers] No stopped containers to clean."
    fi

    # 2. Images (Dangling)
    local -a dangling_images
    dangling_images=("${(f)$(docker images -f "dangling=true" -q)}")

    if [[ ${#dangling_images[@]} -gt 0 && -n "${dangling_images[*]}" ]]; then
        echo -e "\n\033[1;33m[Images]\033[0m Found dangling images (<none>):"
        docker images -f "dangling=true"

        local cmd_rmi="docker rmi ${dangling_images[*]}"
        echo -e "Command: \033[1;32m$cmd_rmi\033[0m"

        read -k 1 "reply?Execute this command? (y/N): "
        echo ""
        [[ "$reply" =~ ^[Yy]$ ]] && docker rmi "${dangling_images[@]}"
    else
        echo -e "\n[Images] No dangling images found."
    fi

    # 3. Volumes (Dangling)
    local -a dangling_volumes
    dangling_volumes=("${(f)$(docker volume ls -qf dangling=true)}")

    if [[ ${#dangling_volumes[@]} -gt 0 && -n "${dangling_volumes[*]}" ]]; then
        echo -e "\n\033[1;33m[Volumes]\033[0m Found unused volumes:"
        docker volume ls -f dangling=true

        local cmd_vrm="docker volume rm ${dangling_volumes[*]}"
        echo -e "Command: \033[1;32m$cmd_vrm\033[0m"

        read -k 1 "reply?Execute this command? (y/N): "
        echo ""
        [[ "$reply" =~ ^[Yy]$ ]] && docker volume rm "${dangling_volumes[@]}"
    else
        echo -e "\n[Volumes] No unused volumes found."
    fi

    # 4. Build Cache
    echo -e "\n\033[1;33m[Build Cache]\033[0m Checking build cache size..."
    docker system df | grep "Build Cache"

    local cmd_cache="docker builder prune"
    echo -e "Command: \033[1;32m$cmd_cache\033[0m"

    read -k 1 "reply?Prune build cache? (y/N): "
    echo ""
    [[ "$reply" =~ ^[Yy]$ ]] && docker builder prune

    echo -e "\n\033[1;32mWizard session finished.\033[0m"
}
