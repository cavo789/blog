#!/bin/bash

function demo {
    echo "Progress=$1"
    sleep 0.1
    return 0
}

function main {
    for i in {1..50}; do
        demo $i
    done
}

source "progress_bar.sh"

main > >(progress_bar::process "Doing some stuff" 50)
