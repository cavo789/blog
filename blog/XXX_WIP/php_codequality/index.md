---
slug: php-code-quality
title: PHP - Code Quality tools
authors: [christophe]
image: ./images/social_media.jpg
tags: [code quality, docker, php]
draft: true
enableComments: true
---
# PHP - Code Quality tools

![PHP - Code Quality tools](./images/header.jpg)

Most programming languages allow you to write code in different ways to achieve the same result.

For instance, both syntax are perfectly correct under PHP:

```php
$array = array( 
    "One" => "Un", 
    "Two" => "Deux", 
); 
```

```php
$array = [ 
    "One" => "Un", 
    "Two" => "Deux", 
]; 
```

Which one to choice? **And what will happens if you're working with other developers and they don't use the same syntax than yours?**

<!-- truncate -->

In the world of PHP, we've a lot of static code quality tools. [PHP_CodeSniffer](https://github.com/squizlabs/PHP_CodeSniffer) is one of them.

PHP_CodeSniffer (in short, `phpcs`) is in fact two tools in one:

* `phpcbf`
* `phpcs`

## PHP Code Beautifier

`phpcbf` stands for `PHP Code Beautifier` and will analyze your php files and will detect violations. A violation is a syntax that does not comply with the defined standards. We'll see later.

`phpcbf` will detect violations, but even better, for the most of them, `phpcbf` will fix them.

## PHP Code Sniffer

`phpcs` stands for `PHP Code Sniffer` and will also analyze your files and will report errors on the console. You'll then need to handle them by hand.

## Rules

As said earlier, tools needs to learn what is your standards. You can define them for you or just reuse existing ones.

Let's say: you're coding something like a plugin for the Joomla CMS. So, the question would be *Are there rules shared by the Joomla community?* and the answer is yes. You can read the post on [https://docs.joomla.org/Joomla_CodeSniffer](https://docs.joomla.org/Joomla_CodeSniffer) and the rules can be retrieved on Github: [Joomla rules](https://github.com/joomla/coding-standards/blob/master/Joomla/ruleset.xml).

## Pratical example

If you already have a PHP project on your disk, please skip the next chapter.

### You don't have any PHP project on your disk

Open your console and create a new folder like `mkdir /tmp/phpcs && cd $_`.

For the example, we'll use an existing Joomla project we can found on Github: [https://github.com/woluweb/plg_task_resethits](https://github.com/woluweb/plg_task_resethits).

We'll clone it in our console, to do this, we'll run `git clone https://github.com/woluweb/plg_task_resethits.git .` (the final dot is to clone the repo without creating a subfolder called `plg_task_resethits`).

```bash
❯ git clone https://github.com/woluweb/plg_task_resethits.git .
Cloning into '.'...
remote: Enumerating objects: 18, done.
remote: Counting objects: 100% (18/18), done.
remote: Compressing objects: 100% (13/13), done.
remote: Total 18 (delta 1), reused 0 (delta 0), pack-reused 0
Receiving objects: 100% (18/18), 5.30 KiB | 5.30 MiB/s, done.
Resolving deltas: 100% (1/1), done.

❯ ls -alh
total 48K
drwxr-xr-x  7 christophe christophe 4.0K Dec  6 12:48 .
drwxrwxrwt 32 root       root        12K Dec  6 12:48 ..
drwxr-xr-x  8 christophe christophe 4.0K Dec  6 12:48 .git
-rw-r--r--  1 christophe christophe 1.1K Dec  6 12:48 LICENSE
-rw-r--r--  1 christophe christophe   97 Dec  6 12:48 README.md
drwxr-xr-x  2 christophe christophe 4.0K Dec  6 12:48 forms
drwxr-xr-x  3 christophe christophe 4.0K Dec  6 12:48 language
-rw-r--r--  1 christophe christophe  842 Dec  6 12:48 resethits.xml
drwxr-xr-x  2 christophe christophe 4.0K Dec  6 12:48 services
drwxr-xr-x  3 christophe christophe 4.0K Dec  6 12:48 src
```

So, ok, we've a PHP project, we can start with PHP CodeSniffer.

### You already have a PHP project on your disk

In this case, please open your console and jump in that folder like `cd ~/myproject`.

### Download a predefined ruleset

Let's suppose your project is a Joomla one so we will download the Joomla ruleset file. The easiest way to do this is by running `curl https://raw.githubusercontent.com/joomla/coding-standards/master/Joomla/ruleset.xml -o ruleset.xml`. This will create the `ruleset.xml` file in your current directory.

```bash
❯ ls -alh ruleset.xml
-rw-r--r--  1 christophe christophe  40K Dec  6 12:50 ruleset.xml
```

:::information You can also download it by hand
Please go to [Joomla rules](https://github.com/joomla/coding-standards/blob/master/Joomla/ruleset.xml) and save the file on your disk.
:::

### We're ready

The instruction to run is `docker run -i --rm -v ${PWD}:/project -w /project -u $(id -u):$(id -g) jakzal/phpqa:1.79.2-php8.1 phpcbf --standard=ruleset.xml .`

```bash
❯ docker run -i --rm -v ${PWD}:/project -w /project -u $(id -u):$(id -g) jakzal/phpqa:1.79.2-php8.1 phpcbf --standard=ruleset.xml .
FF 2 / 2 (100%)

PHPCBF RESULT SUMMARY
----------------------------------------------------------------------
FILE                                                  FIXED  REMAINING
----------------------------------------------------------------------
/project/src/Extension/Resethits.php                  88     0
/project/services/provider.php                        21     0
----------------------------------------------------------------------
A TOTAL OF 109 ERRORS WERE FIXED IN 2 FILES
----------------------------------------------------------------------

Time: 287ms; Memory: 8MB
```

:::caution Don't pay attention to the figures
They will indeed depends on the version of the files and this can vary in time.
:::

Oh nice, so there were 88 violations in the `Resethits.php` file and 21 in `provider.php` and none remains.
