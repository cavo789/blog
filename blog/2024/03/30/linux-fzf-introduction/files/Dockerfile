FROM ubuntu:24.04

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && \
    apt-get install -y \
        bash \
        git \
        curl \
        ca-certificates && \
    rm -rf /var/lib/apt/lists/*

# Install fzf and wire its key bindings + fuzzy completion into bash
RUN git clone --depth 1 https://github.com/junegunn/fzf.git /root/.fzf && \
    /root/.fzf/install --key-bindings --completion --no-update-rc && \
    echo '[ -f ~/.fzf.bash ] && source ~/.fzf.bash' >> /root/.bashrc

# Build a playground: log files to fuzzy-select with Ctrl+T, nested folders
# to jump into with Alt+C
RUN mkdir -p /root/demo/logs /root/demo/scripts /root/demo/nested/deep/folder && \
    for i in 1 2 3 4; do \
        printf 'run%s.sh.log — line 1\nline 2\nline 3\nline 4\nline 5\n' "$i" \
            > /root/demo/logs/run"$i".sh.log; \
    done && \
    touch /root/demo/scripts/deploy.sh /root/demo/scripts/backup.sh

# Pre-seed bash history so Ctrl+R has something real to fuzzy-search: type
# "github" and the git-clone line below turns up, exactly like the article's
# own screenshots.
RUN printf '%s\n' \
    'cd /root/demo' \
    'ls -la' \
    'git clone https://github.com/junegunn/fzf-git.sh.git' \
    'docker compose up --detach' \
    'head -n 5 logs/run1.sh.log' \
    > /root/.bash_history

WORKDIR /root/demo

# Signal clearly that this shell runs inside a container
RUN echo "PS1='\n\e[0;33m🐳 \e[0;36m\$(whoami)\e[0m \w # '" >> /root/.bashrc

CMD ["/bin/bash", "-i"]
