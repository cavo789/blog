---
slug: gitlab-runner-ssh-key
title: GitLab - Using a SSH key to connect to private repo
authors: [christophe]
image: /img/git_tips_social_media.jpg
mainTag: gitlab
tags: [CI, gitlab, ssh]
blueSkyRecordKey: 3lun2oxe3zs2r
enableComments: true
---
<!-- cspell:ignore libcrypto -->

![GitLab - Using a SSH key to connect to private repo](/img/git_tips_banner.jpg)

In this article, we'll see how to use a private SSH key using a GitLab CI.

The need: when running my CI, the GitLab runner has to be able to connect to my self-hosted (and private) GitLab environment. This because he'll need to pull from there private projects. Think to a PHP project f.i. : in my `composer.json`, I'm referring to dependencies hosted on my GitLab server. Or, same for a Javascript project and his `package.json` file.

Another example: my CI will produce some files (like a `.pdf` one) by converting some Markdown documents to a real documentation. At the end of this conversion, the PDF has to be pushed to the repository.

My need is thus: I should share my SSH key with the GitLab runner.

<!-- truncate -->

:::info
To illustrate this article, let's assume `christophe` is my user account on my self hosted GitLab server and that server is called `my_self_hosted_gitlab`.

Think, to replace these two constants by yours ;-)
:::

## First, I need to have a SSH key

> For the long story, read my [SSH - Launch a terminal on your session without having to authenticate yourself](/blog/linux-ssh-scp) article.

I'll create a private key by running `ssh-keygen -t ed25519 -C "christophe@my_self_hosted_gitlab" -f ~/.ssh/id_ed25519_my_self_hosted_gitlab`.

That command will create the `~/.ssh/id_ed25519_my_self_hosted_gitlab` file. It's my private key and this is the one I'll need in the next step.

## Then, I will encode it for better security

By running `cat ~/.ssh/id_ed25519_my_self_hosted_gitlab | base64 -w 0`, I'll *base64 encode* my private key as a very long string with alphanumeric characters.

I've to copy that long string in the clipboard.

## Third, I have to create a SSH_PRIVATE_KEY CI variable

Here I've a lot of possibilities:

* I'll use the variable just for one repo;
* I'll use the variable for all repositories of a given group (a GitLab group is like a folder containing multiple repo);
* I'll use the variable for all repositories stored on my GitLab instance.

By going to my repository, I've to click on **CI/CD Settings**, expand the **Variables** area so I can add a new variable.

The variable name should be **SSH_PRIVATE_KEY** and I'll select `Masked` (or `Masked and hidden`) for the visibility. For the value, I'll paste the base64 encoded string I've just copied in the clipboard.

I'll finalize the creation of the variable by clicking on the `Add variable` button present at the bottom of the pane.

:::info
If I want to use the key for all repositories of a given group, I just need to proceed the same but not at the repository level but at the group level.
:::

:::info
And, if I'm a GitLab admin, I can start the admin interface and from there, go to the **CI/CD Settings** page and proceed the same way.
:::

## Finally, I have to adjust my .gitlab-ci.yml file

As an example, I'll reuse the example provided by GitLab: [https://gitlab.com/gitlab-examples/ssh-private-key/-/blob/main/.gitlab-ci.yml](https://gitlab.com/gitlab-examples/ssh-private-key/-/blob/main/.gitlab-ci.yml)

:::note
Based on the used image, you'll need to use `apt` or `apk`.

For an ubuntu image like the example below, it'll be `apt`. If, f.i. you're using the `docker` image, then, replace
`apt-get update -y && apt-get install openssh-client git -y` by `apk update && apk add --no-cache openssh-client git`.
:::

<Snippets filename=".gitlab-ci.yml">

```yaml
using_ssh_key:
  image: ubuntu
  before_script:
    - |
      apt-get update -y && apt-get install openssh-client git -y
      eval $(ssh-agent -s)
      mkdir -p ~/.ssh && chmod 700 ~/.ssh
    - |
      echo "$SSH_PRIVATE_KEY" | base64 -d > ~/.ssh/id_ed25519
      cat ~/.ssh/id_ed25519
      chmod 400 ~/.ssh/id_ed25519
    - |
      ssh-keyscan my_self_hosted_gitlab >> ~/.ssh/known_hosts
      chmod 644 ~/.ssh/known_hosts
  script:
    - | # try to connect to my GitLab server
      ssh -T git@my_self_hosted_gitlab
    # - | # try to clone a private repo
    #   git clone git@my_self_hosted_gitlab:my_repo.git
```

</Snippets>

:::note
If the CI fails with an error like *load pubkey "id_ed25519": invalid format* or *error in libcrypto*, one cause can be the key used: the variable `SSH_PRIVATE_KEY` should be initialized with the private key; not the public one.

The base64 string should be created like this: `cat ~/.ssh/id_ed25519_my_self_hosted_gitlab | base64 -w 0` (and, thus, not using the `.pub` file).
:::
