#!/usr/bin/env bash

# Load helper functions
source "/opt/docusaurus/.devcontainer/bash_helpers.sh"

# # Install dependencies with `--immutable` to ensure reproducibility.
# yes "yes" | yarn install --immutable

# # Install sharp; needed due to the use of plugin @docusaurus/plugin-ideal-image
# yarn add --platform=linux --arch=x64 sharp

# Run the Docusaurus watcher
HTTPS=true \
SSL_CRT_FILE=localhost.pem \
SSL_KEY_FILE=localhost-key.pem \
yarn start --host 0.0.0.0
