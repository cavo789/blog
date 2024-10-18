---
title: Theme-based approach - Christophe Avonture
hide_table_of_contents: true
---
<!-- cspell:ignore peasy,squeezy,behat -->

## Theme-based approach

As this site is a blog, I post articles on a daily basis and it can be difficult to find a list of articles in a precise order.

Below you'll find a list of topics that you'll also find in the [tags](/blog/tags) screen, but arranged in a logical learning order.

* [Docusaurus](#docusaurus)
* [Docker](#docker)
* [Joomla](#joomla)
* [Oh-My-ZSH](#oh-my-zsh)
* [PHP](#php)
* [Quarto](#quarto)

The list of articles below is very short, so don't hesitate to consult the [blog](/blog) section for the full list of posts.

## Docusaurus

Get all articles by looking for the [Docusaurus](/blog/tags/docusaurus/) tags.

### [Running Docusaurus with Docker](/blog/docusaurus-docker/)

Learn how to create your personal Docker image where we'll install Docusaurus. This done, you'll be able to create your own blog on your localhost.

See also [Running your own blog with Docusaurus and Docker](/blog/docusaurus-docker-own-blog)

### [Encapsulate an entire Docusaurus site in a Docker image](/blog/docker-docusaurus-prod)

You already have a Docusaurus website running as a Docker container. Learn how to create a Docker image with your blog so you can push your blog as a standalone image on Docker Hub.

### [GitHub - Use Actions to deploy this blog](/blog/github-action)

Once your blog is created on your computer, learn how to deploy it to your production site just by pushing your changes to Github.

### [Some tips and tricks when written articles for Docusaurus](/blog/docusaurus-articles-tips)

Some tips and tricks to make your life easier.

### [Getting the number of published posts](/blog/docusaurus-number-of-posts)

Actually there is no way to retrieve the number of articles you've written. However, using xpath, you can do this very easily.

## Docker

Get all articles by looking for the [Docker](/blog/tags/docker/) tags.

### [Docker - Explain me like I'm five - What's Docker for?](/blog/docker-definition-like-im-five)

First of all, let's look at what Docker is.

### [Running a HTML site in seconds using Docker](/blog/docker-html-site)

You'll see how, in just one command, you can have a fully working HTML site on your machine.

### [Using Docker init to quickly dockerize your PHP application](/blog/docker-init-php-apache)

You've an existing PHP application and *Easy peasy lemon squeezy*, thanks to Docker init, your application has been dockerized.

### [Docker secrets - Using your SSH key during the build process](/blog/docker-use-ssh-during-build)

Don't store passwords, token and other private information's in your Docker projects.

### [Understanding the depends_on condition in Docker compose files](/blog/docker-health-condition)

Make sure Docker will start services in the right order and, f.i., make sure that your database service is started and running before your application try to use it.

### [Get health information from your running containers](/blog/docker-healthy)

By using the `healthcheck` feature of your Docker service, you'll be able to have a nice monitoring of which service is running, stopped or in failure.

### [Using volumes with Docker, use cases](/blog/docker-volumes)

Docker will keep your data in volumes. Learn what are the *self-managed* volumes and when to use them.

See also [Share data between your running Docker container and your computer](/blog/docker-volume)

## Joomla

Get all articles by looking for the [joomla](/blog/tags/joomla/) tags.

### [Docker - Explain me like I'm five - What's Docker for?](/blog/docker-definition-like-im-five)

First of all, let's look at what Docker is.

### [Start Joomla with Docker in just a few clicks](/blog/docker-joomla-right-to-the-point)

No headaches, just a few copies and pastes and your Joomla site is ready on your machine

### [Create your Joomla website using Docker - Part 1](/blog/docker-joomla)

A long, very detailed explanation of how to use Docker to create a local Joomla site.  In this document, you'll learn the basics of Docker, what images and containers are, how to keep your data (the notion of persistence), etc. and we'll set up a website during this article.

### [Create your Joomla website using Docker - Part 2](/blog/docker-joomla-part-2)

In this second article, we'll look at how to take advantage of the new features supported by Joomla, such as the ability to install a site without even having to configure it: by using the right parameters (database, site name, etc.), your site will be immediately ready for use.

We'll also look at how to create a structure by project and, as a case in point, we'll have a Joomla 5.2 site, another Joomla 4 and a third, Joomla 3.

### [Restore a Joomla backup using Docker](/blog/docker-joomla-restore-jpa)

Now that you're used to creating new Joomla sites from scratch, let's take a look at how you can download a JPA from your production site and easily restore it locally.

### [Using Adminer, pgadmin or phpmyadmin to access your Docker database container](/blog/docker-adminer-pgadmin-phpmyadmin)

Accessing your database using f.i. phpmyadmin.

### [Update php.ini when using a Docker image](/blog/docker-php-ini)

When using Joomla, you may have to upload much larger files (e.g. a large extension). In this case, you'll need to intervene in the `php.ini` file. Let's look at how to do this.

### [Docker - Configure your localhost to use SSL](/blog/docker-localhost-ssl)

Perhaps you would like to have an https site.

### [Joomla - Run a SQL statement outside Joomla and display a nice HTML table](/blog/joomla-show-table)

With a small PHP script, retrieve data from your Joomla database and show them as an HTML table (with sorting and filtering features) or, stronger, use a custom URL to that script in a spreadsheet application like Microsoft Excel. Then, to get a fresh version of your data, just right-click in your Excel list and choice `refresh`.

### [Joomla - delete tables from your database according to a certain prefix](/blog/joomla-db-kill-tables-prefix)

Using an external script, get the list of all tables present in your database and start to remove old tables just by specifying a prefix.

## Oh-My-ZSH

Get all articles by looking for the [Oh-My-ZSH](/blog/tags/zsh/) tags.

### [How to install Oh-My-ZSH](/blog/zsh-install)

ZSH is a powerful alternative to Linux Bash offering a lot of features like auto-completion (I like this so much), plugins and even themes.

### [Autosuggestions in the console using ZSH](/blog/zsh-plugin-autosuggestions)

ZSH supports plugin and one of the wonders is the `zsh-autosuggestions one`.

That one will suggests commands as you type based on your previous history and completions.

### [Syntax highlighting in the console using ZSH](/blog/zsh-syntax-highlighting)

`zsh-syntax-highlighting` is another gem for ZSH.

As you type, you'll be able to tell from the colors that, for example, something isn't quite right.

### [Customize your Linux prompt with Powerlevel10k](/blog/powerlevel10k_sandbox)

Play with Powerlevel10k even without installing it. Try it and if you like it; install it later.

## PHP

Get all articles by looking for the [php](/blog/tags/php/) tags.

### [The easiest way to run a PHP script / website](/blog/docker-php-run-script-or-website)

First thing first, how to very quickly start a PHP script with Docker using just one command.

See also [Install Docker and play with PHP](/blog/install-docker)

### [Install a PHP Docker environment in a matter of seconds](/blog/php-devcontainer)

This article is the very short and straightforward version of PHP development in a devcontainer with preinstalled code quality tools. If you just want to follow a very few steps and get your PHP environment, this article is for you.

See also [PHP development in a devcontainer with preinstalled code quality tools](/blog/vscode-devcontainer)

### [Rector 1.0.0 🎉🎉🎉, my friend, my coach](/blog/php-rector)

If there was only one, it would be Rector. Rector is extremely powerful and brilliant and, you know what, it's free!

Rector is a tremendous application to scan and automatically upgrade your codebase to a given version of PHP and this means, too, to inspect how you're coding.

### [Introduction to Behat](/blog/behat-introduction)

Behat is a tool for automating functional tests: imagine a robot that logs on to its site, goes to the home page, clicks on a button, selects a value from a drop-down list, etc. and then checks that the scenario works.  And that it does this for an infinite number of scenarios.  If there's an error (a page not working), Behat will tell you.

### [Obfuscate your PHP code](/blog/php-obfuscator)

More for fun since IA can *de-obfuscate* code. Make your PHP code unreadable by an human.

### [Docker image that provides static analysis tools for PHP](/blog/php-jakzal-phpqa)

A must have for PHP projects; `jakzal/phpqa` is a Docker image with plenty static code quality tools for PHP.

### [PHP code refactoring in VSCode](/blog/vscode-php-refactoring)

Using VSCode addons to start PHP code refactoring.

### [Generating documentation for a PHP codebase](/blog/docker-phpdocumentor)

Use phpDocumentor and extract all inline documentation (aka `php-doc-blocks`) from your PHP project and generate a static HTML website with, thus, up-to-date documentation.

## Quarto

Get all articles by looking for the [quarto](/blog/tags/quarto/) tags.

### [Running Quarto Markdown in Docker](/blog/docker-quarto)

Quarto is a tool for producing PDF, Word document, HTML web pages, ePub files, slideshows and many, many more output based on a Markdown file.

This article will explain how to use Quarto using Docker.


### [Using variables from external file in your Quarto project](/blog/quarto-project-variables)

Don't store constants like version number, paths, ... in your markdown files but use a `variables.yaml` file. Really useful to centralize your variables and be able to update them in just one location.

### [Use Quarto and create a PowerPoint slideshow](/blog/quarto-powerpoint)

Use Quarto and generate a PowerPoint output.

### [Some tips and tricks for Quarto when rendering as a reveal.js slideshow](/blog/quarto-revealjs-tips)

All my presentations are made using Markdown source files and I render them as reveal.js thanks to Quarto. In this article you'll get a lot of tips to give more impact to your presentations.

### [Quarto Callout Blocks](/blog/quarto-callout-blocks)

How to highlight some parts of your documentation using Quarto.

### [Quarto includes short code](/blog/quarto-includes-shortcode)

Learn how to include external files in your documentation. My use case is to create smaller files for my chapters and to have a global file where I'll include all chapters.

### [Quarto Inline style](/blog/quarto-inline-style)

Using small inline style you'll be able to inject CSS in your documentation like putting words or sentences in red.

### [Quarto conditional display](/blog/quarto-conditional-display)

Using conditional display will allow you to decide which sentences / chapters should be included in your documentation based on conditions. For instance, to not include a full source code if you're rendering a reveal.js presentation but well if you're creating a PDF documentation.
