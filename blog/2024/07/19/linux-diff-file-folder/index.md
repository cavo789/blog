---
date: 2024-07-19
slug: linux-diff-file-folder
title: Linux - Comparing two folders/files in the console
authors: [christophe]
image: /img/v2/bash.webp
description: Efficiently compare two files or entire folders in Linux using the diff command. Get advanced bash scripts for industrial-level comparison.
mainTag: linux
tags: [bash, linux, tips]
---
![Linux - Comparing two folders/files in the console](/img/v2/bash.webp)

Natively, Linux has a command-line tool called `diff` for comparing two folders or files. Comparing two folders is quite simple: `diff folder_1 folder2`. And it's no more complicated for two files: `diff file_1 file2`.

However, when you want to do this in a slightly more industrialized way (launch a very large number of comparisons to compare two versions of the same project, for example), the use of a few flags and snippets comes in handy.

<!-- truncate -->

## Compare two files

Compares two files and displays only the differences. Just copy/paste the code below in your console and update the three variables you'll find in the first three lines.

The example below will check a given file (`string.sh`) located in both folder `src` and `./../another_project/src`.

<AlertBox variant="info" title="">
You can reuse this snippet for any file you want (the language didn't matters).

</AlertBox>

<Snippet filename="script.sh" source="./files/script.sh" />

## Compare two folders

Compares two folders and displays a list of files that are only in one of the two folders or where there is a difference.

<Snippet filename="script.sh" source="./files/script.part2.sh" />

This variation allows to hide the message `Only in .` i.e. when a file is present in the first folder (the `SOURCE` one) and not in the second one (the `COMPARE_WITH` one).

<Snippet filename="script.sh" source="./files/script.part3.sh" />
