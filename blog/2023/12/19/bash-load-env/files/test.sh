#!/usr/bin/env bash

set -o allexport
source .env set
set +o allexport

echo "${DOCKER_GIT_FULLNAME} (${DOCKER_GIT_USEREMAIL})"
