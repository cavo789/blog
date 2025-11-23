#!/usr/bin/env bash
set -e

# Load helper functions from the Docker image (so if you change
# the bash_helpers.sh, you'll need to rebuild the Docker image)
source "/usr/local/bin/bash_helpers.sh"

# Run Docusaurus in the background
HTTPS=true \
SSL_CRT_FILE=localhost.pem \
SSL_KEY_FILE=localhost-key.pem \
yarn start --host 0.0.0.0 --port 3000 &

# Keep the container running
exec /bin/sh -c "trap : TERM INT; sleep infinity & wait"
