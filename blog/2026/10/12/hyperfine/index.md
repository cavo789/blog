---
slug: hyperfine
title: "hyperfine — Stop Guessing Which Command Is Faster, Measure It"
description: "hyperfine is a command-line benchmarking tool written in Rust. It runs your commands many times, supports warmup runs, computes statistics on time and memory, and tells you definitively which one is faster — with export to Markdown, CSV or JSON."
authors: [christophe, claude]
image: /img/v2/hyperfine.webp
mainTag: linux
tags: [bash, docker, linux]
date: 2026-10-12
ai_assisted: true
---

![hyperfine — Stop Guessing Which Command Is Faster, Measure It](/img/v2/hyperfine.webp)

<TLDR>
`hyperfine` is a command-line benchmarking tool that runs commands many times, warms up disk caches on request, warns you about outliers, and reports mean time, standard deviation, peak memory, and a relative comparison. One command to tell you definitively: is `ripgrep` faster than `grep` on your machine? Is your optimized Docker build actually quicker? No guessing, no stopwatch — just numbers.
</TLDR>

You replaced `grep` with `ripgrep`. You're pretty sure it's faster. But how much faster? Is the difference real or just cache effects from the first run?

You optimized a Docker build step. You think it improved. But you only timed it once, with `time`, which gives you one data point and no statistics.

`hyperfine` answers these questions properly.

<!-- truncate -->

## A first benchmark

Compare `grep -r` and `git grep` for finding every `TODO` in a repository. Both are already on your machine, and `git grep` only searches the files git tracks:

<Terminal>
hyperfine --warmup 3 'grep -r "TODO" .' 'git grep "TODO"'
</Terminal>

```text
Benchmark 1: grep -r "TODO" . (10 runs)
                mean     ±       σ          min     …     max
  Wall Time    321.4 ms  ±     7.0 ms     315.6 ms  …   335.2 ms
  Memory        11.5 MiB ±     0.0 MiB     11.5 MiB …    11.6 MiB

Benchmark 2: git grep "TODO" (29 runs)
                mean     ±       σ          min     …     max
  Wall Time    102.3 ms  ±     1.9 ms      99.7 ms  …   106.4 ms           -68.2%  (3.1x faster)
  Memory        31.8 MiB ±     0.8 MiB     29.6 MiB …    33.0 MiB         +176.1%  (2.8x more)
```

Mean, standard deviation, min, max — for time **and** memory, over as many runs as hyperfine needed to get stable numbers. Every command after the first one is compared to the first: here `git grep` is 3.1 times faster, and uses 2.8 times more memory to get there.

## Install

**With Homebrew (macOS, Linux and WSL):**

<Terminal>
brew install hyperfine
</Terminal>

**With cargo (Rust toolchain):**

<Terminal>
cargo install hyperfine
</Terminal>

**With apt (Debian, Ubuntu):**

<Terminal>
sudo apt install hyperfine
</Terminal>

