---
slug: linux-sed-tips
title: Search and replace (or add) using sed
date: 2024-01-25
description: Master Linux sed for dynamic file editing. Learn how to search and replace an existing variable or seamlessly add a new line if the variable is not found in your configuration file.
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
![Search and replace (or add) using sed](/img/v2/bash.webp)

<TLDR>
This article explains how to use `sed` to update a variable in a config/`.env` file when it already exists, and combine it with `grep -q` to append the variable instead when it's missing — giving a single reliable "search and replace, or insert" pattern for scripted file edits.
</TLDR>

Today, I was facing (once more) the following need: I need to update a setting in a text file but if the variable is not yet present, I need to add it.

So, in short, I need to make a *search and replace or insert new line*.

Using `sed` it's quite easy to automate the search & replace but how to append?

<!-- truncate -->

## The one-liner

Here it is — update `APP_ENV` if the key is there, append it if it isn't:

<Terminal typewriter>
$ echo 'APP_NAME = My application' > .env
$ grep -q "^APP_ENV =" .env \
    && sed -i "s/APP_ENV =.*/APP_ENV = production/" .env \
    || sed -i -e '$aAPP_ENV = production' .env
</Terminal>

The `.env` file only contained `APP_NAME`, so the key has been appended. Let's read the file back:

<Terminal typewriter>
$ cat .env

APP_NAME = My application
APP_ENV = production
</Terminal>

Run the very same block again — or against a file where `APP_ENV` already exists — and the line is substituted instead of duplicated. That's the whole idea: the command is idempotent, you can run it in a deployment script without checking anything first.

## Why it works

- **`grep -q` tests without printing.** `-q` means quiet: it produces no output, only an exit code, which is exactly what a conditional needs.
- **`&&` is the "found" branch.** The key exists → substitute the value in place.
- **`||` is the "missing" branch.** The key doesn't exist → append a new line at the end of the file.

You'll find a lot of other possibilities on the Internet, some using only the `sed` instruction, but ... can you read them? I prefer this approach, perhaps not the *native one* but, yeah, I can read it.

The rest of this article builds the command piece by piece, if you want to understand each half before using it.

## Search and replace

Imagine a `.env` file with just one line (<Link to="/blog/bash-load-env">which your Bash script can then load as real environment variables</Link>), like f.i.:

<Terminal typewriter>
$ echo 'APP_ENV = local' > .env
</Terminal>

I can update `APP_ENV` f.i. using:

<Terminal typewriter>
$ sed -i "s/APP_ENV =.*/APP_ENV = production/" .env
</Terminal>

Easy no? The `s` in the command is for `substitute` (replace) and the used delimiter is `/`. So, `sed` will search for `APP_ENV =.*` and if found, will replace with `APP_ENV = production`. The `-i` flag means that the new content (after replacement) has to be rewritten in the file.

## Don't replace but add if not found

But what if `APP_ENV` is not present at all in the file?

Of course, by running `sed -i "s/APP_ENV =.*/APP_ENV = production/" .env` nothing will happen (you can verify with `cat .env`).

Before seeing how to do, run the following block and you'll get a `NOT FOUND` message.

<Terminal typewriter>
$ echo 'APP_NAME = My application' > .env

$ grep -q "^APP_ENV =" .env && echo "FOUND" || echo "NOT FOUND"

</Terminal>

So if `grep -q` is successful (we've retrieved `APP_ENV` in the file) then we continue (`&&`) and display `FOUND` otherwise (`||`) we'll display `NOT FOUND`.

`&&` means that the previous command is successful (i.e. has been retrieved by `grep`) and `||` means not successful (not retrieved).

So, the next example will now display `FOUND`.

<Terminal typewriter>
$ echo 'APP_NAME = My application' > .env
$ echo 'APP_ENV = local' >> .env
$ grep -q "^APP_ENV =" .env && echo "FOUND" || echo "NOT FOUND"
</Terminal>

The *insert a new line* command is this one: `sed -i -e '$aAPP_ENV = production' .env`. The `-e` argument allows you to execute a script and it's quite strange but the script is `$a`. That command is for *append line*. And now you've understood that sed will here add a new line in the file.

## Combine both

Ok, first we can plug the replace statement into the `&&` branch:

<Terminal typewriter source="./files/terminal-1.txt" />

`APP_ENV` was there, so it has been substituted: running `cat .env` gives, as expected, `APP_ENV = production`.

And the next block will still display `NOT FOUND`, because this time the key is missing:

<Terminal typewriter>
$ echo 'APP_NAME = My application' > .env
$ grep -q "^APP_ENV =" .env \
    && sed -i "s/APP_ENV =.*/APP_ENV = production/" .env \
    || echo "NOT FOUND"
</Terminal>

Replace that `echo "NOT FOUND"` with the *append* command seen above and you get the one-liner shown at the top of this article. Both halves are now in place.

## Conclusion

`grep -q` for the test, `&&` for substitute, `||` for append: three pieces you can read out loud, in a single command that behaves the same whether the key is already there or not. It's the kind of line you end up pasting into every deployment script.

This pattern is the building block of <Link to="/blog/update-env-files-cli">Batch edit of environment file</Link>, where the same logic becomes a reusable function that reports `UPDATED` or `ADDED` for every key it touches.
