---
slug: connect-using-ssh-to-your-hosting-server
title: How to connect to your hosting  server using SSH
authors: [christophe]
mainTag: ssh
description: Learn how to connect to your hosting server using SSH with key-based authentication and a simple alias for easy access.
tags: [planethoster, ssh, tips]
image: /img/v2/planethoster-using-ssh.webp
date: 2025-12-29
blueskyRecordKey: 3mb4feo4u7c2t
---
![How to connect to your hosting  server using SSH](/img/v2/planethoster-using-ssh.webp)

<TLDR>
This guide explains how to configure SSH for passwordless, key-based authentication to your hosting server. It details gathering connection information, generating and copying an SSH public key, and setting up an alias in `~/.ssh/config`. This allows for convenient, one-command access like `ssh planethoster`.
</TLDR>


This guide explains how to configure SSH to connect to your hosting server using a short alias so you can SSH without entering a password each time you want to start the connection.

You'll learn how to gather the required information, generate an SSH key pair, copy your public key to the server, and set up `~/.ssh/config` for a convenient shortcut.

For this article, let's assume you have a PlanetHoster hosting account so, at the end of this guide, you'll be able to connect to your PlanetHoster server using a simple command like `ssh planethoster`.

<!-- truncate -->

<StepsCard
  title="You'll need to obtain the following pieces of information:"
  variant="prerequisites"
  steps={[
    "The username for the connection",
    "The server name (or its IP address)",
    "The port number to use",
    "The password associated with the user account."
  ]}
/>


