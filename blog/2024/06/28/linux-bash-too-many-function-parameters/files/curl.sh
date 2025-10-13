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
