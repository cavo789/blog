FROM ubuntu:24.04

ENV DEBIAN_FRONTEND=noninteractive

# Ubuntu's docker image only enables "main" + "restricted" by default;
# git-delta lives in "universe".
RUN sed -i 's/^Components: main restricted$/Components: main restricted universe multiverse/' \
        /etc/apt/sources.list.d/ubuntu.sources && \
    apt-get update && \
    apt-get install -y \
        git \
        git-delta && \
    rm -rf /var/lib/apt/lists/*

# Configure git to use delta — the exact block from this article
RUN git config --global core.pager delta && \
    git config --global interactive.diffFilter "delta --color-only" && \
    git config --global delta.navigate true && \
    git config --global delta.side-by-side true && \
    git config --global delta.line-numbers true && \
    git config --global delta.syntax-theme "Dracula" && \
    git config --global merge.conflictstyle diff3 && \
    git config --global diff.colorMoved default && \
    git config --global user.email "demo@example.com" && \
    git config --global user.name "Demo"

# Pre-build a repo with a real, word-level-diff-friendly change already
# unstaged, so `git diff` has something worth looking at immediately
RUN mkdir -p /root/demo && cd /root/demo && \
    git init -q && \
    printf 'function refreshToken(token) {\n  const expiry = token.exp * 1000;\n  return expiry;\n}\n' > auth.js && \
    git add auth.js && \
    git commit -q -m "Add refreshToken helper" && \
    sed -i 's/const expiry = token.exp \* 1000;/const expiry = token.exp * 1000 + TOKEN_GRACE_MS;/' auth.js

WORKDIR /root/demo

# Signal clearly that this shell runs inside a container
RUN echo "PS1='\n\e[0;33m🐳 \e[0;36m\$(whoami)\e[0m \w # '" >> /root/.bashrc

CMD ["/bin/bash", "-i"]
