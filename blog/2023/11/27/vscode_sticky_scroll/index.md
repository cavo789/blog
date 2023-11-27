---
slug: vscode-sticky-scroll
title: Sticky scroll in vscode
authors: [christophe]
image: ./images/social_media.jpg
tags: [php, tips, vscode]
enableComments: true
---
# Sticky scroll in vscode

![Sticky scroll in vscode](./images/header.jpg)

> [https://dev.to/amrsamy/vs-code-sticky-scroll-2jcd](https://dev.to/amrsamy/vs-code-sticky-scroll-2jcd)

vscode has recently added a really useful new feature: sticky scroll.

This function allows you to scroll through a document such as a Markdown file, a source code written in PHP or JavaScript or any other supported language and, as you scroll, block contextual information such as the name of the class, the name of the function, the start of the loop, etc. in the upper part of the editor. 

<!-- truncate -->

This is really very practical; see the illustration below (*image coming from [https://dev.to/amrsamy/vs-code-sticky-scroll-2jcd](https://dev.to/amrsamy/vs-code-sticky-scroll-2jcd)*)

![Sticky scroll in vscode](./images/sticky_scroll.gif)

Below an example taken from this blog:

![Sticky scroll in markdown](./images/sticky_scroll_markdown.png)

As you can see, I've opened a markdown file and I'm showing part of the article around line 878. Pay attention on the first 'sticked' lines in the window: vscode is showing me my heading 1, my heading 2 and my heading 3 so I know the context. The displayed lines are located in chapter `Make it easy`. That's pretty cool!

To enable the feature, edit your `settings.json` file and add this entry:

```json
"editor.stickyScroll.enabled": true
```