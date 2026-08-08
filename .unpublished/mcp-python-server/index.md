---
slug: mcp-python-server
title: "MCP in Practice — Build a Python Server That Gives Claude Code Docker Superpowers"
description: "MCP (Model Context Protocol) lets Claude Code call your custom tools. In this article, we build a Python MCP server that exposes Docker information — running containers, logs, image list — and register it with Claude Code so it can use these tools in any conversation."
authors: [christophe, claude]
image: /img/v2/ai.webp
mainTag: ai
draft: true
tags: [ai, docker, python]
date: 2026-09-29
ai_assisted: true
---

![MCP in Practice — Build a Python Server That Gives Claude Code Docker Superpowers](/img/v2/ai.webp)

<TLDR>
MCP (Model Context Protocol) is a standard that lets LLMs call external tools over a local process. You write a Python server that exposes functions as tools; Claude Code discovers and calls them during a conversation. This article builds a `docker-inspector` MCP server with six tools — list containers, get logs, inspect a container, list images, list compose services, run diagnostic commands — and shows how to register it with Claude Code in one JSON block.
</TLDR>

Claude Code can read your files, run shell commands, and browse the web. But it has no direct way to query your running Docker environment — it has to guess from file content or ask you to paste terminal output.

An MCP server fixes this. You write a Python file that exposes Docker queries as named tools. Claude Code calls them automatically whenever they're relevant, without you having to manually retrieve and paste the information.

<!-- truncate -->

## What MCP is — in two paragraphs

