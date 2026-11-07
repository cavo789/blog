# syntax=docker/dockerfile:1

# Python alone: no pip install, no framework.
FROM python:3.14-slim

WORKDIR /site

COPY <<'HTML' index.html
<!doctype html>
<html lang="en">
<meta charset="utf-8">
<title>Hello</title>
<h1>Hello from Python's built-in web server</h1>
<p>No framework, no Nginx: this is a plain HTML file.</p>
HTML

COPY dashboard.py /app/dashboard.py

EXPOSE 8000
CMD ["python", "-m", "http.server", "8000", "--bind", "0.0.0.0"]
