---
slug: ai-python-docstring-pytest
title: Auto-documenting and testing python scripts
authors: [christophe]
mainTag: Python
tags: [ai, python]
image: /img/v2/ai-python-docstring-pytest.webp
date: 2026-12-31
draft: true
blueskyRecordKey:
---

![Auto-documenting and testing python scripts](/img/v2/ai-python-docstring-pytest.webp)

To build and run in the same time: `make build && clear && make run PROJECT_PATH=$(pwd)`

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


## Command line explained

This command executes your AI container in a way that allows it to interact with your local files securely and communicate with your host machine. Here is the breakdown of every flag:

### The Core Command

* **`docker run`**: The standard command to create and start a container from an image.
* **`--rm`**: **Automatic Cleanup.** When the container process finishes (or crashes), Docker will automatically delete the container. This prevents your system from being cluttered with "stopped" container instances.

### Volume and Permissions

* **`-v "$PWD:/app/src"`**: **Volume Mounting.** This maps your current directory (`$PWD` on your host) to the `/app/src` directory inside the container. Any file the script writes to `/app/src` *inside* the container will instantly appear on your host machine.
* **`--user $(id -u):$(id -g)`**: **Permission Mapping.** By default, Docker containers run as `root`. This flag tells Docker to run the process as *your* local user ID (`id -u`) and group ID (`id -g`). This is crucial because it ensures that any files created or modified by the script are owned by **you** on the host, not by `root`, preventing "Permission Denied" errors.

### Networking

* **`--add-host=host.docker.internal:host-gateway`**: **Host Access.** This adds an entry to the container's `/etc/hosts` file. It allows the container to resolve the special hostname `host.docker.internal` to your host machine's internal IP address. This is required so the script can reach your local **Ollama** instance (which is likely running on the host, not inside the container).

### Container Configuration

* **`cavo789/ai-agent:latest`**: The name and tag of the Docker image you are running.

### Application Flags (passed to your `main.py`)

These flags are processed by your Python script's `argparse` configuration, not by Docker:

* **`--path /app/src`**: Tells your script where to look for Python files (inside the container).
* **`--docstring`**: Tells the script to trigger the docstring generation feature.
* **`--tests`**: Tells the script to trigger the unit test generation feature.
* **`--run-tests`**: Tells the script to execute the generated tests immediately using `pytest`.
* **`--model qwen2.5-coder:7b`**: Overrides the default model to use the 7B version of Qwen, which is more powerful but slower than the default 1.5B model.
