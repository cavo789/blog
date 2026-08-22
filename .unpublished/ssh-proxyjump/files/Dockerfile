FROM ubuntu:24.04

ENV DEBIAN_FRONTEND=noninteractive

# Ubuntu's docker image only enables "main" + "restricted" by default;
# fzf lives in "universe".
RUN sed -i 's/^Components: main restricted$/Components: main restricted universe multiverse/' \
        /etc/apt/sources.list.d/ubuntu.sources && \
    apt-get update && \
    apt-get install -y \
        openssh-server \
        openssh-client \
        zsh \
        fzf \
        python3 \
        curl && \
    rm -rf /var/lib/apt/lists/* && \
    mkdir -p /run/sshd

# A simulated two-hop topology, entirely inside this one container:
# - port 2222 = "bastion" (the only host you're supposed to reach directly)
# - port 2223 = "demo-target" (the internal server, reached via -J through 2222)
# Real ProxyJump/LocalForward traffic flows through both — the topology is
# folded into one container purely so the demo needs nothing but `docker run`.
RUN printf '%s\n' \
    'Port 2222' \
    'Port 2223' \
    'PermitRootLogin yes' \
    'PubkeyAuthentication yes' \
    'PasswordAuthentication no' \
    >> /etc/ssh/sshd_config

# Passwordless key for root -> root over both ports
RUN ssh-keygen -t ed25519 -f /root/.ssh/id_ed25519 -N "" -q && \
    cat /root/.ssh/id_ed25519.pub >> /root/.ssh/authorized_keys && \
    chmod 600 /root/.ssh/authorized_keys

# ~/.ssh/config for THIS demo topology (localhost, both ports) — a stand-in
# for the article's own bastion.example.com / 10.0.1.50 / *.internal names,
# which need a real network to resolve
RUN printf '%s\n' \
    'Host demo-bastion' \
    '    HostName 127.0.0.1' \
    '    Port 2222' \
    '    User root' \
    '    StrictHostKeyChecking no' \
    '' \
    'Host demo-target' \
    '    HostName 127.0.0.1' \
    '    Port 2223' \
    '    User root' \
    '    ProxyJump demo-bastion' \
    '    StrictHostKeyChecking no' \
    '' \
    'Host demo-tunnel' \
    '    HostName 127.0.0.1' \
    '    Port 2222' \
    '    User root' \
    '    LocalForward 9090 127.0.0.1:8080' \
    '    StrictHostKeyChecking no' \
    '    ExitOnForwardFailure yes' \
    > /root/.ssh/config

# A tiny "internal" web service — what LocalForward will expose on :9090
RUN mkdir -p /root/internal-site && \
    printf '<!doctype html><html><body><h1>Internal service</h1></body></html>\n' \
        > /root/internal-site/index.html

# Start sshd (both ports) and the internal web service in the background,
# then drop into an interactive shell
RUN printf '%s\n' \
    '#!/bin/bash' \
    '/usr/sbin/sshd' \
    'cd /root/internal-site && python3 -m http.server 8080 >/tmp/web.log 2>&1 &' \
    'exec /bin/bash -i' \
    > /usr/local/bin/start-demo.sh && \
    chmod +x /usr/local/bin/start-demo.sh

# Signal clearly that this shell runs inside a container
RUN echo "PS1='\n\e[0;33m🐳 \e[0;36m\$(whoami)\e[0m \w # '" >> /root/.bashrc

WORKDIR /root

CMD ["/usr/local/bin/start-demo.sh"]
