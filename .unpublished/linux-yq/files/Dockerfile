FROM ubuntu:24.04

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && \
    apt-get install -y \
        curl \
        ca-certificates && \
    rm -rf /var/lib/apt/lists/*

# Install the yq static binary directly (avoids the distroless upstream
# Docker image, which has no shell to play in). Pin the version so this
# image keeps building the same way; bump it during a /freshness pass.
RUN curl -fsSL -o /usr/local/bin/yq \
    https://github.com/mikefarah/yq/releases/download/v4.53.6/yq_linux_amd64 && \
    chmod +x /usr/local/bin/yq

# The exact compose.yaml used throughout this article
RUN mkdir -p /root/demo
RUN printf '%s\n' \
    'services:' \
    '  web:' \
    '    image: nginx:1.25' \
    '    ports:' \
    '      - "8080:80"' \
    '    environment:' \
    '      APP_ENV: production' \
    '      LOG_LEVEL: info' \
    '    volumes:' \
    '      - ./html:/usr/share/nginx/html:ro' \
    '    depends_on:' \
    '      - db' \
    '' \
    '  db:' \
    '    image: postgres:16' \
    '    environment:' \
    '      POSTGRES_USER: myapp' \
    '      POSTGRES_PASSWORD: s3cr3t' \
    '      POSTGRES_DB: myapp_db' \
    '    volumes:' \
    '      - db_data:/var/lib/postgresql/data' \
    '' \
    'volumes:' \
    '  db_data:' \
    > /root/demo/compose.yaml

WORKDIR /root/demo

# Signal clearly that this shell runs inside a container
RUN echo "PS1='\n\e[0;33m🐳 \e[0;36m\$(whoami)\e[0m \w # '" >> /root/.bashrc

CMD ["/bin/bash", "-i"]
