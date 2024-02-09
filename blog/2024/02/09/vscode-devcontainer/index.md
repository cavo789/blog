---
slug: vscode-devcontainer
title: PHP development in a devcontainer with preinstalled code quality tools
authors: [christophe]
image: ./images/devcontainer_social_media.jpg
tags: [code-quality, composer, devcontainer, docker, intelephense, php, php-cs-fixer, phpcs, phpcbf, rector, vscode]
enableComments: true
---
# PHP development in a devcontainer with preinstalled code quality tools

![PHP development in a devcontainer with preinstalled code quality tools](./images/devcontainer_banner.jpg)

Let's imagine the following situation: you are working with several people on the same PHP project and you notice that one or other person does not comply with your quality criteria when it comes to the layout of the code.

You like to use four spaces for indentation, you want the brace that marks the start of a function to be on the line, you don't want to see any more useless spaces at the end of the line, ... and damned! you notice that some people don't care about this.

Or ... you're working alone and just want to force these rules automatically when you start a project (and don't need to configure each project again and again).

The ultimate solution: using a `devcontainer` in VSCode.

<!-- truncate -->

:::tip Download the project
You can download the project by clicking [here](./resources/devcontainer.tar.gz). Copy the file to f.i. folder `/tmp/devcontainer` and uncompress using `tar -xzvf devcontainer.tar.gz`.
:::

## Create the project

Let's start immediately a new project by creating a temporary directory by running `mkdir /tmp/devcontainer_php && cd $_`.

Since we'll create a few files, please run `code .` to start VSCode.

Create a new file called `index.php` with some PHP code like f.i.:

```php
<?php

function sayHello(    )          {
       $text="Hello World!";
    return $text;
 }

        echo sayHello();
```

![Index php with poor written code](./images/index_php_bad_formatting.png)

:::note Pay attention to extra whitespace
On the screen capture here above, you can see "dots" to illustrate spaces and you can see there are a lot of spaces here and there and there are just unneeded.
:::

We can run that script in a browser by running `docker run -d -p 80:80 -u $(id -u):$(id -g) -v .:/var/www/html php:8.2-apache` (read [The easiest way to run a PHP script / website](/blog/docker-php-run-script-or-website) post if a refresh is needed).

As you can expect, the script is running fine:

![Running the index page in a browser](./images/browser_index.png)

:::danger Stop reading here if ...
... you're one of those people who thinks *The script works, doesn't it? Then why this whole article?*, **please turn off your computer and promise never to touch a single line of code again**.
:::

## Install first the ms-azuretools.vscode-docker VSCode extension

In VSCode, <kbd>CTRL</kbd>+<kbd>SHIFT</kbd>+<kbd>X</kbd> to open the `Extensions` left pane and search for the Microsoft Docker extension (called `ms-azuretools.vscode-docker`) and if needed install it.

## Create the devcontainer.json file

Please create a folder called `.devcontainer` and, there, a file called `devcontainer.json` with this content:

```json
{
    "name": "php_devcontainer",
    "build": {
        "dockerfile": "Dockerfile"
    },
    "workspaceMount": "source=${localWorkspaceFolder},target=/var/www/html,type=bind",
    "workspaceFolder": "/var/www/html",
    "remoteUser": "docker",
    "customizations": {
        "vscode": {
            "settings": {
                "[php]": {
                    "editor.formatOnSave": true,
                    "editor.defaultFormatter": "junstyle.php-cs-fixer"
                },
                "editor.codeActionsOnSave": {
                    "source.fixAll": true
                },
                "editor.formatOnSave": true,
                "editor.renderWhitespace": "all",
                "files.autoSave": "onFocusChange",
                "files.eol": "\n",
                "files.insertFinalNewline": true,
                "files.trimTrailingWhitespace": true,
                "intelephense.environment.phpVersion": "8.2",
                "intelephense.telemetry.enabled": false,
                "php-cs-fixer.config": "/var/www/html/.config/.php-cs-fixer.php",
                "php-cs-fixer.executablePath": "/usr/local/bin/php-cs-fixer.phar",
                "php-cs-fixer.onsave": true,
                "php-cs-fixer.rules": "@PSR12",
                "php.validate.executablePath": "/usr/local/bin/php",
                "phpsab.executablePathCBF": "/usr/local/bin/phpcbf.phar",
                "phpsab.executablePathCS": "/usr/local/bin/phpcs.phar",
                "phpsab.fixerEnable": true,
                "phpsab.snifferShowSources": true,
                "phpsab.standard": "/var/www/html/.config/phpcs.xml",
                "telemetry.telemetryLevel": "off",
                "terminal.integrated.profiles.linux": {
                    "bash": {
                        "path": "/bin/bash",
                        "icon": "terminal-bash"
                    }
                },
                "terminal.integrated.defaultProfile.linux": "bash"
            },
            "extensions": [
                "bmewburn.vscode-intelephense-client",
                "junstyle.php-cs-fixer",
                "ms-azuretools.vscode-docker",
                "ValeryanM.vscode-phpsab",
                "zobo.php-intellisense"
            ]
        }
    }
}
```

