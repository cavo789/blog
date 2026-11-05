#!/usr/bin/env bash
# List the public repositories of a GitHub user, cached in Redis for 60 seconds.
set -euo pipefail

readonly USER_NAME="${1:-cavo789}"
readonly KEY="github:repos:${USER_NAME}"
readonly TTL=60

redis() { docker exec -i redis-cache redis-cli --raw "$@"; }

json="$(redis GET "${KEY}")"

if [[ -n "${json}" ]]; then
    echo "⚡ HIT  — served from Redis (expires in $(redis TTL "${KEY}") s)"
else
    echo "🐢 MISS — calling api.github.com"
    json="$(curl -fsS "https://api.github.com/users/${USER_NAME}/repos?per_page=100" \
        | jq -c 'map({name, pushed_at})')"
    # -x appends stdin as the LAST argument: a JSON payload is too long for the command line
    printf '%s' "${json}" | redis -x SET "${KEY}" > /dev/null
    redis EXPIRE "${KEY}" "${TTL}" > /dev/null
fi

echo "${json}" | jq -r 'length as $n | "\($n) public repositories, the 3 most recently pushed:", (sort_by(.pushed_at) | reverse | .[:3][] | "  - \(.name)")'
