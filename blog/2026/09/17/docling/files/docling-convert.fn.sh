# docling-convert: convert a document of the current folder to Markdown with
# the docling Docker image. Works in zsh and bash: save it as
# ~/.zsh/fns/docling-convert.zsh or ~/.bash/fns/docling-convert.sh.
#
#   docling-convert report.pdf          -> report.md, next to report.pdf
#
# The real work (GPU probe, docling options, log filtering) is done by
# ~/tools/docling/docling-convert.sh, a bash script kept next to the
# Dockerfile; this function only checks that everything is in place.
docling-convert() {
    local image="docling"
    local build_dir="${HOME}/tools/docling"
    # Shown as is in the messages, so the command can be copied for any user.
    # shellcheck disable=SC2016
    local build_dir_shown='${HOME}/tools/docling'
    local script="${build_dir}/docling-convert.sh"
    local script_shown="${build_dir_shown}/docling-convert.sh"

    if ! command -v docker >/dev/null 2>&1; then
        printf '\e[31mError: docker is not installed or not in your PATH.\e[0m\n' >&2
        return 1
    fi

    if [[ ! -f "${script}" ]] || ! docker image inspect "${image}" >/dev/null 2>&1; then
        if [[ ! -f "${script}" ]]; then
            printf '\e[31mError: %s does not exist.\e[0m\n\n' "${script_shown}" >&2
        else
            printf '\e[31mError: the Docker image "%s" does not exist on this machine.\e[0m\n\n' "${image}" >&2
        fi
        printf 'How to continue:\n' >&2
        if [[ -f "${build_dir}/Dockerfile" && -f "${script}" ]]; then
            printf '  1. docker build -t %s "%s"\n' "${image}" "${build_dir_shown}" >&2
            printf '  2. Run your docling-convert command again.\n' >&2
        else
            printf '  1. Get the Dockerfile and docling-convert.sh from\n' >&2
            printf '     https://www.avonture.be/blog/docling and save them in %s\n' "${build_dir_shown}" >&2
            printf '  2. docker build -t %s "%s"\n' "${image}" "${build_dir_shown}" >&2
            printf '  3. Run your docling-convert command again.\n' >&2
        fi
        return 1
    fi

    bash "${script}" "$@"
}
