---
slug: linux-inotifywait
title: Monitor number of files in a folder using inotifywait
authors: [christophe]
image: /img/linux_tips_social_media.jpg
tags: [linux, scp, sftp, ssh, sshpass, tips]
draft: true
enableComments: true
---
<!-- cspell:ignore sshpass,ssword -->

![Monitor number of files in a folder using inotifywait](/img/linux_tips_banner.jpg)

I had to run a Python script to generate PDFs. The script took a long time to run, and I had provided a progress bar, but I wanted to keep an eye on the number of PDFs created from a Linux console.

My aim was simply to do something like `ls /tmp | wc -l` to retrieve the list of files and count the number of lines and, therefore, count the number of files.

The command `ls /tmp | wc -l` does the job perfectly and displays the number, e.g. 1,500.

Now let's see how to run this command and keep it active, so that as soon as files are added, the number is updated.

<!-- truncated -->

First, make sure to install `inotifywait` if you don't have it yet. This can be done by running `sudo apt-get update && sudo apt-get install -y --no-install-recommends inotify-tools`.

:::info
You can quickly check if `inotifywait` is already installed by running `which inotifywait`. If you don't get an answer (empty response); then it's not yet there.
:::

Please now create a small script like `monitor.sh` with the content below:

```bash
#!/bin/bash

# cspell:ignore inotifywait,inotify

count=0

# Folder to monitor
folder="$1"

# Monitor the directory for changes
# -r - Recursively monitors subdirectories
# -m - Monitor file modifications

# shellcheck disable=SC2034
inotifywait -m ${folder} | while read -r line; do
    #shellcheck disable=SC2012
    if (( count != $(ls "${folder}" | wc -l) )); then

        count=$(ls "${folder}" | wc -l)

        # Clear the terminal screen
        clear

        # Count the files and display the updated count
        echo "Number of files in ${folder}: ${count}"
    fi
done
```

Make the script executable by running `chmod +x ./monitor.sh`.

You're ready to use it. Simply run `./monitor.sh` followed by the name of the folder to monitor; f.i. `./monitor.sh /tmp`.
