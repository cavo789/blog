FROM ubuntu:24.04

ENV DEBIAN_FRONTEND=noninteractive

# Ubuntu's docker image only enables "main" + "restricted" by default;
# fzf and bat live in "universe".
RUN sed -i 's/^Components: main restricted$/Components: main restricted universe multiverse/' \
        /etc/apt/sources.list.d/ubuntu.sources && \
    apt-get update && \
    apt-get install -y \
        zsh \
        ripgrep \
        fzf \
        bat && \
    rm -rf /var/lib/apt/lists/*

# ~/.zsh/fns/rgf — the exact function from this article, wired via real
# zsh autoload (fpath + autoload -Uz), no VSCode required: it falls back to
# printing "file:line" when `code` is not in $PATH.
RUN mkdir -p /root/.zsh/fns

RUN printf '%s\n' \
    '#!/bin/zsh' \
    '# Description: Interactive code search using ripgrep + fzf + bat preview.' \
    '#              Opens the selected result in VSCode at the exact matching line.' \
    '# Usage: rgf [rg options] <pattern> [path]' \
    '# Place in: ~/.zsh/fns/rgf (no extension)' \
    '' \
    '_rgf_check_deps() {' \
    '    local missing_dep=0' \
    '    local os_type' \
    '    os_type=$(uname -s)' \
    '' \
    '    if ! command -v fzf >/dev/null 2>&1; then' \
    '        printf "\033[0;31m[Error]\033[0m '\''fzf'\'' is not installed.\n"' \
    '        missing_dep=1' \
    '    fi' \
    '' \
    '    if ! command -v rg >/dev/null 2>&1; then' \
    '        printf "\033[0;31m[Error]\033[0m '\''rg'\'' (ripgrep) is not installed.\n"' \
    '        missing_dep=1' \
    '    fi' \
    '' \
    '    if ! command -v bat >/dev/null 2>&1 && ! command -v batcat >/dev/null 2>&1; then' \
    '        printf "\033[0;31m[Error]\033[0m '\''bat'\'' is not installed.\n"' \
    '        missing_dep=1' \
    '    fi' \
    '' \
    '    if [[ "$missing_dep" -eq 1 ]]; then' \
    '        printf "\033[0;33mHow to install:\033[0m\n"' \
    '        if [[ "$os_type" == "Darwin" ]]; then' \
    '            printf "  brew install fzf ripgrep bat\n"' \
    '        elif [[ -f /etc/debian_version ]]; then' \
    '            printf "  sudo apt update && sudo apt install fzf ripgrep bat\n"' \
    '        elif [[ -f /etc/fedora-release ]]; then' \
    '            printf "  sudo dnf install fzf ripgrep bat\n"' \
    '        else' \
    '            printf "  Please install '\''fzf'\'', '\''rg'\'' and '\''bat'\'' using your package manager.\n"' \
    '        fi' \
    '        return 1' \
    '    fi' \
    '' \
    '    return 0' \
    '}' \
    '' \
    '# 1. Run the dependency check' \
    'if ! _rgf_check_deps; then' \
    '    return 1' \
    'fi' \
    '' \
    '# 2. Determine the correct bat binary (Ubuntu/Debian ship it as '\''batcat'\'')' \
    'local bat_bin' \
    'if command -v bat >/dev/null 2>&1; then' \
    '    bat_bin="bat"' \
    'else' \
    '    bat_bin="batcat"' \
    'fi' \
    '' \
    '# 3. Search and preview — write fzf'\''s output to a temp file so that fzf runs' \
    '#    in the foreground with full terminal access. Using $(...) would block the' \
    '#    TUI in WSL subshells.' \
    'local tmpfile' \
    'tmpfile=$(mktemp /tmp/rgf.XXXXXX)' \
    '' \
    'rg --color=always --line-number --no-heading --smart-case "${@:-}" \' \
    '  | fzf --ansi \' \
    '        --layout=reverse \' \
    '        --exact \' \
    '        --delimiter='\'':'\'' \' \
    '        --nth=3.. \' \
    '        --preview="${bat_bin} --color=always --pager=never --highlight-line {2} -- {1}" \' \
    '        --preview-window='\''right:60%:+{2}+3/3:wrap'\'' > "$tmpfile"' \
    '' \
    'local fzf_exit=$?' \
    'local selected' \
    'selected=$(<"$tmpfile")' \
    'rm -f "$tmpfile"' \
    '' \
    '# fzf exits 130 on Esc/CTRL-C, 1 when no match' \
    '[[ "$fzf_exit" -ne 0 || -z "$selected" ]] && return' \
    '' \
    '# 4. Strip ANSI color codes before parsing file path and line number' \
    'local file line' \
    'file=$(echo "$selected" | sed $'\''s/\033\[[0-9;]*m//g'\'' | cut -d: -f1)' \
    'line=$(echo "$selected" | sed $'\''s/\033\[[0-9;]*m//g'\'' | cut -d: -f2)' \
    '' \
    '[[ -n "$file" ]] || return' \
    '' \
    '# 5. Open in VSCode at the exact matching line' \
    'if command -v code >/dev/null 2>&1; then' \
    '    code --goto "$file:$line"' \
    'else' \
    '    printf "\033[0;33m[Warning]\033[0m '\''code'\'' (VSCode) not found. Result: %s:%s\n" "$file" "$line"' \
    'fi' \
    > /root/.zsh/fns/rgf

RUN printf '%s\n' \
    'fpath=(~/.zsh/fns $fpath)' \
    'autoload -Uz rgf' \
    >> /root/.zshrc

# Build a demo project matching the "real-world scenarios" section: a
# leaking DB_PASSWORD, TODO/FIXME/HACK markers, a sendEmail call site, a
# hardcoded port, and a TypeScript interface
RUN mkdir -p /root/demo/src/components /root/demo/config && \
    printf 'DB_PASSWORD=demo-secret\n' > /root/demo/config/.env && \
    printf 'function sendEmail(user) {\n  // TODO: retry on failure\n}\n' \
        > /root/demo/src/mailer.js && \
    printf 'import { sendEmail } from "./mailer";\n\n// FIXME: this still calls the old name in one place\nsendEmail(currentUser);\n' \
        > /root/demo/src/notifications.js && \
    printf '// HACK: temporary workaround for #482\nfunction legacyRetry() {}\n' \
        > /root/demo/src/legacy.js && \
    printf 'services:\n  db:\n    image: postgres:16\n    ports:\n      - "5432:5432"\n' \
        > /root/demo/compose.yml && \
    printf 'export interface UserProps {\n  id: number;\n  name: string;\n}\n' \
        > /root/demo/src/components/UserProfile.tsx

WORKDIR /root/demo

# Signal clearly that this shell runs inside a container
RUN echo "PROMPT='%B%F{yellow}🐳 %F{cyan}%n%f%b %~ %# '" >> /root/.zshrc

CMD ["/bin/zsh", "-i", "-l"]
