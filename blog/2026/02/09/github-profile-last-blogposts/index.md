---
slug: github-profile-last-blogposts
title: Automate your GitHub README with your latest blog posts
date: 2026-02-09
description: Keep your GitHub profile README up to date with your latest blog posts using GitHub Actions. Learn how to set up a scheduled workflow that fetches your RSS feed and updates your README automatically every week.
authors: [christophe]
image: /img/v2/github_profile_automate.webp
mainTag: Github
tags: [actions, docusaurus, github]
language: en
blueskyRecordKey:
---
![Automate your GitHub README with your latest blog posts](/img/v2/github_profile_automate.webp)

<TLDR>
This article explains how to use the `gautamkrishnar/blog-post-workflow` GitHub Action to automatically update a profile README with the latest posts from an RSS feed. The process involves creating a YAML workflow file scheduled with a cron job and adding specific comment tags to the README.md file to mark where the dynamic blog list should be injected.
</TLDR>

I recently found the GitHub Action `gautamkrishnar/blog-post-workflow` and thought: *this could keep my profile README up to date automatically*.

Since I already refactored my Docusaurus [RSS feed](https://www.avonture.be/blog/rss.xml), it's a great fit for automating the latest ten posts on my GitHub profile

Let's add a scheduled GitHub Action (for example, every Sunday) to update my [cavo789](https://github.com/cavo789/cavo789) repo automatically

<!-- truncate -->

So, just to make things clear:

* Once a week, I want the `README.md` file in my [cavo789](https://github.com/cavo789/cavo789) repo is updated automatically.
* The content of the `My last published articles on my blog` chapter will be rewritten and the list of articles will come from my [blog/rss.xml](https://www.avonture.be/blog/rss.xml) file.

Let's start by cloning the repository.

So, in my case, I'll clone my [cavo789](https://github.com/cavo789/cavo789) repo on my disk then start VSCode to edit it.

## Create the workflow YAML file

I've to create a GitHub action (so I should create the `.github/workflows` folder if not yet present).

And in that folder, I'll create a new YAML file, let's call it `blog-post-workflow.yml`:

<Snippet filename=".github/workflows/blog-post-workflow.yml" source="./files/blog-post-workflow.yml" />

### Step by step explanations

#### The introduction block

Not too difficult here, it'll be the name of our action.

```yaml
name: Latest blog post workflow
```

Here, we'll instruct GitHub to run our workflow using a cron i.e. automatically based on a specific time schedule.
In the example below, every Sunday at 00:00 UTC.

```yaml
on:
  schedule:              # Run workflow automatically (in a cron)
    - cron: '0 12 * * 1' # Runs every Monday at 12:00 UTC
  workflow_dispatch:     # This will allow to run the workflow manually too
```

but, too, we want to be able to start the workflow manually. To do this, just open your repo using a browser, click on the `Actions` button and, in the left sidebar, you'll see the action (`Latest blog post workflow` in our example) and find the `Run workflow` button somewhere at the right part of the screen.

We also need to allow the action to write files back (since we'll update the `README.md` file).

```yaml
permissions:
  contents: write       # To write the generated contents to the readme
```

#### The jobs block

We need to foresee two steps; the first one to clone the repo and the second one to do the main job.

The first step is like on your computer: you need to `git clone` the repo before being able to update it.

The second step is taking in charge by the `gautamkrishnar/blog-post-workflow@v1` action.

```yaml
jobs:
  update-readme-with-blog:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4

      - name: Fetch and Update README
        uses: gautamkrishnar/blog-post-workflow@v1
        with:
          feed_list: 'https://www.avonture.be/blog/rss.xml'
          max_post_count: 10
          comment_tag_name: 'BLOG-POST-LIST'
          date_format: 'yyyy-mm-dd'
          template: "<tr><td>$title</td><td>$url</td></tr>"
          commit_message: 'feat: Update README with latest blog posts'
```

You can find detailed documentation on its official site: [https://github.com/marketplace/actions/blog-post-workflow](https://github.com/marketplace/actions/blog-post-workflow) but, in short:

* `feed_list` is the source RSS to query for articles
* `max_post_count` is the maximum number of blog posts to retrieve and to inject in your `README.md` file
* `comment_tag_name` is the commented block to replace (we'll see this below)
* `date_format` to make sure, if you show dates in your content, it's based on your desired format
* `template` is a ... template (HTML in my case) that will be used for any entries in your result (so if you're retrieving 10 articles, you'll obtain a string with ten times your template) and
* ` commit_message` will be used by the `gautamkrishnar/blog-post-workflow` action to push changes to your repo back.

## Updating the README.md file

We've seen that, in your step, we've instructed `gautamkrishnar/blog-post-workflow` to scan for a comment tag called `BLOG-POST-LIST`.

Let's now see how it can be used:

<Snippet filename="README.md" source="./files/readme.md" />

As you can see, there is a `<!-- BLOG-POST-LIST:START -->`  and `<!-- BLOG-POST-LIST:END -->` block in my file.

And now, not really a secret : the GitHub action will thus generate an HTML string with my 10 articles then inject it in my file by removing the two comment tags and push the change to GitHub.

From now on, every Sunday, my repo will be automatically updated.

Easy no?
