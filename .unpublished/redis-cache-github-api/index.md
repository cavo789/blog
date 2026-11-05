---
slug: redis-cache-github-api
title: "Redis in Five Minutes: Cache a Rate-Limited API with Docker"
description: "Spin up the official Redis image with Docker Compose, then use it to cache the GitHub API (60 calls per hour unauthenticated) from Bash and Python, watch every command live with MONITOR, and build a rate limiter in four lines."
authors: [christophe, claude]
image: /img/v2/database_admin.webp
mainTag: docker
draft: true
tags: [docker, database, bash, python]
date: 2026-11-04
ai_assisted: true
---

![Redis in Five Minutes: Cache a Rate-Limited API with Docker](/img/v2/database_admin.webp)

<TLDR>
Redis is an in-memory key-value store: you `SET` a value, optionally give it a lifetime, and `GET` it back in well under a millisecond. Run it with one `compose.yaml`, then put it in front of any slow or rate-limited API — here the GitHub API, which allows only 60 unauthenticated calls per hour. The same server also gives you a rate limiter almost for free, with `INCR` + `EXPIRE`.
</TLDR>

I keep writing small scripts that call the GitHub API to list my repositories. Run one of them a few times while debugging and the API answers `403 rate limit exceeded`: without a token, GitHub allows **60 requests per hour per IP address**. Every run asks for the same data, which changed maybe once that day.

What I want is simple: remember the answer for a minute, and only call GitHub again when that memory is stale. That is exactly what Redis is for — and it takes one Docker container.

<!-- truncate -->

## What Redis Does For You

Here is the same script, run twice in a row. The first run asks GitHub; the second never leaves my machine:

<Terminal source="./files/terminal_demo.txt" />

The second call skipped the network entirely and GitHub's quota was not touched. After 60 seconds Redis deletes the key by itself and the next run fetches fresh data.

On my connection GitHub answers quickly, so the gain is ~0.36 s per call — and most of the 0.118 s left is `docker exec` starting `redis-cli`, not Redis itself. The real win is the quota: run the script a hundred times in a minute, GitHub sees one request.

## Why It Works

- **Everything lives in RAM.** Redis keeps its whole dataset in memory, which is why a read takes microseconds. With 78 repositories cached, the server uses 1.6 MB.
- **Keys can expire on their own.** Give a key a time-to-live and Redis removes it when the time is up — no cleanup job, no stale data served forever.
- **It is a server, not a library.** Any language that can open a TCP connection to port 6379 shares the same cache: a Bash script, a Python service and a PHP site can all read what the others wrote.
- **Commands are atomic.** `INCR` increments a counter in one step, even with a thousand clients hitting it at once — which is what makes the rate limiter further down correct without any locking.

Beyond caching, the same primitives power user sessions, job queues (lists), leaderboards (sorted sets) and pub/sub messaging. This article sticks to the two you will use first: a cache and a counter.

## Running Redis with Docker

You need Docker with the Compose plugin, plus `curl` and `jq` for the Bash script:

<Prerequisite name="Docker" install="https://docs.docker.com/engine/install/" check="docker compose version" />

<ProjectSetup folderName="redis-demo">
  <Snippet filename="compose.yaml" source="./files/compose.yaml" />
  <Snippet filename="repos.sh" source="./files/repos.sh" defaultOpen={false} />
</ProjectSetup>

Start the server and check it answers:

```bash
docker compose up -d --wait
docker exec redis-cache redis-cli ping
```

`PONG` means you are ready. The healthcheck in `compose.yaml` is what lets `--wait` return only once Redis accepts connections — the same mechanism explained in <Link to="/blog/docker-health-condition">the `depends_on` condition article</Link>.

Then run `./repos.sh` twice, or pass any GitHub user name: `./repos.sh torvalds`.

<AlertBox variant="info" title="No password, no persistence">

This container listens on port 6379 without authentication and is meant for a local demo. Never publish it like this on a public network. Its data lives in an anonymous volume: `docker compose down` followed by `up` starts on an empty cache — which is fine for a cache.

</AlertBox>

## Watching Redis Work, Live

Open a second terminal and type:

```bash
docker exec -it redis-cache redis-cli MONITOR
```

Every command any client sends now scrolls by. Here is one miss followed by one hit:

<Terminal source="./files/terminal_monitor.txt" />

You can read the whole caching logic of the script straight from this log: look up, store on a miss, set a lifetime, look up again and find it. `MONITOR` is my first reflex whenever an application "should" be using its cache and I want to prove it does.

## The Same Cache from Python

Nothing about the cache is Bash-specific. The Python version uses the official `redis` client and `requests`:

<Snippet filename="repos.py" source="./files/repos.py" defaultOpen={false} />

```bash
pip install redis requests
python3 repos.py
```

<Terminal source="./files/terminal_python.txt" />

The interesting line is `cache.set(KEY, json.dumps(repos), ex=TTL)`: storage and lifetime in one atomic call. Run Redis somewhere other than your own machine and set `REDIS_HOST` accordingly.

## A Rate Limiter in Four Lines

The GitHub quota works in reverse to protect *GitHub*. The same idea protects *your* API, and Redis makes it trivial: one counter per client per minute.

<Snippet filename="rate-limit.sh" source="./files/rate-limit.sh" defaultOpen={false} />

<Terminal source="./files/terminal_ratelimit.txt" />

The key name contains the current minute (`ratelimit:christophe:202611041530`), so every minute starts on a fresh counter, and `EXPIRE` makes sure old counters disappear instead of piling up.

## Under the Hood (skip this if you just want to use it)

### What to cache, and for how long

A TTL is a trade-off between freshness and quota. Sixty seconds is a demo value; for a list of repositories, ten minutes is perfectly reasonable and turns 60 calls per hour into 6. Cache the trimmed data you actually use rather than the raw response: smaller keys, less memory, and the cache keeps working if the API adds fields.

### Redis's license

Since version 8, Redis is again available under an OSI-approved license (AGPLv3, alongside RSAL and SSPL). The Valkey fork, created in 2024 when Redis left open source, remains a drop-in alternative speaking the same protocol: `redis-cli` and the client libraries used here work against both.

## Conclusion

A rate-limited API, called repeatedly with the same question, is the textbook case for a cache, and Redis turns it into a dozen lines: look up, store with a lifetime, done. The same container then hands you a correct rate limiter with `INCR` and `EXPIRE`.

If you have a `compose.yaml` with a `redis` service you never really understood — like the voting app in <Link to="/blog/docker-compose-viz">the docker-compose-viz article</Link> — open `MONITOR` next to it: you will see exactly what the application asks of it.