## Create the Dockerfile file

Right now, we'll continue and create a second file called `Dockerfile` with this content:

```dockerfile
ARG PHP_VERSION=8.2

ARG COMPOSER_HOME="/var/cache/composer"
ARG COMPOSER_VERSION=2.5.5

ARG PHPCSFIXER_INSTALL=true
ARG PHPCSFIXER_VERSION=3.46.0

ARG PHPCBF_INSTALL=true
ARG PHPCBF_VERSION=3.7.2

ARG TIMEZONE="Europe/Brussels"

ARG OS_USERID=1000
ARG OS_USERNAME="docker"

FROM composer:${COMPOSER_VERSION} as composer_base

FROM php:${PHP_VERSION}-fpm

ARG TIMEZONE
ENV TZ=${TIMEZONE}

ARG PHPCSFIXER_INSTALL
ARG PHPCSFIXER_VERSION

RUN set -e -x \
    && if [ "$PHPCSFIXER_INSTALL" = "true" ] ; then \
    printf "\e[0;105m%s\e[0;0m\n" "Install php-cs-fixer.phar ${PHPCSFIXER_VERSION}" \
    && curl -L https://github.com/PHP-CS-Fixer/PHP-CS-Fixer/releases/download/v${PHPCSFIXER_VERSION}/php-cs-fixer.phar -o /usr/local/bin/php-cs-fixer.phar \
    && chmod +x /usr/local/bin/php-cs-fixer.phar ; \
    fi

ARG PHPCBF_INSTALL
ARG PHPCBF_VERSION

RUN set -e -x \
    && if [ "$PHPCBF_INSTALL" = "true" ] ; then \
    printf "\e[0;105m%s\e[0;0m\n" "Install phpcbf.phar ${PHPCBF_VERSION}" \
    && curl -L https://github.com/squizlabs/PHP_CodeSniffer/releases/download/${PHPCBF_VERSION}/phpcbf.phar -o /usr/local/bin/phpcbf.phar \
    && chmod +x /usr/local/bin/phpcbf.phar \
    && curl -L https://github.com/squizlabs/PHP_CodeSniffer/releases/download/${PHPCBF_VERSION}/phpcs.phar -o /usr/local/bin/phpcs.phar \
    && chmod +x /usr/local/bin/phpcs.phar ; \
    fi

ARG COMPOSER_HOME
ENV COMPOSER_HOME=${COMPOSER_HOME}

RUN set -e -x \
    && mkdir -p "${COMPOSER_HOME}/cache/files" \
    && mkdir -p "${COMPOSER_HOME}/cache/vcs" \
    && chmod -R 777 "${COMPOSER_HOME}"

COPY --from=composer_base /usr/bin/composer /usr/bin/composer

ARG OS_USERID
ARG OS_USERNAME

RUN set -e -x \
    && useradd --password '' -G www-data,root -u ${OS_USERID} -l -d "/home/${OS_USERNAME}" "${OS_USERNAME}" \
    && mkdir -p "/home/${OS_USERNAME}" \
    && chown -R "${OS_USERNAME}":"${OS_USERNAME}" "/home/${OS_USERNAME}"

RUN set -e -x \
    && printf "\e[0;105m%s\e[0;0m\n" "Install Linux binaries" \
    && apt-get update -yqq \
    && apt-get install -y --no-install-recommends curl libzip-dev zip unzip \
    && docker-php-ext-install zip \
    && docker-php-source delete \
    && apt-get clean \
    && rm -rf /tmp/* /var/list/apt/*

WORKDIR /var/www/html
```

