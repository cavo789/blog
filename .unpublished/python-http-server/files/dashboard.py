"""A small Docker dashboard, using nothing but the Python standard library."""

import html
import http.client
import json
import shutil
import socket
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import parse_qs, quote, urlparse

DOCKER_SOCKET = "/var/run/docker.sock"
PAGE = """<!doctype html>
<html lang="en">
<meta charset="utf-8">
<meta http-equiv="refresh" content="10">
<title>{running}/{total} containers running</title>
<style>
  body {{ font: 16px system-ui; max-width: 900px; margin: 2rem auto; padding: 0 1rem; }}
  table {{ width: 100%; border-collapse: collapse; }}
  th, td {{ text-align: left; padding: .5rem; border-bottom: 1px solid #ddd; }}
  .running {{ color: #0a7d32; font-weight: 600; }}
  .other {{ color: #b3261e; font-weight: 600; }}
</style>
<h1>{running}/{total} containers running</h1>
<p>Disk: {used} GB used, {free} GB free. This page refreshes every 10 seconds.</p>
<table>
  <tr><th>Name</th><th>Image</th><th>State</th><th>Status</th></tr>
  {rows}
</table>
"""


class DockerConnection(http.client.HTTPConnection):
    """An HTTP connection that goes through Docker's Unix socket."""

    def connect(self) -> None:
        self.sock = socket.socket(socket.AF_UNIX)
        self.sock.connect(DOCKER_SOCKET)


def list_containers(project: str | None) -> list[dict]:
    path = "/containers/json?all=true"
    if project:
        filters = json.dumps({"label": [f"com.docker.compose.project={project}"]})
        path += f"&filters={quote(filters)}"
    connection = DockerConnection("localhost")
    connection.request("GET", path)
    return json.load(connection.getresponse())


def table_row(container: dict) -> str:
    state = container["State"]
    css = "running" if state == "running" else "other"
    cells = (container["Names"][0].lstrip("/"), container["Image"])
    name, image = (html.escape(cell) for cell in cells)
    status = html.escape(container["Status"])
    return (
        f"<tr><td>{name}</td><td>{image}</td>"
        f'<td class="{css}">{html.escape(state)}</td><td>{status}</td></tr>'
    )


class Dashboard(BaseHTTPRequestHandler):
    def do_GET(self) -> None:
        url = urlparse(self.path)
        if url.path != "/":
            self.send_error(404)
            return

        project = parse_qs(url.query).get("project", [None])[0]
        containers = list_containers(project)
        running = [c for c in containers if c["State"] == "running"]
        disk = shutil.disk_usage("/")
        body = PAGE.format(
            running=len(running),
            total=len(containers),
            used=disk.used // 1024**3,
            free=disk.free // 1024**3,
            rows="\n".join(table_row(c) for c in containers),
        ).encode()

        self.send_response(200)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)


if __name__ == "__main__":
    print("Dashboard on port 8000", flush=True)
    ThreadingHTTPServer(("0.0.0.0", 8000), Dashboard).serve_forever()
