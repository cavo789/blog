---
slug: linux-xmlstarlet
title: The xmlstarlet utility for Linux
date: 2023-12-13
description: Master XML data manipulation on the Linux command line with xmlstarlet. This guide shows you how to beautify XML output and filter nodes using XPath expressions.
authors: [christophe]
image: /img/v2/bash.webp
mainTag: linux
tags: [bash, linux, tips, xml, xmlstarlet]
language: en
---
![The xmlstarlet utility for Linux](/img/v2/bash.webp)

`xmlstarlet` is a powerful utility for Linux allowing manipulating XML data from the command line and can be integrated into shell scripts.

Using `xmlstarlet` you can beautify XML output but also filter it like f.i. showing only a given node.

<!-- truncate -->

To verify if `xmlstarlet` is already installed on your system, simply run `which xmlstarlet`. If you get `xmlstarlet not found` as an answer, please install it: `sudo apt-get update && sudo apt-get -y install xmlstarlet`

## Let's play

For the illustration, please start a Linux shell and run `mkdir -p /tmp/xmlstarlet && cd $_`.

Create a new file called `data.xml` with this content:

<Snippet filename="data.xml" source="./files/data.xml" />

As you can see, our XML has no format, everything on the same line.

We can beautify it using the `format` action:

<Terminal>
$ cat "data.xml" | xmlstarlet format --indent-spaces 4
</Terminal>

<Snippet filename="data.xml" source="./files/data.part2.xml" />

We can also use `Xpath` to specify our desired output:

<Terminal>
$ cat "data.xml" | xmlstarlet sel -t -v "/bookstore/book/title"

Everyday Italian
Harry Potter
XQuery Kick Start
Learning XML

</Terminal>

If you don't known XPath yet, we've used `"/bookstore/book/title"` because our XML is constructed like that. As you can see below, our root node is called `bookstore`, then we have one or more `book` and each book has a `title`.

<Snippet filename="data.xml" source="./files/data.part3.xml" />

We can also make some filtering like getting books for children:

<Terminal>
$ cat "data.xml" | xmlstarlet sel -t -v "//book[@category='children']/title"

Harry Potter
</Terminal>

And here, the XPath expression `//book[@category='children']/title` means: give me each `book`; it doesn't matter where the book node is located; but only if it has an attribute named `category` and whose value is `children`. Then, if found, display his `title`.

<Snippet filename="data.xml" source="./files/data.part4.xml" />

Read the [official documentation](https://xmlstar.sourceforge.net/docs.php) to learn more about xmlstarlet.