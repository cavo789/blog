#!/bin/zsh
# Description: Interactive code search using ripgrep + fzf + bat preview.
#              Opens the selected result in VSCode at the exact matching line.
# Usage: rgf [rg options] <pattern> [path]
# Place in: ~/.zsh/fns/rgf (no extension)

_rgf_check_deps() {
    local missing_dep=0
    local os_type
    os_type=$(uname -s)

    if ! command -v fzf >/dev/null 2>&1; then
        printf "\033[0;31m[Error]\033[0m 'fzf' is not installed.\n"
        missing_dep=1
    fi

    if ! command -v rg >/dev/null 2>&1; then
        printf "\033[0;31m[Error]\033[0m 'rg' (ripgrep) is not installed.\n"
        missing_dep=1
    fi

    if ! command -v bat >/dev/null 2>&1 && ! command -v batcat >/dev/null 2>&1; then
        printf "\033[0;31m[Error]\033[0m 'bat' is not installed.\n"
        missing_dep=1
    fi

    if [[ "$missing_dep" -eq 1 ]]; then
        printf "\033[0;33mHow to install:\033[0m\n"
        if [[ "$os_type" == "Darwin" ]]; then
            printf "  brew install fzf ripgrep bat\n"
        elif [[ -f /etc/debian_version ]]; then
            printf "  sudo apt update && sudo apt install fzf ripgrep bat\n"
        elif [[ -f /etc/fedora-release ]]; then
            printf "  sudo dnf install fzf ripgrep bat\n"
        else
            printf "  Please install 'fzf', 'rg' and 'bat' using your package manager.\n"
        fi
        return 1
    fi

    return 0
}

# 1. Run the dependency check
if ! _rgf_check_deps; then
    return 1
fi

# 2. Determine the correct bat binary (Ubuntu/Debian ship it as 'batcat')
local bat_bin
if command -v bat >/dev/null 2>&1; then
    bat_bin="bat"
else
    bat_bin="batcat"
fi

# 3. Search and preview — write fzf's output to a temp file so that fzf runs
#    in the foreground with full terminal access. Using $(...) would block the
#    TUI in WSL subshells.
local tmpfile
tmpfile=$(mktemp /tmp/rgf.XXXXXX)

rg --color=always --line-number --no-heading --smart-case "${@:-}" \
  | fzf --ansi \
        --delimiter=':' \
        --preview="${bat_bin} --color=always --highlight-line {2} -- {1}" \
        --preview-window='right:60%:+{2}+3/3:~3' > "$tmpfile"

local fzf_exit=$?
local selected
selected=$(<"$tmpfile")
rm -f "$tmpfile"

# fzf exits 130 on Esc/CTRL-C, 1 when no match
[[ "$fzf_exit" -ne 0 || -z "$selected" ]] && return

# 4. Strip ANSI color codes before parsing file path and line number
local file line
file=$(echo "$selected" | sed $'s/\033\[[0-9;]*m//g' | cut -d: -f1)
line=$(echo "$selected" | sed $'s/\033\[[0-9;]*m//g' | cut -d: -f2)

[[ -n "$file" ]] || return

# 5. Open in VSCode at the exact matching line
if command -v code >/dev/null 2>&1; then
    code --goto "$file:$line"
else
    printf "\033[0;33m[Warning]\033[0m 'code' (VSCode) not found. Result: %s:%s\n" "$file" "$line"
fi
