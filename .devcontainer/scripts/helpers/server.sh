# .devcontainer/scripts/helpers/server.sh
#
# Category "Server" — the dev server and the static preview.
#
# Sourced by ../interactive.sh — no shebang, never executed directly.
# shellcheck shell=bash

# @cat Server
# @cmd start
# @desc Clear cache and (re)start the Docusaurus dev server on port 3000 (HTTPS)
function start() {
    local port=3000

    printf "🔄 Stopping any running Docusaurus dev server...\n"
    pkill -f "docusaurus start" 2>/dev/null || true

    local pids
    pids=$(lsof -ti "tcp:${port}" 2>/dev/null) || true
    if [[ -n "${pids}" ]]; then
        # shellcheck disable=SC2086 # intentionally unquoted: lsof -t can return several
        # newline-separated PIDs, and word-splitting is what lets `kill` take them all at once.
        kill -9 ${pids} 2>/dev/null || true
    fi

    local tries=0
    while lsof -i "tcp:${port}" >/dev/null 2>&1; do
        tries=$((tries + 1))
        if [[ "${tries}" -gt 10 ]]; then
            printf "❌ Port %s is still in use after 10s, aborting.\n" "${port}" >&2
            printf "   See what's holding it with: lsof -i tcp:%s\n" "${port}" >&2
            return 1
        fi
        sleep 1
    done

    printf "🧹 Clearing Docusaurus cache...\n"
    # `yarn clear`, not `yarn docusaurus clear` directly — the package.json script also wipes
    # .docusaurus-dev/ (see below), which the bare CLI command doesn't know about.
    if ! yarn clear; then
        printf "❌ 'yarn clear' failed, see errors above.\n" >&2
        return 1
    fi

    printf "🚀 Starting Docusaurus on port %s...\n" "${port}"
    # DOCUSAURUS_GENERATED_FILES_DIR_NAME keeps this dev server's codegen (.docusaurus-dev/)
    # separate from a `yarn build`'s (.docusaurus/) — sharing one folder let a concurrent
    # build corrupt an already-running dev server's compile (README.md has the full story).
    # `start_fr` sets DOCUSAURUS_LOCALE; unset (the normal case) means the default locale and
    # `locale_args` stays empty, so this invocation is byte-for-byte what it always was.
    local locale_args=()
    if [[ -n "${DOCUSAURUS_LOCALE:-}" ]]; then
        locale_args=(--locale "${DOCUSAURUS_LOCALE}")
        printf "🌍 Locale: %s\n" "${DOCUSAURUS_LOCALE}"
    fi

    HTTPS=true SSL_CRT_FILE=localhost.pem SSL_KEY_FILE=localhost-key.pem \
        DOCUSAURUS_GENERATED_FILES_DIR_NAME=.docusaurus-dev \
        yarn docusaurus start --host 0.0.0.0 --port "${port}" "${locale_args[@]}"
}

# @cat Server
# @cmd start_fr
# @desc Same as `start`, but serves the site in FRENCH (locale fr) on port 3000
function start_fr() {
    # Docusaurus's dev server serves ONE locale at a time, so this replaces `start` rather than
    # running alongside it: the EN flag on a translated page will point at a route this server
    # did not build. That is expected — use `static` for a preview where both locales exist.
    printf "🇫🇷 Starting the dev server in French. Run 'start' to go back to English.\n"
    DOCUSAURUS_LOCALE=fr start "$@"
}

# @cat Server
# @cmd static
# @desc Build the blog and serve the static site on port 3001 (HTTPS via VS Code) — leaves the dev server on 3000 alone
function static() {
    local port=3001

    printf "🔄 Stopping any running static server on port %s...\n" "${port}"
    pkill -f "docusaurus serve" 2>/dev/null || true

    local pids
    pids=$(lsof -ti "tcp:${port}" 2>/dev/null) || true
    if [[ -n "${pids}" ]]; then
        # shellcheck disable=SC2086 # intentionally unquoted: lsof -t can return several
        # newline-separated PIDs, and word-splitting is what lets `kill` take them all at once.
        kill -9 ${pids} 2>/dev/null || true
    fi

    local tries=0
    while lsof -i "tcp:${port}" >/dev/null 2>&1; do
        tries=$((tries + 1))
        if [[ "${tries}" -gt 10 ]]; then
            printf "❌ Port %s is still in use after 10s, aborting.\n" "${port}" >&2
            printf "   See what's holding it with: lsof -i tcp:%s\n" "${port}" >&2
            return 1
        fi
        sleep 1
    done

    printf "🏗️  Building Docusaurus...\n"
    # No `docusaurus clear` here — this is just "preview the built site locally", not the
    # correctness gate (that's `run_ci build`, which clears deliberately). Keeping the webpack
    # persistent cache lets unchanged rebuilds skip most of the work.
    if ! yarn docusaurus build; then
        printf "❌ 'docusaurus build' failed, see errors above.\n" >&2
        return 1
    fi

    printf "🌐 Serving built site on https://localhost:%s ...\n" "${port}"
    yarn docusaurus serve --host 0.0.0.0 --port "${port}"
}
