---
slug: linux-sort-functions-in-script
title: Linux - Sort functions in a Bash script
date: 2024-07-28
description: Learn how to use diff and sort in Bash to check if functions in your shell scripts are defined in alphabetical order. Includes a script to scan an entire directory.
authors: [christophe]
image: /img/v2/bash.webp
mainTag: bash
tags: [bash, introspection, linux, tips]
language: en
---
![Linux - Sort functions in a Bash script](/img/v2/bash.webp)

In a previous <Link to="/blog/linux-compare-two-versions-of-the-same-script">article</Link>, we've seen a simple CLI command to display the list of functions present in a script but what about a Bash script that will scan an entire folder; retrieve any `.sh` scripts and check if functions are sorted in the files?

<!-- truncate -->

## Create a simple Bash script to play with this blog post

Please create the `/tmp/bash/console.sh` file on your disk with this content:

<Snippet filename="/tmp/bash/console.sh" source="./files/console.sh" />

As we can see, we'll just create empty functions in no particular order.

## Get the list of functions in a Bash script

To get the list of functions declared in a script, just run the command below:

<Terminal>
$ {`grep -P "^(function\s+.*)\(\)" "/tmp/bash/console.sh" | awk '{print \$2}' | sort`}
</Terminal>

![Get the list of functions](./images/display_list_of_functions.png)

Ok, now, we know how to sort the list of functions in the console.

Let's use `diff` to compare our existing file (left-hand side) and the sorted list of functions (right-hand side):

```bash
(
  FILE=/tmp/bash/console.sh
  printf "\e[33;1m%-39s %s\e[0;1m\n" "Left side: AS IS" "Right side: Using correct sorter"
  diff --side-by-side --width 83 \
    <(grep -P "^(function\s+.*)\(\)" "${FILE}" | awk '{print $2}') \
    <(grep -P "^(function\s+.*)\(\)" "${FILE}" | awk '{print $2}' | sort)
)
```

As we can see on the image below, the column at the left show that the first-defined function in the `/tmp/bash/console.sh` script is `console::printCyan` followed by `console::askYesNo` and `console::printRed` for the third function declared (in that order) in the Bash script.

In the right column, we can see that the first, sorted, function is `console::askYesNo`, the second is `console::banner` and so on.

![Bad sorter](./images/bad_sorter.png)

Back to the left column: the name displayed in white are already in the correct order!

Let's update partially the `/tmp/bash/console.sh` file and reorder some functions:

<Snippet filename="/tmp/bash/console.sh" source="./files/console.part2.sh" />

Now, rerunning the same command:

![Almost correct](./images/almost_correct.png)

We just need to put `console::printRed()` at the end and we'll be fine and, to give some positive feedback, use this enhanced version:

```bash
(
  FILE=/tmp/bash/console.sh
  printf "\e[33;1m%-39s %s\e[0;1m\n" "Left side: AS IS" "Right side: Using correct sorter"
  diff --side-by-side --width 83 \
    <(grep -P "^(function\s+.*)\(\)" "${FILE}" | awk '{print $2}') \
    <(grep -P "^(function\s+.*)\(\)" "${FILE}" | awk '{print $2}' | sort) && printf "\n%s\n" "🎉 🎊 🕺 💃 👏 CONGRATULATIONS"
)
```

![Congratulations](./images/congratulations.png)

If you see this, perfect, functions are correctly ordered in your script.

## Process all scripts from a specific folder

We have just seen, on the command line, how to check whether a Bash script declaring functions does so in alphabetical order.

Let's move on to the industrialization of this concept: a script that will scan each .sh file in a specific folder and check whether the functions are defined in the file in alphabetical order.

If this is the case, we won't have any display so as not to pollute our console.

If this is not the case, the left-hand side of the screen shows the current order of function declarations and the right-hand side shows the expected order, sorted alphabetically.

To do this, create the `order.sh` script on your hard drive with this content:

<Snippet filename="order.sh" source="./files/order.sh" />

And now, start the script like this: `./order.sh  ~/helpers`. The expected parameter is the name of a folder containing `.sh` files.

![Running the batch script](./images/batch_script.png)

What does that means?  My `~/helpers/api.sh` script is actually (left side) really poorly sorted since there are a lot of differences with the right column (perfect ordering).

The first function in my file is `api::__injectLogsToApplicationLog` while there is a `api::__assertHttpMethod` function later in the code.

By editing my file and moving `api::__assertHttpMethod` at the top of my script, now, by rerunning the script:

![Move the assert method first](./images/api_move_assert_first.png)

Ok, so now, still at the right side, we can see `api::__debugCurlStatement` is expected in the second position, `api::__doSomeCleaning` as the third one then `api::__executeCall()` and so one (as we can see in the right side).

As soon as the `api.sh` file is correctly sorted, rerunning the script won't mention anymore the script but other ones.

![The console.sh script isn't ordered](./images/console.png)

The final objective is thus: we expect no output with the script. If all Bash scripts are correctly sorted then the `order.sh` script is no longer going to find any differences, which is in fact what we want.
