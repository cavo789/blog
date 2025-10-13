FROM alpine:3.19

ARG KEY_NAME="id_rsa"

USER root

RUN apk add --no-cache bash ca-certificates git openssh-client

// highlight-next-line
RUN mkdir -p -m 0700 /root/.ssh && ssh-keyscan "github.com" >> /root/.ssh/known_hosts

// highlight-next-line
RUN --mount=type=secret,id=my_ssh_key,dst=/root/.ssh/${KEY_NAME} \
    // highlight-next-line
    mkdir -p /app && cd app \
    // highlight-next-line
    && ssh -T git@github.com || true \
    // highlight-next-line
    && git clone git@github.com:cavo789/my_private_repo.git

WORKDIR /app

# Keep the container running
ENTRYPOINT ["tail", "-f", "/dev/null"]
