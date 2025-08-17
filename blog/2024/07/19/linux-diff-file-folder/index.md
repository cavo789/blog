---
slug: linux-diff-file-folder
title: Linux - Comparing two folders/files in the console
authors: [christophe]
image: /img/bash_tips_social_media.jpg
mainTag: linux
tags: [bash, linux, tips]
enableComments: true
---
![Linux - Comparing two folders/files in the console](/img/bash_tips_banner.jpg)

Natively, Linux has a command-line tool called `diff` for comparing two folders or files. Comparing two folders is quite simple: `diff folder_1 folder2`. And it's no more complicated for two files: `diff file_1 file2`.

However, when you want to do this in a slightly more industrialized way (launch a very large number of comparisons to compare two versions of the same project, for example), the use of a few flags and snippets comes in handy.

<!-- truncate -->

## Compare two files

Compares two files and displays only the differences. Just copy/paste the code below in your console and update the three variables you'll find in the first three lines.

The example below will check a given file (`string.sh`) located in both folder `src` and `./../another_project/src`.

:::info
You can reuse this snippet for any file you want (the language didn't matters).
:::

<Snippets filename="script.sh">

```bash
FILE="string.sh"
FOLDER_SOURCE="src"
FOLDER_COMPARE_WITH="./../another_project/src"

clear

[[ ! -d "${FOLDER_SOURCE}" ]] && printf "\033[1;31mThe folder %s didn't exists\033[0m\n" "${FOLDER_SOURCE}" && return 0
[[ ! -f "${FOLDER_SOURCE}/${FILE}" ]] && printf "\033[1;31mThe file %s didn't exists\033[0m\n" "${FOLDER_SOURCE}/${FILE}" && return 0
[[ ! -d "${FOLDER_COMPARE_WITH}" ]] && printf "\033[1;31mThe folder %s didn't exists\033[0m\n" "${FOLDER_COMPARE_WITH}" && return 0
[[ ! -f "${FOLDER_COMPARE_WITH}/${FILE}" ]] && printf "\033[1;31mThe file %s didn't exists\033[0m\n" "${FOLDER_COMPARE_WITH}/${FILE}" && return 0

printf "\033[1;34m%s %s %s %s\033[0m\n" "Compare" "${FOLDER_SOURCE}/${FILE}" "against" "${FOLDER_COMPARE_WITH}/${FILE}"
printf "\033[1;34m%s \033[1;31m%s \033[1;34m%s \033[1;32m%s\033[0m\n\n" "Below in red sentences from" "${FOLDER_SOURCE}/${FILE}" "and, in green, sentences from"  "${FOLDER_COMPARE_WITH}/${FILE}"

pushd "${FOLDER_SOURCE}" > /dev/null && diff --suppress-common-lines "${FILE}" "${FOLDER_COMPARE_WITH}"/"${FILE}" && echo "Congratulations, the two files are exactly the same" ; popd > /dev/null
```

</Snippets>

## Compare two folders

Compares two folders and displays a list of files that are only in one of the two folders or where there is a difference.

<Snippets filename="script.sh">

```bash
FOLDER_SOURCE="src"
FOLDER_COMPARE_WITH="./../another_project/src"

clear

[[ ! -d "${FOLDER_SOURCE}" ]] && printf "\033[1;31mThe folder %s didn't exists\033[0m\n" "${FOLDER_SOURCE}" && return 0
[[ ! -d "${FOLDER_COMPARE_WITH}" ]] && printf "\033[1;31mThe folder %s didn't exists\033[0m\n" "${FOLDER_COMPARE_WITH}" && return 0

printf "\033[1;34m%s %s %s %s\033[0m\n" "Compare folder" "${FOLDER_SOURCE}" "against" "${FOLDER_COMPARE_WITH}"

pushd "${FOLDER_SOURCE}" > /dev/null && LC_ALL=C diff --brief --ignore-blank-line . "${FOLDER_COMPARE_WITH}" ; popd > /dev/null
```

</Snippets>

This variation allows to hide the message `Only in .` i.e. when a file is present in the first folder (the `SOURCE` one) and not in the second one (the `COMPARE_WITH` one).

<Snippets filename="script.sh">

```bash
FOLDER_SOURCE="src"
FOLDER_COMPARE_WITH="./../another_project/src"

clear

[[ ! -d "${FOLDER_SOURCE}" ]] && printf "\033[1;31mThe folder %s didn't exists\033[0m\n" "${FOLDER_SOURCE}" && return 0
[[ ! -d "${FOLDER_COMPARE_WITH}" ]] && printf "\033[1;31mThe folder %s didn't exists\033[0m\n" "${FOLDER_COMPARE_WITH}" && return 0

printf "\033[1;34m%s %s %s %s\033[0m\n" "Compare folder" "${FOLDER_SOURCE}" "against" "${FOLDER_COMPARE_WITH}"

pushd "${FOLDER_SOURCE}" > /dev/null && LC_ALL=C diff --brief --ignore-blank-line . "${FOLDER_COMPARE_WITH}" | grep -v '^Only in \.' ; popd > /dev/null
```

</Snippets>
