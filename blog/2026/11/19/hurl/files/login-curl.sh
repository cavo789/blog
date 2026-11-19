#!/usr/bin/env bash
set -euo pipefail

# Step 1. Log in, then dig the token out of the JSON answer with jq
TOKEN=$(curl --silent --fail \
    --header 'Content-Type: application/json' \
    --data "{\"username\": \"${API_USERNAME}\", \"password\": \"${API_PASSWORD}\"}" \
    https://dummyjson.com/auth/login | jq --raw-output '.accessToken')

# Step 2. Call the protected endpoint with that token
curl --silent --fail \
    --header "Authorization: Bearer ${TOKEN}" \
    https://dummyjson.com/auth/me | jq '{username, email}'

# ...and checking the answer is still up to you
