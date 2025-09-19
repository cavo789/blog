---
slug: docusaurus-snippets
title: A component for showing code snippets in a Docusaurus blog
authors: [christophe]
image: /img/docusaurus_component_social_media.jpg
series: Creating Docusaurus components
mainTag: component
tags: [component, docusaurus, markdown, react, swizzle]
blueskyRecordKey:
draft: true
date: 2025-09-30
---

<!-- markdownlint-disable MD046 -->
<!-- cspell:ignore reposts,packagist,3lun2qjuxc22r,repost,noopener,noreferrer,docux -->

![A component for showing code snippets in a Docusaurus blog](/img/docusaurus_component_banner.jpg)

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

It works but, ok, let's create ours.

In this article we'll learn how to create a `Snippets` component and get this look&feel:

<Snippet filename="blog/index.md">

Hello world! Proud to be here!!!

</Snippet>

## Creation of our Snippets component

Please create the `src/components/Snippets/index.js` file with this content:

<Snippet filename="src/components/Snippets/index.js" source="src/components/Snippets/index.js" />

Also create the stylesheet:

<Snippet filename="src/components/Snippets/styles.module.css" source="src/components/Snippets/styles.module.css" />

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

## Using the Snippets component

Now, if you want to add a snippets in your blog, just do something like this:

```html
<Snippet filename="who_are_you.py">

name = input("What's your name? ")

if name:
    print(f"Hello, {name}!")
else:
    print("Hello, stranger!")

print("Nice to meet you.")

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

There is much better way to use the `Snippet` component when the source file is on your disk.

Let's imagine this:

`<Snippet filename="src/components/Blog/PostCard/index.js" source="src/components/Blog/PostCard/index.js" />`

* `filename` is thus the title to show in the article so the reader knows the file should be named like that
* `source` is the relative path (from your Docusaurus root folder) when the file can be retrieved. In this scenario, we don't have to put the source code in the file but Docusaurus will do the job for us:
  * When previewing the site (dev mode), a plugin will read the content immediately from the disk and will inject its content. So, if the sourced file is updated, your article will always be up-to-date
  * When building the static version (prod mode), the Docusaurus build engine will also read the content of the file from the disk and inject it in your article.

## Demo, hardcoded content

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
