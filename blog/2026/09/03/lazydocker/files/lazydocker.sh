# lazydocker: open the containerized lazydocker TUI on the current folder,
# so it picks up a local compose.yaml and shows a "project" view instead of
# a flat container list. Works in zsh and bash: save it as
# ~/.zsh/fns/lazydocker.zsh or ~/.bash/fns/lazydocker.sh (see the article).
lazydocker() {
    local image="lazydocker"
    # Permanent home of the Dockerfile and compose.yaml, so the image can always be rebuilt.
    local build_dir="${HOME}/tools/lazydocker"
    # Shown as is in the messages, so the command can be copied for any user.
    # shellcheck disable=SC2016
    local build_dir_shown='${HOME}/tools/lazydocker'
    local config_dir="/root/.config/jesseduffield/lazydocker"

    if ! command -v docker >/dev/null 2>&1; then
        printf '\e[31mError: docker is not installed or not in your PATH.\e[0m\n' >&2
        return 1
    fi

    if ! docker image inspect "${image}" >/dev/null 2>&1; then
        printf '\e[31mError: the Docker image "%s" does not exist on this machine.\e[0m\n\n' "${image}" >&2
        printf 'How to continue:\n' >&2
        if [[ -f "${build_dir}/compose.yaml" ]]; then
            printf '  1. (cd "%s" && docker compose build)\n' "${build_dir_shown}" >&2
            printf '  2. Run lazydocker again.\n' >&2
        else
            printf '  1. Get the Dockerfile and compose.yaml from https://www.avonture.be/blog/lazydocker\n' >&2
            printf '     and save them in %s\n' "${build_dir_shown}" >&2
            printf '  2. (cd "%s" && docker compose build)\n' "${build_dir_shown}" >&2
            printf '  3. Run lazydocker again.\n' >&2
        fi
        return 1
    fi

    # Your custom actions (see "Customize" in the article), mounted only when the file exists.
    local -a config_mount=()
    if [[ -f "${build_dir}/config.yml" ]]; then
        config_mount=(-v "${build_dir}/config.yml:${config_dir}/config.yml")
    fi

    docker run --rm -it \
        -v /var/run/docker.sock:/var/run/docker.sock \
        -v "lazydocker-config:${config_dir}" \
        "${config_mount[@]}" \
        -v "${PWD}:/workdir" \
        --workdir /workdir \
        "${image}"
}
