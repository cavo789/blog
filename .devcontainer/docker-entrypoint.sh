#!/usr/bin/env bash
set -e

# Load helper functions from the Docker image (so if you change
# the bash_helpers.sh, you'll need to rebuild the Docker image)
source "/usr/local/bin/bash_helpers.sh"

# Use the project-committed mkcert CA so certs survive container rebuilds.
# The CA lives in .devcontainer/mkcert-ca/ and is mounted from the host.
CAROOT="${APP_HOME:-/opt/docusaurus}/.devcontainer/mkcert-ca"
export CAROOT

if [ -f "${CAROOT}/rootCA.pem" ]; then
    mkcert -install 2>/dev/null || true

    # Regenerate SSL certs if missing or if they don't cover 127.0.0.1
    if [ ! -f "${APP_HOME:-/opt/docusaurus}/localhost.pem" ] || \
       ! openssl x509 -in "${APP_HOME:-/opt/docusaurus}/localhost.pem" -noout -text 2>/dev/null | grep -q "127.0.0.1"; then
        cd "${APP_HOME:-/opt/docusaurus}"
        mkcert -key-file localhost-key.pem -cert-file localhost.pem localhost 127.0.0.1
    fi
fi

# Run Docusaurus in the background
HTTPS=true \
SSL_CRT_FILE=localhost.pem \
SSL_KEY_FILE=localhost-key.pem \
yarn start --host 0.0.0.0 --port 3000 &

# Keep the container running
exec /bin/sh -c "trap : TERM INT; sleep infinity & wait"
