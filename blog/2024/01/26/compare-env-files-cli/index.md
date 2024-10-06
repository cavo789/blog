---
slug: compare-env-files-cli
title: Compare environment files in the Linux console
authors: [christophe]
image: /img/bash_tips_social_media.jpg
tags: [.env, bash, linux, sed, tips]
enableComments: true
---
![Compare environment files in the Linux console](/img/bash_tips_banner.jpg)

This is a very common source of problems using .env files: you've two or more different `.env` file like `.env` and `.env.example`.

You're a programmer and coding a new amazing feature. You're adding one or more new environment variables to your local `.env` file and everything is working fine **on your computer**.

:::danger Boum! Your feature is buggy.
A colleague copy the source code from a versioning system like Github/GitLab or, second scenario, someone will deploy the feature on a server and your feature is broken.
:::

Why? Because the variable(s) you've added have been added in **your local `.env`** file, on **your computer only**.

As you know, you have to create the variables in the `.env.example` file too but let's be honest, nobody thinks about it.

<!-- truncate -->

There are some tools that allow comparing two files like `diff` but not really the best here since:

1. We don't care about comments and empty lines. If a variable has been commented, we just need to ignore it.
2. We don't care about the position in the file where the variable is declared. If `APP_ENV = local` is on the first line, in the middle of the file or just before the last line, we don't care about it.
3. We can also ignore some variables that we know they should be different like `APP_KEY` f.i.

Let's try... Below we'll create the file `.env.example` with two lines then copy it to `.env` and just add a new line in `.env.example`. Finally, we'll sort  sort -o `.env.example` so the order will differs with `.env`.

```bash
mkdir -p /tmp/playing_env && cd $_

echo 'APP_NAME = My application' > .env.example
echo 'APP_ENV = local' >> .env.example

# Make .env and .env.example identical
cp .env.example .env

# Now just create a variable with a different value in both files
echo 'APP_KEY = 5a0678afd37f4b8d/8d9451a7381266e3' >> .env
echo 'APP_KEY = 3445118442a942d1/afd37466fadd5223' >> .env.example

# Add a new variable but only in the .env.example file
echo 'CACHE_DRIVER = redis' >> .env.example

# And sort .env.example so line ordering will differs with .env
sort -o .env.example .env.example
```

Now that we have our two files with some differences, we can run this command:

```bash
(
  clear
  ENV1=.env
  ENV2=.env.example
  printf "\e[33;1m%-63s %s\e[0;1m\n" "Left side: ${ENV1}" "Right side: ${ENV2}"
  diff --suppress-common-lines -y \
    <(grep -v -E '^#|^$' ${ENV1}| sort) \
    <(grep -v -E '^#|^$' ${ENV2} | sort) \
   | grep -v 'APP_KEY'
)
```

`diff` will compare the two files but not directly the file itself but the content of the file where we're first removed empty and commented lines and with lines sorted.

The flag `--suppress-common-lines -y` will display the result in two columns (`-y`) and only differences (`--suppress-common-lines`).

Once the `diff` is made, the command ignores the `APP_KEY` variable (in our example); so, yes, the expected result is:

```text
Left side: .env                   Right side: .env.example
                                > CACHE_DRIVER = redis
```

For the illustration, we can now add a new key but just in `.env` (real world situation: I'm coding a new feature and I add a variable like a switch on/off)

```bash
echo 'ALLOW_FEATURE_DO_THIS = true' >> .env
```

Now the output will be:

```text
Left side: .env                   Right side: .env.example
ALLOW_FEATURE_DO_THIS = true    <
                                > CACHE_DRIVER = redis
```

The column on the left represents the first file (in our example `.env`) while the column on the right is for the second file (`.env.example`).

Last sample:

```bash
echo 'DATABASE_TYPE = pgsql' >> .env
echo 'DATABASE_TYPE = mysql' >> .env.example
```

And the result of the `diff` command:

```text
Left side: .env                   Right side: .env.example
ALLOW_FEATURE_DO_THIS = true    <
DATABASE_TYPE = pgsql           | CACHE_DRIVER = redis
                                > DATABASE_TYPE = mysql
```

How to read:

* `ALLOW_FEATURE_DO_THIS` is only present in `.env`,
* `DATABASE_TYPE` is initialized to `pgsql` in `.env` and to `mysql` in `.env.example`,
* `CACHE_DRIVER` is only present in `.env.example` and
* all other lines are strictly identical (remember we've ignored commented and empty lines)
