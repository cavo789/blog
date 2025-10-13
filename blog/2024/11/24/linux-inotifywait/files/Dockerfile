# syntax=docker/dockerfile:1

FROM python:3.10-slim AS base

# The /app/out folder where we'll create files
RUN mkdir -p /app/out

# The /app/src where we'll put our Python script
WORKDIR "/app/src"

# Keep the container running
ENTRYPOINT ["tail", "-f", "/dev/null"]
