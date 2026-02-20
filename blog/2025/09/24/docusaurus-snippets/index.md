---
slug: docusaurus-snippets
title: A component for showing code snippets in a Docusaurus blog
date: 2025-09-24
description: Learn how to build a custom React component to embed dynamic code snippets in your Docusaurus blog for a more interactive reader experience.
authors: [christophe]
image: /img/v2/docusaurus_react.webp
series: Creating Docusaurus components
mainTag: component
tags: [component, docusaurus, iconify, markdown, plugin, snippets]
language: en
blueskyRecordKey: 3lzkrxkfpo22m
updates:
  - date: 2025-10-10
    note: Allow relative paths
---
<!-- markdownlint-disable MD046 -->
<!-- cspell:ignore iconify,docux,pyproject -->
![A component for showing code snippets in a Docusaurus blog](/img/v2/docusaurus_react.webp)

<TLDR>
This article guides you through creating a powerful `<Snippet>` component for Docusaurus to display code blocks. This custom component improves on native HTML by adding features like file-type-specific icons and custom styling. The tutorial shows how to build the React component, integrate it with an icon library, and then takes it a step further by creating a remark plugin. This plugin allows you to dynamically load code from source files directly into your articles, ensuring your snippets are always up-to-date without manual copy-pasting. You'll learn how to handle both relative and absolute file paths and register the plugin in your site's configuration.
</TLDR>

If you're a regular reader of this blog, you know I'm sharing a lot of code snippets.

