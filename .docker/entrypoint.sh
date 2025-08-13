#!/usr/bin/env bash

# Install dependencies with `--immutable` to ensure reproducibility.
yes "yes" | yarn install --immutable

# Run the Docusaurus watcher
HTTPS=true SSL_CRT_FILE=localhost.pem SSL_KEY_FILE=localhost-key.pem yarn start --host 0.0.0.0