---
slug: docusaurus-components-accessibility-audit
title: "I Audited My Docusaurus Components for Accessibility, and the Report Stings"
authors: [christophe, claude]
image: /img/v2/docusaurus_react.webp
mainTag: component
tags: [docusaurus, component, react, docker, tests]
date: 2026-11-07
description: "Run a real WCAG audit on any website with one Docker container and axe-core. Real results from this blog's custom Docusaurus components: failing contrast, nested controls and invalid ARIA."
series: Creating Docusaurus components
ai_assisted: true
draft: true
---

![I Audited My Docusaurus Components for Accessibility, and the Report Stings](/img/v2/docusaurus_react.webp)

<TLDR>
Custom components look good on your screen, but that says nothing about a reader using a keyboard, a screen reader or a dim monitor. A small Docker image combining Chromium and axe-core audits any URL against WCAG rules with nothing to install. Run on this blog, it found failing contrast on every `Terminal` title, nested controls in the series list and invalid ARIA in the command palette.
</TLDR>

Like you know me, I've written quite a few components for this blog: `Terminal`, `Snippet`, `AlertBox`, a command palette, a series list… I test them in light and dark mode, I find them pretty, and I move on. But have I ever checked whether someone can really *read and use* them? Honestly, no.

So I pointed an automated audit at my own blog. By the end of this article, you'll be able to do the same on your site, with a single command.

<!-- truncate -->

## Seeing It in Action with Docker

*In a hurry for the fixes? [Jump to the findings](#what-the-audit-found-on-this-blog) — this chapter only runs a throwaway container.*

Here is the result for one published article of this blog:

<Terminal source="./files/terminal_audit.txt" />

Four kinds of problems, on a page I considered finished. To run it on your own site, this image has a real Chromium browser, [axe-core](https://github.com/dequelabs/axe-core), and a 30-line script:

<Snippet filename="Dockerfile" source="./files/Dockerfile" defaultOpen={false} />

Save it in an empty folder, build it, and start with the easiest page in the world to judge, then try yours:

<Terminal>
{`$ docker build -t a11y-check .

$ docker run --rm a11y-check https://example.com/
https://example.com/
0 kinds of problems

$ docker run --rm a11y-check https://your-site.example/`}
</Terminal>

Several URLs are accepted, and `-e SCHEME=dark` runs the audit with the browser asking for dark mode. Audit both: colors that pass in one theme can fail in the other. The exit code is `1` when something is found, so the same container can also serve as a CI gate.

## Why These Rules Matter

- A real browser renders the page, so axe-core judges the final colors and the final HTML, including everything your React components generate.
- The filter used here covers WCAG 2.0 and 2.1, levels A and AA, which is the usual target for a website.
- A clean report isn't proof of accessibility: a tool can't judge whether an `alt` text is meaningful or whether the keyboard order makes sense. It finds the mechanical errors, cheaply, so your manual testing can focus on the rest.

## What the Audit Found on This Blog

I scanned the home page and two articles, in both themes, and grouped the results by cause. Fixing one design token can clear dozens of findings at once.

| Component | Problem | Measured | Required |
| --- | --- | --- | --- |
| `Terminal` title, light theme | Text too pale on its background | 4.12:1 | 4.5:1 |
| `Terminal` title, dark theme | Same | 3.46:1 | 4.5:1 |
| Primary buttons, dark theme | Light text on orange | 2.38:1 | 4.5:1 |
| Active navbar link, light theme | Slightly too pale | 4.41:1 | 4.5:1 |
| "No comment yet" (`Bluesky`), light theme | Too pale | 3.99:1 | 4.5:1 |
| Command palette, status row | Too pale | 3.42:1 | 4.5:1 |
| `SeriesPosts` | A control nested inside a `summary` | 2 per page | none |
| Command palette | `option` elements outside a valid `listbox` | 6 + 1 | none |
| `Reaction`, `Bluesky`, `TriedIt` buttons | `aria-label` doesn't contain the visible text | 4 per page | none |
| Links in paragraphs | Recognizable only by their color | 3 to 6 per page | none |

Each row deserves a short translation.

**Contrast.** The `Terminal` alone accounts for 19 of the 22 contrast findings on a code-heavy page. It's one CSS rule, and that's good news. If you've ever tried to read a blog on a phone in the sun, you already know who this rule protects.

**Nested controls.** A clickable element inside a `<summary>` gives a screen reader two overlapping controls in one place. The user may not be told that the inner one exists, or may trigger the wrong one.

**The command palette.** ARIA is a contract: `role="listbox"` promises direct `option` children. Here the options sit inside group wrappers without the role that would make this valid. The list works perfectly with a mouse, and the screen reader gets a structure it can't reliably announce.

**Label mismatch.** A button displaying "Like" with an `aria-label` that says something else fails for a person using voice control. They say what they see, "click Like", and nothing happens.

**Links identified by color.** A reader who doesn't perceive this difference in color can't spot the link in the sentence. An underline solves it.

## The Same Audit on Your Components

The fixes usually fall into three simple habits, in this order of effort:

1. **Start with the design tokens.** Replace a color in one variable, and every component using it is fixed. Check any pair with the same scan rather than by eye.
2. **Prefer native HTML.** A `<button>` already has a keyboard behavior, a focus state and a role. A `<div onClick>` has to rebuild all of it, with new chances of mistakes.
3. **Write ARIA last.** A wrong role is worse than no role, as the palette shows. If you use one, read its [ARIA pattern](https://www.w3.org/WAI/ARIA/apg/patterns/) and respect the expected parents and children.

Then spend five minutes on what no tool can test: unplug your mouse, and go through your page with <kbd>Tab</kbd>, <kbd>Enter</kbd> and <kbd>Esc</kbd>. Can you always see where you are? Can you open and close each thing? Components like the <Link to="/blog/docusaurus-typo-report-component">typo report popup</Link> or the <Link to="/blog/docusaurus-bluesky-comments">Bluesky comments</Link> are the kind of interactive element worth trying this way.

## Conclusion

At the beginning of this article, I believed my components were fine because they looked fine on my screen. The report says otherwise, and that's exactly why it's useful: it gave me an objective, repeatable list instead of an impression. Each of these findings is now on my to-do list. It's your turn: build the image, point it at your site, in both themes, and see what your own components have been hiding from you.
