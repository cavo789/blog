#!/bin/bash

# cspell:ignore inotifywait,inotify

count=0

# Folder to monitor
folder="$1"

# Monitor the directory for changes
# -r - Recursively monitors subdirectories
# -m - Monitor file modifications

# shellcheck disable=SC2034
inotifywait -m ${folder} | while read -r line; do
    #shellcheck disable=SC2012
    if (( count != $(ls "${folder}" | wc -l) )); then

        count=$(ls "${folder}" | wc -l)

        # Clear the terminal screen
        clear

        # Count the files and display the updated count
        echo "Number of files in ${folder}: ${count}"
    fi
done
