---
slug: docusaurus-snippets
title: A component for showing code snippets in a Docusaurus blog
authors: [christophe]
image: /img/v2/docusaurus_react.jpg
series: Creating Docusaurus components
description: Learn how to build a custom React component to embed dynamic code snippets in your Docusaurus blog for a more interactive reader experience.
mainTag: component
tags: [component, docusaurus, iconify, markdown, plugin, snippet]
blueskyRecordKey: 3lzkrxkfpo22m
date: 2025-09-24
---

<!-- markdownlint-disable MD046 -->
<!-- cspell:ignore iconify,docux,pyproject -->
![A component for showing code snippets in a Docusaurus blog](/img/v2/docusaurus_react.jpg)

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

And it's rendered like this in HTML:

<details>
    <summary>blog/index.md</summary>

    Hello world! Proud to be here!!!

</details>

:::tip
It works but ... can we do better. I think to f.i. add an icon based on the language type, also do color's distinction between language and much, much better, don't copy/paste the code anymore in the article but just read it from the disk.
:::

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

<Snippet filename="src/theme/MDXComponents.js">

```js
import MDXComponents from "@theme-original/MDXComponents";
import Snippets from "@site/src/components/Snippets";

export default {
  // Reusing the default mapping
  ...MDXComponents,
  Snippets,
};
```

</Snippet>

### LogoIcon of Docux

You'll also need the [LogoIcon](https://docuxlab.com/blog/logoicon-component-docusaurus/) created by [Docux](https://github.com/Juniors017).

