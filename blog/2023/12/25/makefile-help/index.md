---
slug: makefile-help
title: Linux Makefile - Adding a help screen
authors: [christophe]
image: /img/makefile_tips_social_media.jpg
mainTag: makefile
tags: [makefile, tips]
enableComments: true
---
![Linux Makefile - Adding a help screen](/img/makefile_tips_banner.jpg)

By using a makefile, you know it already, you can gather in one place a lot of *actions* like `make bash`, `make build`, `make deploy`, ... just like I do when working on this blog (see my makefile on [https://github.com/cavo789/blog/blob/main/makefile](https://github.com/cavo789/blog/blob/main/makefile)).

What's really nice is being able to type `make` at the command line without any other options and then get a screen with lists of existing commands and a short one-line explanation.

That's what we'll be looking at in this article.

<!-- truncate -->

<StepsCard
  title="Before you begin make sure..."
  variant="prerequisites"
  steps={[
    "You've GNU Make installed",
    "You've an existing makefile",
  ]}
/>

## Install GNU Make if needed

We will use `GNU make` so you need to have it.

Please run `which make` in your Linux console to check if `make` is already installed. If so, you will get f.i. `/usr/bin/make` as result.

If you got `make not found`, please run `sudo apt-get update && sudo apt-get -y install make` to install it.

## Create a sample file

For the demo, please start a Linux shell and run `mkdir -p /tmp/makefile && cd $_` to create a folder called `makefile` in your Linux temporary folder and jump in it.

Please create a new file called `makefile` with this content:

<Snippet filename="makefile">

```makefile
SHELL:=bash

COLOR_YELLOW:=33

.PHONY: bash
bash:
 @printf "\e[1;${COLOR_YELLOW}m%s\e[0m\n\n" "Start an interactive shell in the Docker container; type exit to quit"

.PHONY: code
code:
 @printf "\e[1;${COLOR_YELLOW}m%s\e[0m\n\n" "Open the blog in Visual Studio Code"

.PHONY: build
build:
 @printf "\e[1;${COLOR_YELLOW}m%s\e[0m\n\n" "Generate a newer version of the build directory"

.PHONY: deploy
deploy: build
 @printf "\e[1;${COLOR_YELLOW}m%s\e[0m\n\n" "Deploy static pages to the web server"

.PHONY: install
install:
 @printf "\e[1;${COLOR_YELLOW}m%s\e[0m\n\n" "Generate a newer version of the build directory"

.PHONY: start
start:
 @printf "\e[1;${COLOR_YELLOW}m%s\e[0m\n\n" "Open the blog (http://localhost:3000)"

.PHONY: watch
watch:
 @printf "\e[1;${COLOR_YELLOW}m%s\e[0m\n\n" "Run Docusaurus watcher and open the blog on the localhost. When done, just start a browser and surf to http://localhost:3000"
```

</Snippet>

:::danger
The indentation in a makefile **SHOULD BE** made using tabs and not spaces, this is crucial. So please make sure, if your file didn't work, you know what to do.
:::

That file contains a few *targets* (=actions) and a simple `printf` statement to display a text. Except echoing something into the console that `makefile` does nothing.

<Terminal>
$ ls -alh

total 920K
drwxr-xr-x  2 christophe christophe 4.0K Dec  10 12:19 .
drwxrwxrwt 17 root       root       908K Dec  10 12:19 ..
-rw-r--r--  1 christophe christophe 1.4K Dec  10 12:19 makefile
</Terminal>

## Adding the default action

We're ready to start our implementation.

We have to do three things for this:

1. Add a `default: help` action
2. Add a `help:` target (a target is, in the Make terminology an action)
3. Edit each target and add a small description.

### Step 1 - Adding the default action

In the absence of a `default:` action defined in the file, like in your example, the first action will be executed.

So, right now, if you run `make` (without any other arguments), you'll get the *Start an interactive shell...* message, that's the result of the `bash:` target; the first in the file

<Terminal>
$ make
Start an interactive shell in the Docker container; type exit to quit
</Terminal>

Please edit the file and add the highlighted line below:

<Snippet filename="makefile">

```makefile
SHELL:=bash

// highlight-next-line
default: help

COLOR_YELLOW:=33

.PHONY: bash
bash:
 @printf "\e[1;${COLOR_YELLOW}m%s\e[0m\n\n" "Start an interactive shell in the Docker container; type exit to quit"

```

</Snippet>

### Step 2 - Adding the help target

Still in your editor, please add the highlighted block below; the position where you'll copy/paste it is not important but, logically, let's put this new action as the first since it's the one that will be executed by default.

<Snippet filename="makefile">

```makefile
SHELL:=bash

default: help

COLOR_YELLOW:=33

// highlight-next-line
.PHONY: help
// highlight-next-line
help: ## Show the help with the list of commands
    // highlight-next-line
 @clear
    // highlight-next-line
 @awk 'BEGIN {FS = ":.*##"; printf "\nUsage:\n  make \033[36m<target>\033[0m\n\n"} /^[a-zA-Z_-]+:.*?##/ { printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2 } /^##@/ { printf "\n\033[0;33m%s\033[0m\n", substr($$0, 5) } ' $(MAKEFILE_LIST)
    // highlight-next-line
 @echo ""
```

</Snippet>

Right now, if you type `make` on your console, you'll get this:

<Terminal wrap={false}>
Usage:
  make \<target>

  help                  Show the help with the list of commands
</Terminal>

### Step 3 - Add a description for each target

Take a look on your new `help` target: the description *Show the help with the list of commands* is prefixed by a double `#`. This is how to add a description.

<Snippet filename="makefile">

```makefile
// highlight-next-line
help: ## Show the help with the list of commands
```

</Snippet>

So, you've to edit your makefile for the last time, and, for each target, add a `## a small, one line, description` text; like below, our final file:

<Snippet filename="makefile">

```makefile
SHELL:=bash

COLOR_YELLOW:=33

.PHONY: help
help: ## Show the help with the list of commands
 @clear
 @awk 'BEGIN {FS = ":.*##"; printf "\nUsage:\n  make \033[36m<target>\033[0m\n\n"} /^[a-zA-Z_-]+:.*?##/ { printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2 } /^##@/ { printf "\n\033[0;33m%s\033[0m\n", substr($$0, 5) } ' $(MAKEFILE_LIST)
 @echo ""

.PHONY: bash
bash: ## Open an interactive shell in the Docker container
 @printf "\e[1;${COLOR_YELLOW}m%s\e[0m\n\n" "Start an interactive shell in the Docker container; type exit to quit"

.PHONY: code
code: ## Open Visual Studio Code
 @printf "\e[1;${COLOR_YELLOW}m%s\e[0m\n\n" "Open the blog in Visual Studio Code"

.PHONY: build
build: ## Generate a newer version of the build directory
 @printf "\e[1;${COLOR_YELLOW}m%s\e[0m\n\n" "Generate a newer version of the build directory"

.PHONY: deploy
deploy: build ## Deploy static pages to the web server
 @printf "\e[1;${COLOR_YELLOW}m%s\e[0m\n\n" "Deploy static pages to the web server"

.PHONY: install
install: ## The very first time, after having cloned this blog, you need to install Docusaurus before using it.
 @printf "\e[1;${COLOR_YELLOW}m%s\e[0m\n\n" "Generate a newer version of the build directory"

.PHONY: start
start: ## Start the local web server and open the webpage
 @printf "\e[1;${COLOR_YELLOW}m%s\e[0m\n\n" "Open the blog (http://localhost:3000)"

.PHONY: watch
watch: ## Start the Docusaurus watcher. Listen any changes to a .md file and reflect the change onto the website
 @printf "\e[1;${COLOR_YELLOW}m%s\e[0m\n\n" "Run Docusaurus watcher and open the blog on the localhost. When done, just start a browser and surf to http://localhost:3000"
```

</Snippet>

And now, by running `make` you'll get a nice help screen:

<Terminal wrap={false}>
{`
Usage:
  make \<target>

  help                  Show the help with the list of commands
  bash                  Open an interactive shell in the Docker container
  code                  Open Visual Studio Code
  build                 Generate a newer version of the build directory
  deploy                Deploy static pages to the web server
  install               The very first time, after having cloned this blog, you need to install Docusaurus before using it.
  start                 Start the local web server and open the webpage
  watch                 Start the Docusaurus watcher. Listen any changes to a .md file and reflect the change onto the website
`}
</Terminal>

As you can see, the order of targets respect the order in your file. `help` is displayed first because it's the first target in the file so, think to reorder targets in your file based on your logic (f.i. alphabetically).

## Step 4 - Add a subtitle between each "main section"

Imagine you have dozens of shares... It would be nice to group them into sections: everything concerning your application, everything relating to your database, actions of the Code Analysis type, and so on.

To do this, simply add a line with this syntax: `##@ My project` as illustrated below:

<Snippet filename="makefile">

```makefile
SHELL:=bash

COLOR_YELLOW:=33

.PHONY: help
help: ## Show the help with the list of commands
 @clear
 @awk 'BEGIN {FS = ":.*##"; printf "\nUsage:\n  make \033[36m<target>\033[0m\n\n"} /^[a-zA-Z_-]+:.*?##/ { printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2 } /^##@/ { printf "\n\033[0;33m%s\033[0m\n", substr($$0, 5) } ' $(MAKEFILE_LIST)
 @echo ""

// highlight-next-line
##@ My project              Helpers to work with the application

.PHONY: bash
bash: ## Open an interactive shell in the Docker container
    # [...]

// highlight-next-line
##@ Data quality            Code analysis tools

.PHONY: phan
phan: ## Run phan analysis
    # [...]

.PHONY: php-cs-fixer
php-cs-fixer: ## Run php-cs-fixer
    # [...]

// highlight-next-line
##@ Database management     Working with the database

.PHONY: phpmyadmin
phpmyadmin: ## Run phpmyadmin web interface
    # [...]
```

</Snippet>

And here is the final result:

<Terminal wrap={false}>
Usage:
  make \<target\>

  help                  Show the help with the list of commands

My project              Helpers to work with the application
  bash                  Open an interactive shell in the Docker container

Data quality            Code analysis tools
  phan                  Run phan analysis
  php-cs-fixer          Run php-cs-fixer

Database management     Working with the database
  phpmyadmin            Run phpmyadmin web interface
</Terminal>

:::tip Now we have a clear grouping of actions. Much better.
:::

## Take a look on mine, for this blog

This blog is maintained using such makefile, you can get a copy here: [https://github.com/cavo789/blog/blob/main/makefile](https://github.com/cavo789/blog/blob/main/makefile)
