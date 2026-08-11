---
slug: update-env-files-cli
title: Batch edit of environment file
date: 2024-01-26
description: Stop manually editing .env files! Learn how to use a simple Linux function to batch update environment variables safely for consistent deployment across all your servers.
authors: [christophe]
image: /img/v2/bash.webp
mainTag: linux
tags:
  - bash
  - docker
  - linux
language: en
review_date: 2026-07-30
---
![Batch edit of environment file](/img/v2/bash.webp)

<TLDR>
This article provides a reusable `updateEnv` Bash function that safely batch-updates `.env` files: it takes a variable name, value, and file, using `grep`/`sed` to update the variable if present or append it if not, with an optional flag to skip adding variables that don't already exist — useful for consistent multi-server deployments.
</TLDR>

When deploying a project on servers, we need to pay particular attention to the `.env` file. This file is crucial and will determine whether our application works properly (or crashes).

The normal way of doing things is to run a `git clone` command to get the latest version of the application from a repository (branch `test` for a test server, `dev` for an acceptance server, `main` for a production server).

Once cloned, the next command will be to create the `.env` file and it's done using `cp .env.example .env`.

And that's where the obligation to be meticulous begins.

<!-- truncate -->

Depending on the server (is this a test server or UAT or PROD?), settings won't be the same. We'll definitely not enable debugging on a production server, while we will on a test/UAT one. Credentials for the database f.i. will differ for each server. And so on.

So, each time the `.env` file is created, the normal way of doing things is to open it in an editor and start to make changes. And when you have to deploy several servers; you can't be 100% sure you haven't forgotten something important.

## What `updateEnv` does for you

Instead of opening an editor, you describe the target state of the file as a list of calls:

```bash
dotEnv=".env"

updateEnv "APP_DEBUG" "false" "${dotEnv}"
updateEnv "APP_ENV" "production" "${dotEnv}"
updateEnv "APP_NAME" "My application is running on production" "${dotEnv}"
updateEnv "CAN_REGISTER" "false" "${dotEnv}"
updateEnv "FORCE_HTTPS" "true" "${dotEnv}"
```

And here is what your console answers:

<Terminal typewriter source="./files/terminal-1.txt" />

Four variables have been updated and one has been added (`CAN_REGISTER`). That status column is the whole point: after a deployment you don't wonder whether a setting was applied, you read it.

## Why it works

- **`grep` decides**: the variable is searched at the start of a line, so `APP_ENV` never matches `APP_ENV_LABEL`.
- **`sed` does one of two things**: substitute the value in place when the key exists, append the line at the end of the file when it doesn't.
- **`printf` reports**: `UPDATED` or `ADDED` for each key, followed by the line as it now stands in the file — read back from the file, not from what we intended to write.

## The function

Before seeing the function, like always, just create a sample file:

<Terminal typewriter source="./files/terminal-2.txt" />

The `updateEnv` function receives three arguments: a variable name like `APP_DEBUG`, the value we wish to set (f.i. `false`), and the name of the `.env` file to update (probably `.env`). It relies on the `grep`/`sed` idiom described in <Link to="/blog/linux-sed-tips">Search and replace (or add) using sed</Link>:

```bash
(
  updateEnv() {
    variable="$1"
    newValue="$2"
    file="${3:-.env}"

    # search the variable in the file. If found, update. If not, add the entry
    grepStatus="$(grep -E -q "^${variable}\s?=" "${file}" \
      && (sed -i -r "s~${variable}(\s?)=(\s?).*~${variable}\1=\2${newValue}~" "${file}" && echo "UPDATED") \
      || (sed -i -e "\$a${variable}=${newValue}" "${file}" && echo "ADDED"))"

    # Output on the console to help the guy in front of the screen to understand
    printf "\e[33;1m%s \e[32;1m%-7s\e[0;1m %s\n" \
        ${file} "${grepStatus}" "$(grep -i -E "^${variable}\s?=" "${file}")"

    return 0
  }

  clear

  dotEnv=".env"

  updateEnv "APP_DEBUG" "false" "${dotEnv}"
  updateEnv "APP_ENV" "production" "${dotEnv}"
  updateEnv "APP_NAME" "My application is running on production" "${dotEnv}"
  updateEnv "CAN_REGISTER" "false" "${dotEnv}"
  updateEnv "FORCE_HTTPS" "true" "${dotEnv}"
)
```

Notice the surrounding `( … )`: everything runs in a subshell, so the function and the `dotEnv` variable disappear once the block has finished. Copy/paste it in your console and it just runs.

## Adding a skip boolean

This version introduces a *Should we add the variable?* flag, i.e. should we absolutely set a variable in the environment file if it's not yet there?

In the example here above, we've seen `updateEnv "APP_DEBUG" "false" "${dotEnv}"`. If `APP_DEBUG` is not yet present, the `updateEnv` function will add the variable.

And now, if we call `updateEnv "FORCE_HTTPS" "false" "${dotEnv}"`, same thing, we'll add `FORCE_HTTPS` in the file but, what if we just skip it?

```bash
(
 updateEnv() {
    variable="$1"
    newValue="$2"
    file="$3"
    add=${4:-true}

    # search the variable in the file. If found, update. If not, add the entry
    grepStatus="$(grep -E -q "^${variable}\s?=" "${file}" \
      && (sed -i -r "s~${variable}(\s?)=(\s?).*~${variable}\1=\2${newValue}~" "${file}" && echo "UPDATED") \
      || (if [ "$add" = "true" ]; then \
            sed -i -e "\$a${variable}=${newValue}" "${file}"
            echo "ADDED"
          else
            echo "SKIP"
           fi)
    )"


    # Output on the console to help the guy in front of the screen to understand
    printf "\e[33;1m%s \e[32;1m%-7s\e[0;1m %s\n" \
        ${file} "${grepStatus}" "$(grep -i -E "^${variable}\s?=" "${file}" || echo ${variable})"
  }

  clear

  dotEnv=".env"

  updateEnv "DEFAULT_CACHE" "redis" "${dotEnv}" false
  updateEnv "REDIS_HOST" "127.0.0.1" "${dotEnv}" false
)
```

Now, we've introduced a fourth argument; by default set to `true`.

The output of the previous command will be the one below. If not present, variables are not added and this is just perfect.

<Terminal typewriter>
.env SKIP    DEFAULT_CACHE
.env SKIP    REDIS_HOST
</Terminal>

## Conclusion

Deploying to a new server stops being a careful reading exercise: you keep one list of `updateEnv` calls per environment, run it right after `cp .env.example .env`, and the console tells you, key by key, what was updated, added or deliberately skipped.

The natural companion is <Link to="/blog/compare-env-files-cli">Compare environment files in the Linux console</Link>: it tells you which keys are missing, this one sets them. And to consume the result from your scripts, see <Link to="/blog/bash-load-env">Bash - Loading environment variables from a file</Link>.
