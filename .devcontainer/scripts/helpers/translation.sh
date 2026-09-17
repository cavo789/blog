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
        printf "  Already-translated articles are skipped unless --force is given, and the\n" >&2
        printf "  confirmation prompt only counts what really needs an API call.\n" >&2
        printf "  'yarn translate:plan <path>' shows that verdict without translating anything;\n" >&2
        printf "  'yarn translate:check' lists what is fresh, stale or missing.\n" >&2
        return 1
    fi

    # Collected before translating anything: a folder-wide run costs real money, so what the run
    # will do has to be known up front rather than discovered one API call at a time.
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

    if [[ ${#files[@]} -eq 0 ]]; then
        printf "❌ No article found under: %s\n" "${paths[*]}" >&2
        return 1
    fi

    # What the run would ACTUALLY do, decided offline and for free by translate-plan.mjs: an
    # unchanged article costs nothing, a small edit is a cheap patch, only a new or heavily
    # rewritten article costs a full translation. Announcing "108 articles, 17.28 $" for a folder
    # that is already fully translated was the bug this replaces.
    local plan
    if ! plan=$(node scripts/translate-plan.mjs --porcelain "${extra[@]+"${extra[@]}"}" "${files[@]}"); then
        printf "❌ Could not compute the translation plan.\n" >&2
        return 1
    fi

    local todo=() skipped=0 cost="0" state entry_cost file summary=()
    while IFS=$'\t' read -r state entry_cost file; do
        [[ -z "${file}" ]] && continue
        if [[ "${entry_cost}" == "0.0000" ]]; then
            skipped=$((skipped + 1))
        else
            todo+=("${file}")
            cost="${cost}+${entry_cost}"
            summary+=("${state}")
        fi
    done <<< "${plan}"

    if [[ ${#todo[@]} -eq 0 ]]; then
        # The whole point of the plan: say "nothing to do" instead of quoting a price for work
        # that would not happen. --repair asks a different question, so it gets its own wording.
        if [[ " ${extra[*]+${extra[*]}} " == *" --repair "* ]]; then
            printf "✅ Nothing to repair — %d translation(s) pass every validator check.\n" "${skipped}"
        else
            printf "✅ Nothing to do — %d article(s) already up to date.\n" "${skipped}"
            printf "   'translate <path> --force' redoes a translation; '--repair' fixes a bad one.\n"
        fi
        return 0
    fi

    local count=${#todo[@]}

    # Shown, never enforced — the point is that `translate blog` is a ~41 $ command and must not
    # start by surprise. A single article skips the prompt: that is the everyday case, right
    # after publishing.
    if [[ ${count} -gt 1 ]]; then
        # NEW×3 PATCH×2 rather than one line per article: the states are what decide the cost.
        local breakdown
        breakdown=$(printf "%s\n" "${summary[@]}" | sort | uniq -c \
            | awk '{ printf "%s%s×%s", (NR > 1 ? " " : ""), $2, $1 }')
        printf "🇫🇷 %d article(s) to translate (%s) — about %.2f \$ (Opus 5).\n" \
            "${count}" "${breakdown}" "$(awk "BEGIN { print ${cost} }")"
        if [[ ${skipped} -gt 0 ]]; then
            printf "   %d already up to date, skipped — they cost nothing.\n" "${skipped}"
        fi
        printf "Continue? [y/N] "
        local reply
        read -r reply
        if [[ ! "${reply}" =~ ^[yY]$ ]]; then
            printf "Aborted — nothing sent to the API.\n"
            return 1
        fi
    elif [[ ${skipped} -gt 0 ]]; then
        printf "🇫🇷 %d already up to date; translating %s.\n" "${skipped}" "${todo[0]}"
    fi

    local ok=0 failed=0 index=0
    for file in "${todo[@]}"; do
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
