# md-convert: convert a document of the current folder to Markdown with the
# isolated markitdown Docker image. Works in zsh and bash: save it as
# ~/.zsh/fns/md-convert.zsh or ~/.bash/fns/md-convert.sh (see the article).
#
#   md-convert report.docx > report.md
#
# The current folder is the only thing the container sees; everything else is
# read-only, unprivileged, and thrown away after the conversion.
md-convert() {
    local image="markitdown"
    # Permanent home of the Dockerfile, so the image can always be rebuilt.
    local build_dir="${HOME}/tools/markitdown"
    # Shown as is in the messages, so the command can be copied for any user.
    # shellcheck disable=SC2016
    local build_dir_shown='${HOME}/tools/markitdown'

    if ! command -v docker >/dev/null 2>&1; then
        printf '\e[31mError: docker is not installed or not in your PATH.\e[0m\n' >&2
        return 1
    fi

    if ! docker image inspect "${image}" >/dev/null 2>&1; then
        printf '\e[31mError: the Docker image "%s" does not exist on this machine.\e[0m\n\n' "${image}" >&2
        printf 'How to continue:\n' >&2
        if [[ -f "${build_dir}/Dockerfile" ]]; then
            printf '  1. docker build -t %s "%s"\n' "${image}" "${build_dir_shown}" >&2
            printf '  2. Run your md-convert command again.\n' >&2
        else
            printf '  1. Get the Dockerfile from https://www.avonture.be/blog/markitdown\n' >&2
            printf '     and save it as %s/Dockerfile\n' "${build_dir_shown}" >&2
            printf '  2. docker build -t %s "%s"\n' "${image}" "${build_dir_shown}" >&2
            printf '  3. Run your md-convert command again.\n' >&2
        fi
        return 1
    fi

    docker run --rm -i \
        -v "${PWD}:/workspace" \
        -w /workspace \
        --read-only \
        --tmpfs /tmp:size=64m,noexec,nosuid \
        --tmpfs /run:size=16m \
        --cap-drop ALL \
        --security-opt no-new-privileges:true \
        -u "$(id -u):$(id -g)" \
        "${image}" "$@"
}