[MCP (Model Context Protocol)](https://modelcontextprotocol.io) is a protocol developed by Anthropic for connecting LLMs to external data sources and tools. An MCP server is a local process that listens on stdin/stdout for requests. The LLM client (Claude Code in our case) discovers available tools by calling `tools/list`, then calls individual tools with `tools/call`. The server executes the function and returns the result.

The key property: MCP servers run locally on your machine, not in the cloud. Your Docker socket, your files, your database — the server has the same access you do. The LLM sees only what the server chooses to expose.

## Using It in Claude Code

Restart Claude Code (or reload the window) after adding the `mcpServers` block (covered below). Then simply ask questions about your Docker environment — Claude Code will call the tools when relevant:

> *"Which containers are currently running and what images are they using?"*

Claude Code calls `list_containers`, receives the output, and answers directly:

```
I can see 4 running containers:
- my_api (image: node:22-alpine, up 2 days)
- postgres_dev (image: postgres:16, up 2 days)
- redis_cache (image: redis:7-alpine, up 5 hours)
- caddy (image: caddy:2-alpine, up 2 days)
```

Or:

> *"The api container seems slow. Can you check the last 100 log lines and tell me if there's anything suspicious?"*

Claude Code calls `get_logs("my_api", 100)`, reads the output, and identifies patterns — slow queries, connection timeouts, repeated errors.

Or:

> *"What environment variables is the postgres_dev container running with?"*

Claude Code calls `inspect_container("postgres_dev")` and extracts the `env` field from the JSON.

## Install

Create a directory for the server:

<Terminal>
mkdir -p ~/.mcp/docker-inspector
cd ~/.mcp/docker-inspector
</Terminal>

Install the Python MCP SDK:

<Terminal>
pip install mcp
# or, with uv (recommended):
uv pip install mcp
</Terminal>

Verify:

<Terminal>
python3 -c "import mcp; print(mcp.__version__)"
</Terminal>

```
1.x.x
```

## The server

<Snippet source="./files/server.py" language="python" />

Six tools, each decorated with `@mcp.tool()`:

| Tool | What it does |
|------|-------------|
| `list_containers` | `docker ps` (running or all) |
| `get_logs` | `docker logs --tail N` |
| `inspect_container` | Key metadata: image, status, ports, env, mounts |
| `list_images` | `docker images` with size |
| `compose_services` | Services defined in a `compose.yaml` |
| `exec_in_container` | Read-only diagnostic commands (allowlisted) |

The `exec_in_container` tool includes an explicit allowlist of safe read-only commands (`ps`, `env`, `ls`, `cat`, etc.). Any other verb is rejected — the MCP server runs with your Docker socket access, so it's worth being deliberate about what you expose.

## How FastMCP works

`FastMCP` is the high-level API in the `mcp` package. The decorator pattern is intentionally minimal:

```python
@mcp.tool()
def list_containers(all: bool = False) -> str:
    """Get running Docker containers. If all=True, include stopped ones."""
    ...
```

FastMCP derives everything it needs from the Python function:
- **Tool name**: the function name (`list_containers`)
- **Description**: the docstring (shown to Claude Code when deciding which tool to call)
- **Parameters**: the type-annotated function arguments, with their own docstrings from the `Args:` block
- **Return type**: the function return type annotation

No separate schema definition, no JSON to write. The Python function is the specification.

## Register with Claude Code

Save the server to `~/.mcp/docker-inspector/server.py`, then tell Claude Code about it.

**Project-level** (only for the current repository) — add to `.claude/settings.json`:

<Snippet source="./files/settings.json" language="json" />

**Global** (available in every project) — add the same `mcpServers` block to `~/.claude/settings.json`.

Use an absolute path in `args`. A relative path resolves from where Claude Code is launched, which is unpredictable.

## Test the server manually

Before registering with Claude Code, verify the server starts without errors:

<Terminal>
python3 ~/.mcp/docker-inspector/server.py
</Terminal>

It blocks on stdin (waiting for MCP protocol messages). Press `Ctrl+C` — if it started cleanly with no import errors or syntax issues, it's ready.

<AlertBox type="tip" title="mcp dev mode">
The `mcp` package includes a development inspector: `mcp dev server.py`. It opens a local web UI where you can call each tool manually and inspect the JSON responses — useful for testing before Claude Code is involved.
</AlertBox>

## Ideas for extending the server

The `docker-inspector` server is a starting point. The same `@mcp.tool()` pattern works for anything you want to expose:

```python
@mcp.tool()
def query_database(sql: str, limit: int = 10) -> str:
    """Run a read-only SQL query against the development database."""
    # Use psycopg2 or similar — connect to localhost:5432
    ...

@mcp.tool()
def get_gitlab_pipeline_status(project_id: str) -> str:
    """Get the status of the latest GitLab CI pipeline for a project."""
    # Call the GitLab API — same idea as the ai-ci ZSH function
    ...

@mcp.tool()
def read_env_file(path: str = ".env") -> str:
    """Read a .env file and return its contents (redacting passwords)."""
    ...
```

Each new `@mcp.tool()` function appears automatically in Claude Code's tool list after a restart. No schema to update, no JSON to write.

## Under the Hood (skip this if you just want to use it)

### Security considerations

An MCP server runs with your credentials and file system access. A few principles:

- **Allowlist over blocklist**: for tools that execute commands (`exec_in_container`), explicitly list what's allowed rather than filtering what's blocked
- **No writes by default**: start with read-only tools; add write operations only when you need them and can reason about the blast radius
- **Absolute paths in settings.json**: prevents path traversal surprises
- **No network exposure**: MCP servers communicate over stdin/stdout, not a network port — they're not accessible from outside your machine

### Where MCP fits in your workflow

MCP tools complement rather than replace the ZSH functions in the <Link to="/blog/zsh-docker-functions">ZSH Docker functions</Link> article. The ZSH functions (`dex`, `dstop`, `dlogs`) are for direct interaction — you're at the terminal, you know what you want. MCP tools are for when Claude Code is reasoning about your environment as part of a larger task: debugging a problem, reviewing a `compose.yaml`, or answering a question about what's running.

The overlap is intentional: both give you fast access to Docker information, but through different surfaces (terminal vs. AI conversation).

## Conclusion

FastMCP makes writing an MCP server genuinely simple — a Python function with a docstring is all it takes to add a new tool. The `docker-inspector` server above is immediately useful; the pattern extends to any data source or command you'd otherwise have to query manually and paste into the chat.

Write the server once, register it once, and Claude Code can answer Docker questions for every project you work on.
