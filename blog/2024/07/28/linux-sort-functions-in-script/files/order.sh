#!/usr/bin/env bash

clear

if [ ! $# -eq 1 ]; then
  echo "Usage: $0 <folder>"
  exit 1
fi

sourceFolder="$1"

[[ ! -d "${sourceFolder}" ]]  && echo "Error: Source folder ${sourceFolder} not found." &&  exit 1

printf "\e[37;1m%s\e[0;1m\n\n" "Check if functions declared in Bash .sh script in folder ${sourceFolder} are correctly ordered in the file."

printf "\e[33;1m%-39s %s\e[0;1m\n\n" "Left side: AS IS" "Right side: Using correct sorter"

pushd "${sourceFolder}" >/dev/null

set +e

for bashScript in *.sh; do
    result="$(diff --side-by-side --width 83 \
        <(grep -P "^(function\s+.*)\(\)" "${bashScript}" | awk '{print $2}') \
        <(grep -P "^(function\s+.*)\(\)" "${bashScript}" | awk '{print $2}' | sort))"

    if ! [[ $? -eq 0 ]]; then
        printf "\e[33;1m%s\e[0;1m\n" "The file ${bashScript} isn't correctly ordered"
        printf "\e[37;1m%s\e[0;1m\n" "${result}"
    fi
done

set -e

popd >/dev/null
