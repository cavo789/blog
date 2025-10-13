#!/usr/bin/env bash

clear

# We'll start Chrome on URL http://0.0.0.0:9222
# If this URL has to be modified, think to update the constructor of FeatureContext.php too
# Note: /usr/bin/google-chrome-stable has been installed in our Dockerfile
nohup /usr/local/bin/chrome/chrome --headless --remote-debugging-address=0.0.0.0 \
    --remote-debugging-port=9222 --no-sandbox --window-size="1920,1080" --disable-dev-shm-usage \
    --disable-extensions --no-startup-window --no-first-run --no-pings > /dev/null 2>&1 &

# Get the process ID of chrome so we can kill the process when we've finished
chromePID=$!

# shellcheck disable=SC2048,SC2086
php -d memory_limit=-1 "vendor/bin/behat" --config=behat.yaml

if ((chromePID > 0)); then
    kill ${chromePID} > /dev/null 2>&1
fi
