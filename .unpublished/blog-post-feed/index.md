---
slug: blog-post-feed
title: Override how Docusaurus generate the rss.xml file
date: 2025-12-12
description:
authors: [christophe]
image: /img/v2/`github_profile_automate.webp`
mainTag: Github
tags: [actions, docusaurus, github]
language: en
draft: true
blueskyRecordKey:
---
![Override how Docusaurus generate the rss.xml file](/img/v2/github_profile_automate.webp)

1. Il faut exécuter `yarn add feed front-matter glob`

2. Dans `docusaurus.config.js`, désactiver le RSS générer par défaut en mettant `type` sur `null`

```javascript
feedOptions: {
    type: null,
},
```

3. Ajouter `["./plugins/blog-feed-plugin/index.mjs", {}],` dans la section `plugins` du fichier `docusaurus.config.js`.

Cela fait, on peut faire un `yarn run build` pour générer la version statique du blog.

On pourra voir `[BlogFeedPlugin] Custom RSS feed successfully written to /opt/docusaurus/build/blog/rss.xml (212 items).` lors du build.

Si on fait `yarn run serve` puis qu'on se rends à l'URL `/blog/rss.xml` on aura le nouveau fichier dont le contenu ressemble à quelque chose comme ceci:

```xml
<?xml version="1.0" encoding="utf-8"?>
<rss version="2.0" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:content="http://purl.org/rss/1.0/modules/content/">
    <channel>
        <title>Christophe Avonture</title>
        <link>https://www.avonture.be/blog</link>
        <description>Personal blog about Docker, WSL, Python, Quarto, PHP, Joomla, Docusaurus and even more</description>
        <lastBuildDate>Tue, 02 Dec 2025 12:30:50 GMT</lastBuildDate>
        <docs>https://validator.w3.org/feed/docs/rss2.html</docs>
        <generator>https://github.com/jpmonette/feed</generator>
        <language>en</language>
        <item>
            <title><![CDATA[Discovering Zorin]]></title>
            <link>https://www.avonture.be/blog/2025/12/01/zorin/index</link>
            <guid isPermaLink="false">/blog/2025/12/01/zorin/index</guid>
            <pubDate>Mon, 01 Dec 2025 00:00:00 GMT</pubDate>
            <description><![CDATA[<img src="https://www.avonture.be/img/v2/zorin_os.webp" alt="Discovering Zorin" style="display:block; max-width:100%; height:auto;">Trying a new OS? Zorin OS 18 is a Linux distribution based on Ubuntu, perfect for switching from Windows. Easy install, familiar interface, and great compatibility!]]></description>
            <content:encoded><![CDATA[![Discovering Zorin](/img/v2/zorin_os.webp)<<THE_FULL_ARTICLE>>]]></content:encoded>
            <enclosure length="0" type="image/webp" url="https://www.avonture.be/img/v2/zorin_os.webp"/>
        </item>
    </channel>
</rss>
```

Le RSS est bien plus riche, il offre une meilleure visibilité des médias (il inclue les images) et il permet aux aggrégateurs RSS d'avoir l'intégralité de l'article pour p.ex. une consultation offline.

Inconvénients actuels:

* Les tags persos comme AlertBox ne sont pas convertis; il faudrait le HTML.
