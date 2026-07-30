---
slug: vscode-markdown-code-folding
title: Markdown folding not working
date: 2023-11-03
description: Fix your VS Code Markdown code folding issue! Learn why folding may not be working and discover the simple solution to enable code blocks and headings folding for a cleaner editing experience.
authors: [christophe]
image: /img/v2/vscode_tips.webp
mainTag: vscode
tags:
  - markdown
  - vscode
language: en
review_date: 2026-07-30
---
![Markdown folding not working](/img/v2/vscode_tips.webp)

<TLDR>
This article fixes a case where code folding doesn't work in VSCode's Markdown editor: make sure the built-in `@builtin Markdown Language Features` extension is enabled.
</TLDR>

> [https://github.com/microsoft/vscode/issues/107130](https://github.com/microsoft/vscode/issues/107130)

In case code folding is not working in markdown mode as illustrated below, make sure the `@builtin Markdown Language Features` addon is enabled. *That same built-in extension powers <Link to="/blog/vscode-sticky-scroll">sticky scroll</Link> in Markdown files, which stops working for the same reason.*

<!-- truncate -->

![code_folding](./images/code_folding.gif)

![Markdown Language Features](./images/markdown_language_features.webp)

Once folding works again, you may want more control over *what* gets folded: <Link to="/blog/vscode-regions">Working with regions in VSCode</Link> shows how to define your own foldable blocks, even in file types VSCode doesn't support natively.