<AlertBox type="info" title="apt ships hyperfine 1.x">
Ubuntu 24.04 packages version 1.18 and Debian 13 version 1.19. Version 2.0 changed the output format and how commands are executed (see [No shell by default](#no-shell-by-default)), so the examples in this article will not look exactly the same. To get 2.0 on Debian or Ubuntu, install the `.deb` attached to the [GitHub release](https://github.com/sharkdp/hyperfine/releases/tag/v2.0.0):
</AlertBox>

<Terminal>
curl -LO https://github.com/sharkdp/hyperfine/releases/download/v2.0.0/hyperfine-musl_2.0.0_amd64.deb
sudo apt install ./hyperfine-musl_2.0.0_amd64.deb
</Terminal>

Verify:

<Terminal>
hyperfine --version
</Terminal>

```text
hyperfine 2.0.0
```

## Warmup runs

The first run of any command is often slower: disk caches are cold, the OS hasn't prefetched anything. This makes single-measurement tools like `time` unreliable. `hyperfine` handles this with `--warmup`:

<Terminal>
hyperfine --warmup 3 'grep -r "TODO" .' 'rg "TODO"'
</Terminal>

Three throwaway runs before measurement starts. The benchmark times only the warmed-up state — the condition that matters in real use.

## Controlling run count

By default, hyperfine runs each command at least 10 times, and keeps going for at least three seconds — which is why fast commands get hundreds of runs. You can override this:

<Terminal>
hyperfine --min-runs 20 'my-command'   # at least 20 runs
hyperfine --runs 5 'my-command'        # exactly 5 runs (faster, less accurate)
</Terminal>

For slow commands (Docker builds, compilation), use fewer runs:

<Terminal>
hyperfine --runs 3 'docker build -t myapp:v1 -f Dockerfile.v1 .'
</Terminal>

## No shell by default

Since version 2.0, hyperfine runs each command **directly**, without a shell in between. That removes the shell's startup time from the measurement, but it also means shell syntax — pipes, redirections, `&&`, `~` — is not interpreted. hyperfine refuses such a command instead of silently measuring the wrong thing:

<Terminal>
$ hyperfine 'seq 100 | sort'
Error: Command 'seq 100 | sort' contains unquoted shell syntax ('|').
Explicitly choose how to execute it:
  -S / --shell=default  Interpret shell syntax.
  -N / --shell=none     Run directly, passing '|' as a literal argument.
</Terminal>

Add `-S` to run the command through `sh`, or `--shell bash` / `--shell zsh` to pick one. Your aliases and shell functions are never available, with or without `-S`: hyperfine only sees real executables.

## Benchmarking with variable inputs

Use `{var}` placeholders combined with `--parameter-list`. The pipe below needs a shell, hence `-S`:

<Terminal>
hyperfine -S --parameter-list size 100,1000,10000 \
  'seq \{size} | sort'
</Terminal>

```text
Benchmark 1: seq 100 | sort (1870 runs)
                mean     ±       σ          min     …     max
  Wall Time    569.5 µs  ±   209.2 µs     393.0 µs  …  1907.6 µs
  Memory         1.7 MiB ±     0.1 MiB      1.6 MiB …     1.9 MiB

Benchmark 2: seq 1000 | sort (2920 runs)
                mean     ±       σ          min     …     max
  Wall Time    700.3 µs  ±   321.8 µs     396.0 µs  …  2185.2 µs           +23.0%
  Memory         2.1 MiB ±     0.2 MiB      1.9 MiB …     2.4 MiB          +21.6%

Benchmark 3: seq 10000 | sort (1949 runs)
                mean     ±       σ          min     …     max
  Wall Time   1081.8 µs  ±   336.0 µs     840.7 µs  …  2630.4 µs           +89.9%  (1.9x slower)
  Memory         2.6 MiB ±     0.1 MiB      2.4 MiB …     2.8 MiB          +52.4%  (1.5x more)
```

This runs three benchmarks automatically and lets you see how performance scales with input size. For commands this short, hyperfine also prints a warning: below 5 ms, the shell's own startup time weighs on the result.

## Prepare and cleanup

Some benchmarks need a setup step that shouldn't be measured — clearing a cache, creating a test file, resetting state. Use `--prepare`:

<Terminal>
hyperfine --prepare 'sync; echo 3 | sudo tee /proc/sys/vm/drop_caches' \
  'grep -r "function" /usr/lib/python3'
</Terminal>

The `--prepare` command runs before each timed run, not as part of the measured time. It always goes through a shell, so the `;` and the pipe work here without `-S`.

## Exporting results

Three export formats are the most useful:

**Markdown table** (paste directly into a blog post or README):

<Terminal>
hyperfine --export-markdown results.md 'find . -name "*.md"' 'grep -rl "TODO" .'
</Terminal>

The table holds the primary metric only — wall time, unless you chose another one with `--metrics`:

```markdown
| Command | Mean Wall Time [ms] | Change | Factor |
|:---|---:|---:|:---|
| `find . -name "*.md"` | 6.2 ± 0.2 |  |  |
| `grep -rl "TODO" .` | 33.9 ± 0.8 | +446.7% | (5.5x slower) |
```

**CSV** (for spreadsheets or further analysis, one column per metric):

<Terminal>
hyperfine --export-csv results.csv 'command1' 'command2'
</Terminal>

**JSON** (for scripting, with every individual run):

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

`fd` is rarely installed by default: `brew install fd`, or `sudo apt install fd-find` on Debian and Ubuntu, where the command is called `fdfind`.

This compares three tools across 10+ runs each — impossible to evaluate fairly with a stopwatch.

## Interpreting the output

The key numbers:

- **Wall Time, mean ± σ**: average time and standard deviation. A high σ relative to the mean means results vary a lot — more runs or a `--prepare` to clear caches would help.
- **min … max**: the fastest and slowest individual runs. A large range suggests external interference (other processes, I/O).
- **Memory**: the peak memory the command used. Handy when the faster tool is also the greedier one.
- **The comparison column**: every benchmark after the first is compared to the first one, as a percentage and as "N.Nx faster" or "slower". This is the number you came for — so put your reference command first.

<AlertBox type="tip" title="Trust the mean, not the minimum">
Some benchmarking tools report only the minimum time (the argument being that the minimum is the "true" speed and everything slower is noise). `hyperfine` compares means because in practice, commands run in real conditions — not in ideal isolation. The mean is what your users experience.
</AlertBox>

## Under the Hood (skip this if you just want to use it)

### hyperfine vs time

The built-in `time` command gives you one measurement. It's fine for one-off curiosity. `hyperfine` is for when the result matters:

| | `time` | `hyperfine` |
| -- | -------- | ------------- |
| Runs | 1 | 10+ (configurable) |
| Warmup | No | Yes (`--warmup`) |
| Statistics | No | Mean, σ, min, max |
| Memory | No | Peak memory, by default |
| Comparison | Manual | Automatic (against the first command) |
| Export | No | Markdown, CSV, JSON |
| Variable inputs | No | Yes (`--parameter-list`) |

If you're presenting a benchmark to a team, writing a blog post, or making a decision based on performance data, use `hyperfine`. For a quick gut-check, `time` is fine.

## Conclusion

`hyperfine` makes performance claims testable. Is <Link to="/blog/ripgrep">ripgrep</Link> faster than grep? Is your refactored build step actually an improvement? Is the <Link to="/blog/linux-eza">`eza`</Link> alias you added instead of `ls` noticeable? These are questions hyperfine answers in seconds, with enough statistical rigor to trust the result.

Add it to your toolkit alongside the tools you're already benchmarking, and stop guessing.
