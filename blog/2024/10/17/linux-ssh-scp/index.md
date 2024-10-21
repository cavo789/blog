---
slug: linux-ssh-scp
title: SSH - Launch a terminal on your session without having to authenticate yourself
authors: [christophe]
image: /img/linux_tips_social_media.jpg
tags: [linux, putty, scp, ssh, tips]
enableComments: true
---
![SSH - Launch a terminal on your session without having to authenticate yourself](/img/linux_tips_banner.jpg)

<!-- cspell:ignore randomart -->

Imagine that you regularly need to connect to your Linux server: you need to launch a tool such as Putty, you need to enter your login, password, etc. and carry out various operations before you can access the terminal.

If your password isn't saved in Putty's configuration, you'll have to launch another tool like a password vault; in short, it's annoying.

In this article, we'll look at how to authenticate once and for all on the server using an SSH key.

<!-- truncate -->

## Creating and copying the key

The first thing to do, only once, is to generate a private key.

To do this, please run `ssh-keygen -t rsa -b 4096` to create a RSA key.

You'll be asked to save the generated key in a file.

:::note
Since I already have a `~/.ssh/id_rsa` on my computer, I'll answer to save my key in a file called `~/.ssh/id_rsa_server_name` so I don't overwrite the first RSA key.
:::

```text
❯ ssh-keygen -t rsa -b 4096

Generating public/private rsa key pair.
Enter file in which to save the key (/home/christophe/.ssh/id_rsa): /home/christophe/.ssh/id_rsa_server_name
Enter passphrase (empty for no passphrase):
Enter same passphrase again:
Your identification has been saved in /home/christophe/.ssh/id_rsa_server_name
Your public key has been saved in /home/christophe/.ssh/id_rsa_server_name.pub
The key fingerprint is:
SHA256:xxxxxxxxxxxxxx christophe@xxxxx
```

When this is done, I just need to copy my public key to the server using this command: `ssh-copy-id <USER>@<SERVER_NAME_OR_IP>`. Just replace `<USER>` by your user account on that server (in my case `christophe`) and `<SERVER_NAME_OR_IP>` by the server name or his IP.

```text
❯ ssh-copy-id <USER>@<SERVER_NAME_OR_IP>

/usr/bin/ssh-copy-id: INFO: Source of key(s) to be installed: "/home/christophe/.ssh/id_rsa_server_name.pub"
ECDSA key fingerprint is xxxxxxxxxxx.
Are you sure you want to continue connecting (yes/no/[fingerprint])? yes
/usr/bin/ssh-copy-id: INFO: attempting to log in with the new key(s), to filter out any that are already installed
/usr/bin/ssh-copy-id: INFO: 1 key(s) remain to be installed -- if you are prompted now it is to install the new keys
<USER>@<SERVER_NAME_OR_IP>'s password:

Number of key(s) added: 1

Now try logging into the machine, with:   "ssh '<USER>@<SERVER_NAME_OR_IP>'"
and check to make sure that only the key(s) you wanted were added.
```

As you can see above, I'll need to enter my password to validate the instruction.

:::info
The `ssh-copy-id` command will append your public key to the `~/.ssh/authorized_keys` file on the server.
:::

Now, everything is in place, I can run `ssh '<USER>@<SERVER_NAME_OR_IP>'` and it should work i.e. I should have my SSH terminal opened on that server.

What is really pretty cool is: I'm using Microsoft Terminal in a full screen, a nice background image, etc. and without leaving my preferred terminal, I can jump on the server. If you've already experienced Putty, you know what I mean: Putty interface is so awful.

:::note
Because on my own, my key file is `~/.ssh/id_rsa_server_name` and not, just `.ssh/id_rsa`, I have to run `ssh '<USER>@<SERVER_NAME_OR_IP> -i ~/.ssh/id_rsa_server_name` so the system will not ask for my password.

For example, without the `-i` flag, I'll need to provide my password.

```bash
❯ ssh '<USER>@<SERVER_NAME_OR_IP>'
<USER>@<SERVER_NAME_OR_IP>'s password:
```

But no more if I mention which key file to use.
:::

## Copying files from your computer to the server

Now that we can connect the server so easily, we can f.i. copy files from our computer like this:

```bash
scp local_file <USER>@<SERVER_NAME_OR_IP>:/remote_file
```

First we need to specify our local file (or folder) then where to copy it.

:::note
If you need to specify your key file:

```bash
scp -i ~/.ssh/id_rsa_server_name local_file <USER>@<SERVER_NAME_OR_IP>:/remote_file
```
:::

## Copy files from the server to your computer

Now, in the other direction, from the server to your computer:

```bash
scp <USER>@<SERVER_NAME_OR_IP>:/remote_file local_file
```

## Copying folders

If you need to copy a folder, just add the recursive flag i.e. `-r`.

For instance, `scp -r <USER>@<SERVER_NAME_OR_IP>:~/backup/ .` will copy the entire `~/backup` folder from the server in my current, local, folder. Really handy.

## Tips

### Using the config file

As we have seen, when using the `ssh` or `scp` command, we need to specify the user name, the name or IP address of the server and the name of the file containing the private key. That's a lot of information to provide, isn't it?

What's more, like me, I can't remember all this information. I just want to connect to my application server and that's it!

It would be nice to be able to ssh my_application and that's it. No?

This is the purpose of the `~/.ssh/config` file!

Just imagine:

* The IP address of my server is 1.2.3.4;
* On this server, my local user is christophe and
* my key is id_rsa_my_app.

To connect on that server, my ssh command looks like this: `ssh christophe@1.2.3.4 -i ~/.ssh/id_rsa_my_app`. Not easy at all!

Let's create a `~/.ssh/config` file. If the file already exists, just edit it: `code  ~/.ssh/config`.

Add these lines in the file:

```text
Host my_app
    Hostname 1.2.3.4
    User christophe
    IdentityFile ~/.ssh/id_rsa_my_app
```

Save the file and go back to the console.

Now, you can just run `ssh my_app` to make the connection. Pretty easy no?

Want more info? Continue your reading [here](https://linuxize.com/post/using-the-ssh-config-file/)
