# DuckDB CLI through Docker: query the CSV / JSON / Parquet files of the
# current folder, from anywhere. Works in zsh and bash: save it as
# ~/.zsh/fns/duckdb.zsh or ~/.bash/fns/duckdb.sh (see the article).
#
#   duckdb                       -> interactive SQL shell
#   duckdb -c "SELECT ..."       -> one query, then exit
#   cat q.sql | duckdb           -> piped SQL works too (no TTY needed)
#   duckdb --write -c "COPY ..." -> allow writing files in the current folder
#
# The current folder is mounted read-only by default: a query can never alter
# your files by accident. --write (first argument) lifts that, for COPY ... TO
# and ATTACH 'file.duckdb'.
duckdb() {
    local image="duckdb-cli"
    # Permanent home of the Dockerfile, so the image can always be rebuilt.
    local build_dir="${HOME}/tools/duckdb"
    # Shown as is in the messages, so the command can be copied for any user.
    # shellcheck disable=SC2016
    local build_dir_shown='${HOME}/tools/duckdb'

    if ! command -v docker >/dev/null 2>&1; then
        printf '\e[31mError: docker is not installed or not in your PATH.\e[0m\n' >&2
        return 1
    fi

    if ! docker image inspect "${image}" >/dev/null 2>&1; then
        printf '\e[31mError: the Docker image "%s" does not exist on this machine.\e[0m\n\n' "${image}" >&2
        printf 'How to continue:\n' >&2
        if [[ -f "${build_dir}/Dockerfile" ]]; then
            printf '  1. docker build -t %s "%s"\n' "${image}" "${build_dir_shown}" >&2
            printf '  2. Run your duckdb command again.\n' >&2
        else
            printf '  1. Get the Dockerfile from https://www.avonture.be/blog/duckdb-json-csv\n' >&2
            printf '     and save it as %s/Dockerfile\n' "${build_dir_shown}" >&2
            printf '  2. docker build -t %s "%s"\n' "${image}" "${build_dir_shown}" >&2
            printf '  3. Run your duckdb command again.\n' >&2
        fi
        return 1
    fi

    # Read-only mount unless --write is the first argument.
    local mount_mode=":ro"
    if [[ "${1:-}" == "--write" ]]; then
        mount_mode=""
        shift
    fi

    # -t only when both ends are a terminal, so piping SQL in or out still works.
    local tty_flags="-i"
    [[ -t 0 && -t 1 ]] && tty_flags="-it"

    if [[ -n "${mount_mode}" && $# -eq 0 && -t 0 ]]; then
        printf '\e[33mRead-only: your files cannot be modified. Start with "duckdb --write" to save files.\e[0m\n' >&2
    fi

    # --read-only locks the container's own filesystem; the mount mode above
    # is what protects (or not) the files of the current folder.
    docker run --rm "${tty_flags}" \
        -v "${PWD}:/workspace${mount_mode}" \
        -w /workspace \
        --read-only \
        --tmpfs /tmp:size=256m,noexec,nosuid \
        --cap-drop ALL \
        --security-opt no-new-privileges:true \
        -u "$(id -u):$(id -g)" \
        "${image}" "$@"

    # zsh reserves $status, hence rc.
    local rc=$?
    if [[ ${rc} -ne 0 && -n "${mount_mode}" ]]; then
        printf '\e[33mTip: the current folder is read-only. If this failed while writing a file, run it again as: duckdb --write ...\e[0m\n' >&2
    fi
    return "${rc}"
}
