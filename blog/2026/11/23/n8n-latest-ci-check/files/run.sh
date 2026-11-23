#!/usr/bin/env bash
set -euo pipefail

# Run an n8n workflow from the terminal, without opening the editor, and print
# what one of its nodes produced, as JSON.
#
#   ./run.sh <workflow-id>                  -> output of the "Edit Fields" node
#   ./run.sh <workflow-id> "HTTP Request"   -> output of another node
#
# Needs jq on the host. The run is listed in the Executions tab like any other.

id="${1:?Usage: ./run.sh <workflow-id> [node name]}"
node="${2:-Edit Fields}"

cd "$(dirname "$0")"

# The running instance already holds the task-runner port (5679): this
# one-off run gets its own. n8n prints a few log lines before the JSON,
# so everything before the first "{" is dropped.
docker compose exec -T -e N8N_RUNNERS_BROKER_PORT=5690 n8n \
    n8n execute --id="${id}" --rawOutput 2>/dev/null |
    sed -n '/^{/,$p' |
    jq --arg node "${node}" '.data.resultData.runData[$node][0].data.main[0][0].json'
