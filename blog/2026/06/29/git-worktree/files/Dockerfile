FROM ubuntu:24.04

ENV DEBIAN_FRONTEND=noninteractive

# Ubuntu's docker image only enables "main" + "restricted" by default; fzf
# (used by the gwt() navigator below) lives in "universe".
RUN sed -i 's/^Components: main restricted$/Components: main restricted universe multiverse/' \
        /etc/apt/sources.list.d/ubuntu.sources && \
    apt-get update && \
    apt-get install -y \
        git \
        zsh \
        fzf \
        vim && \
    rm -rf /var/lib/apt/lists/*

RUN git config --global user.email "demo@example.com" && \
    git config --global user.name "Demo" && \
    git config --global init.defaultBranch main

# A bare repo standing in for GitHub/GitLab, so `git push origin ...` in the
# scenario below has somewhere real to go instead of failing on a missing
# remote.
RUN git init -q --bare /root/origin.git

# Build the exact starting point of "The hotfix scenario, step by step":
# a repo on `feature/user-notifications`, mid-refactor, with uncommitted
# changes — and a billing bug on `main` waiting to be hotfixed.
RUN mkdir -p /root/projects/my-blog/src/components /root/projects/my-blog/src/api /root/projects/my-blog/src/billing && \
    cd /root/projects/my-blog && \
    git init -q && \
    git remote add origin /root/origin.git && \
    printf 'export function Notifications() {\n  return null;\n}\n' \
        > src/components/Notifications.tsx && \
    printf 'export function fetchNotifications() {\n  return [];\n}\n' \
        > src/api/notifications.ts && \
    printf 'export function calculateVat(amount, rate) {\n  return amount * rate;\n}\n' \
        > src/billing/invoice.ts && \
    git add -A && \
    git commit -q -m "chore: update dependencies" && \
    git push -q origin main && \
    git checkout -q -b feature/user-notifications && \
    printf 'export function Notifications({ items }) {\n  return items.map((i) => i.text);\n}\n' \
        > src/components/Notifications.tsx && \
    printf 'export function fetchNotifications() {\n  return fetch("/api/notifications").then((r) => r.json());\n}\n' \
        > src/api/notifications.ts

# ~/.zsh/fns/gwt — the exact fzf-powered worktree navigator from this
# article, wired via real zsh autoload
RUN mkdir -p /root/.zsh/fns

RUN printf '%s\n' \
    '# ~/.zsh/fns/gwt' \
    '# git worktree navigator — select a worktree with fzf and cd into it' \
    '' \
    'gwt() {' \
    '  local worktrees selected dir' \
    '' \
    '  worktrees=$(git worktree list 2>/dev/null) || {' \
    '    echo "Not inside a git repository."' \
    '    return 1' \
    '  }' \
    '' \
    '  if [[ -z "$1" ]]; then' \
    '    # Interactive: pick a worktree with fzf' \
    '    selected=$(echo "$worktrees" \' \
    '      | fzf --prompt="Worktree > " \' \
    '            --preview="ls -la {1}" \' \
    '            --height=40%)' \
    '    [[ -z "$selected" ]] && return 0' \
    '    dir=$(echo "$selected" | awk '\''{print $1}'\'')' \
    '  else' \
    '    # Direct: create a new worktree for the given branch' \
    '    local branch="$1"' \
    '    dir="${$(git rev-parse --show-toplevel)}-${branch//\//-}"' \
    '    git worktree add -b "$branch" "$dir" main || return 1' \
    '    echo "Created worktree at $dir"' \
    '  fi' \
    '' \
    '  cd "$dir"' \
    '}' \
    > /root/.zsh/fns/gwt

RUN printf '%s\n' \
    'fpath=(~/.zsh/fns $fpath)' \
    'autoload -Uz gwt' \
    >> /root/.zshrc

WORKDIR /root/projects/my-blog

# Signal clearly that this shell runs inside a container
RUN echo "PROMPT='%B%F{yellow}🐳 %F{cyan}%n%f%b %~ %# '" >> /root/.zshrc

CMD ["/bin/zsh", "-i", "-l"]
