---
slug: linux-xmlstarlet
title: The xmlstarlet utility for Linux
date: 2023-12-13
description: Master XML data manipulation on the Linux command line with xmlstarlet. This guide shows you how to beautify XML output and filter nodes using XPath expressions
authors: [christophe]
image: /img/v2/bash.webp
series: Modern CLI tools for your terminal
mainTag: linux
tags:
  - bash
  - linux
language: en
review_date: 2026-07-30
---
![The xmlstarlet utility for Linux](/img/v2/bash.webp)

<TLDR>
This article introduces `xmlstarlet`, the XML equivalent of `jq`: pretty-printing minified XML with `xmlstarlet format --indent-spaces 4`, and extracting or filtering nodes with XPath expressions via `xmlstarlet sel -t -v`, including attribute-based filters like `//book[@category='children']/title`.
</TLDR>

`xmlstarlet` is a powerful utility for Linux that lets you manipulate XML data from the command line and can be integrated into shell scripts. *It is to XML what <Link to="/blog/linux-jq">`jq`</Link> is to JSON.*

Using `xmlstarlet` you can beautify XML output but also filter it like f.i. showing only a given node.

<!-- truncate -->

## A wall of XML in, one word out

Here is the file we'll play with, `data.xml`, exactly as a machine would have written it; everything on the same line, no format at all:

<Snippet filename="data.xml" source="./files/data.xml" />

Now let's ask it a question: *give me the title of the book filed under the `children` category*.

<Terminal typewriter>
$ cat "data.xml" | xmlstarlet sel -t -v "//book[@category='children']/title"

Harry Potter
</Terminal>

One command, one answer, and not a single line of parsing code.

## Beautifying the file

The second thing you'll use every day: making that wall readable, using the `format` action.

<Terminal typewriter>
$ cat "data.xml" | xmlstarlet format --indent-spaces 4
</Terminal>

<Snippet title="The output of the format action" source="./files/data.part2.xml" />

## Installing xmlstarlet

To verify if `xmlstarlet` is already installed on your system, simply run `which xmlstarlet`. If you get `xmlstarlet not found` as an answer:

<Prerequisite
  name="xmlstarlet"
  install="sudo apt-get update && sudo apt-get -y install xmlstarlet"
  check="xmlstarlet --version"
  checkOutput={`\n1.6.1`}
  typewriter
/>

## Let's play

To reproduce the two commands above on your machine, please start a Linux shell and run `mkdir -p /tmp/xmlstarlet && cd $_`, then create a new file called `data.xml` with the content displayed at the top of this article.

## Understanding the XPath expression

An XPath expression is just a path in the tree. Our root node is called `bookstore`, then we have one or more `book` and each book has a `title`:

<Snippet title="How our XML is constructed" source="./files/data.part3.xml" />

Walk that path from the root and you get every title of the file:

<Terminal typewriter source="./files/terminal-1.txt" />

The expression used at the beginning of this article, `//book[@category='children']/title`, is the filtering version: give me each `book`; it doesn't matter where the book node is located (that's the `//` prefix); but only if it has an attribute named `category` and whose value is `children`. Then, if found, display its `title`.

## Conclusion

Two actions cover most of the day-to-day needs: `format` to make an XML file human-readable, and `sel -t -v` with an XPath expression to pull exactly the node you need out of it; both usable in a pipe, so both usable in a shell script.

Read the [official documentation](https://xmlstar.sourceforge.net/docs.php) to learn more about xmlstarlet, and if your next file is a `.json` one, <Link to="/blog/linux-jq">the jq utility for Linux</Link> is the very same story with a different syntax.
