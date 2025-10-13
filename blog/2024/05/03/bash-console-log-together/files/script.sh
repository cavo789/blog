#!/usr/bin/env bash

declare -r command="ls -alhR /tmp"

declare -r LOGFILE="/tmp/test.log"
touch "${LOGFILE}"

function log::write() {
    printf '[%s] %s%s\n' "$(date +"%Y-%m-%dT%H:%M:%S%z")" "${line}" >>"${LOGFILE}"
    return 0
}

eval "${command}" |
    while IFS= read -r line; do
        echo "${line}"          # Output on the console (stdout)
        log::write "${line}"    # And append in the log file
    done
