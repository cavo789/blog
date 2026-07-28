#!/usr/bin/env bash
# Launches the containerized lazydocker TUI against whatever directory you're
# currently standing in — that's what makes it pick up a local compose.yaml
# and show a "project" view instead of just a flat container list.
#
# Build the image once from ~/tools/lazydocker with: docker compose build

exec docker run --rm -it \
    -v /var/run/docker.sock:/var/run/docker.sock \
    -v lazydocker-config:/root/.config/jesseduffield/lazydocker \
    -v "${PWD}:/workdir" \
    --workdir /workdir \
    lazydocker
