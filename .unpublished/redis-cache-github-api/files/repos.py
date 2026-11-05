"""List the public repositories of a GitHub user, cached in Redis for 60 seconds."""

import json
import os
import sys

import redis
import requests

USER_NAME = sys.argv[1] if len(sys.argv) > 1 else "cavo789"
KEY = f"github:repos:{USER_NAME}"
TTL = 60

cache = redis.Redis(host=os.environ.get("REDIS_HOST", "localhost"), port=6379, decode_responses=True)

if (cached := cache.get(KEY)) is not None:
    print(f"⚡ HIT  — served from Redis (expires in {cache.ttl(KEY)} s)")
    repos = json.loads(cached)
else:
    print("🐢 MISS — calling api.github.com")
    response = requests.get(
        f"https://api.github.com/users/{USER_NAME}/repos",
        params={"per_page": 100},
        timeout=10,
    )
    response.raise_for_status()
    repos = response.json()
    cache.set(KEY, json.dumps(repos), ex=TTL)

print(f"{len(repos)} public repositories")
