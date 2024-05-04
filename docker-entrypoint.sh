#!/usr/bin/env bash

# Install dependencies with `--immutable` to ensure reproducibility.
yes "yes" | yarn install --immutable

# Run the Docusaurus watcher
yarn start --host 0.0.0.0