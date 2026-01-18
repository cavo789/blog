---
slug: gemini-tldr
title: Automating TL;DR Summaries with Gemini AI
date: 2026-01-17
description: Improve your reader's experience by automatically generating concise TL;DR summaries for your blog posts using Google's Gemini AI and Python.
authors: [christophe]
image: /img/v2/gemini_tldr.webp
series: Creating Docusaurus components
mainTag: component
tags: [ai, docker, docusaurus, python]
draft: true
language: en
---

![Automating TL;DR Summaries with Gemini AI](/img/v2/gemini_tldr.webp)

<TLDR>
Writing summaries for long blog posts improves user experience but can be time-consuming. This article explains how to automate the generation of "Too Long; Didn't Read" (TL;DR) sections using a Python script and Google's Gemini AI. We'll cover the Docker setup, the script usage, and how to integrate it into your Docusaurus workflow.
</TLDR>

As a technical blogger, I was searching for a way to enhance my readers' experience by providing concise summaries at the beginning of my articles. Not loosing time (I hope not!) to read the full article and thinking "How, that was not what I was looking for".

So, I decided to automate the generation of TL;DR summaries using Google's Gemini AI and a simple Python script. In this article, I'll explain how I did.

<!-- truncate -->

## The Concept

The idea is simple: I need some script that will scan my blog post (one or more)and generate a short summary using Gemini AI. Then, it should insert that summary into the blog post, wrapped in a custom `<TLDR>` component for easy styling and visibility.

The script will do the following:

1. Get a path as input (file or folder).
2. Read the Markdown files.
3. Send the content to Gemini AI for summarization.
4. Receive the summary.
5. Inject the summary back in the Markdown file.

My folder structure looks like this: `blog/YYYY/MM/DD/index.md` for each blog post. So by calling the script with `blog/2026/01/`, it will process all posts from January 2026.

## The React Component

First, we need a way to display the summary nicely in Docusaurus. I use a simple custom component for this. Here is the implementation:

```html
<TLDR> This is the summary of the article... </TLDR>
```

The component code is as follows:

<Snippet filename="src/components/TLDR/index.js" source="src/components/TLDR/index.js" />

<Snippet filename="src/components/TLDR/styles.module.css" source="src/components/TLDR/styles.module.css" />

## The Automation Script

In my blog, I've created a `.scripts/python_tldr` folder to hold the Python script and its dependencies.

<AlertBox variant="info" title="Gemini API">
You'll need a Google Gemini API key for this to work. You can get one from [https://aistudio.google.com/api-keys](https://aistudio.google.com/api-keys).
</AlertBox>

### Running with Docker

Because I'm a huge fan of Docker, I wanted to ensure that the script runs in a consistent environment.

Here is how to start the container:

<Terminal wrap={true}>
$ docker run -it --rm --env-file .env -v .:/app -w /app python sh -c "pip install google-genai python-dotenv > /dev/null 2>&1 && /bin/bash"
</Terminal>

That command will create a Python container, mount your current directory to `/app`, read and load your environment file, install the required packages (`google-genai` for Gemini API access and `python-dotenv` for environment variable management), and start a bash shell where you can run the script.

<AlertBox variant="info" title="Environment Variables">

You'll need to create a `.env` file in the root of your project with the following content:

<Snippet filename=".env" source="./files/.env" defaultOpen={true} />

</AlertBox>

### Generating Summaries

Once inside the container, you can run the script against a specific file or an entire directory.

To process a single file:

<Terminal wrap={true}>
$ python .scripts/python_tldr/main.py blog/2026/01/index.md
</Terminal>

To process all posts for a specific month:

<Terminal wrap={true}>
$ python .scripts/python_tldr/main.py blog/2026/01/
</Terminal>

The script is smart enough to skip files that already have a `<TLDR>` tag, so you can run it safely on your entire blog archive.

## Conclusion

You'll find below all the files you'll need to set this up in your own Docusaurus blog. Feel free to adapt and improve the script as needed!

<ProjectSetup folderName="/your_docusaurus_site" createFolder={false} >
  <Guideline>
    Now, please run 'docker run -it --rm -v .:/app -w /app python sh -c "pip install google-genai python-dotenv && /bin/bash"' to start a terminal in the Python container. Then run something like 'python .scripts/python_tldr/main.py blog/2026/' for instance to add the TLDR summary in each blog post under that path..
  </Guideline>
  <Snippet filename=".env" source="./files/.env" defaultOpen={true} />
  <Snippet filename=".scripts/python_tldr/main.py" source="./files/main.py" />
  <Snippet filename=".scripts/python_tldr/src/ai_service.py" source="./files/src/ai_service.py" />
  <Snippet filename=".scripts/python_tldr/src/file_manager.py" source="./files/src/file_manager.py" />
  <Snippet filename="src/components/TLDR/index.js" source="src/components/TLDR/index.js" />
  <Snippet filename="src/components/TLDR/styles.module.css" source="src/components/TLDR/styles.module.css" />
</ProjectSetup>

<AlertBox variant="info" title="Gemini limitations" >
Based on your Gemini AI plan, there may be limitations on the number of requests or the length of text you can process. Be sure to check your plan details to avoid unexpected charges or interruptions.

Currently, my own plan allows me run 20 calls a day.
</AlertBox>

<AlertBox variant="note" title="src/theme/MDXComponents.js">

Please don't forget to update your `src/theme/MDXComponents.js` file to include the new `TLDR` component, so Docusaurus knows how to render it. If you don't have that file yet, you can create it. Here is the content:

<Snippet filename="src/theme/MDXComponents.js" source="./files/MDXComponents.js" defaultOpen={false} />
</AlertBox>
