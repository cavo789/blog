# Aider in Docker, usable from any folder
aider() {
    local -a docker_args=() aider_args=()

    # Commit with your own git identity
    [[ -f "$HOME/.gitconfig" ]] && docker_args+=(--volume "$HOME/.gitconfig:/home/aider/.gitconfig:ro")

    # A CONVENTIONS.md in the current folder is sent as read-only context, without asking
    [[ -f CONVENTIONS.md ]] && aider_args+=(--read CONVENTIONS.md)

    printf '\e[2m%s\e[0m\n' \
        "Tip: no need to name files, just describe the change." \
        "     Wrong file picked? /add <file> to point at it, /drop <file> to remove it, /ls to list them."

    docker run --rm -it \
        --user "$(id -u):$(id -g)" \
        --add-host host.docker.internal:host-gateway \
        --env OLLAMA_API_BASE="${OLLAMA_API_BASE:-http://host.docker.internal:11434}" \
        --volume "$PWD:/app" \
        "${docker_args[@]}" \
        aider-ollama:0.86.2 "${aider_args[@]}" "$@"
}
