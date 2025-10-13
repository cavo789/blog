#!/usr/bin/env bash

GRAY=30
GREEN=32
RED=31

clear

printf "\e[1;33m%s\e[0m\n\n" "Docker containers - Health check"

docker container list --all --format "{{.Names}}" | while read -r name; do
    healthcheckStatus=$(docker inspect --format='{{json .State.Health}}' $name | jq -r '.Status')

    # Default color
    COLOR=${GRAY}

    if [[ "$healthcheckStatus" == "healthy" ]]; then
        COLOR=${GREEN}
        healthcheckStatus="${healthcheckStatus}"
    elif [[ ! "$healthcheckStatus" == "null" ]]; then
        COLOR=${RED}
    fi

    printf "%-40s\e[1;${COLOR}m%s\e[0m\n" "$name" "$healthcheckStatus"
done
