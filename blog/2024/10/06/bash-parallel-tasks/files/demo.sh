#!/bin/bash

function demo {
    echo "Sleeping for 3 seconds..."
    sleep 3
    return 0
}

function main {
    for i in {1..10}; do
        demo
    done
}

start_time=$(date +%s)
main
end_time=$(date +%s)
total_time=$((end_time - start_time))
echo "Total running time: $total_time seconds"
