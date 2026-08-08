---
slug: python-ai-helper
title: Auto-documenting and testing python scripts
description: "A Dockerized agent that reads a Python file, writes a real docstring for it, generates a pytest file, and runs that test file immediately — all through a local Ollama model, no code leaving the machine."
authors: [christophe]
mainTag: Python
tags: [ai, python]
image: /img/v2/python-ai-helper.webp
date: 2026-12-31
draft: true
---

![Auto-documenting and testing python scripts](/img/v2/python-ai-helper.webp)

I have Python scripts scattered across projects with no docstring and no test — written fast, never revisited, and every time I open one months later I have to re-read the whole thing to remember what it does. Writing the docstring by hand is quick per file; writing it for the fortieth script in a project I inherited is not.

<!-- truncate -->

## What ai-agent Does For You

Point it at a folder and it writes the missing docstring, generates a pytest file, and runs that test file immediately — one command:

```bash
docker run --rm \
    -v "$PWD:/app/src" \
    --user $(id -u):$(id -g) \
    --add-host=host.docker.internal:host-gateway \
    cavo789/ai-agent:latest --path /app/src --docstring --tests --run-tests --model qwen2.5-coder:7b
```

<Terminal source="./files/terminal_run.txt" typewriter />

The docstring landed at the top of the file, correctly describing what both functions do. The generated test caught something real, too — it's *wrong* about the expected total (`47.22` instead of the actual `42.35`), a model arithmetic mistake, not a bug in the code. That's the honest picture: a genuinely useful first draft, not a tool to trust blindly.

<AlertBox variant="caution" title="Read the generated test before trusting it">
`--run-tests` executes what the model wrote, immediately, and a failing assertion doesn't necessarily mean your code is broken — it might mean the model did the math wrong, exactly like the case above. Treat a generated test the same way you'd treat a pull request from a junior colleague: read it before you rely on it.
</AlertBox>

## Why It Works

- One container, one model call per file — no IDE plugin, no API key, no code leaving the machine: `OLLAMA_URL` points at `host.docker.internal`, your existing local Ollama instance.
- `--docstring`, `--tests`, and `--run-tests` are independent flags — ask for a docstring only, or generate and immediately execute a test file, without re-running the parts you don't need.
- The container runs `--read-only` with your host UID/GID mapped in — files it writes belong to you, not `root`, and it can't touch anything outside the mounted project folder.
- `--force` re-generates files that already have a docstring or test; without it, the agent skips anything already documented, so re-running on a partially-processed project is cheap.

## Under the Hood (skip this if you just want to use it)

### Command line explained

This command executes your AI container in a way that allows it to interact with your local files securely and communicate with your host machine. Here is the breakdown of every flag:

#### The Core Command

- **`docker run`**: The standard command to create and start a container from an image.
- **`--rm`**: **Automatic Cleanup.** When the container process finishes (or crashes), Docker will automatically delete the container. This prevents your system from being cluttered with "stopped" container instances.

#### Volume and Permissions

- **`-v "$PWD:/app/src"`**: **Volume Mounting.** This maps your current directory (`$PWD` on your host) to the `/app/src` directory inside the container. Any file the script writes to `/app/src` *inside* the container will instantly appear on your host machine.
- **`--user $(id -u):$(id -g)`**: **Permission Mapping.** By default, Docker containers run as `root`. This flag tells Docker to run the process as *your* local user ID (`id -u`) and group ID (`id -g`). This is crucial because it ensures that any files created or modified by the script are owned by **you** on the host, not by `root`, preventing "Permission Denied" errors.

#### Networking

- **`--add-host=host.docker.internal:host-gateway`**: **Host Access.** This adds an entry to the container's `/etc/hosts` file. It allows the container to resolve the special hostname `host.docker.internal` to your host machine's internal IP address. This is required so the script can reach your local **Ollama** instance (which is likely running on the host, not inside the container).

#### Container Configuration

- **`cavo789/ai-agent:latest`**: The name and tag of the Docker image you are running.

#### Application Flags (passed to your `main.py`)

These flags are processed by your Python script's `argparse` configuration, not by Docker:

- **`--path /app/src`**: Tells your script where to look for Python files (inside the container).
- **`--docstring`**: Tells the script to trigger the docstring generation feature.
- **`--tests`**: Tells the script to trigger the unit test generation feature.
- **`--run-tests`**: Tells the script to execute the generated tests immediately using `pytest`.
- **`--model qwen2.5-coder:7b`**: Overrides the default model to use the 7B version of Qwen, which is more powerful but slower than the default 1.5B model.

To run manually, in the folder to process:

```bash
docker run --rm \
    -v "$PWD:/app/src" \
    --user $(id -u):$(id -g) \
    --add-host=host.docker.internal:host-gateway \
    cavo789/ai-agent:latest --path /app/src --docstring --tests --run-tests --model qwen2.5-coder:7b
```

To get the list of local LLMs:

```bash
docker exec -it ollama ollama list
```

## Conclusion

A docstring and a test file for a script that had neither, in the time it takes to type a `docker run` command — that's the whole value, and it doesn't pretend to be more than that. The generated test above was wrong on its first attempt, and that's fine: it's still faster to fix one bad assertion than to write the test from a blank file. Same idea as the rest of the local-Ollama tooling on this blog: a fast, private first draft, reviewed before it's trusted, not a replacement for actually reading your own code.

If wiring a local model into your own Python tooling looks interesting, <Link to="/blog/mcp-python-server">building an MCP server that gives Claude Code Docker superpowers</Link> covers the same "local model, one Python file, no cloud" idea from a different angle.
