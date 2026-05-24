#!/bin/zsh
# Description: Navigate to projects and optionally open in an editor.
# Usage: fproj [search_path]

# Private helper for fproj to check dependencies.
_fproj_check_deps() {
    local missing_dep=0
    local os_type
    os_type=$(uname -s)

    # Check for fzf
    if ! command -v fzf >/dev/null 2>&1; then
        printf "\033[0;31m[Error]\033[0m 'fzf' is not installed.\n"
        missing_dep=1
    fi

    # Check for fd or fdfind
    if ! command -v fd >/dev/null 2>&1 && ! command -v fdfind >/dev/null 2>&1; then
        printf "\033[0;31m[Error]\033[0m 'fd' is not installed.\n"
        missing_dep=1
    fi

    if [[ "$missing_dep" -eq 1 ]]; then
        printf "\033[0;33mHow to install:\033[0m\n"
        if [[ "$os_type" == "Darwin" ]]; then
            printf "  brew install fzf fd\n"
        elif [[ -f /etc/debian_version ]]; then
            printf "  sudo apt update && sudo apt install fzf fd-find\n"
        elif [[ -f /etc/fedora-release ]]; then
            printf "  sudo dnf install fzf fd-find\n"
        else
            printf "  Please install 'fzf' and 'fd' using your package manager.\n"
        fi
        return 1
    fi

    return 0
}

# 1. Run the private dependency check
# Since _fproj_check_deps is also in fpath, we can call it directly.
if ! _fproj_check_deps; then
    return 1
fi

# 2. Determine the correct fd binary
local fd_bin
if command -v fd >/dev/null 2>&1; then
    fd_bin="fd"
else
    fd_bin="fdfind"
fi

# 3. Setup Editor: Use $EDITOR, or fallback to 'code'
local visual_editor="${EDITOR:-code}"

# 4. Search logic
local search_path="${1:-$HOME/repositories}"
local selected_dir

selected_dir=$("$fd_bin" '^\.git$' "$search_path" \
    --hidden --no-ignore --type d --max-depth 3 | \
    sed 's|/\.git/\?$||' | \
    fzf --reverse --height 40% --border --header 'Navigate to Project')

# 5. Handling exit
if [[ -z "$selected_dir" ]]; then
    return 0
fi

# Clean up trailing /.git
selected_dir="${selected_dir%/.git}"
selected_dir="${selected_dir%/.git/}"

cd "$selected_dir" || return 1
printf "Switched to: %s\n" "$selected_dir"

# 6. Open in Editor
# We check if the editor command actually exists on the machine
if command -v "$visual_editor" >/dev/null 2>&1; then
    # [Y/n] is the standard way to show Y is the default
    printf "Open in %s? [Y/n] " "$visual_editor"
    read -k 1 REPLY
    printf "\n"
    # Check if REPLY is a newline (Enter) OR Y/y
    if [[ "$REPLY" == $'\n' || "$REPLY" =~ ^[Yy]$ ]]; then
        "$visual_editor" .
    fi
else
    printf "\033[0;33mNote:\033[0m Editor '%s' not found. Set \$EDITOR in your .zshrc\n" "$visual_editor"
fi
