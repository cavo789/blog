#!/usr/bin/env bash
# .devcontainer/scripts/post-create.sh
# Runs once, when the container is created (postCreateCommand).
set -o errexit -o nounset -o pipefail

readonly WORKSPACE="${1:?Usage: post-create.sh <workspace folder>}"

# Tip 15 - the cheatsheet, in every new terminal
echo "source ${WORKSPACE}/.devcontainer/scripts/welcome.sh" >> "${HOME}/.bashrc"

# Tip 7 - commit as yourself; only when the host provided an identity
if [[ -n "${HOST_GIT_NAME:-}" ]]; then
    git config --global user.name "${HOST_GIT_NAME}"
fi
if [[ -n "${HOST_GIT_EMAIL:-}" ]]; then
    git config --global user.email "${HOST_GIT_EMAIL}"
fi

# Tip 7 - trust the workspace when UIDs differ (once, never duplicated)
git config --global --replace-all safe.directory "${WORKSPACE}" "^${WORKSPACE}$"

# The project's own dependencies
yarn install --frozen-lockfile
