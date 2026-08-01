---
slug: hyperfine
title: "hyperfine — Stop Guessing Which Command Is Faster, Measure It"
description: "hyperfine is a command-line benchmarking tool written in Rust. It runs your commands multiple times, warms up caches, computes statistics, and tells you definitively which one is faster — with confidence intervals and export to Markdown or CSV."
authors: [christophe, claude]
image: /img/v2/linux_parallel.webp
mainTag: linux
draft: true
tags: [bash, docker, linux]
date: 2026-08-25
ai_assisted: true
---

![hyperfine — Stop Guessing Which Command Is Faster, Measure It](/img/v2/linux_parallel.webp)

<TLDR>
`hyperfine` is a command-line benchmarking tool that runs commands multiple times, warms up disk caches, removes statistical outliers, and reports mean time, standard deviation, and a relative comparison. One command to tell you definitively: is `ripgrep` faster than `grep` on your machine? Is your optimized Docker build actually quicker? No guessing, no stopwatch — just numbers.
</TLDR>

You replaced `grep` with `ripgrep`. You're pretty sure it's faster. But how much faster? Is the difference real or just cache effects from the first run?

You optimized a Docker build step. You think it improved. But you only timed it once, with `time`, which gives you one data point and no statistics.

`hyperfine` answers these questions properly.

<!-- truncate -->

## Install

**With cargo (Rust toolchain):**

<Terminal>
cargo install hyperfine
</Terminal>

**As a static binary:**

<Terminal>
curl -L https://github.com/sharkdp/hyperfine/releases/latest/download/hyperfine-x86_64-unknown-linux-musl.tar.gz \
  | tar -xz --strip-components=1 -C ~/.local/bin hyperfine-x86_64-unknown-linux-musl/hyperfine
</Terminal>

**With Docker (no install at all):**

<Terminal>
alias hyperfine='docker run --rm -v "$PWD":/workdir -w /workdir --network none \
  ghcr.io/sharkdp/hyperfine'
</Terminal>

<AlertBox type="info" title="About the Docker alias">
The `--network none` flag prevents network access during benchmarks, which removes a source of variability for commands that might try to reach the network. For commands that genuinely need the network, remove this flag.
</AlertBox>

Verify:

<Terminal>
hyperfine --version
</Terminal>

```
hyperfine 1.18.0
```

## A first benchmark

Compare `find` and `fd` for locating all `.md` files in the current directory tree:

<Terminal>
hyperfine 'find . -name "*.md"' 'fd -e md'
</Terminal>

```
Benchmark 1: find . -name "*.md"
  Time (mean ± σ):      45.3 ms ±   3.1 ms    [User: 12.4 ms, System: 30.2 ms]
  Range (min … max):    41.8 ms …  52.7 ms    10 runs

Benchmark 2: fd -e md
  Time (mean ± σ):       8.2 ms ±   0.6 ms    [User: 5.1 ms, System: 10.3 ms]
  Range (min … max):     7.5 ms …   9.4 ms    10 runs

Summary
  fd -e md ran
    5.52 ± 0.51 times faster than find . -name "*.md"
```

Ten runs. Mean, standard deviation, min, max. A clear winner.

## Warmup runs

The first run of any command is often slower: disk caches are cold, the OS hasn't prefetched anything. This makes single-measurement tools like `time` unreliable. `hyperfine` handles this with `--warmup`:

<Terminal>
hyperfine --warmup 3 'grep -r "TODO" .' 'rg "TODO"'
</Terminal>

Three throwaway runs before measurement starts. The benchmark times only the warmed-up state — the condition that matters in real use.

## Controlling run count

By default, hyperfine runs each command at least 10 times (more for fast commands, up to a configurable maximum). You can override this:

<Terminal>
# Minimum 20 runs
hyperfine --min-runs 20 'my-command'

# Exactly 5 runs (faster, less accurate)
hyperfine --runs 5 'my-command'
</Terminal>

For slow commands (Docker builds, compilation), use fewer runs:

<Terminal>
hyperfine --runs 3 'docker build -t myapp:v1 -f Dockerfile.v1 .'
</Terminal>

## Benchmarking with variable inputs

Use `{var}` placeholders combined with `--parameter-list`:

<Terminal>
hyperfine --parameter-list size 100,1000,10000 \
  'seq {size} | sort'
</Terminal>

