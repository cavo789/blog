#!/usr/bin/env bash
set -euo pipefail

declare -r command="ls -alhR /tmp"
declare -r LOGFILE="/tmp/test.log"

eval "${command}" > "${LOGFILE}"
cat "${LOGFILE}"
