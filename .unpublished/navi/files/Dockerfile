FROM ubuntu:24.04

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && \
    apt-get install -y \
        curl \
        ca-certificates \
        fzf && \
    rm -rf /var/lib/apt/lists/*

# Install navi as a static binary — no Rust toolchain needed. Pin the
# version so this image keeps building the same way; bump it during a
# /freshness pass. Note: navi's release asset names embed the version tag
# (navi-vX.Y.Z-...), unlike the unversioned filename this article's own
# "Install" section still references — worth a fix there too.
RUN curl -fsSL \
    https://github.com/denisidoro/navi/releases/download/v2.24.0/navi-v2.24.0-x86_64-unknown-linux-musl.tar.gz \
    | tar -xz -C /usr/local/bin

# The exact docker.cheat from this article
RUN mkdir -p /root/.local/share/navi/cheats

RUN printf '%s\n' \
    '% docker, containers' \
    '' \
    '# List all running containers (with names)' \
    'docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}"' \
    '' \
    '# Enter a running container as root' \
    'docker exec -it -u root <container> bash' \
    '' \
    '$ container: docker ps --format "{{.Names}}"' \
    '' \
    '# Remove all stopped containers' \
    'docker container prune -f' \
    '' \
    '# Follow logs of a container (last 50 lines)' \
    'docker logs -f --tail 50 <container>' \
    '' \
    '# Inspect environment variables of a container' \
    'docker inspect <container> --format '\''{{range .Config.Env}}{{println .}}{{end}}'\''' \
    '' \
    '% docker, images' \
    '' \
    '# List images sorted by size (largest first)' \
    'docker images --format "{{.Size}}\t{{.Repository}}:{{.Tag}}" | sort -rh' \
    '' \
    '# Remove all dangling images' \
    'docker image prune -f' \
    '' \
    '# Pull and immediately run an image interactively' \
    'docker run --rm -it <image> sh' \
    '' \
    '$ image: docker images --format "{{.Repository}}:{{.Tag}}"' \
    '' \
    '% docker, compose' \
    '' \
    '# Start services in detached mode' \
    'docker compose up -d' \
    '' \
    '# Rebuild and restart a specific service' \
    'docker compose up -d --build <service>' \
    '' \
    '# Tail logs from all services' \
    'docker compose logs -f' \
    '' \
    '# Stop and remove all containers + volumes' \
    'docker compose down -v' \
    '' \
    '$ service: docker compose config --services' \
    > /root/.local/share/navi/cheats/docker.cheat

# A second cheatsheet with no external dependency (no Docker daemon here) so
# the interactive variable picker can be tried end-to-end without errors
RUN printf '%s\n' \
    '% demo, files' \
    '' \
    '# Show the first lines of a file in the demo folder' \
    'head -n 5 <file>' \
    '' \
    '$ file: find /root/demo -maxdepth 1 -type f -printf "%f\n"' \
    > /root/.local/share/navi/cheats/demo.cheat && \
    mkdir -p /root/demo && \
    printf 'line 1\nline 2\nline 3\n' > /root/demo/notes.txt && \
    printf 'console.log("hi")\n' > /root/demo/app.js

WORKDIR /root/demo

# Signal clearly that this shell runs inside a container
RUN echo "PS1='\n\e[0;33m🐳 \e[0;36m\$(whoami)\e[0m \w # '" >> /root/.bashrc

CMD ["/bin/bash", "-i"]
