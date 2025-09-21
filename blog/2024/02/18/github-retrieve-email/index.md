---
date: 2024-02-18
slug: github-retrieve-email
title: Github - How to find email addresses for most users
authors: [christophe]
image: /img/v2/github_tips.jpg
mainTag: github
tags: [Github, tips]
---
![Github - How to find email addresses for most users](/img/v2/github_tips.jpg)

You'd like to get in touch with a GitHub user but, e.g., you don't want to post your question as an issue because, e.g., it's not about a specific repository but more generic.

As a result, the problem can be translated in *How to find the email address linked to a GitHub account*.

Recently, I had this need in order to contact someone with a [Docusaurus](https://docusaurus.io/) blog offering a feature that I couldn't find documented on the web. His blog was not on GitHub but other repos well.

:::note It isn't always possible to retrieve the associated email.
Indeed, GitHub provides a.o.t. an option to make the email private in his user settings page.
:::

<!-- truncate -->
## Using web interface

Such tool exists on the web like [https://emailaddress.github.io/](https://emailaddress.github.io/). Just copy/paste there and, perhaps, the system will return any used emails associated to this account.

## Using parametrized URl

GitHub provides, in his public API, the list of public events of a given user.

You can retrieve the email using the following URL: `https://api.github.com/users/xxxxxx/events/public`. Just replace `xxxxxx` by the Github user you wish to retrieve the email.

## Based on a last commit

The first thing is, for sure, to go to a public repository maintained by this person and to find a commit, any commit in fact, that he's made.

On the main page of the repo, locate f.i. the last commit ID he's made:

![Last commit ID](./images/find_any_commit.png)

Click on the ID and you'll get a new web page with a URL like f.i. `https://github.com/<USERNAME>/<REPONAME>/commit/<LONG_COMMIT_ID>`. Edit the URL and just append the `.patch` suffix to it (so now, the URL should be `https://github.com/<USERNAME>/<REPONAME>/commit/<LONG_COMMIT_ID>.patch`).

Before the suffix was added, this is what the page looked like:

![Before adding the suffix](./images/before.png)

And once added:

![Once the .patch suffix has been added](./images/after.png)

As you can see, the email address associated with the Github account used to send the commit is now displayed.
