# AI-Powered Global Git Hook Reviewer

An automated, local code review system that leverages **Ollama** and high-performance LLMs (like Codestral or DeepSeek; based on your configuration) to audit your staged changes before every commit.

## Features

* **Local & Private:** Your code never leaves your machine.
* **Strict Standards:** Enforces SOLID principles, DRY (Don't Repeat Yourself), and maintainability.
* **Strict Typing:** Validates type hinting for **Python** and **PHP** (compatible with MyPy, PHPStan, Phan).
* **Bash Support:** Analyzes **Shell scripts** for best practices and security.
* **English Only:** Automatically flags non-English comments and documentation (comments should be written in English).
* **Work/Home Awareness:** If the Ollama service is unreachable (e.g., at the office without your local GPU), the hook gracefully skips the review without blocking your workflow.
* **Commit Guard:** Blocks the commit if the AI suggests improvements.

### Debugging

If the AI behavior is unexpected or you want to see the exact prompts being sent to Ollama, you can enable **Debug Mode** by setting the `AI_REVIEWER_DEBUG` environment variable to `1`.

**In your Git Hook or manual command:**

```bash
docker run --rm \
    -e AI_REVIEWER_DEBUG=1 \
    -v "$(pwd):/repo" \
    --network="host" \
    cavo789/ai-reviewer:3.14-alpine
```

This will display:

* The full system prompt (including the specific rules merged for the file type).
* The raw request payload sent to the Ollama API.
* The unprocessed response from the LLM before parsing.


## Prerequisites

* **Python 3.11+**
* **Ollama** installed and running.
* **High-performance model:** Recommended models for 24GB VRAM:
  * `ollama pull codestral` (Best for Python/PHP)
  * `ollama pull deepseek-coder-v2`

## Setup

1. **Install Dependencies:**

   ```bash
   pip install requests pyyaml
   ```

2. **Make the script executable:**

   ```bash
   chmod +x src/main.py
   ```

3. **Configure your prompt:**

   Edit `config/system_prompt.txt` to refine your coding standards and `config/settings.yaml` to set your preferred model.

4. Build the Docker image

   First, we should create the `uv.lock` file, here is how:

   ```bash
   docker run --rm \
      -v "$(pwd)":/app \
      -w /app \
      python:3.14-alpine \
      sh -c "pip install --no-cache-dir uv && uv lock && chown $(id -u):$(id -g) uv.lock"
  ```

  Then we can build the image:

   ```bash
   PYTHON_VERSION=3.14
   DOCKER_BUILDKIT=1 docker build -t ai-reviewer:${PYTHON_VERSION}-alpine .
   ```

## Running Ollama in a container

```compose.yaml
name: tools

services:
  ollama:
    image: ollama/ollama
    container_name: ollama
    ports:
      - "11434:11434"
    volumes:
      - ollama_data:/root/.ollama
    restart: always
    # This part is to enable to use of the VRAM
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]

  open-webui:
    image: ghcr.io/open-webui/open-webui:main
    container_name: open-webui
    ports:
      - "4000:8080"
    extra_hosts:
      - "host.docker.internal:host-gateway"
    environment:
      - OLLAMA_BASE_URL=http://ollama:11434
    volumes:
      - open-webui_data:/app/backend/data
    restart: always
    depends_on:
      - ollama

volumes:
  ollama_data:
  open-webui_data:
```

## Global Hook Installation

To ensure this hook runs on **every** Git repository on your machine:

1. **Set up a global template directory:**

   ```bash
   git config --global init.templateDir '~/.git-templates'
   mkdir -p ~/.git-templates/hooks
   ```

2. **Create the pre-commit hook:**

   ```bash
   touch ~/.git-templates/hooks/pre-commit
   chmod +x ~/.git-templates/hooks/pre-commit
   ```

3. **Link the hook to the Python script:**

   Open `~/.git-templates/hooks/pre-commit` in your editor and paste the following (replace the path with your actual project location):

   ```bash
   #!/bin/bash

   # --network="host": needed to be able to access to localhost:11434 (Ollama)

   docker run --rm \
      -v "$(pwd):/repo" \
      --network="host" \
      cavo789/ai-reviewer:3.14
   ```

## Check GPU use

Run `watch -n 0.5 nvidia-smi` while a request is running to see the use of the GPU.

We can also run `docker exec -it ollama ollama ps` and we've to see **100% GPU** when no RAM is used.

```bash
❯ docker exec -it ollama ollama ps
NAME                ID              SIZE      PROCESSOR    CONTEXT    UNTIL
qwen2.5-coder:7b    dae161e27b0e    8.2 GB    100% GPU     32768      4 minutes from now
```

If you see this:

```bash
❯ docker exec -it ollama ollama ps
NAME                 ID              SIZE     PROCESSOR          CONTEXT    UNTIL
qwen2.5-coder:32b    b92d6a0bd47e    31 GB    27%/73% CPU/GPU    32768      4 minutes from now
```

It's a confirmation Ollama didn't find enough VRAM and has used RAM. In that case, if you want speed, you've to use another LLM

```bash
❯ docker exec -it ollama ollama ps
NAME                 ID              SIZE     PROCESSOR    CONTEXT    UNTIL
qwen2.5-coder:14b    9ec8897f747e    17 GB    100% GPU     32768      4 minutes from now
```

### Initialize existing repositories

The global template only applies to `git init` or `git clone` commands performed *after* the setup. To apply the hook to an existing repository, simply run:

```bash
git init
```

## Usage

### Normal Workflow

When you run `git commit`, the script automatically:

1. Detects staged files (`.py`, `.php`, `.sh`).
2. Checks if Ollama is online.
3. Sends the code to the LLM for review.
4. **If the AI finds issues:** The commit is interrupted, and suggestions are displayed.
5. **If the AI returns "LGTM":** The commit proceeds.

### Bypassing the Review

If you are in a hurry, have a false positive from the AI, or are working offline at the office, you have two options:

1. **Offline Mode:** The script detects if Ollama is unreachable and prints `Ollama not found; continue`. It will not block the commit.
2. **Manual Force:** If the AI is blocking a commit that you want to push anyway, use the `--no-verify` flag:

   ```bash
   git commit -m "My message" --no-verify
   ```

## Configuration

* **`config/settings.yaml`**: Define the model name (`codestral`, `llama3`, etc.) and the connection URL.
* **`config/rules/`**: This directory contains the "brain" of the reviewer. It is split into `common.txt` (global rules) and language-specific files (e.g., `python.txt`, `php.txt`). You can update these to refine your standards without touching the Python code.

## Architecture

* `src/git_utils.py`: Extracts only the staged content (using `git show :file`).
* `src/ollama_client.py`: Handles API communication and health checks.
* `src/analyzer.py`: Logic for filtering file extensions and processing reviews.
* `src/main.py`: Main entry point orchestrating the workflow.

## Coding tips

## Coding tips

If you're updating the configuration or the code, you have to rebuild the image each time. To avoid this, simply mount the `config` and `src` folders and use the debug flag:

```bash
docker run --rm \
    -e AI_REVIEWER_DEBUG=1 \
    -v "$(pwd)/src:/app/src" \
    -v "$(pwd)/config:/app/config" \
    -v "$(pwd):/repo" \
    --network="host" \
    ai-reviewer:3.14-alpine src/main.py
```

    When finished, think to build the final image