The HTML native way of doing this is by using the `<summary>` element (see [official documentation](https://www.w3schools.com/tags/tag_summary.asp)).

Can we do something, perhaps not better but more esthetic?

<!-- truncate -->

## The summary element

In pure HTML, we can use the `<summary>` DOM element like this:

```html
<details>
  <summary>blog/index.md</summary>

  Hello world! Proud to be here!!!
</details>
```

<AlertBox variant="info" title="">
It works but ... can we do better. I think to f.i. add an icon based on the language type, also do color's distinction between language and much, much better, don't copy/paste the code anymore in the article but just read it from the disk.

</AlertBox>

In this article we'll learn how to create a `Snippets` component and get this look&feel:

```html
<Snippet filename="blog/index.md"> Hello world! Proud to be here!!! </Snippet>
```

and here is the rendering:

<Snippet filename="blog/index.md">

Hello world! Proud to be here!!!

</Snippet>

## Creation of our Snippets component

Please create the `src/components/Snippet/index.js` file with this content _(look at the icon, we can see it's a Javascript code; the border is also set to a yellow one)_:

<Snippet filename="src/components/Snippet/index.js" source="src/components/Snippet/index.js" />

Also create the stylesheet _(CSS icon and blue border here)_:

<Snippet filename="src/components/Snippet/styles.module.css" source="src/components/Snippet/styles.module.css" />

The last thing we should do is to teach Docusaurus about our custom component.

Please also edit the `src/theme/MDXComponents.js` file (and if not present, please create it)

<Snippet filename="src/theme/MDXComponents.js" source="./files/MDXComponents.js" />

### LogoIcon of Docux

You'll also need the [LogoIcon](https://docuxlab.com/blog/logoicon-component-docusaurus/) created by [Docux](https://github.com/Juniors017).

This component will make easy to retrieve an SVG icon for a language (let's say Python) and display it. Under the scenes, LogoIcon is using [Iconify](https://icon-sets.iconify.design/).

In very short:

1. Please run `yarn install @iconify/react` to install the iconify library
2. Please create this file `src/components/Blog/LogoIcon/index.js`:

<Snippet filename="src/components/Blog/LogoIcon/index.js" source="src/components/Blog/LogoIcon/index.js" />

## Using the Snippets component

Now, if you want to add a snippet in your blog, just do something like this:

```html
<Snippet filename="who_are_you.py">
  name = input("What's your name? ") if name: print(f"Hello, {name}!") else:
  print("Hello, stranger!") print("Nice to meet you.")
</Snippet>
```

And it'll be rendered like this:

<Snippet filename="who_are_you.py" source="./files/who_are_you.py" />

## Don't copy/paste content anymore

Let's do much, much better: don't copy/paste the code to the article but read it from the disk.

Let's imagine this:

`<Snippet filename="src/components/Blog/Snippet/index.js" source="src/components/Blog/Snippet/index.js" />`

* `filename` is thus the title to show in the article, so the reader knows the file should be named like that
* `source` is the relative path (from your Docusaurus root folder) when the file can be retrieved. In this scenario, we don't have to put the source code in the file but Docusaurus will do the job for us:
  * When previewing the site (dev mode), a plugin will read the content immediately from the disk and will inject its content. So, if the sourced file is updated, your article will always be up-to-date
  * When building the static version (prod mode), the Docusaurus build engine will also read the content of the file from the disk and inject it in your article.

<AlertBox variant="caution" title="">
You've two types of paths: from your root folder or relative to the blog post.

If you use the `source="./files/example.js"` syntax (the path is starting with a dot), the file will be relative to your blog post.

The second possible syntax is without the dot like `source="src/components/Blog/Snippet/index.js"` and, in this case, the filename will be relative to your Docusaurus root folder i.e. the folder where the `docusaurus.config.js` file is saved.

</AlertBox>

### To make this working, a need a plugin

In Docusaurus vocabulary, we need a plugin to do this i.e. read the file's content from the disk and "inject" it in the article.

So the plugin will parse the blog post, search for any `<Snippet>` call and check if there is a `src=` attribute. If so, the plugin will open the file and read its content. The plugin will also extract the file's extension (like `.js`). With these two information (content and extension), the plugin will inject the content into the `<Snippet>` tag, just like if you, the blog post author, has make a copy/paste.

The ultimate advantage here: your blog post will always be up-to-date; if you change the file on the disk, your post will automatically get the last version.

Please create the `plugins/remark-snippet-loader/index.cjs` with the content below:

<Snippet filename="plugins/remark-snippet-loader/index.cjs" source="plugins/remark-snippet-loader/index.cjs" />

Also, please edit your `docusaurus.config.js` file like this:

<Snippet filename="docusaurus.config.js" source="./files/docusaurus.config.js" />

This done, please restart your Docusaurus server and on the next start, if some changes have to be made, you can see them in your console:

## Demo, hardcoded content

In this section, I've copy/pasted the source inside the `<Snippet>` tag. Useful when I don't have the file on my disk.

<Snippet filename="sample.apacheconf" source="./files/sample.apacheconf" />

<Snippet filename="sample.asm" source="./files/sample.asm" />

<Snippet filename="script.sh" source="./files/script.sh" />

<Snippet filename="script.bat" source="./files/script.bat" />

<Snippet filename="styles.css" source="./files/styles.css" />

<Snippet filename="data.csv" source="./files/data.csv" />

<Snippet filename="change.diff" source="./files/change.diff" />

<Snippet filename="Dockerfile" source="./files/Dockerfile" />

<Snippet filename="login.feature" source="./files/login.feature" />

<Snippet filename="hello.html" source="./files/hello.html" />

<Snippet filename=".gitignore" source="./files/.gitignore" />

<Snippet filename="config.ini" source="./files/config.ini" />

<Snippet filename="HelloWorld.java" source="./files/HelloWorld.java" />

<Snippet filename="script.js" source="./files/script.js" />

<Snippet filename="data.json" source="./files/data.json" />

<Snippet filename="application.log" source="./files/application.log" />

<Snippet filename="makefile" source="./files/makefile" />

<Snippet filename="readme.md">

```md
# Hello World

This is a markdown example.
```

</Snippet>

<Snippet filename="hello_world.pas" source="./files/hello_world.pas" />

<Snippet filename="HelloWorld.php" source="./files/HelloWorld.php" />

<Snippet filename="Hello_World.ps1" source="./files/Hello_World.ps1" />

<Snippet filename="hello_world.py" source="./files/hello_world.part2.py" />

<Snippet filename="active.sql" source="./files/active.sql" />

<Snippet filename="logo.svg" source="./files/logo.svg" />

<Snippet filename="pyproject.toml" source="./files/pyproject.toml" />

<Snippet filename="HelloWorld.vb" source="./files/HelloWorld.vb" />

<Snippet filename="message.xml" source="./files/message.xml" />

<Snippet filename="config.yaml" source="./files/config.yaml" />

## Demo, get content from the disk

Unlike the previous chapter, here, the syntax `<Snippet filename="src/components/Blog/PostCard/index.js" source="src/components/Blog/PostCard/index.js" />` has been used. So, the source code is injected dynamically during the previewing/rendering of the blog. If the source file is updated, the article will be updated too. Both are synchronized.

<Snippet filename="src/components/Blog/PostCard/index.js" source="src/components/Blog/PostCard/index.js" />

<Snippet filename="src/components/Blog/PostCard/readme.md" source="src/components/Blog/PostCard/readme.md" />

<Snippet filename="src/components/Blog/PostCard/styles.module.css" source="src/components/Blog/PostCard/styles.module.css" />

And, last demo, retrieve the content of file relative to this blog post **(so the source filename starts here with a dot to tell it's relative to the `.md` file)**:

<Snippet filename="./files/hello_world.py" source="./files/hello_world.py" />
