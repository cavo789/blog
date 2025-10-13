#!/usr/bin/env sh

if [[ ! -f /data/counter.txt ]]; then
    mkdir -p /data
    echo "Creating /data/counter.txt ..."
    echo "0" > /data/counter.txt
fi

counter=$((`cat /data/counter.txt`+1))

echo "You have executed this script ${counter} times."

echo "${counter}" > /data/counter.txt