This component will make easy to retrieve a SVG icon for a language (let's say Python) and display it. Under the scenes, LogoIcon is using [Iconify](https://icon-sets.iconify.design/).

In very short:

1. Please run `yarn install @iconify/react` to install the iconify library
2. Please create this file `src/components/Blog/LogoIcon/index.js`:

<Snippet filename="src/components/Blog/LogoIcon/index.js" source="src/components/Blog/LogoIcon/index.js" />

## Using the Snippets component

Now, if you want to add a snippets in your blog, just do something like this:

```html
<Snippet filename="who_are_you.py">
  name = input("What's your name? ") if name: print(f"Hello, {name}!") else:
  print("Hello, stranger!") print("Nice to meet you.")
</Snippet>
```

And it'll be rendered like this:

<Snippet filename="who_are_you.py">

```python
name = input("What's your name? ")

if name:
    print(f"Hello, {name}!")
else:
    print("Hello, stranger!")

print("Nice to meet you.")
```

</Snippet>

## Don't copying/pasting content anymore

Let's do much, much better: don't copy/paste the code to the article but read it from the disk.

Let's imagine this:

`<Snippet filename="src/components/Blog/Snippet/index.js" source="src/components/Blog/Snippet/index.js" />`

- `filename` is thus the title to show in the article so the reader knows the file should be named like that
- `source` is the relative path (from your Docusaurus root folder) when the file can be retrieved. In this scenario, we don't have to put the source code in the file but Docusaurus will do the job for us:
  - When previewing the site (dev mode), a plugin will read the content immediately from the disk and will inject its content. So, if the sourced file is updated, your article will always be up-to-date
  - When building the static version (prod mode), the Docusaurus build engine will also read the content of the file from the disk and inject it in your article.

### To make this working, a need a plugin

In Docusaurus vocabulary, we need a plugin to do this i.e. read the file's content from the disk and "inject" it in the article.

So the plugin will parse the blog post, search for any `<Snippet>` call and check if there is a `src=` attribute. If so, the plugin will open the file and read its content. The plugin will also extract the file's extension (like `.js`). With these two information (content and extension), the plugin will inject the content into the `<Snippet>` tag, just like if you, the blog post author, has make a copy/paste.

The ultimate advantage here: your blog post will always be up-to-date; if you change the file on the disk, your post will automatically get the last version.

Please create the `plugins/remark-snippet-loader/index.cjs` with the content below:

<Snippet filename="plugins/remark-snippet-loader/index.cjs" source="plugins/remark-snippet-loader/index.cjs" />

Also please edit your `docusaurus.config.js` file like this:

<Snippet filename="docusaurus.config.js">

```js
// highlight-next-line
import remarkSnippetLoader from "./plugins/remark-snippet-loader/index.cjs";

const config = {
  // [ ... ]
  presets: [
    [
      "classic",
      {
        // [ ... ]
        blog: {
          beforeDefaultRemarkPlugins: [
            // [ ... ]
            // highlight-next-line
            remarkSnippetLoader,
          ],
        },
        // [ ... ]
      },
    ],
  ],
};

export default config;
```

</Snippet>

This done, please restart your Docusaurus server and on the next start, if some changes have to be made, you can see them in your console:

## Demo, hardcoded content

In this section, I've copy/pasted the source inside the `<Snippet>` tag. Useful when I don't have the file on my disk.

<Snippet filename="sample.apacheconf">

```apacheconf
<VirtualHost *:80>
    ServerName www.example.com
    DocumentRoot /www/domain
</VirtualHost>
```

</Snippet>

<Snippet filename="sample.asm">

```asm
section .data
    msg db 'Hello, world!', 0Ah
section .text
    global _start
_start:
    mov edx, 13
```

</Snippet>

<Snippet filename="script.sh">

```bash
#!/bin/bash
echo "Hello, world!"
```

</Snippet>

<Snippet filename="script.bat">

```batch
@echo off
echo Hello, world!
```

</Snippet>

<Snippet filename="styles.css">

```css
body {
  background-color: #f0f0f0;
}
```

</Snippet>

<Snippet filename="data.csv">

```csv
name,age
Alice,30
Bob,25
```

</Snippet>

<Snippet filename="change.diff">

```diff
- old line
+ new line
```

</Snippet>

<Snippet filename="Dockerfile">

```docker
FROM node:18
WORKDIR /app
COPY . .
RUN npm install
CMD ["node", "index.js"]
```

</Snippet>

<Snippet filename="login.feature">

```gherkin
Feature: User login
  Scenario: Valid login
    Given the user is on the login page
    When the user enters valid credentials
    Then they are redirected to the dashboard
```

</Snippet>

<Snippet filename="hello.html">

```html
<!DOCTYPE html>
<html>
  <body>
    <p>Hello, world!</p>
  </body>
</html>
```

</Snippet>

<Snippet filename=".gitignore">

```ignore
node_modules/
dist/
.env
```

</Snippet>

<Snippet filename="config.ini">

```ini
[server]
port=8080
host=localhost
```

</Snippet>

<Snippet filename="HelloWorld.java">

```java
public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello, world!");
    }
}

```

</Snippet>

<Snippet filename="script.js">
```js
console.log("Hello, world!");
```

</Snippet>

<Snippet filename="data.json">

```json
{
  "name": "example",
  "version": "1.0.0"
}
```

</Snippet>

<Snippet filename="application.log">

```log
[INFO] Server started at 10:00
[ERROR] Connection failed
```

</Snippet>

<Snippet filename="makefile">

```makefile
build:
\tgcc main.c -o app
```

</Snippet>

<Snippet filename="readme.md">

```md
# Hello World

This is a markdown example.
```

</Snippet>

<Snippet filename="hello_world.pas">

```pascal
program HelloWorld;
begin
    writeln('Hello, world!');
end.
```

</Snippet>

<Snippet filename="HelloWorld.php">

```php
<?php
echo "Hello, world!";
?>
```

</Snippet>

<Snippet filename="Hello_World.ps1">

```powershell
Write-Output "Hello, world!"
```

</Snippet>

<Snippet filename="hello_world.py">

```python
print("Hello, world!")
```

</Snippet>

<Snippet filename="active.sql">

```sql
SELECT * FROM users WHERE active = 1;
```

</Snippet>

<Snippet filename="logo.svg">
```svg
<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="40" fill="red" />
</svg>
```

</Snippet>

<Snippet filename="pyproject.toml">

```toml
[package]
name = "example"
version = "0.1.0"
```

</Snippet>

<Snippet filename="HelloWorld.vb">
```vbnet
Public Module HelloWorld
    Sub Main()
        Console.WriteLine("Hello, world!")
    End Sub
End Module
```

</Snippet>

<Snippet filename="message.xml">

```xml
<message>
  <text>Hello, world!</text>
</message>
```

</Snippet>

<Snippet filename="config.yaml">

```yaml
name: Example
version: 1.0.0
```

</Snippet>

## Demo, get content from the disk

Unlike the previous chapter, here, the syntax `<Snippet filename="src/components/Blog/PostCard/index.js" source="src/components/Blog/PostCard/index.js" />` has been used. So, the source code is injected dynamically during the previewing/rendering of the blog. If the source file is updated, the article will be updated too. Both are synchronized.

<Snippet filename="src/components/Blog/PostCard/index.js" source="src/components/Blog/PostCard/index.js" />

<Snippet filename="src/components/Blog/PostCard/readme.md" source="src/components/Blog/PostCard/readme.md" />

<Snippet filename="src/components/Blog/PostCard/styles.module.css" source="src/components/Blog/PostCard/styles.module.css" />
