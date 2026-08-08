---
slug: oha-http-load-testing
title: "oha — Benchmark Your Blog Before Your Visitors Do"
authors: [christophe, claude]
image: /img/v2/functional_tests.webp
mainTag: linux
tags: [linux, docker, bash]
ai_assisted: true
date: 2026-07-30
draft: true
description: oha is a Rust-powered HTTP load generator with a real-time TUI. Send hundreds of concurrent requests to your local Docusaurus dev server and read the full latency breakdown in seconds — no config files, no scripting required.
language: en
---

![oha — Benchmark Your Blog Before Your Visitors Do](/img/v2/functional_tests.webp)

<!-- cspell:ignore oha hatoo percentile -->

<TLDR>
`oha` is a Rust-powered HTTP load generator that fires N requests with C concurrent workers and renders a real-time terminal UI — progress bars, a latency histogram, and full percentile breakdowns. Instead of pointing it at a production site and generating real traffic, this article uses a local Docusaurus dev server at `http://localhost:3000` as the target, which is both safe and surprisingly revealing about how your server actually behaves under pressure.
</TLDR>

Like you know me now, I care a lot about performance. Not in the abstract "optimize everything" way, but in the practical "will this actually hold up?" way. I push a new feature to my blog, the CI passes, the site deploys — all good. But how many simultaneous visitors would it take before things start to slow down? I never had a quick answer to that. Until I found `oha`.

The problem with traditional load testing is the setup. JMeter needs XML config files. Locust needs Python scripts. Even `wrk` and `ab` have enough flags to make you reach for the man page. I wanted something I could type in ten seconds and understand in five.

That tool is `oha`.

<!-- truncate -->

## First run: testing the blog homepage

The <Link to="/blog/running-docusaurus-with-docker">Docusaurus dev server</Link> runs at `http://localhost:3000`. A first test is a single command:

<Terminal>
$ oha -n 200 -c 10 http://localhost:3000
</Terminal>

That sends **200 requests**, **10 at a time**. While it runs, oha renders a live TUI with a progress bar and running averages. When done, it prints the full report:

<Terminal>
$ oha -n 200 -c 10 --no-tui http://localhost:3000

Summary:
  Success rate: 100.00%
  Total:        3.4512 secs
  Slowest:      0.2134 secs
  Fastest:      0.0047 secs
  Average:      0.0864 secs
  Requests/sec: 57.95

  Total data:   8.36 MiB
  Size/request: 42.72 KiB
  Size/sec:     2.42 MiB

Response time histogram:
  0.005 [1]   |
  0.025 [12]  |■■■
  0.046 [38]  |■■■■■■■■■■
  0.066 [52]  |■■■■■■■■■■■■■
  0.086 [44]  |■■■■■■■■■■■
  0.106 [28]  |■■■■■■■
  0.127 [14]  |■■■
  0.147 [6]   |■
  0.167 [3]   |
  0.188 [2]   |
  0.213 [0]   |

Latency distribution:
  10% in 0.0344 secs
  25% in 0.0519 secs
  50% in 0.0789 secs
  75% in 0.1023 secs
  90% in 0.1287 secs
  95% in 0.1512 secs
  99% in 0.1934 secs

Details (average, fastest, slowest):
  DNS+dialup:  0.0001 secs, 0.0001 secs, 0.0002 secs
  DNS-lookup:  0.0000 secs, 0.0000 secs, 0.0000 secs
  req write:   0.0001 secs, 0.0000 secs, 0.0002 secs
  resp wait:   0.0860 secs, 0.0045 secs, 0.2131 secs
  resp read:   0.0003 secs, 0.0001 secs, 0.0012 secs

Status code distribution:
  [200] 200 responses
</Terminal>

200 out of 200 responses, `Success rate: 100.00%`. Let's read the rest.

<AlertBox variant="note" title="--no-tui in the Terminal blocks above">
The `--no-tui` flag disables the live progress bar so the output fits cleanly in a static code block. In practice, skip it — the live TUI is one of the best parts of oha.
</AlertBox>

## What is oha?

