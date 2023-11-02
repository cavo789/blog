#!/usr/bin/env bash

# Generate a newer version of the build directory
docker run --rm -it --user $UID:$GID -v ${PWD}/:/project -w /project node /bin/bash -c "yarn build"

# And use WinSCP to deploy files on the remote server
"/mnt/c/Program Files (x86)/WinSCP/WinSCP.com" /script="WinSCP_deploy.txt"