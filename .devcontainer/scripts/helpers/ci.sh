# .devcontainer/scripts/helpers/ci.sh
#
# Category "CI Parity" — reproduce the GitHub Actions workflows locally.
#
# Sourced by ../interactive.sh — no shebang, never executed directly.
# shellcheck shell=bash

# @cat CI Parity
# @cmd run_ci
# @desc Reproduce GitHub Actions locally — no args opens an fzf picker, or: run_ci hooks/lint/format/links/build/e2e/all (run_ci --help for details)
function run_ci() {
    local choice="${1:-}"

    # Single source of truth for both the fzf picker and `run_ci --help` — a
    # parallel array, not "name  desc" strings, so neither has to re-parse the
    # other's formatting (the picker needs fzf's own column, --help needs its
    # own printf width).
    local -a opt_names=(all build e2e format hooks links lint)
    local -a opt_descs=(
        "run every check below, in order (stops at first failure)"
        "deploy.yml — production build (yarn clear && yarn build)"
        "quality.yml — Playwright smoke/hydration test against build/ (needs 'build' first)"
        "local-only — yarn format:check (Prettier)"
        "pre-commit — trailing-whitespace, typos, markdownlint, eslint, prettier, freshness"
        "quality.yml — internal links on changed/new articles"
        "quality.yml — yarn lint (ESLint + stylelint + tsc + snippets)"
    )

    if [[ "${choice}" == "help" || "${choice}" == "--help" || "${choice}" == "-h" ]]; then
        printf "\n\033[1;34mrun_ci\033[0m — reproduce GitHub Actions (quality.yml/deploy.yml) locally.\n"
        printf "\033[2mSame scripts the CI jobs call — a green run_ci means a green CI job.\033[0m\n\n"
        printf "\033[1;33mUsage:\033[0m run_ci [option]\n\n"
        local i
        for i in "${!opt_names[@]}"; do
            printf "  \033[1;32m%-7s\033[0m %s\n" "${opt_names[${i}]}" "${opt_descs[${i}]}"
        done
        printf "\n  \033[2mNo option: opens an fzf picker (Tab-select one of the above).\033[0m\n\n"
        return 0
    fi

    if [[ -z "${choice}" ]]; then
        if ! command -v fzf >/dev/null 2>&1; then
            printf "❌ fzf is not installed. Run 'run_ci --help' to see the options directly.\n" >&2
            return 1
        fi

        local -a lines=()
        local i
        for i in "${!opt_names[@]}"; do
            lines+=("$(printf '%-7s %s' "${opt_names[${i}]}" "${opt_descs[${i}]}")")
        done

        local picked
        picked=$(
            printf '%s\n' "${lines[@]}" \
                | fzf --height=40% --reverse --header="run_ci — pick a check to reproduce locally" \
                | awk '{print $1}'
        )

        if [[ -z "${picked}" ]]; then
            return 0
        fi

        printf "\n💡 \033[1;36mTip:\033[0m skip the picker next run — \033[1mrun_ci %s\033[0m\n\n" "${picked}"
        choice="${picked}"
    fi

    case "${choice}" in
        hooks)
            check
            ;;
        lint)
            printf '\033[1;34m▶ quality.yml — yarn lint\033[0m\n'
            yarn lint
            ;;
        format)
            printf '\033[1;34m▶ format:check — Prettier\033[0m\n'
            yarn format:check
            ;;
        links)
            printf '\033[1;34m▶ quality.yml — internal links on changed/new articles\033[0m\n'
            _run_ci_links
            ;;
        build)
            printf '\033[1;34m▶ deploy.yml — production build\033[0m\n'
            # `yarn clear` (not `yarn docusaurus clear`): the package.json script also
            # wipes .docusaurus-dev/, so a stale MDX cache can't mask a regression here.
            yarn clear && yarn build
            ;;
        e2e)
            # No auto-build here: `run_ci build` is a distinct, explicit step (and
            # `all` already runs it right before this one) — silently rebuilding
            # would either duplicate that work or mask which `build/` got tested.
            if [[ ! -d build ]]; then
                printf "❌ No build/ found — run 'run_ci build' first.\n" >&2
                return 1
            fi
            printf '\033[1;34m▶ quality.yml — Playwright smoke/hydration (build/)\033[0m\n'
            yarn test:e2e
            ;;
        all | --all)
            run_ci hooks && run_ci lint && run_ci format && run_ci links && run_ci build && run_ci e2e
            ;;
        *)
            printf "Unknown option: %s\n" "${choice}" >&2
            printf "Usage: run_ci [hooks|lint|format|links|build|e2e|all] — run 'run_ci --help' for details\n" >&2
            return 1
            ;;
    esac
}

# Internal helper for `run_ci links`. Mirrors the internal-links job in
# quality.yml, but diffs against local `main` instead of a PR base sha — there
# is no PR context to read outside of CI.
function _run_ci_links() {
    local base
    base=$(git merge-base HEAD main 2>/dev/null) || true
    if [[ -z "${base}" ]]; then
        base=$(git rev-parse HEAD~1 2>/dev/null) || true
        [[ -z "${base}" ]] && base=$(git rev-parse HEAD)
    fi

    local articles
    articles=$(git diff --name-only --diff-filter=ACM "${base}" HEAD -- \
        'blog/**/index.md' 'blog/**/index.mdx' \
        '.unpublished/**/index.md' '.unpublished/**/index.mdx') || true

    if [[ -z "${articles}" ]]; then
        printf "No article added or modified since %s.\n" "${base}"
        return 0
    fi

    local status=0
    local article
    while IFS= read -r article; do
        [[ -z "${article}" ]] && continue
        printf "\n— %s —\n" "${article}"
        if ! node scripts/internal-link-opportunities.mjs --post "${article}"; then
            status=1
        fi
    done <<< "${articles}"

    return "${status}"
}
