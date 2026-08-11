---
slug: docker-html-site
title: Running an HTML site in seconds using Docker
date: 2024-08-09
description: Run any static HTML website in seconds with just ONE Docker command. Skip the headache of installing and configuring Apache or Nginx for a quick local setup.
authors: [christophe]
image: /img/v2/docker_tips.webp
mainTag: docker
tags:
  - docker
  - windows
language: en
review_date: 2026-07-30
blueskyRecordKey: 3lzxdp44mw223
---
<!-- cspell:ignore easyphp,wamp,pffffiou,htdocs,lzxdp -->

![Running an HTML site in seconds using Docker](/img/v2/docker_tips.webp)

<TLDR>
This article shows the fastest way to serve a static HTML site locally: no Apache/Nginx install needed, just one command — `docker run -d --name static-site -p 8080:80 -v .:/usr/local/apache2/htdocs/ httpd:alpine` — run from the site's folder, then browse to `http://localhost:8080`.
</TLDR>

Imagine the following situation: you've an HTML website on your computer and you would like to run it. But how? Should you install Apache or Nginx? Yes, you should ... or just run exactly **ONE COMMAND** to start Docker.

Years ago, to open a local website, you needed to install f.i. EasyPhp or Wamp, configure a lot of things, restart the computer, make sure EasyPhp or Wamp was running in the background and ... pffffiou.

Those times are thankfully, definitively over.

<!-- truncate -->

For a change, this article will use PowerShell, but I could, of course, have used DOS or Linux. So let's play with Powershell.

## Result

Just one command, run from the folder containing your static site: `docker run -d --name static-site -p 8080:80 -v .:/usr/local/apache2/htdocs/ httpd:alpine`.

Once done, just start your preferred browser and surf to `http://localhost:8080`. Bingo!

<BrowserWindow url="http://localhost:8080">
  ![Your local website](./images/localhost.webp)
</BrowserWindow>

You've a fully working site. Crazy no?

## Why it works

- The `httpd:alpine` image mounts the current folder (`-v .:/usr/local/apache2/htdocs/`) as Apache's docroot, so whatever HTML is already on your disk gets served immediately.
- Docker downloads Apache for you the first time; nothing to install, configure or keep running in the background.

*Two natural follow-ups: your site is served by a real Apache, so every directive from <Link to="/blog/apache-htaccess">Apache .htaccess file</Link> works here; and if your pages are not plain HTML but PHP, use <Link to="/blog/docker-php-run-script-or-website">The easiest way to run a PHP script / website</Link> instead.*

## Don't have a site to try this on yet?

For the illustration, I'll download a free static website from [https://github.com/toidicode/template](https://github.com/toidicode/template). Take a look to demos and [just download one ZIP](https://github.com/toidicode/template?tab=readme-ov-file#demo-and-download).

I'll jump in my `C:\temp` directory and download the zip. To do this, I will execute the following command: `curl https://github.com/toidicode/template/raw/master/src/100-cookingschool.zip -o demo.zip` (yes, curl is available for PowerShell too).

The next thing to do is to unzip the file. I can do it with Windows Explorer for sure but I'm a console guy so let's run `Expand-Archive demo.zip -DestinationPath demo`.

Ok, now, we've a `demo` folder containing a static website. Jump into it: `cd demo`, then run the one command from above in that folder.

## Conclusion

One `docker run`, no Apache/Nginx install, no configuration file to touch: that's the whole
recipe. Point it at any folder of static HTML and it's served in seconds — throw the container
away with `docker rm -f static-site` when you're done and your disk is exactly as it was.