## Reopen in the container

So, we've now three files: `index.php`, `.devcontainer/devcontainer.json` and `.devcontainer/Dockerfile`.

Take a look at the bottom left of your screen:

![Running in WSL](./images/running_in_wsl.png)

You'll see something like, in my case, `WSL: Ubuntu-20.04`. It can be different on your computer depending on your operating system.

Click on that status or, same effect, press <kbd>CTRL</kbd>+<kbd>SHIFT</kbd>+<kbd>P</kbd> to open the Command Palette and then search for `Reopen in Container` and press <kbd>Enter</kbd>.

![Reopen in Container](./images/reopen_in_container.png)

Visual Studio Code will do a lot of stuff. It can take a few minutes the first time.

![Now, you're in the container](./images/dev_container_vscode.png)

## Working in the container

Now the magic happens: please reopen the so badly formatted `index.php` file and save the file **without any changes**. Just press <kbd>CTRL</kbd>+<kbd>S</kbd> and ...

![Your script has been correctly formatted this time](./images/index_php_correctly_formatted.png)

:::tip How is this possible?
This because we taught VSCode to use a specific formatter for our PHP file and we told him to format the file each time it's saved.
:::

### PHP-CS-FIXER

To better understand, reopen your `.devcontainer/devcontainer.json` file and look at the highlighted lines below:

```json
{
    // ...
    "customizations": {
        "vscode": {
            "settings": {
                //highlight-next-line
                "[php]": {
                    //highlight-next-line
                    "editor.formatOnSave": true,
                    //highlight-next-line
                    "editor.defaultFormatter": "junstyle.php-cs-fixer"
                },
                // ...
                //highlight-next-line
                "files.autoSave": "onFocusChange",
                // ...
                //highlight-next-line
                "php-cs-fixer.config": "/var/www/html/.config/.php-cs-fixer.php",
                //highlight-next-line
                "php-cs-fixer.executablePath": "/usr/local/bin/php-cs-fixer.phar",
                //highlight-next-line
                "php-cs-fixer.onsave": true,
                //highlight-next-line
                "php-cs-fixer.rules": "@PSR12",
                //...
            },
            "extensions": [
                // ...
                //highlight-next-line
                "junstyle.php-cs-fixer",
            ]
        }
    }
}
```

So, we're asking VSCode to, for PHP files, run a `format this file` command when the file is saved and the tool to use for the formatting is `junstyle.php-cs-fixer`. Look directly at the end, in the `extensions` section, we instruct VSCode to install that extension.

We also instruct VSCode to automatically saved the file as soon as the focus changes i.e. for instance, if we select another file, if we click elsewhere (no more in the editor), ...

Finally, `junstyle.php-cs-fixer` requires some settings that we need to initialize like f.i. `php-cs-fixer.executablePath`.

Right now, you can think: *Wait a minute, I don't have the `/usr/local/bin/php-cs-fixer.phar` file on my computer.* And you are probably right but think again: are you coding *on your computer* or are you *inside a Docker container*?

By running VSCode in a container, you're *no more* on your machine.

And now, you need to take a look on the third file we've created: `Dockerfile`.

Please reopen the `.devcontainer/Dockerfile` file and look at the highlighted lines below:

```dockerfile
// highlight-next-line
ARG PHP_VERSION=8.2

// ...

// highlight-next-line
ARG PHPCSFIXER_INSTALL=true
// highlight-next-line
ARG PHPCSFIXER_VERSION=3.46.0

// ...

// highlight-next-line
FROM php:${PHP_VERSION}-fpm

// ...

// highlight-next-line
ARG PHPCSFIXER_INSTALL
// highlight-next-line
ARG PHPCSFIXER_VERSION

// highlight-next-line
RUN set -e -x \
    // highlight-next-line
    && if [ "$PHPCSFIXER_INSTALL" = "true" ] ; then \
    // highlight-next-line
    printf "\e[0;105m%s\e[0;0m\n" "Install php-cs-fixer.phar ${PHPCSFIXER_VERSION}" \
    // highlight-next-line
    && curl -L https://github.com/PHP-CS-Fixer/PHP-CS-Fixer/releases/download/v${PHPCSFIXER_VERSION}/php-cs-fixer.phar -o /usr/local/bin/php-cs-fixer.phar \
    // highlight-next-line
    && chmod +x /usr/local/bin/php-cs-fixer.phar ; \
    // highlight-next-line
    fi

// ...
```

That file will instruct VSCode to download a `php:8.2-fpm` Docker image and to install `php-cs-fixer` (since `PHPCSFIXER_INSTALL` has been set to `true`).

The version `3.46.0` of the `php-cs-fixer` executable will be downloaded and stored, in the Docker image, as `usr/local/bin/php-cs-fixer.phar`. This is why, in our `devcontainer.json` we can do `"php-cs-fixer.executablePath": "/usr/local/bin/php-cs-fixer.phar",`, because we've already downloaded and installed the executable.

#### PHP-CS-FIXER - Configuration file

The `.devcontainer/devcontainer.json` file also contains this line: `"php-cs-fixer.config": "/var/www/html/.config/.php-cs-fixer.php"`.

So, we can have our own configuration file for php-cs-fixer and that file has to be created in a folder called `.config` and should be named `.php-cs-fixer.php`.

Let's try and this time we'll make sure all our PHP files will have a header block with our copyright or license information or anything else.

In VSCode, please create the `.config` folder and there the `.php-cs-fixer.php` file with this content:

```php
<?php

$finder = PhpCsFixer\Finder::create()
    ->in('.')
    // Exclude directories
    ->exclude([
        '.config', '.devcontainer', '.git', 'node_modules','vendor'
    ]);

$header = file_get_contents(__DIR__ . '/licenseHeader.txt');

$config = new PhpCsFixer\Config();

return $config->setRules(
    [
        '@PSR12' => true,
        'header_comment' => [
            'header'       => rtrim($header, "\r\n"),
            'location'     => 'after_declare_strict',
            'comment_type' => 'PHPDoc',
        ],
    ]
)
    ->setCacheFile('/tmp/.php-cs-fixer.cache')
    ->setIndent('    ')
    ->setLineEnding("\n")
    ->setFinder($finder);

```

Please also create a second file called `licenseHeader.txt` file with the content you wish, f.i.:

```text
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful, but
WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License
for more details.

You should have received a copy of the GNU General Public License along
with this program. If not, see <https://www.gnu.org/licenses/>.
```

Now, back to your index.php file and just press <kbd>CTRL</kbd>+<kbd>S</kbd> to save the file again and ...

![A license block is automatically added by php-cs-fixer](./images/license.gif)

As you can see, when fixing the file, php-cs-fixer will also, now, inject our header.

:::tip Lots of options are explained here
Please go to [https://mlocati.github.io/php-cs-fixer-configurator](https://mlocati.github.io/php-cs-fixer-configurator) or [https://github.com/FriendsOfPHP/PHP-CS-Fixer](https://github.com/FriendsOfPHP/PHP-CS-Fixer) to learn more about the php-cs-fixer configuration file options.
:::

#### PHP-CS-FIXER - Fix all files at once

One step further: is it possible to run php-cs-fixer not just on the file being edited but on all files in your repository.

Yes, of course.

In VSCode, please press <kbd>CTRL</kbd>+<kbd>´</kbd> (or click on the `View` menu then `Terminal`).

Make sure you're in the `/var/www/html` folder (where you code is located inside the container) and run the following command:

```bash
/usr/local/bin/php-cs-fixer.phar fix --config /var/www/html/.config/.php-cs-fixer.php .
```

This will run php-cs-fixer on all your codebase (`.`). If you want to exclude some folders, open the `.config/.php-cs-fixer.php` file and update the `exclude` array.

### PHPCS and PHPCBF

There is a second tool that is installed in our `Dockerfile` and it's PHP_CodeSniffer tools called `phpcs` and `phpcbf`.

`phpcbf` is a `Code beautifier` tool i.e. will not only format your code like php-cs-fixer but, also make some changes accordingly to enabled rules.

For instance, see this file:

```php
<?php

function sayHello($firstname)
{
    if($firstname == "") {
        $text = "Hello World!";
    }else{
        $text = "Hello " . $firstname;
    }

    return $text;
}

echo sayHello();
```

What's wrong with this syntax? Almost nothing but ... the standard (`PSR12`) ask to put one space after the `if` keyword.

Like for PHP-CS-FIXER, we already have installed PHPCS and PHPCBF in our container. See your `.devcontainer/devcontainer.json` file:

```json
{
    // ..
    "customizations": {
        "vscode": {
            "settings": {
                // ...
                // highlight-next-line
                "phpsab.executablePathCBF": "/usr/local/bin/phpcbf.phar",
                // highlight-next-line
                "phpsab.executablePathCS": "/usr/local/bin/phpcs.phar",
                // highlight-next-line
                "phpsab.fixerEnable": true,
                // highlight-next-line
                "phpsab.snifferShowSources": true,
                // highlight-next-line
                "phpsab.standard": "/var/www/html/.config/phpcs.xml",
                // ...
            },
            "extensions": [
                // ...
                // highlight-next-line
                "ValeryanM.vscode-phpsab",
                // ...
            ]
        }
    }
}
```

And the two executables `/usr/local/bin/phpcbf.phar` and `/usr/local/bin/phpcs.phar` have been scripted in your Dockerfile. Just take a look if needed.

#### PHPCS and PHPCBF - Configuration file

Like as for php-cs-fixer, we need a configuration file. In VSCode, please create the `.config` folder and there the `phpcs.xml` file with this content:

```xml
<?xml version="1.0"?>
<ruleset name="MyRules">
    <arg name="colors" />
    <arg name="extensions" value="php" />
    <arg value="s" />
    <arg value="p" />
    <rule ref="PSR12" />
</ruleset>
```

Now, since we have defined our coding standard (`PSR12` here), just display the `index.php` script again:

![PHPCS in vscode](./images/vscode_phpcs.png)


Open a terminal by pressing <kbd>CTRL</kbd>+<kbd>´</kbd> (or by clicking on the `View` menu then `Terminal`) and run this command:

```bash
/usr/local/bin/phpcs.phar --standard=/var/www/html/.config/phpcs.xml /var/www/html/index.php
```

And you'll get this output:

```text
FILE: /var/www/html/index.php
------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
FOUND 1 ERROR AND 1 WARNING AFFECTING 2 LINES
------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  1 | WARNING | [ ] A file should declare new symbols (classes, functions, constants, etc.) and cause no other side effects, or it should execute logic with side effects, but should not do
    |         |     both. The first symbol is defined on line 18 and the first side effect is on line 29. (PSR1.Files.SideEffects.FoundWithSymbols)
 20 | ERROR   | [x] Expected 1 space(s) after IF keyword; 0 found (Squiz.ControlStructures.ControlSignature.SpaceAfterKeyword)
------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
PHPCBF CAN FIX THE 1 MARKED SNIFF VIOLATIONS AUTOMATICALLY
------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

```

There is one warning and one error (coding convention violation) and the nice thing is **phpcbf can fix it**.

Now, run almost the same command but no more `phpcs` (to detect violations) but `phpcbf` (to fix them -the ones that can be fixed automatically-).

```bash
/usr/local/bin/phpcbf.phar --standard=/var/www/html/.config/phpcs.xml /var/www/html/index.php
```

You'll get this:

```text
PHPCBF RESULT SUMMARY
----------------------------------------------------------------------
FILE                                                  FIXED  REMAINING
----------------------------------------------------------------------
/var/www/html/index.php                               1      1
----------------------------------------------------------------------
A TOTAL OF 1 ERROR WERE FIXED IN 1 FILE
----------------------------------------------------------------------
```

And, indeed, if you look at your PHP script, now, there is a space after the `if` keyword.

#### PHPCS and PHPCBF - All files at once

You've probably already understood the syntax:

Just use the `.` to scan the entire codebase:

1. To fix some violations automatically: `/usr/local/bin/phpcbf.phar  --standard=/var/www/html/.config/phpcs.xml .`
2. To scan the rest of violations: `/usr/local/bin/phpcs.phar  --standard=/var/www/html/.config/phpcs.xml .` and


### Sonarlint

Let's see how to install a new extension: [sonarLint](https://marketplace.visualstudio.com/items?itemName=SonarSource.sonarlint-vscode).

Please open your `.devcontainer/devcontainer.json` file again and jump to the `extensions` node and add a new line:

```json
{
    // ...
    "customizations": {
        "vscode": {
            "extensions": [
                // ...
                // highlight-next-line
                "sonarsource.sonarlint-vscode",
                // ...
            ]
        }
    }
}
```

Press <kbd>CTRL</kbd>+<kbd>SHIFT</kbd>+<kbd>P</kbd> to open the Command Palette, search for `Rebuild Container` and press <kbd>Enter</kbd>. VSCode need to install the extension and to enable it.

When done, please reopen the `index.php` file you've:

```php
<?php

function sayHello($firstname)
{
    if ($firstname == "") {
        $text = "Hello World!";
    } else {
        $text = "Hello " . $firstname;
    }

    return $text;
}

echo sayHello();
```

![SonarLint is seeing something](./images/sonarlint_underline.png)

Move the mouse cursor on the `$text` variable and get extra information from SonarLint as a popup. You can, too, press <kbd>CTRL</kbd>+<kbd>SHIFT</kbd>+<kbd>M</kbd> to show the `Problems` pane (or menu `View` then `Problems`) to get the list of every SonarLint problems encountered in the current file and, too, in any file you'll open from now.

![SonarLint explained](./images/sonarlint_explained.png)

One solution would be to update the prototype of `sayHello` like this: `function sayHello($firstname = "")`.

### Rector

Rector is a tremendous application to scan and automatically upgrade your codebase to a given version of PHP and this means, too, to inspect how you're coding.

Perhaps you're still using a way of programming that's worthy of PHP 5.4 but unworthy of a modern developer who's up to date with the latest developments.

:::tip Rector is my private coach
I really LOVE Rector since he'll help me to learn new features of PHP. When I run it on any of my codebase, I can see where I can improve my code by refactoring some part and do better.

**I REALLY LOVE RECTOR.**
:::

This time, we'll need to install Rector for our project and for this, we'll follow the official documentation: [https://github.com/rectorphp/rector?tab=readme-ov-file#install](https://github.com/rectorphp/rector?tab=readme-ov-file#install)

Open a terminal by pressing <kbd>CTRL</kbd>+<kbd>´</kbd> (or by clicking on the `View` menu then `Terminal`) and run these commands:

```bash
cd /var/www/html

composer require rector/rector --dev
```

:::tip Composer has been installed in our Dockerfile
If you're thinking "Yes, but I haven't installed composer...", well, I have. We installed it in our container. See again your `.devcontainer/Dockerfile` if needed.
:::

Once installed, you'll have two new files in our repo (`composer.json` and `composer.lock`) and a new folder called `vendor`.

#### Rector - configuration file

:::caution Skip this chapter if you have downloaded the archive
If you've downloaded the `tar.gz` file, you already have a configuration file in folder `.config/` so please skip this chapter.
:::

The second step in the installation guide asks us to run the command below. When prompted, please answer `yes` to create your `rector.php` configuration file.

```bash
vendor/bin/rector
```

Finally, open the `rector.php` configuration file and update it like this:

```php
<?php

declare(strict_types=1);

use Rector\Config\RectorConfig;

return RectorConfig::configure()
    ->withSkip(
        [
            '.config', '.devcontainer', '.git', 'node_modules','vendor'
        ]
    )
    ->withPhpSets(php82: true)
    ->withPreparedSets(codeQuality: true, deadCode: true, typeDeclarations: true);
```

:::important Tell to Rector which PHP version you use
Rector will suggest you changes but to do this, he needs to know which version of PHP you're running. Indeed, Rector won't suggest you a PHP 8.2 syntax f.i. if you're still running on an older version (see [PHP Version Features](https://getrector.com/documentation/php-version-features)).
:::

:::tip On my side, I prefer to put all configuration files in a .config folder
You've noticed that Rector has created his configuration file in the root directory of your project. I prefer to move it to the `.config` folder.
:::

#### Run Rector

To illustrate what Rector can do, please edit the `index.php` with this content, once again:

```php
<?php

function sayHello($firstname = "")
{
    if($firstname == "") {
        $text = "Hello World!";
    } else {
        $text = "Hello " . $firstname;
    }

    return $text;
}

echo sayHello();
```

In a terminal, run `vendor/bin/rector process index.php --dry-run --config .config/rector.php` as we did before.

![Rector is simplifying our sayHello function](./images/rector_say_hello.png)

Take a look on the image here above. In red, your current code and, yes, we knew that, didn't we, the code quality is poor.

Indeed, one concept in clean code approach is to avoid to use the `if ... else ...` conditional statement. Most probably, we don't need `else` (see [https://phpmd.org/rules/cleancode.html#elseexpression](https://phpmd.org/rules/cleancode.html#elseexpression)).

Rector suggests removing completely the `if .. else ...` expression and to use a [ternary expression](https://github.com/rectorphp/rector/blob/main/docs/rector_rules_overview.md#simplifyifelsetoternaryrector).

So we can do:

```php
<?php

function sayHello($firstname = "")
{
    $text = $firstname == "" ? "Hello World!" : "Hello " . $firstname;
    return $text;
}
```

but here too, we can improve by [not using a temporary variable](https://github.com/rectorphp/rector/blob/main/docs/rector_rules_overview.md#simplifyuselessvariablerector) and return directly:

```php
<?php
function sayHello($firstname = "")
{
    return empty($firstname) ? "Hello World!" : "Hello " . $firstname;
}
```

But it's not finished: Rector see our parameter is a string so suggest to [add a type hint](https://github.com/rectorphp/rector/blob/main/docs/rector_rules_overview.md#strictstringparamconcatrector) and, too, to [add a return type](https://github.com/rectorphp/rector/blob/main/docs/rector_rules_overview.md#returntypefromstrictscalarreturnexprrector) for the same reason.

Since we've analyzed the suggestion of Rector and we agree with, please rerun the same command but, this time, without, the `--dry-run` flag.

```bash
vendor/bin/rector process index.php --config .config/rector.php
```

Rector has updated our `index.php` file! Now, our function is just one line and no more seven. Nice improvement!

Our new, improved, code is now:

```php
<?php

function sayHello(string $firstname = ""): string
{
    return $firstname == "" ? "Hello World!" : "Hello " . $firstname;
}

echo sayHello();
```

Rector is **absolutely brilliantly powerful**. Learn more about it by reading carefully his documentation site: [https://getrector.com/documentation/](https://getrector.com/documentation/).

:::tip The programmer has the last word, but for how much longer?
We can do one more improvement by using a `Hello `prefix. Rector has not yet see this but until when?

```php
<?php

function sayHello(string $firstname = ""): string
{
    return "Hello " . ($firstname == "" ? "World!" : $firstname);
}

echo sayHello();
```
:::

#### Rector - All files at once

Back in your terminal and run:

```bash
vendor/bin/rector process . --dry-run
```

or, if you've moved the `rector.php` file into `.config`:

```bash
vendor/bin/rector process . --dry-run --config .config/rector.php
```

##### Dry-run means no changes are made, just displayed

When running Rector using `vendor/bin/rector process . --dry-run`, no files will be rewritten. Rector will only suggest changes.

If you allow Rector to make changes to your files, run `vendor/bin/rector process .` instead but, here, you need to be sure it's OK.

:::tip Code versioning using f.i. GitHub
If you're using a code versioning system, you can push your actual codebase to Github, create a new branch like for instance `refactoring` then run Rector safely on your disk. If something should be broken, you can always retrieve your source before any changes.
:::

### Intelephense

This time just for illustration purpose, we change the `index.php` file back to:

```php
<?php

function sayHello($firstname)
{
    if($firstname == "") {
        $text = "Hello World!";
    } else {
        $text = "Hello " . $firstname;
    }

    return $text;
}

echo sayHello();
```

And we can notify that Intelephense also detect the error of the missing argument:

![Intelephense in action](./images/intelephense.png)

:::important We need several tools
This example illustrates the point: to date, in February 2024, we still have to juggle with several extensions and tools to achieve clean, bug-free code.
:::
