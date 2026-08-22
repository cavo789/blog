FROM ubuntu:24.04

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && \
    apt-get install -y \
        curl \
        ca-certificates \
        python3 && \
    rm -rf /var/lib/apt/lists/*

# Install the oha static binary. Pin the version so this image keeps
# building the same way; bump it during a /freshness pass.
RUN curl -fsSL -o /usr/local/bin/oha \
    https://github.com/hatoo/oha/releases/download/v1.15.0/oha-linux-amd64 && \
    chmod +x /usr/local/bin/oha

# A tiny local target so oha has something to hit without needing your
# real Docusaurus dev server — a static page served by Python's http.server
RUN mkdir -p /root/site && \
    printf '<!doctype html><html><body><h1>Demo page</h1></body></html>\n' \
        > /root/site/index.html

# Start the demo server in the background, then drop into an interactive
# shell — oha targets http://localhost:8000 from there
RUN printf '%s\n' \
    '#!/bin/bash' \
    'cd /root/site && python3 -m http.server 8000 >/tmp/server.log 2>&1 &' \
    'exec /bin/bash -i' \
    > /usr/local/bin/start-demo.sh && \
    chmod +x /usr/local/bin/start-demo.sh

# Signal clearly that this shell runs inside a container
RUN echo "PS1='\n\e[0;33m🐳 \e[0;36m\$(whoami)\e[0m \w # '" >> /root/.bashrc

WORKDIR /root

CMD ["/usr/local/bin/start-demo.sh"]
