#!/usr/bin/env bash
# Allow at most 5 calls per minute per client — the classic INCR + EXPIRE pattern.
set -euo pipefail

readonly CLIENT="${1:-christophe}"
readonly LIMIT=5
readonly KEY="ratelimit:${CLIENT}:$(date +%Y%m%d%H%M)"

redis() { docker exec -i redis-cache redis-cli --raw "$@"; }

count="$(redis INCR "${KEY}")"
[[ "${count}" -eq 1 ]] && redis EXPIRE "${KEY}" 60 > /dev/null

if (( count > LIMIT )); then
    echo "⛔ call ${count} — limit of ${LIMIT}/min reached, try again in $(redis TTL "${KEY}") s"
    exit 1
fi

echo "✅ call ${count}/${LIMIT} accepted"
