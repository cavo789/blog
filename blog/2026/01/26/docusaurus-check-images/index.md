---
slug: docusaurus-check-images
title: Running some checks on your Docusaurus images
date: 2026-01-26
description: A Python script to verify lazy loading and size of images in your Docusaurus site using Playwright and BeautifulSoup.
authors: [christophe]
image: /img/v2/check_images.webp
series: Creating Docusaurus components
mainTag: Docusaurus
tags: [docker, docusaurus, python]
language: en
---

![Running some checks on your Docusaurus images](/img/v2/check_images.webp)

Like you know me well enough now, you know I care a lot about performance. For a lot of good reasons but mainly because it's fun to optimize things and see the results immediately. And it's a good challenge too!

My blog is now quite big (more than 200 articles) and I wanted to make sure that all images are lazy-loaded properly f.i. but how can I be sure of that?

Lazy load? What is it? When you lazy load an image, you tell the browser to only load it when it's about to enter the viewport (i.e., when the user scrolls near it). So instead of loading all images at once when the page loads, only the images that are immediately visible are loaded first. This reduces the initial load time and saves bandwidth, especially for pages with many images.

In this post, I'll share how I enforced lazy loading on this Docusaurus blog and, more importantly, how I automated the verification of this behavior using a Python script.

<!-- truncate -->

## Step 1: Enforcing Lazy Loading in Docusaurus

By default, when you write standard Markdown image syntax `![Alt text](image.webp)`, Docusaurus renders a standard HTML `<img>` tag. While modern browsers support the `loading="lazy"` attribute, it's not always added automatically by the framework.

To ensure **every single image** on my blog is lazy-loaded (and decoded asynchronously), I overrode the default `img` component in Docusaurus.

This is done in `src/theme/MDXComponents.js`. By wrapping the default image component, I can inject the attributes I need:

<Snippet filename="src/theme/MDXComponents.js" source="./files/MDXComponents.js" defaultOpen={false} />

With this simple change, every image generated from Markdown now has `loading="lazy"`.

## Step 2: Trust, but Verify

Implementing the code is one thing; ensuring it works across hundreds of blog posts is another. I wanted to be sure that:

1. Images indeed have the `loading="lazy"` attribute.
2. Large images are properly handled.
3. The behavior persists even after site updates.

Manually inspecting elements in Chrome DevTools is tedious. So, I wrote a **Python script** to automate this.

### The Challenge: Scrolling

Static analysis (just downloading the HTML) isn't enough. Some lazy loading implementations (or hydration processes) might depend on the user actually scrolling down the page.

To simulate a real user, I've used **Playwright**. It allows me to run a headless browser, render the page, and programmatically scroll to the bottom, triggering any lazy-loading mechanisms.

### The Script

The script performs the following actions:

1.  **Browses** a list of URLs (my blog posts).
2.  **Scrolls** down the page multiple times (simulating a user reading).
3.  **Parses** the DOM using `BeautifulSoup`.
4.  **Inspects** every `<img>` tag to verify the presence of `loading="lazy"`.
5.  **Checks** image dimensions using `Pillow` to flag large images that definitely should be lazy-loaded.

<Snippet filename=".scripts/check-images.py" source=".scripts/check-images.py" defaultOpen={false} />

You know me very well now; I like to containerize things. So, I'm not using Python or Playwright directly on my host machine but rather inside a Docker container.

To run the script, I first start a Linux console, then go to my blog folder and finally I run:

<Terminal wrap={true}>
$ docker run -it --rm -v .:/app -w /app --entrypoint /bin/sh mcr.microsoft.com/playwright/python:v1.57.0-jammy -c "pip install --root-user-action=ignore beautifulsoup4 pillow playwright requests >/dev/null && python .scripts/check-images.py"
</Terminal>

This command does the following:

* Mounts the current directory into the container.
* Uses the official Playwright Python Docker image.
* Installs the required Python packages.
* Runs the `.scripts/check-images.py` script (make sure you've saved it on your disk with that name).
* Cleans up the container after execution.

I'll get a report in the console indicating any images that are missing the `loading="lazy"` attribute, especially if they are large.

For instance:

![Example output](./images/output.webp)

Up to you, now, to act on the results! On my own blog, I've added some missing attributes and optimized some images that were too large. I've reviewed my React components too to ensure they also include lazy loading where appropriate.

### Additional Checks

The script also do these checks:

* Check to see if the image format is WebP; if not, it issues a warning.
* Check if the image size exceeds a certain threshold (200 KB); if so, it issues a warning.
* Check if the image height and width attributes are set; if not, it issues a warning.

You can easily modify these checks in the script to fit your own needs. And add yours too!

## Conclusion

Performance optimization is a journey, not a destination. By combining a global code override in Docusaurus with an automated validation script, I can write content peacefully, knowing that my images won't slow down the experience for my readers.

If you are interested in the full script, you can find it in the `.scripts` folder of my repository!
