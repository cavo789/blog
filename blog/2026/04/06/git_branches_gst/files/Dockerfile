FROM ubuntu:24.04

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && \
    apt-get install -y \
        zsh \
        git && \
    rm -rf /var/lib/apt/lists/*

# ~/.zshrc — the exact block from this article, appended verbatim
RUN printf '%s\n' \
    '# !!! PUT THIS NEW BLOCK AT THE END OF YOUR ~/.zshrc FILE' \
    '# !!! DON'\''T REPLACE ALL THE FILE, JUST APPEND' \
    '' \
    '# Core function to display the 3 most recently modified local branches' \
    '_display_recent_git_context() {' \
    '    # Fallback immediately if the current directory is not a git repository' \
    '    if ! command git rev-parse --is-inside-work-tree >/dev/null 2>&1; then' \
    '        return 0' \
    '    fi' \
    '' \
    '    # Fallback if the repository is entirely empty (no commits yet)' \
    '    if ! command git rev-parse HEAD >/dev/null 2>&1; then' \
    '        return 0' \
    '    fi' \
    '' \
    '    local current_branch' \
    '    current_branch=$(command git rev-parse --abbrev-ref HEAD 2>/dev/null)' \
    '' \
    '    echo $'\''\e[1;36m=== Recent Local Branches ===\e[0m'\''' \
    '' \
    '    # Extract and format the 3 most recently modified local branches' \
    '    command git for-each-ref --sort=-committerdate refs/heads/ \' \
    '        --format="%(if:equals=${current_branch})%(refname:short)%(then)%(color:green)* %(refname:short)%(color:reset)%(else)  %(color:yellow)%(refname:short)%(color:reset)%(end) - %(color:blue)%(committerdate:relative)%(color:reset)" \' \
    '        | head -n 3' \
    '' \
    '    echo ""' \
    '}' \
    '' \
    '# Smart wrapper for git status' \
    'unalias gst 2>/dev/null' \
    'gst() {' \
    '    _display_recent_git_context' \
    '    command git status "$@"' \
    '    return $?' \
    '}' \
    '' \
    '# Triggered automatically by Zsh on directory change' \
    'chpwd() {' \
    '    _display_recent_git_context' \
    '}' \
    >> /root/.zshrc

# Build a repo mirroring the article's own example: `main` is checked out
# (the oldest of the three, ~3 months old) while `wip` and `feature_logging`
# were both touched more recently — the exact "wrong branch" trap.
RUN git config --global user.email "demo@example.com" && \
    git config --global user.name "Demo" && \
    mkdir -p /root/projects/my-blog && \
    cd /root/projects/my-blog && \
    git init -q -b main && \
    export GIT_AUTHOR_DATE="$(date -d '-100 days' '+%Y-%m-%d 12:00:00')" && \
    export GIT_COMMITTER_DATE="$GIT_AUTHOR_DATE" && \
    echo "# Demo repo" > README.md && \
    git add README.md && \
    git commit -q -m "Initial commit" && \
    git checkout -q -b wip && \
    export GIT_AUTHOR_DATE="$(date -d '-70 days' '+%Y-%m-%d 12:00:00')" && \
    export GIT_COMMITTER_DATE="$GIT_AUTHOR_DATE" && \
    echo "wip notes" > NOTES.md && \
    git add NOTES.md && \
    git commit -q -m "wip: refactor attempt" && \
    git checkout -q main && \
    git checkout -q -b feature_logging && \
    export GIT_AUTHOR_DATE="$(date -d '-45 days' '+%Y-%m-%d 12:00:00')" && \
    export GIT_COMMITTER_DATE="$GIT_AUTHOR_DATE" && \
    echo "console.log(1)" > logging.js && \
    git add logging.js && \
    git commit -q -m "feat: add logging" && \
    git checkout -q main

WORKDIR /root

# Signal clearly that this shell runs inside a container
RUN echo "PROMPT='%B%F{yellow}🐳 %F{cyan}%n%f%b %~ %# '" >> /root/.zshrc

CMD ["/bin/zsh", "-i", "-l"]