For the first three items, log in to the [PlanetHoster dashboard](https://my.planethoster.com/v2/hosting-management/overview).

You'll land on the dashboard page. In the left sidebar, navigate to **Web Hosting --> Account Management** and click the arrow to open the page:

![Opening your control panel](./images/web_hosting.webp)

At the top of [the page](https://mg.n0c.com/), you'll find the three required pieces of information:

* The *Current user*: the username to use for SSH.
* Your server name (and its IP address).
* The SSH port to use (likely `5022`).

![Your Planethoster Dashboard page](./images/planethoster_dashboard.webp)

The fourth piece of information to gather is the password associated with your user account.

*If you're using another hosting company, the steps to get this information will differ. Please refer to your hosting provider's documentation for details.*

<StepsCard
  title="For the rest of this article, let's assume these values:"
  variant="prerequisites"
  steps={[
    "User: `john_doe`",
    "Server name: `node30-eu.n0c.com`",
    "Port number: `5022`",
    "Password: `p@ssword`"
  ]}
/>

## First, just try with a manual SSH connection

In a Linux (or Windows Powershell) console, run the following command:

<Terminal wrap={true}>
$ ssh -p 5022 john_doe@node30-eu.n0c.com
</Terminal>

You'll be prompted for a password; enter your account password.

If everthing is correctly configured, you will get a shell. You'll be located in your user's home directory (not the system root).

Please type `ls -al` to list files and `pwd` or `whoami` to confirm you are in your home directory:

![Seeing the root directory using SSH](./images/ssh_logged_in.webp)

<AlertBox variant="caution" title="What to do if you get a timeout">
If the `ssh` command takes a long time and then ends with a timeout, it likely means you are using incorrect information, such as the wrong username. Don't retry multiple times in a row, otherwise you'll block your IP address: your hosting company may detect multiple failed connection attempts, interpret them as a security threat, and block your IP address. If this happens, even with the correct command, you won't be able to connect due to the blacklisted IP.

In this case, you'll have to wait a certain amount of time (depends on the hosting company). Best, if you're blocked, would be to create a support ticket and ask for your IP to be unblocked.
</AlertBox>

## Create an SSH Key to Connect to PlanetHoster

In the previous step, we've confirmed that we can connect to the server with our credentials so let's improve the connection by setting up SSH key-based authentication. This will allow passwordless authentication for future connections.

### Create an SSH key

On your local machine, run a command like `ssh-keygen -t ed25519 -C "john_doe" -f ~/.ssh/id_ed25519_hosting` in your terminal. This will create a private SSH key called `~/.ssh/id_ed25519_hosting` (and the associated public key `~/.ssh/id_ed25519_hosting.pub`).

You'll be prompted to enter a passphrase. You can choose to set one for added security or leave it empty for convenience (in this article, I'm not using a passphrase).

<AlertBox variant="info">
Are you curious? Run `cat ~/.ssh/id_ed25519_hosting.pub` to view the content of your public key. The key will look something like `ssh-ed25519 BASE64_STRING john_doe`.
</AlertBox>

### Copy your key to the server

To be able to connect without a password, you need to copy your public key to the server.

Please run `ssh-copy-id -i ~/.ssh/id_ed25519_hosting -p 5022 john_doe@node30-eu.n0c.com` to copy your public key to the hosting server.

You'll be prompted to enter your password one last time.

<Terminal wrap={true}>
$ ssh-copy-id -i ~/.ssh/id_ed25519_hosting -p 5022 john_doe@node30-eu.n0c.com

/usr/bin/ssh-copy-id: INFO: Source of key(s) to be installed: "/home/john_doe/.ssh/id_ed25519_hosting.pub"
/usr/bin/ssh-copy-id: INFO: attempting to log in with the new key(s), to filter out any that are already installed
/usr/bin/ssh-copy-id: INFO: 1 key(s) remain to be installed -- if you are prompted now it is to install the new keys

john_doe@node30-eu.n0c.com's password:

Number of key(s) added: 1
</Terminal>

Make sure you see a message indicating that the key(s) were added successfully.

From now, you will be able to connect without providing a password.

Run the command below as a test:

<Terminal wrap={true}>
$ ssh -i ~/.ssh/id_ed25519_hosting -p 5022 john_doe@node30-eu.n0c.com
</Terminal>

As expected, you'll be immediately connected without a password prompt thanks to our SSH key.

### Simplify the Command with an SSH Config File

The previous command is quite complex, isn't it? Are we able to simplify it? Yes!

Let's simplify it so we can just use `ssh planethoster`.

To do this, run `vi ~/.ssh/config` (or your preferred editor) to open your SSH configuration file. If the file doesn't exist yet, simply create it.

Append the block below to the file (remember to update values according to your setup):

<Snippet filename="~/.ssh/config" source="./files/config" />

Save and close the file (tip: it's `:w!` in vi).

This done, make sure to set the correct permissions for your key by running `chmod 0600 ~/.ssh/id_ed25519_hosting*`. This makes the key files accessible only to you (private and public keys).

<AlertBox variant="note" title="WARNING: UNPROTECTED PRIVATE KEY FILE!">
If you don't set the correct permissions with `chmod`, you will get an error like the one below when you try to connect:

```text
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@         WARNING: UNPROTECTED PRIVATE KEY FILE!          @
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
Permissions 0644 for '/home/john_doe/.ssh/id_ed25519_hosting' are too open.
```

</AlertBox>

### Establish an Easy SSH Connection

From now on, to start an SSH connection to your host, open a terminal and run `ssh planethoster` (or the alias you defined). If everything is configured correctly, you will be connected **immediately** and **without a password prompt**.

![Success](./images/success.webp)

## Troubleshooting & tips

* If a connection fails, run the SSH client in verbose mode to see debug output: `ssh -vvv -p 5022 john_doe@node30-eu.n0c.com` (i.e. add `-vvv` as an extra CLI flag).
* If you see a `WARNING: UNPROTECTED PRIVATE KEY FILE!` error, check local permissions on your private key and use `chmod 600` as shown earlier.
* If you need to, connect to the server, verify that your key exists in `~/.ssh/authorized_keys` and that `~/.ssh` and `authorized_keys` have correct permissions (just run `vi ~/.ssh/authorized_keys` to open the file so you can edit it / remove unwanted keys).

## Conclusion

This guide showed how to set up key-based SSH access to a hosting server and create a simple `ssh planethoster` shortcut.
