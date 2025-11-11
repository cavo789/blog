#!/usr/bin/env bash

# Load helper functions
source "/opt/docusaurus/.devcontainer/bash_helpers.sh"

# Run the Docusaurus watcher
HTTPS=true \
SSL_CRT_FILE=localhost.pem \
SSL_KEY_FILE=localhost-key.pem \
yarn start --host 0.0.0.0
