#!/usr/bin/env bash

clear

if [ ! $# -eq 2 ]; then
  echo "Usage: $0 <folder_1> <folder_2>"
  exit 1
fi

sourceFolder="$1"
compareWithFolder="$2"

[[ ! -d "${sourceFolder}" ]]      && echo "Error: Source folder ${sourceFolder} not found." &&  exit 1
[[ ! -d "${compareWithFolder}" ]] && echo "Error: CompareWith folder ${compareWithFolder} not found." &&  exit 1

pushd "${sourceFolder}" >/dev/null

printf "\e[37;1m%s\e[0;1m\n\n" "Compare .sh scripts and detects functions that are in one of the files but not in the other between these two folders:"
printf "\e[37;1m%s\e[0;1m\n" "LEFT SIDE  = ${sourceFolder}"
printf "\e[37;1m%s\e[0;1m\n\n" "RIGHT SIDE = ${compareWithFolder}"

printf "\e[37;1m%s\e[0;1m\n\n" "Legend:"
printf "\e[37;1m1/ \e[34;1m%s\e[0;1m\n" "name1           <"
printf "\e[37;1m\t%s\e[0;1m\n\n" "That function only exist in the first file; not in the second one"

printf "\e[37;1m2/ \e[34;1m%s\e[0;1m\n" "name1           | name2"
printf "\e[37;1m\t%s\e[0;1m\n\n" "The function name1 only exists in the first file and name2 only exists in the second file"

printf "\e[37;1m3/ \e[34;1m%s\e[0;1m\n" "                > name2"
printf "\e[37;1m\t%s\e[0;1m\n\n" "The function name2 only exists in the second file"

printf "\e[41;1m%s\e[0;1m\n" "Warning: this script checks whether a function is present in one of the files and not in the other,"
printf "\e[41;1m%s\e[0;1m\n" "but does not check whether the function code is identical. It just checks whether it is present or not."

for bashScript in *.sh; do
    if [[ -f "${compareWithFolder}/${bashScript}" ]]; then
        (
            FILE1="${sourceFolder}/${bashScript}"
            FILE2="${compareWithFolder}/${bashScript}"
            printf "\e[32;1m%s\e[0;1m\n" "File ${bashScript}"
            diff --suppress-common-lines --side-by-side --width 83 \
                <(grep -P "^(function\s+.*)\(\)" "${FILE1}" | awk '{print $2}' | sort) \
                <(grep -P "^(function\s+.*)\(\)" "${FILE2}" | awk '{print $2}' | sort) && \
            printf "\e[32;1m%s\e[0;1m\n"  "The two files are identical"
        )
    fi
done

popd >/dev/null
