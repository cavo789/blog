# syntax=docker/dockerfile:1

# n8n with one ready-to-run workflow, imported and activated at startup.
# Bump the tag during a /freshness pass.
FROM n8nio/n8n:2.46.6

COPY ci-alerts.json /demo/ci-alerts.json

ENTRYPOINT ["/bin/sh", "-c", "n8n import:workflow --input=/demo/ci-alerts.json && n8n update:workflow --id=ciAlertsDemo01 --active=true; exec n8n start"]
