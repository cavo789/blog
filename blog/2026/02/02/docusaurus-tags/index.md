---
slug: docusaurus-tags
title: Tags management in Docusaurus
date: 2026-02-02
description: Automate Docusaurus tag management with this Python script. Clean up duplicates, fix casing, and merge tags safely across hundreds of Markdown files via Docker.
authors: [christophe]
image: /img/v2/tags_manager.webp
series: Creating Docusaurus components
mainTag: Docusaurus
tags: [docker, docusaurus, python]
language: en
blueskyRecordKey: 3mdubzzquds2t
---

![Tags management in Docusaurus](/img/v2/tags_manager.webp)

<TLDR>
This article introduces a custom Python script designed to automate the cleanup and management of inconsistent tags within a Docusaurus blog. The tool runs in a Docker container to list, rename, and delete tags while providing smart suggestions for merging duplicates or fixing case variations. It also discusses using Docusaurus's native configuration options to enforce stricter tag usage policies moving forward.
</TLDR>

More than 200 blog posts later, my Docusaurus site has accumulated a bit of tag chaos. Too many similar tags, inconsistent capitalization, singular vs plural forms... Tags with just one or two posts. And so on.

In this post, I'll share a **Python script** I wrote to automate tag management like removing some tags, merging others, and cleaning up inconsistencies.

It's quite impossible to do by hand when you have hundreds of Markdown files. Plus, doing it manually risks breaking the YAML frontmatter formatting.

<!-- truncate -->

## The Solution: A Smart Tag Manager

I wanted a tool that could do three things:

1.  **List** all tags by frequency.
2.  **Suggest** optimizations (finding duplicates or singular/plural variations).
3.  **Rename** or **Delete** tags safely.

### Smart Suggestions

The coolest part of the script is the "Optimization Suggestions". It compares every tag against every other tag to find potential duplicates.

It looks for:

* **Case variations**: `GitHub` vs `github`.
* **Plurals**: `snippet` vs `snippets`.
* **Substrings**: `visual studio code` vs `vscode`.
* \*his helps me spot the mess I didn't even know I had.

### The Script

Here is the full Python script. It uses `argparse` to handle command-line arguments and `python-frontmatter` to parse the files.

<Snippet filename=".scripts/tags-manager.py" source=".scripts/tags-manager.py" defaultOpen={false} />

## How to Run It (Docker-First)

As always, I don't want to pollute my host machine with Python dependencies. I run this script using Docker.

I have a `Makefile` target set up, but essentially, it runs a command like this:

<Terminal wrap={true}>
$ docker run -it --rm -v .:/app -w /app --entrypoint /bin/sh python:3.14-slim -c "pip install --root-user-action=ignore oyaml python-frontmatter >/dev/null && python .scripts/tags-manager.py list"
</Terminal>

But, for sure, that command is quite complex to remember so I'm using a Makefile target:

<Snippet filename="makefile" source="./files/makefile" defaultOpen={false} />

### Examples

**1. Listing tags and getting suggestions:**

<Terminal wrap={true}>
$ make tags-manager ARGS="list"
</Terminal>

![List of tags](./images/list.webp)

**2. Renaming a tag:**

If, by looking at the list of tags, I see I've a `snippets` tag and a `snippet` one, I'll merge them like this:

<Terminal wrap={true}>
make tags-manager ARGS="rename snippets,snippet"
</Terminal>

**3. Deleting a tag:**

I can also find that a specific tag didn't have any added-value so, to remove it, I'll run something like this:

<Terminal wrap={true}>
$ make tags-manager ARGS="delete draft"
</Terminal>

## Bonus

Natively, Docusaurus allows you to create a special file called `blog/tags.yml`.

Here is the one I'm using:

<Snippet filename="blog/tags.yml" source="blog/tags.yml" defaultOpen={false} />

With such file, you can then configure your `docusaurus.config.js` file and set the `onInlineTags` attribute to `warn` or `throw`.

Need more info, read the [Tags File](https://docusaurus.io/docs/api/plugins/@docusaurus/plugin-content-docs#tags-file) official documentation.

## Conclusion

Keeping a blog organized is a continuous process. With this script, I can quickly audit my tags and ensure that `Docusaurus` doesn't become `docusaurus` or `DocuSaurus` over time.

Feel free to grab the script and adapt it to your own static site generator!
