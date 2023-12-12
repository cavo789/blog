---
slug: linux-xmlstarlet
title: The xmlstarlet utility for Linux
authors: [christophe]
image: /img/bash_tips_social_media.jpg
tags: [bash, linux, tips, xml]
draft: true
enableComments: true
---
# The xmlstarlet utility for Linux

![The xmlstarlet utility for Linux](/img/bash_tips_header.jpg)

`xmlstarlet` is a powerful utility for Linux allowing to manipulate XML data from the command line and can be integrated into shell scripts.

Using `xmlstarlet` you can beautify XML output but also filter it like f.i. showing only a given node.

<!-- truncate -->

To verify if `xmlstarlet` is already installed on your system, simply run `which xmlstarlet`. If you get `xmlstarlet not found` as answer, please install it: `sudo apt-get update && sudo apt-get -y install xmlstarlet`

## Let's play

For the illustration, please start a Linux shell and run `mkdir -p /tmp/xmlstarlet && cd $_`.

Create a new file called `data.xml` with this content:

```xml
<?xml version="1.0" encoding="UTF-8"?><bookstore><book category="cooking"><title lang="en">Everyday Italian</title><author>Giada De Laurentiis</author><year>2005</year><price>30.00</price></book><book category="children"><title lang="en">Harry Potter</title><author>J K. Rowling</author><year>2005</year><price>29.99</price></book><book category="web"><title lang="en">XQuery Kick Start</title><author>James McGovern</author><author>Per Bothner</author><author>Kurt Cagle</author><author>James Linn</author><author>Vaidyanathan Nagarajan</author><year>2003</year><price>49.99</price></book><book category="web"><title lang="en">Learning XML</title><author>Erik T. Ray</author><year>2003</year><price>39.95</price></book></bookstore>
```

As you can see, our XML has no format, everything on the same line.

We can beautify it using the `format` action:

```bash
❯ cat "data.xml" | xmlstarlet format --indent-spaces 4
```

```xml
<?xml version="1.0" encoding="UTF-8"?>
<bookstore>
    <book category="cooking">
        <title lang="en">Everyday Italian</title>
        <author>Giada De Laurentiis</author>
        <year>2005</year>
        <price>30.00</price>
    </book>
    <book category="children">
        <title lang="en">Harry Potter</title>
        <author>J K. Rowling</author>
        <year>2005</year>
        <price>29.99</price>
    </book>
    <book category="web">
        <title lang="en">XQuery Kick Start</title>
        <author>James McGovern</author>
        <author>Per Bothner</author>
        <author>Kurt Cagle</author>
        <author>James Linn</author>
        <author>Vaidyanathan Nagarajan</author>
        <year>2003</year>
        <price>49.99</price>
    </book>
    <book category="web">
        <title lang="en">Learning XML</title>
        <author>Erik T. Ray</author>
        <year>2003</year>
        <price>39.95</price>
    </book>
</bookstore>
```

We can also use `Xpath` to specify our desired output:

```bash
❯ cat "data.xml" | xmlstarlet sel -t -v "/bookstore/book/title"
```

```xml
Everyday Italian
Harry Potter
XQuery Kick Start
Learning XML
```

We can also make some filtering like getting books for children:

```bash
❯ cat "data.xml" | xmlstarlet sel -t -v "//book[@category='children']/title"
```

```xml
Harry Potter
```

Read the [official documentation](https://xmlstar.sourceforge.net/docs.php) to learn more about xmlstarlet.
