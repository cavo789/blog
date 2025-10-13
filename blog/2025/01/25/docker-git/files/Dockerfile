# syntax=docker/dockerfile:1

FROM alpine:latest

# Install git and ssh so we can use our SSH credentials
RUN apk update && apk add git openssh-client

WORKDIR /root

RUN set -e -x \
    mkdir -p -m 0700 ~/.ssh

# Keep the container running
ENTRYPOINT ["tail", "-f", "/dev/null"]
