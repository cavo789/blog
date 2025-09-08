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

<Snippet filename="src/components/Snippets/index.js">

```js
import React, { useState, useRef, useEffect, useCallback } from "react";
import styles from "./styles.module.css";

export default function Snippets({ filename, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  const contentRef = useRef(null);
  const [height, setHeight] = useState("0px");

  useEffect(() => {
  if (contentRef.current) {
    setHeight(open ? `${contentRef.current.scrollHeight}px` : "0px");
  }
}, [open, children]);

  const handleToggle = useCallback(() => {
    setOpen((prev) => !prev);
  }, []);

  const contentId = useRef(
    `snippet-content-${Math.random().toString(36).substr(2, 9)}`
  ).current;

  return (
    <div className={`${styles.snippet_block} alert alert--info`}>
      <button className={styles.snippet_summary} onClick={handleToggle} aria-expanded={open} aria-controls={contentId}>
        <span className="">{filename}</span>
        <span className={`${styles.chevron} ${open ? styles.rotate : ""}`}>&#9662;</span>
      </button>
      <div ref={contentRef} id={contentId} className={styles.snippet_content} style={{ maxHeight: height }} >
        <div className={styles.snippet_inner}>{children}</div>
      </div>
    </div>
  );
}

```

</Snippet>

Also create the stylesheet:

<Snippet filename="styles.module.css">

```css
code {
  /* This variable adapts automatically to light and dark themes */
  background-color: var(--ifm-code-background) !important;
  padding: 0px !important;
}

code:hover {
  background-color: var(--ifm-code-background) !important;
  padding: 0px !important;
}

.snippet_block {
  border: 1px solid var(--ifm-color-emphasis-300);
  border-radius: 8px;
  margin: 1rem 0;
  overflow: hidden;
}

.snippet_summary {
  width: 100%;
  background: none;
  border: none;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  font-weight: bold;
  --chevron-rotation: 0deg;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.snippet_summary:hover {
  background: var(--ifm-hover-overlay);
}

.snippet_summary[aria-expanded="true"] {
  --chevron-rotation: 180deg;
}

.snippet_summary:focus-visible {
  outline: 2px solid var(--ifm-color-primary);
  outline-offset: 2px;
}

.chevron {
  transition: transform 0.3s ease;
  transform: rotate(var(--chevron-rotation));
}

.chevron.rotate {
  transform: rotate(180deg);
}

.snippet_content {
  overflow: hidden;
  transition: max-height 0.35s ease;
}

.snippet_inner {
  padding: 0.75rem 1rem;
}

.snippet_toolbar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 0.5rem;
}

```

</Snippet>

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

## Demo

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
