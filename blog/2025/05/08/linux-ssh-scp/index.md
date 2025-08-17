---
slug: linux-ssh-scp
title: SSH - Launch a terminal on your session without having to authenticate yourself
authors: [christophe]
image: /img/linux_tips_social_media.jpg
mainTag: ssh
tags: [linux, putty, scp, ssh, tips]
blueSkyRecordKey: 3lun2x6tugs2r
enableComments: true
---
![SSH - Launch a terminal on your session without having to authenticate yourself](/img/linux_tips_banner.jpg)

**Updated on May 8 2025**

<!-- cspell:ignore randomart -->

Imagine that you regularly need to connect to your Linux server: you need to launch a tool such as Putty, you need to enter your login, password, etc. and carry out various operations before you can access the terminal.

If your password isn't saved in Putty's configuration, you'll have to launch another tool like a password vault; in short, it's annoying.

In this article, we'll look at how to authenticate once and for all on the server using an SSH key.

<!-- truncate -->

:::info
To illustrate this article, let's assume `christophe` is the remote username (this is the username for the server, distinct from your local username) and `my_blog.be` is the remote server address.

Think, to replace these two constants by yours ;-)
:::

## TLDR

Create a SSH key, copy it to the remote server and run a SSH connection. Steps 1 and 2 have to be done just once.

1. `ssh-keygen -t ed25519 -C "christophe@my_blog.be" -f ~/.ssh/id_ed25519_my_blog`
2. `ssh-copy-id -i ~/.ssh/id_ed25519_my_blog christophe@my_blog.be`
3. `ssh -i ~/.ssh/id_ed25519_my_blog christophe@my_blog.be`

## In-depth

### 1. Creating the SSH key

The first thing to do, only once, is to generate a SSH key on your host for the remote server.

By running `ssh-keygen -t ed25519 -C "christophe@my_blog.be" -f ~/.ssh/id_ed25519_my_blog` (or `ssh-keygen -t rsa -C "christophe@my_blog.be" -b 4096 -f ~/.ssh/id_rsa_my_blog` for the RSA algorithm):

1. You'll create a SSH key for the remote user `christophe` on server `my_blog.be`. You'll get a private key and a public one,
2. The key will be saved on your machine and the filename will be `~/.ssh/id_ed25519_my_blog` for the private key (and will have the `~/.ssh/id_ed25519_my_blog.pub` for the public one),
3. The key will be based on the ed25519 algorithm.

### 2. Copying the key

When this is done, you've to copy the public SSH key to your remote server. To do this, please run `ssh-copy-id -i ~/.ssh/id_ed25519_my_blog christophe@my_blog.be`. This has to be done just once.

1. You'll copy your local SSH public key `id_ed25519_my_blog` on the `my_blog.be` server,
2. The key will be added for the remote user `christophe`,
3. You'll have to provide the password of that user when prompted.

:::info
The `ssh-copy-id` command will append your public key to the `~/.ssh/authorized_keys` file on the server.
:::

### 3. Connect to the server

Now, everything is in place, you can run `ssh -i ~/.ssh/id_ed25519_my_blog christophe@my_blog.be` and it should work because the `id_ed25519_my_blog` public key was already copied on the server `my_blog.be` for the user `christophe`.

:::info
You can display or edit the content of the `~/.ssh/authorized_keys` file by running `cat ~/.ssh/authorized_keys` (or `vi ~/.ssh/authorized_keys`). You can then remove old allowed keys f.i.
:::

## Copying files from your host to the server

Now that we can connect the server so easily, we can f.i. copy files from our host like this:

```bash
scp -i ~/.ssh/id_ed25519_my_blog local_file christophe@my_blog.be:/remote_file
```

First we need to specify our local file (or folder) then where to copy it.

## Copy files from the server to your host

Now, in the other direction, from the server to your host:

```bash
scp -i ~/.ssh/id_ed25519_my_blog christophe@my_blog.be:/remote_file local_file
```

## Copying folders

If you need to copy a folder, just add the recursive flag i.e. `-r`.

For instance, `scp -r christophe@my_blog.be:~/backup/ .` will copy the entire `~/backup` folder from the server in my current, local, folder. Really handy.

## Tips

## Running ssh from Microsoft Terminal

The SSH experience is much, much better using Microsoft Terminal than the old Putty application.

With Microsoft Terminal, you can work in a full screen mode, you can have a nice background image, you can work with a much better font (the standard one with Putty is awful), use tabs, ...

If you've already experienced Putty, you know what I mean.

### Using the config file

As we have seen, when using the `ssh` or `scp` command, we need to specify the user name, the name or IP address of the server and the name of the file containing the private key. That's a lot of information to provide, isn't it?

What's more, like me, I can't remember all this information. I just want to connect to my application server and that's it!

It would be nice to be able to ssh my_application and that's it. No? This is the purpose of the `~/.ssh/config` file!

To connect on that server, my ssh command looks like this: `ssh christophe@my_blog.be -i ~/.ssh/id_ed25519_my_blog`. Not easy to remember!

Let's create a `~/.ssh/config` file. If the file already exists, just edit it: `code  ~/.ssh/config`.

Add these lines in the file:

<Snippets filename="~/.ssh/config">

```text
Host my_app
    Hostname my_blog.be
    User christophe
    IdentityFile ~/.ssh/id_ed25519_my_blog
```

</Snippets>

Save the file and go back to the console.

Now, you can just run `ssh my_app` to make the connection. Pretty easy no?

Want more info? Continue your reading [here](https://linuxize.com/post/using-the-ssh-config-file/)
