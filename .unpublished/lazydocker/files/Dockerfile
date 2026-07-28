# syntax=docker/dockerfile:1.7-labs

FROM alpine:3.20

# Check https://github.com/jesseduffield/lazydocker/releases for the current
# tag before building; this ARG makes bumping it a one-line change.
ARG LAZYDOCKER_VERSION=0.23.3

# The Docker CLI (and the compose plugin) are what lazydocker actually shells
# out to behind the scenes — the binary below is only the TUI on top of them.
RUN apk add --no-cache docker-cli docker-cli-compose curl tar

RUN curl -Lo /tmp/lazydocker.tar.gz \
        "https://github.com/jesseduffield/lazydocker/releases/download/v${LAZYDOCKER_VERSION}/lazydocker_${LAZYDOCKER_VERSION}_Linux_x86_64.tar.gz" && \
    tar -xzf /tmp/lazydocker.tar.gz -C /tmp lazydocker && \
    install -m 0755 /tmp/lazydocker /usr/local/bin/lazydocker && \
    rm -f /tmp/lazydocker.tar.gz /tmp/lazydocker

ENTRYPOINT ["lazydocker"]
