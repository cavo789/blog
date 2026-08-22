FROM ubuntu:24.04

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && \
    apt-get install -y \
        curl \
        ca-certificates && \
    rm -rf /var/lib/apt/lists/*

# Install eza from a prebuilt release (avoids adding eza's own apt repository
# just for a demo). Pin the version so this image keeps building the same
# way; bump it during a /freshness pass.
RUN curl -fsSL \
    https://github.com/eza-community/eza/releases/download/v0.23.5/eza_x86_64-unknown-linux-gnu.tar.gz \
    | tar -xz -C /usr/local/bin

# Recreate the exact alias from the article
RUN echo "alias ls='eza --all --long --group --group-directories-first --icons --header --time-style long-iso'" \
    >> /root/.bashrc

# Build a small, varied playground so the listing actually looks interesting:
# sub-folders, a dotfile, a text file and a binary-ish file of a different size
RUN mkdir -p /root/demo/src /root/demo/docs && \
    touch /root/demo/.env && \
    echo "# Notes" > /root/demo/README.md && \
    printf 'console.log("hi")\n' > /root/demo/src/index.js && \
    dd if=/dev/zero of=/root/demo/docs/report.pdf bs=1024 count=200 status=none

WORKDIR /root/demo

# Signal clearly that this shell runs inside a container
RUN echo "PS1='\n\e[0;33m🐳 \e[0;36m\$(whoami)\e[0m \w # '" >> /root/.bashrc

CMD ["/bin/bash", "-i"]
