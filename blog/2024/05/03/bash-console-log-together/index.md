---
date: 2024-05-03
slug: bash-console-log-together
title: Bash - Echo on the console and in a logfile in the same time
authors: [christophe]
image: /img/v2/bash.jpg
tags: [bash, tips]
mainTag: bash
---
![Bash - Echo on the console and in a logfile in the same time](/img/v2/bash.jpg)

In my previous article <Link to="/blog/bash-logging">Bash - Script to add logging features to your script</Link>, I've shared a way to write information in a logfile.

By running `ls -alh /tmp` you will get the list of all files in the `/tmp` folder and display the list on your console. By running `ls -alh /tmp >> application.log` you won't see the list in your console since everything will be written in the `application.log` file.

How can we display the output of a command like `ls` f.i. both on the console and in a logfile?

<!-- truncate -->

For example, let's get the list of all files below `/tmp` and this recursively. For this, our command will be `ls -alhR /tmp`.

This command will probably take time to run and this is the objective: run a long command and make sure our user will see the output on the screen so he knows that the script is doing something and, too, to redirect the output to a log file for further analysis in case of f.i. problems (or just because the script is fired in a cron).

<Snippet filename="script.sh">

```bash
#!/usr/bin/env bash

declare -r command="ls -alhR /tmp"

declare -r LOGFILE="/tmp/test.log"
touch "${LOGFILE}"

function log::write() {
    printf '[%s] %s%s\n' "$(date +"%Y-%m-%dT%H:%M:%S%z")" "${line}" >>"${LOGFILE}"
    return 0
}

eval "${command}" |
    while IFS= read -r line; do
        echo "${line}"          # Output on the console (stdout)
        log::write "${line}"    # And append in the log file
    done
```

</Snippet>

The main part is the `eval` function.

The command (`ls -alhR /tmp`) will be fired and, for every single line, we'll `echo` the line on the screen and, also, redirect it in a text file.

The example below does almost the same thing i.e., it executes a command and displays it both in a file and on the console but ... as you can see, the command will be run and everything will be redirected to the file so, during seconds, the user will have no screen output and can think that the script is blocking. Then, once the command has successfully finished, and only then, the log file will be displayed, in a block, on the console.

<Snippet filename="script.sh">

```bash
#!/usr/bin/env bash

declare -r command="ls -alhR /tmp"
declare -r LOGFILE="/tmp/test.log"

eval "${command}" > "${LOGFILE}"
cat "${LOGFILE}"
```

</Snippet>

Don't do things like that!
