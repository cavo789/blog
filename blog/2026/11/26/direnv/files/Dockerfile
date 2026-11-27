FROM ubuntu:24.04

ENV DEBIAN_FRONTEND=noninteractive

# Ubuntu's docker image only enables "main" + "restricted" by default;
# direnv lives in "universe".
RUN sed -i 's/^Components: main restricted$/Components: main restricted universe multiverse/' \
        /etc/apt/sources.list.d/ubuntu.sources && \
    apt-get update && \
    apt-get install -y \
        direnv && \
    rm -rf /var/lib/apt/lists/*

# Hook direnv into bash — the exact one-liner from this article
RUN echo 'eval "$(direnv hook bash)"' >> /root/.bashrc

# Build the exact my-api project from "The Docker Compose use case" — an
# .envrc left deliberately UN-allowed, so the "blocked" message is the
# first thing you see, exactly like the article describes
RUN mkdir -p /root/my-api && \
    printf 'dotenv\n' > /root/my-api/.envrc && \
    printf '%s\n' \
        'DB_HOST=localhost' \
        'DB_PORT=5432' \
        'DB_NAME=myapp_dev' \
        'DB_USER=dev' \
        'DB_PASSWORD=changeme' \
        '' \
        'APP_PORT=8080' \
        'APP_DEBUG=true' \
        > /root/my-api/.env.example && \
    cp /root/my-api/.env.example /root/my-api/.env && \
    printf 'services:\n  db:\n    image: postgres:16\n    environment:\n      POSTGRES_PASSWORD: ${DB_PASSWORD}\n      POSTGRES_DB: ${DB_NAME}\n' \
        > /root/my-api/compose.yaml

WORKDIR /root

# Signal clearly that this shell runs inside a container
RUN echo "PS1='\n\e[0;33m🐳 \e[0;36m\$(whoami)\e[0m \w # '" >> /root/.bashrc

CMD ["/bin/bash", "-i"]