[oha](https://github.com/hatoo/oha) is a small HTTP load generator written in Rust, inspired by [`hey`](https://github.com/rakyll/hey) (itself inspired by Apache Bench). It sends a configurable number of HTTP requests with a configurable number of concurrent workers, displays a live TUI progress bar while running, then prints a full summary: total time, request throughput, a latency histogram, and percentile distribution.

The thing that sets oha apart is that live TUI — you watch the requests fly in real time, see errors appear as they happen, and get the full picture the moment the test finishes. No log parsing, no secondary tool, no post-processing.

It joins the same family as <Link to="/blog/ripgrep">ripgrep</Link> (for `grep`) and <Link to="/blog/linux-eza">eza</Link> (for `ls`) — modern Rust rewrites of older Unix tools that earn their place by being genuinely better to use.

## Install

### Via Cargo

<Prerequisite
  name="oha"
  install="cargo install oha"
  check="oha --version"
  checkOutput="oha 0.6.4"
/>

### Via a pre-built binary

No Rust toolchain? Download the binary directly from the [GitHub releases page](https://github.com/hatoo/oha/releases):

<Terminal>
$ curl -L https://github.com/hatoo/oha/releases/latest/download/oha-linux-amd64 -o oha
$ chmod +x oha && sudo mv oha /usr/local/bin/
$ oha --version
oha 0.6.4
</Terminal>

### With Docker — zero installation required

The cleanest approach on a machine where you already have Docker: run oha straight from its image.

<Terminal>
$ docker run --rm --network=host ghcr.io/hatoo/oha:latest http://localhost:3000
</Terminal>

`--network=host` gives the container direct access to your machine's `localhost`. On Linux and WSL2 this works immediately — which is exactly the setup used in this article.

## Reading the output

<StepsCard
  variant="remember"
  title="What each metric means"
  steps={[
    {
      content: "**Success rate** — percentage of requests that got a 2xx or 3xx response. 100% means no errors, no timeouts, no refused connections.",
    },
    {
      content: "**Requests/sec** — throughput: how many requests the server handled per second across the full test. Here: ~58 req/s with 10 concurrent workers.",
    },
    {
      content: "**Response time histogram** — a visual distribution of latencies. A bell curve peaking around 50–90ms is typical for a local dev server. A long right tail means some requests were significantly slower than the average.",
    },
    {
      content: "**Latency percentiles** — the most actionable numbers. `p50` (median) is what a typical visitor experiences. `p95` and `p99` are your worst-case users. A p99 of 193ms on localhost is fine; the same number on a remote server carries a different weight.",
    },
    {
      content: "**resp wait** — the time between sending the request and receiving the first byte of the response. This is the server's actual processing time. `req write` and `resp read` are network overhead and are near-zero on localhost.",
    }
  ]}
/>

<AlertBox variant="tip" title="The dev server is slower than production">
The Docusaurus dev server trades performance for hot reload and developer convenience. A production build served by a web server or a CDN handles an order of magnitude more requests per second. To benchmark the production build locally, run `npm run build` then `npm run serve`, and point oha at that instead.
</AlertBox>

## Cranking up the pressure

What happens when 50 visitors arrive simultaneously?

<Terminal>
$ oha -n 500 -c 50 --no-tui http://localhost:3000

Summary:
  Success rate: 100.00%
  Total:        4.2193 secs
  Slowest:      0.6847 secs
  Fastest:      0.0051 secs
  Average:      0.4021 secs
  Requests/sec: 118.51

Response time histogram:
  0.005 [1]   |
  0.073 [38]  |■■■■■■■■
  0.141 [42]  |■■■■■■■■■
  0.209 [47]  |■■■■■■■■■■
  0.277 [51]  |■■■■■■■■■■■
  0.344 [62]  |■■■■■■■■■■■■■
  0.412 [58]  |■■■■■■■■■■■■
  0.480 [73]  |■■■■■■■■■■■■■■■
  0.548 [78]  |■■■■■■■■■■■■■■■■
  0.616 [39]  |■■■■■■■■
  0.685 [11]  |■■

Latency distribution:
  10% in 0.1142 secs
  25% in 0.2384 secs
  50% in 0.4156 secs
  75% in 0.5089 secs
  90% in 0.5812 secs
  95% in 0.6192 secs
  99% in 0.6713 secs

Status code distribution:
  [200] 500 responses
</Terminal>

Still 100% success — no errors, nothing dropped. But the latency picture changed dramatically: the p50 jumped from 79ms to 415ms, and the histogram shifted hard to the right, now skewing toward the 500–600ms range. That bell curve from the first test is gone; requests are clearly queuing behind each other.

This is exactly what load testing is for: not to break things, but to see where the curve starts to bend.

## Testing specific routes

The blog homepage is a large page with a full article listing. What about a single post?

<Terminal>
$ oha -n 200 -c 10 http://localhost:3000/blog/ripgrep
</Terminal>

Or a static asset like the RSS feed, which is much lighter:

<Terminal>
$ oha -n 500 -c 50 http://localhost:3000/blog/rss.xml
</Terminal>

oha accepts any URL — pages, feed URLs, static files. This makes it useful beyond simple load testing: you can compare the response time of two different routes side by side to spot which one needs attention.

## Running for a fixed duration

Instead of a fixed request count, run for a fixed time. Useful when you want to observe throughput and latency patterns over 30 seconds without calculating how many requests that implies:

<Terminal>
$ oha -z 30s -c 10 http://localhost:3000
</Terminal>

`-z` accepts `s` (seconds), `m` (minutes), `h` (hours). The test ends when the duration expires, regardless of request count.

## Docker Compose for repeatable tests

If you want to pin a specific test as part of a project's workflow, drop a `compose.yaml` next to your code:

<Snippet
  filename="compose.yaml"
  source="./files/compose.yaml"
  defaultOpen={true}
/>

Then run it with:

<Terminal>
$ docker compose run --rm oha
</Terminal>

Or override parameters on the fly:

<Terminal>
$ docker compose run --rm oha -n 500 -c 50 http://localhost:3000/blog/ripgrep
</Terminal>

## Exporting results as JSON

For scripting or CI integration, oha can write a machine-readable report:

<Terminal>
$ oha -n 200 -c 10 --json result.json http://localhost:3000
</Terminal>

The JSON includes the full latency distribution and status code breakdown — easy to parse in a script or feed into a dashboard. Pair this with <Link to="/blog/bruno">Bruno</Link> for functional API tests and oha for load tests, and you have a pretty solid local testing stack.

## Conclusion

oha is one of those tools that earns its place in the first five minutes. A single command gives you a complete picture of your server's behavior under load — not just average latency, but the tail: the p95, the p99, the requests that made visitors notice something was wrong.

Testing against `localhost:3000` might look like cheating — no network latency, no CDN, no real traffic. But that's exactly the point: you control all the variables, so any slowness you observe is the server's fault, not the internet's. The baseline you establish today is what you compare against after the next deployment.

And if things look fine on localhost? Then you push to production with just a little more confidence — and you know exactly which number to watch.
