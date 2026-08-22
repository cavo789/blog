FROM ubuntu:24.04

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && \
    apt-get install -y \
        zsh \
        git \
        curl \
        ca-certificates && \
    rm -rf /var/lib/apt/lists/*

# Install Oh-My-Zsh unattended: no interactive prompt, no shell switch, keep
# the default .zshrc so it can be inspected/edited straight away.
RUN sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)" \
    "" --unattended --keep-zshrc

# Pre-build a demo playground so the daily-use features have something real
# to act on: a deep folder tree (for `cd ...`) inside a git repo with a
# commit and an untracked file (for `gst`, the `git status` alias).
RUN git config --global user.email "demo@example.com" && \
    git config --global user.name "Demo" && \
    mkdir -p /root/demo/a/b/c/d/e/f && \
    cd /root/demo && \
    git init -q -b main && \
    echo "# Demo repo" > README.md && \
    git add README.md && \
    git commit -q -m "Initial commit" && \
    echo "draft notes, not committed" > notes.txt

WORKDIR /root/demo/a/b/c/d/e/f

# Signal clearly that this shell runs inside a container (overrides the
# Oh-My-Zsh theme prompt on purpose)
RUN echo "PROMPT='%B%F{yellow}🐳 %F{cyan}%n%f%b %~ %# '" >> /root/.zshrc

CMD ["/bin/zsh", "-i", "-l"]
