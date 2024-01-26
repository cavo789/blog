---
slug: update-env-files-cli
title: Batch edit of environment file
authors: [christophe]
image: /img/bash_tips_social_media.jpg
tags: [.env, bash, linux, sed, tips]
enableComments: true
---
# Batch edit of environment file

![Batch edit of environment file](/img/bash_tips_header.jpg)

When deploying a project on servers, we need to pay particular attention to the `.env` file. This file is crucial and will determine whether our application works properly (or crashes).

The normal way of doing things is to run a `git clone` command to get the latest version of the application from a repository (branch `test` for a test server, `dev` for an acceptance server, `main` for a production server).

Once cloned, the next command will be to create the `.env` file and it's done using `cp .env.example .env`.

And that's where the obligation to be meticulous begins.

<!-- truncate -->

Depending on the server (is this a test server or UAt or PROD?), settings won't be the same. We'll for sure not enable debugging on a production one while we'll for a test / uat server. Credentials for the database f.i. will differs for each server. And so on.

So, each time the `.env` file is created, the normal way of doing things is to open it in an editor and start to make changes.

And when you have to deploy several servers; you can't be 100% sure you haven't forgotten something important.

Below a Linux function that can help. You can just copy/paste it in your console and run it but first, let's take a look on it.

The `updateEnv` function will receive three arguments.

* A variable name like `APP_DEBUG`,
* The value was wish to set in the file f.i. `false`
* And the name of the `.env` file to update (probably `.env`)

The function will use `grep` and `sed` (see my [Search and replace (or add) using sed](/blog/linux-sed-tips) article to learn more) to update the variable or add it to the file.

Then `printf` will echo the new value on screen, just for debugging / control process.

Finally the function is called like this: `updateEnv "APP_DEBUG" "false" ".env"`.

Below an example with a few variables:

```bash
(
  updateEnv() {
    variable="$1"
    newValue="$2"
    file="$3"

    # search the variable in the file. If found, update. It not, add the entry
    grep -E -q "^${variable}\s?=" "${file}" \
      && sed -i -r "s~${variable}(\s?)=(\s?).*~${variable}\1=\2${newValue}~" "${file}" \
      || sed -i -e "\$a${variable}=${newValue}" "${file}"

    # Output on the console to help the guy in front of the screen to understand
    printf "\e[33;1m%s \e[0;1m %s\n" ${file} "$(grep -i "^${variable}" "${file}")"

    return 0
  }

  clear

  updateEnv "APP_DEBUG" "false" ".env"
  updateEnv "CACHE_DURATION_IN_SECONDS" "86400" ".env"
  updateEnv "DEFAULT_CACHE_DRIVER" "redis" ".env"
  updateEnv "CAN_REGISTER" "false" ".env"
  updateEnv "FORCE_HTTPS" "true" ".env"
  updateEnv "REDIS_HOST" "127.0.0.1" ".env"
  updateEnv "REDIS_PORT" "6789" ".env"
  updateEnv "TIMEZONE" "Europe/Brussels" ".env"
)
```

This example can be used as a skeleton for much more complex code, with more variables and conditions depending on your target environment (`APP_DEBUG` would be set to `true` for test servers and `false` for production ones).
