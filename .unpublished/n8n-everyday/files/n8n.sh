# Drive the permanent n8n instance from any folder. Works in zsh and bash:
# save it as ~/.zsh/fns/n8n.zsh or ~/.bash/fns/n8n.sh (see the article).
#
#   n8n          -> start n8n (or keep it running) and print its address
#   n8n stop     -> stop it; workflows and account stay in the volume
#   n8n logs     -> follow its logs (Ctrl+C to leave)
#   n8n status   -> is it running?
n8n() {
    # Permanent home of compose.yaml.
    local compose_file="${HOME}/tools/n8n/compose.yaml"
    # Shown as is in the messages, so the command can be copied for any user.
    # shellcheck disable=SC2016
    local compose_file_shown='${HOME}/tools/n8n/compose.yaml'
    local url="http://localhost:5678"

    if ! command -v docker >/dev/null 2>&1; then
        printf '\e[31mError: docker is not installed or not in your PATH.\e[0m\n' >&2
        return 1
    fi

    if [[ ! -f "${compose_file}" ]]; then
        printf '\e[31mError: %s does not exist.\e[0m\n\n' "${compose_file_shown}" >&2
        printf 'How to continue:\n' >&2
        printf '  1. Get compose.yaml from https://www.avonture.be/blog/n8n-latest-ci-check\n' >&2
        printf '     and save it as %s\n' "${compose_file_shown}" >&2
        printf '  2. Run n8n again.\n' >&2
        return 1
    fi

    case "${1:-up}" in
        up)
            docker compose -f "${compose_file}" up -d || return 1
            printf '\e[32mn8n is running: %s\e[0m\n' "${url}"
            ;;
        stop)
            docker compose -f "${compose_file}" stop
            ;;
        logs)
            docker compose -f "${compose_file}" logs -f
            ;;
        status)
            docker compose -f "${compose_file}" ps
            ;;
        *)
            printf 'Usage: n8n [up|stop|logs|status]\n' >&2
            return 1
            ;;
    esac
}
