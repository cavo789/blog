---
slug: matomo-install
title: How to self-host Matomo
date: 2024-01-28
description: Self-host Matomo for free and gain GDPR-compliant website analytics. This simple guide covers installation, database setup, and Docusaurus integration.
authors: [christophe]
image: /img/v2/matomo.webp
mainTag: self-hosted
tags: [docusaurus, matomo]
language: en
---
![How to self-host Matomo](/img/v2/matomo.webp)

[Matomo](https://matomo.org) is a GDPR-compliant tracking tool for your website. I've finally decided to install it so that I can get the blog's traffic figures; find out which articles are the most widely read, which topics are of most interest, etc., not just out of curiosity but also to get a better idea of the audience.

I've chosen for the self-hosted solution (because it's free) and like that my traffic figures remains on my own server.

<!-- truncate -->

The installation is a piece of cake: download a zip file, unzip and start the wizard. Really easy.

There is a nice tutorial on [https://matomo.org/faq/on-premise/installing-matomo/](https://matomo.org/faq/on-premise/installing-matomo/).

On my side, here the actions I've done:

1. Create a subdomain `matomo.avonture.be` and pointing to a specific folder on my host.
2. Create a SSL certificate for the sub-domain.
3. Connect on that new folder using SSH
   1. Run `wget https://builds.matomo.org/matomo.zip` to download the latest version
   2. Run `unzip -o matomo.zip` to unzip and get files
   3. Run `rm -f matomo.zip "How to install Matomo"` to remove two unneeded files

Since I know I should have a MySQL database, I went to my dashboard. For PlanetHoster, it's [https://my.planethoster.com](https://my.planethoster.com) and there, I create a new MySQL db and his user.

Finally, I just need to start the wizard on `https://matomo.avonture.be/index.php` and follow the guide.

The wizard is really well done and very easy to follow.

When done, I get my dashboard on [https://matomo.avonture.be/index.php](https://matomo.avonture.be/index.php) and I just need to add my tracking script to my pages as explained in the wizard.

## Docusaurus

On this blog, I'm using [Docusaurus](https://docusaurus.io/) so I've installed a plugin for this: [https://github.com/karser/docusaurus-plugin-matomo](https://github.com/karser/docusaurus-plugin-matomo).