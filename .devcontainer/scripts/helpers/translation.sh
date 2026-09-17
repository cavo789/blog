# .devcontainer/scripts/helpers/translation.sh
#
# Category "Translation" — French translation of the articles.
#
# Sourced by ../interactive.sh — no shebang, never executed directly.
# shellcheck shell=bash

# @cat Translation
# @cmd translate
# @desc Translate to French — one article, or every article under a folder (translate blog/2026/09)
function translate() {
    local paths=() extra=()

    # `--model`/`--locale` carry a value; everything else that starts with `--` is a bare flag.
    # Anything left is a path, so `translate blog/2026/09 --force` works in either order.
    while [[ $# -gt 0 ]]; do
        case "$1" in
            --model | --locale)
                if [[ -z "${2:-}" ]]; then
                    printf "❌ %s needs a value.\n" "$1" >&2
                    return 1
                fi
                extra+=("$1" "$2")
                shift 2
                ;;
            --*)
                extra+=("$1")
                shift
                ;;
            *)
                paths+=("$1")
                shift
                ;;
        esac
    done

    if [[ ${#paths[@]} -eq 0 ]]; then
        printf "Usage: translate <path> [--force] [--model <id>] [--locale <code>]\n" >&2
        printf "  <path> an article folder (blog/2026/09/17/docling), its index.md, or any\n" >&2
        printf "         folder above it (blog/2026/09, blog/2026, blog)\n" >&2
        printf "  Already-translated articles are skipped unless --force is given.\n" >&2
        printf "  'yarn translate:check' lists what is fresh, stale or missing.\n" >&2
        return 1
    fi

    # Collected before translating anything: a folder-wide run costs real money, so the count
    # has to be known up front rather than discovered one API call at a time.
    local files=() target found
    for target in "${paths[@]}"; do
        if [[ -f "${target}" ]]; then
            files+=("${target}")
        elif [[ -d "${target}" ]]; then
            # -print0/read -d '' so a path with a space survives; sorted so a batch runs in a
            # stable, chronological order rather than whatever order the filesystem returns.
            while IFS= read -r -d '' found; do
                files+=("${found}")
            done < <(find "${target}" -type f \( -name "index.md" -o -name "index.mdx" \) -print0 | sort -z)
        else
            printf "❌ Not found: %s\n" "${target}" >&2
            return 1
        fi
    done

    local count=${#files[@]}
    if [[ ${count} -eq 0 ]]; then
        printf "❌ No article found under: %s\n" "${paths[*]}" >&2
        return 1
    fi

    # Measured at roughly 0.16 $/article on Opus 5 (TODO 0119). Shown, never enforced — the point
    # is that `translate blog` is a ~41 $ command and must not start by surprise. A single article
    # skips the prompt: that is the everyday case, right after publishing.
    if [[ ${count} -gt 1 ]]; then
        printf "🇫🇷 %d articles to translate — about %.2f \$ (Opus 5, ≈ 0.16 \$/article).\n" \
            "${count}" "$(awk "BEGIN { print ${count} * 0.16 }")"
        printf "Continue? [y/N] "
        local reply
        read -r reply
        if [[ ! "${reply}" =~ ^[yY]$ ]]; then
            printf "Aborted — nothing sent to the API.\n"
            return 1
        fi
    fi

    local ok=0 failed=0 index=0 file
    for file in "${files[@]}"; do
        index=$((index + 1))
        printf "\n\033[1;33m── [%d/%d] %s\033[0m\n" "${index}" "${count}" "${file}"
        if node scripts/translate-post.mjs "${file}" "${extra[@]+"${extra[@]}"}"; then
            ok=$((ok + 1))
        else
            failed=$((failed + 1))
        fi
    done

    printf "\n🇫🇷 %d ok, %d failed.\n" "${ok}" "${failed}"
    if [[ ${failed} -gt 0 ]]; then
        printf "   A translation rejected by the validator is NOT written; its output is kept\n"
        printf "   under .translation-rejected/ so you can see what the model produced.\n" >&2
        return 1
    fi
    printf "   Next: 'start_fr' to read it on http://localhost:3000/fr/, or 'build' to check the locale.\n"
}
