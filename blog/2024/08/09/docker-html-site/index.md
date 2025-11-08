---
slug: docker-html-site
title: Running a HTML site in seconds using Docker
date: 2024-08-09
description: Run any static HTML website in seconds with just ONE Docker command. Skip the headache of installing and configuring Apache or Nginx for a quick local setup.
authors: [christophe]
image: /img/v2/docker_tips.webp
mainTag: docker
tags: [docker, powershell, wamp]
language: en
blueskyRecordKey: 3lzxdp44mw223
---
<!-- cspell:ignore easyphp,wamp,pffffiou,htdocs,lzxdp -->

![Running a HTML site in seconds using Docker](/img/v2/docker_tips.webp)

Imagine the following situation: you've a HTML website on your computer and you would like to run it. But how? Should you install Apache or Nginx? Yes, you should ... or just run exactly **ONE COMMAND** to start Docker.

Years ago, to open a local website, it was needed to install f.i. EasyPhp or Wamp, install and configure a lot of things, restart the computer, make sure EasyPhp or Wamp are running in background and ... pffffiou.

Those times are thankfully, definitively over.

<!-- truncate -->

For a change, this article will use PowerShell, but I could, of course, have used DOS or Linux. So let's play with Powershell.

For the illustration, I'll download a free static website from [https://github.com/toidicode/template](https://github.com/toidicode/template). Take a look to demos and [just download one ZIP](https://github.com/toidicode/template?tab=readme-ov-file#demo-and-download).

I'll jump in my `C:\temp` directory and download the zip. To do this, I will execute the following command: `curl https://github.com/toidicode/template/raw/master/src/100-cookingschool.zip -o demo.zip` (yes, curl is available for PowerShell too).

The next thing to do is to unzip the file. I can do it with Windows Explorer for sure but I'm a console guy so let's run `Expand-Archive demo.zip -DestinationPath demo`.

Ok, now, we've a `demo` folder containing a static website. Jump in in: `cd demo`.

<AlertBox variant="caution" title="Our promise">
And now, let's fulfil the promise made above: we've got a static website on our hard disk and we want to run it.

Just one command to run in your `C:\temp\demo` folder: `docker run -d --name static-site -p 8080:80 -v .:/usr/local/apache2/htdocs/ httpd:alpine`.

</AlertBox>

Docker will download Apache if not yet on your machine, then will start a Apache container, mount our site in it.

Once done, just start your preferred browser and surf to `http://localhost:8080`. Bingo!

![Your local website](./images/localhost.png)

You've a fully, working, site. Crazy no?
