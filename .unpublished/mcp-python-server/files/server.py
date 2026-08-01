"""
docker-inspector: an MCP server that exposes Docker information to Claude Code.

Install dependencies:
    pip install mcp

Run manually to test:
    python server.py

Register with Claude Code in .claude/settings.json:
    {
      "mcpServers": {
        "docker-inspector": {
          "command": "python3",
          "args": ["/absolute/path/to/server.py"]
        }
      }
    }
"""

import json
import subprocess
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("docker-inspector")


# ─── Helpers ──────────────────────────────────────────────────────────────────

def _run(cmd: list[str]) -> str:
    """Run a Docker command and return its stdout+stderr as a single string."""
    result = subprocess.run(cmd, capture_output=True, text=True)
    output = result.stdout.strip()
    if result.returncode != 0 and result.stderr:
        output += f"\n[stderr] {result.stderr.strip()}"
    return output or "(no output)"


# ─── Tools ────────────────────────────────────────────────────────────────────

@mcp.tool()
def list_containers(all: bool = False) -> str:
    """
    List Docker containers.

    Args:
        all: If True, include stopped containers. Default: running only.
    """
    cmd = ["docker", "ps", "--format",
           "table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}"]
    if all:
        cmd.insert(2, "-a")
    return _run(cmd)


@mcp.tool()
def get_logs(container: str, lines: int = 50) -> str:
    """
    Get recent log lines from a Docker container.

    Args:
        container: Container name or ID.
        lines: Number of log lines to return (default: 50).
    """
    return _run(["docker", "logs", "--tail", str(lines), container])


@mcp.tool()
def inspect_container(container: str) -> str:
    """
    Get key information about a Docker container: image, status, ports, env vars.

    Args:
        container: Container name or ID.
    """
    result = subprocess.run(
        ["docker", "inspect", container],
        capture_output=True, text=True
    )
    if result.returncode != 0:
        return f"Error: {result.stderr.strip()}"

    data = json.loads(result.stdout)
    if not data:
        return "Container not found."

    c = data[0]
    summary = {
        "name": c["Name"].lstrip("/"),
        "image": c["Config"]["Image"],
        "status": c["State"]["Status"],
        "started": c["State"].get("StartedAt", ""),
        "ports": c["NetworkSettings"]["Ports"],
        "env": [v for v in c["Config"]["Env"] if not v.startswith("PATH=")],
        "mounts": [
            {"source": m["Source"], "destination": m["Destination"], "mode": m["Mode"]}
            for m in c["Mounts"]
        ],
    }
    return json.dumps(summary, indent=2)


@mcp.tool()
def list_images() -> str:
    """List all local Docker images with their size."""
    return _run(["docker", "images",
                 "--format", "table {{.Repository}}:{{.Tag}}\t{{.Size}}\t{{.CreatedSince}}"])


@mcp.tool()
def compose_services(project_path: str = ".") -> str:
    """
    List services defined in a Docker Compose project.

    Args:
        project_path: Path to the directory containing compose.yaml (default: current directory).
    """
    return _run(["docker", "compose", "-f", f"{project_path}/compose.yaml", "config", "--services"])


@mcp.tool()
def exec_in_container(container: str, command: str) -> str:
    """
    Run a read-only diagnostic command inside a running container.
    Restricted to: ps, env, ls, cat, df, free, uname, id, whoami, pwd.

    Args:
        container: Container name or ID.
        command: The command to run (e.g. "env", "ls /app", "cat /etc/os-release").
    """
    # Allowlist: only read-only diagnostic commands
    allowed_verbs = {"ps", "env", "ls", "cat", "df", "free", "uname", "id", "whoami", "pwd"}
    verb = command.strip().split()[0]
    if verb not in allowed_verbs:
        return (
            f"Command '{verb}' is not allowed. "
            f"Permitted commands: {', '.join(sorted(allowed_verbs))}"
        )
    return _run(["docker", "exec", container] + command.split())


# ─── Entry point ──────────────────────────────────────────────────────────────

if __name__ == "__main__":
    mcp.run()
