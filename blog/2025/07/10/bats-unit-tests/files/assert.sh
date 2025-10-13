#!/usr/bin/env bash

function assert::notEmpty() {
    local -r variable="${1:-}"
    local -r errorMessage="${2:-"The variable can't be empty."}"

    [[ -z ${variable} ]] && echo "${errorMessage}" >&2

    return 0
}

function assert::binaryExists() {
    local -r binary="${1:-}"

    assert::notEmpty "${binary}" \
        "You should specify the name of the program whose existence needs to be checked."

    if [[ -z "$(command -v "$binary" || true)" ]]; then
        echo "The ${binary} binary wasn't found on your system." >&2
        exit 1
    fi

    return 0
}
