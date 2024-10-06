---
slug: linux-bash-too-many-function-parameters
title: Clean code - Linux Bash - Keep the number of function parameters as small as possible
authors: [christophe]
image: /img/bash_tips_social_media.jpg
tags: [code quality, linux, tips]
enableComments: true
---
![Clean code - Linux Bash - Keep the number of function parameters as small as possible](/img/bash_tips_banner.jpg)

A concept of the clean code approach is to avoid too many function parameter (I would say that four parameters is already too many).

When you're programming in a language more advanced than Linux Bash, it's easy to get round the problem. For example, in PHP, if I need to call a function and pass it several parameters, I'll create an object that will be my only parameter and that object will then have several properties.

So, for instance, if I need to pass data such as a surname, first name, date of birth, gender, etc., I'll create a `person` object, define my properties and voilà, I've only got one parameter to pass to my function. In most cases, it'll be a very nice solution.

But how do you do it in Linux Bash? It's impossible to pass an object... so I'm going to pass it an associative array.

<!-- truncate -->

The trick, for a Bash script, is to define an associative array (created with the command `declare -A arr=()`) and pass this array as a parameter to the function.

Below is an example:

```bash
#!/usr/bin/env bash

# let script exit if an unused variable is used or if a command fails
set -o nounset
set -o errexit

function runCurl() {
    local -n arrCall=$1

    # The endpoint (the URL to request) is mandatory
    local -r endpoint="${arrCall["endpoint"]}"

    # The other properties are optional; initialize to an empty string or any other default values
    [[ ! -v arrCall[header] ]]  && local -r header=""    || local -r header="${ arrCall["header"]}"
    [[ ! -v arrCall[method] ]]  && local -r method="GET" || local -r method="${arrCall["method"]}"
    [[ ! -v arrCall[payload] ]] && local -r payload=""   || local -r payload="${arrCall["payload"]}"
    [[ ! -v arrCall[proxy] ]]   && local -r proxy=""     || local -r proxy="${arrCall["proxy"]}"
    [[ ! -v arrCall[token] ]]   && local -r token=""     || local -r token="${arrCall["token"]}"

    # And now I can work with my multiple variables exactly as I would have done if I'd passed them all as parameters.
    #    
    # Here is an example:

    cmd="curl -X ${method} ${endpoint} --no-progress-meter"

    [[ -n ${payload} ]] && cmd="${cmd} --data ${payload}"
    [[ -n ${header} ]]  && cmd="${cmd} --header ${header}"
    [[ -n ${token} ]]   && cmd="${cmd} ${token}"
    [[ -n ${proxy} ]]   && cmd="${cmd} --proxy ${proxy}" 

    json="$(eval "${cmd}")"

    if [[ $? -ne 0 ]]; then
        echo "CURL has failed"
        exit 1
    fi

    echo "${json}"

    return 0
}

declare -A arr=(
   [endpoint]=https://jsonplaceholder.typicode.com/todos/5
   [token]="--header 'Authorization:Bearer ABCDEF'"
)

# As you know, when using variables you should use the syntax like ${variable}
# But, here below, no. We're passing our array and we should not use the `$`
runCurl arr
```

One of the big advantages is that you don't have to worry about the position of the arguments (ah yes, so the first parameter is the url, the second is the HTTP method, the third is, er? the proxy? ah no, damn).

New parameters can also be created in the future without affecting existing scripts in any way.

Everything is much cleaner using an associative array and more robust too.