```
Benchmark 1: seq 100 | sort
  Time (mean ± σ):       2.1 ms ±   0.3 ms

Benchmark 2: seq 1000 | sort
  Time (mean ± σ):       5.8 ms ±   0.4 ms

Benchmark 3: seq 10000 | sort
  Time (mean ± σ):      42.3 ms ±   2.1 ms
```

This runs three benchmarks automatically and lets you see how performance scales with input size.

## Prepare and cleanup

Some benchmarks need a setup step that shouldn't be measured — clearing a cache, creating a test file, resetting state. Use `--prepare`:

<Terminal>
hyperfine --prepare 'sync; echo 3 | sudo tee /proc/sys/vm/drop_caches' \
  'grep -r "function" /usr/lib/python3'
</Terminal>

The `--prepare` command runs before each timed run, not as part of the measured time.

## Exporting results

Three export formats are available:

**Markdown table** (paste directly into a blog post or README):

<Terminal>
hyperfine --export-markdown results.md 'find . -name "*.log"' 'fd -e log'
</Terminal>

**CSV** (for spreadsheets or further analysis):

<Terminal>
hyperfine --export-csv results.csv 'command1' 'command2'
</Terminal>

**JSON** (for scripting):

<Terminal>
hyperfine --export-json results.json 'command1' 'command2'
</Terminal>

## Real-world examples

### grep vs ripgrep — is the hype justified?

<Terminal>
hyperfine --warmup 3 \
  'grep -r "ERROR" /var/log' \
  'rg "ERROR" /var/log'
</Terminal>

### Two Docker build strategies

You have a monolithic Dockerfile and a multi-stage version. Which builds faster from a cold cache?

<Terminal>
hyperfine --runs 3 \
  'docker build --no-cache -t test:mono -f Dockerfile.mono .' \
  'docker build --no-cache -t test:multi -f Dockerfile.multi .'
</Terminal>

The `--no-cache` flag ensures each run starts from scratch. Without it, Docker's layer cache makes the second run near-instant regardless of strategy.

### Shell startup time

If you're optimizing your `~/.zshrc` (perhaps after reading about <Link to="/blog/modular-zsh-workflow">modular ZSH workflows</Link>), measure the impact before and after:

<Terminal>
hyperfine --warmup 5 \
  'zsh -i -c exit' \
  'bash -i -c exit'
</Terminal>

### find alternatives comparison

<Terminal>
hyperfine --warmup 3 \
  'find . -type f -name "*.ts"' \
  'fd -t f -e ts' \
  'rg --files -g "*.ts"'
</Terminal>

This compares three tools across 10+ runs each — impossible to evaluate fairly with a stopwatch.

## Interpreting the output

The key numbers:

- **Mean ± σ**: average time and standard deviation. A high σ relative to mean means results vary a lot — more runs or a `--prepare` to clear caches would help.
- **Range (min … max)**: the fastest and slowest individual runs. A large range suggests external interference (other processes, I/O).
- **Summary**: the final comparison, expressed as "X ran N times faster than Y". This is the number you came for.

<AlertBox type="tip" title="Trust the mean, not the minimum">
Some benchmarking tools report only the minimum time (the argument being that the minimum is the "true" speed and everything slower is noise). `hyperfine` reports the mean because in practice, commands run in real conditions — not in ideal isolation. The mean is what your users experience.
</AlertBox>

## hyperfine vs time

The built-in `time` command gives you one measurement. It's fine for one-off curiosity. `hyperfine` is for when the result matters:

| | `time` | `hyperfine` |
|--|--------|-------------|
| Runs | 1 | 10+ (configurable) |
| Warmup | No | Yes (`--warmup`) |
| Statistics | No | Mean, σ, min, max |
| Comparison | Manual | Automatic (with ratio) |
| Export | No | Markdown, CSV, JSON |
| Variable inputs | No | Yes (`--parameter-list`) |

If you're presenting a benchmark to a team, writing a blog post, or making a decision based on performance data, use `hyperfine`. For a quick gut-check, `time` is fine.

## Conclusion

`hyperfine` makes performance claims testable. Is <Link to="/blog/ripgrep">ripgrep</Link> faster than grep? Is your refactored build step actually an improvement? Is the `eza` alias you added instead of `ls` noticeable? These are questions hyperfine answers in seconds, with enough statistical rigor to trust the result.

Add it to your toolkit alongside the tools you're already benchmarking, and stop guessing.
