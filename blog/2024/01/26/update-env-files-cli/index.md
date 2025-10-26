---
slug: update-env-files-cli
title: Batch edit of environment file
date: 2024-01-26
description: Stop manually editing .env files! Learn how to use a simple Linux function to batch update environment variables safely for consistent deployment across all your servers.
authors: [christophe]
image: /img/v2/bash.webp
mainTag: linux
tags: [.env, bash, linux, sed, tips]
language: en
---
![Batch edit of environment file](/img/v2/bash.webp)

When deploying a project on servers, we need to pay particular attention to the `.env` file. This file is crucial and will determine whether our application works properly (or crashes).

The normal way of doing things is to run a `git clone` command to get the latest version of the application from a repository (branch `test` for a test server, `dev` for an acceptance server, `main` for a production server).

Once cloned, the next command will be to create the `.env` file and it's done using `cp .env.example .env`.

And that's where the obligation to be meticulous begins.

<!-- truncate -->

Depending on the server (is this a test server or UAt or PROD?), settings won't be the same. We'll for sure not enable debugging on a production one while we'll for a test / uat server. Credentials for the database f.i. will differ for each server. And so on.

So, each time the `.env` file is created, the normal way of doing things is to open it in an editor and start to make changes.

And when you have to deploy several servers; you can't be 100% sure you haven't forgotten something important.

Below a Linux function that can help. You can just copy/paste it in your console and run it but first, let's take a look on it.

The `updateEnv` function will receive three arguments.

* A variable name like `APP_DEBUG`,
* The value was wish to set in the file f.i. `false`
* And the name of the `.env` file to update (probably `.env`)

The function will use `grep` and `sed` (see my <Link to="/blog/linux-sed-tips">Search and replace (or add) using sed</Link> article to learn more) to update the variable or add it to the file.

Then `printf` will echo the new value on the screen, just for debugging / control process.

Finally, the function is called like this: `updateEnv "APP_DEBUG" "false" ".env"`.

Before seeing the function, like always, just create a sample file:

<Terminal>
$ mkdir -p /tmp/playing_env && cd $_
$ echo 'APP_ENV = local' > .env
$ echo 'APP_DEBUG = true' >> .env
$ echo 'APP_KEY = 3445118442a942d1/afd37466fadd5223' >> .env
$ echo 'APP_NAME = My application' >> .env
$ echo 'CACHE_DRIVER = redis' >> .env
$ echo 'DATABASE_TYPE = mysql' >> .env
$ echo 'FORCE_HTTPS = false' >> .env
</Terminal>

Now, we can run in our console:

```bash
(
  updateEnv() {
    variable="$1"
    newValue="$2"
    file="${3:-.env}"

    # search the variable in the file. If found, update. It not, add the entry
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

The output will be, for this example:

<Terminal>
.env UPDATED APP_DEBUG = false
.env UPDATED APP_ENV = production
.env UPDATED APP_NAME = My application is running on production
.env ADDED   CAN_REGISTER=false
.env UPDATED FORCE_HTTPS = true
</Terminal>

We can see fourth variables have been updated and one has been added (`CAN_REGISTER`).

## Adding a skip boolean

This version introduce a *Should we add the variable?* flag i.e. should we absolutely set a variable in the environment file if not yet there?

In the example here above, we've seen `updateEnv "APP_DEBUG" "false" "${dotEnv}"`. In case of `APP_DEBUG` is not yet present, the `updateEnv` function will add the variable.

And now, if we call `updateEnv "FORCE_HTTPS" "false" "${dotEnv}"`, same thing, we'll add `FORCE_HTTPS` in the file but, what if we just skip it?

```bash
(
 updateEnv() {
    variable="$1"
    newValue="$2"
    file="$3"
    add=${4:-true}

    # search the variable in the file. If found, update. It not, add the entry
    grepStatus="$(grep -E -q "^${variable}\s?=" "${file}" \
      && (sed -i -r "s~${variable}(\s?)=(\s?).*~${variable}\1=\2${newValue}~" "${file}" && echo "UPDATED") \
      || (if ( $add -eq true ); then \
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

<Terminal>
.env SKIP    DEFAULT_CACHE
.env SKIP    REDIS_HOST
</Terminal>