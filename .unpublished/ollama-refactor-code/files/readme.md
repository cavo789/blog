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

    ```bash
    DOCKER_BUILDKIT=1 docker build -t ai-reviewer:3.14-alpine .
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
       ai-reviewer:3.14
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
* **`config/system_prompt.txt`**: The "brain" of the reviewer. You can update your coding standards here without touching the Python code.

## Architecture

* `src/git_utils.py`: Extracts only the staged content (using `git show :file`).
* `src/ollama_client.py`: Handles API communication and health checks.
* `src/analyzer.py`: Logic for filtering file extensions and processing reviews.
* `src/main.py`: Main entry point orchestrating the workflow.

## Coding tips

* If you're updating the configuration or the code, you've to rebuild the image each time. To avoid this, simply mount the `config` and `src` folder like this:

   ```bash
   # Create the folder first to make sure permissions are correct
   mkdir -p /tmp/.ai_cache

   docker run --rm \
    -u "$(id -u):$(id -g)" \
    -v "/tmp/.ai_cache:/app/.cache" \
    -v "$(pwd)/src:/app/src" \
    -v "$(pwd)/config:/app/config" \
    -v "$(pwd):/repo" \
    --network="host" \
    ai-reviewer:3.14-alpine src/main.py
    ```

    When finished, think to run `DOCKER_BUILDKIT=1 docker build -t ai-reviewer:3.14-alpine .` to build the final image
