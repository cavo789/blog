---
slug: linux-sftp-cli
title: Using sftp on the command line, with or without a proxy
authors: [christophe]
image: /img/linux_tips_social_media.jpg
mainTag: sftp
tags: [linux, scp, sftp, ssh, sshpass, tips]
---
<!-- cspell:ignore sshpass,ssword -->

![Using sftp on the command line, with or without a proxy](/img/linux_tips_banner.jpg)

After my article <Link to="/blog/linux-ssh-scp">SSH - Launch a terminal on your session without having to authenticate yourself</Link>, it was obvious that, next to the `ssh` and `scp` commands, I forgot the `sftp` one.

In this article, we'll explore how to start a SFTP connection to a remote server; from the command line.

In the second section, we'll also learn how to configure the sftp connection to use a proxy server.

<!-- truncate -->

## How to run a sftp connection

The easiest way is `sftp <username>@<hostname_or_ip>` so, if you need to connect to the server having the IP `1.2.3.4` with the user `christophe`, the command to start is simply `sftp christophe@1.2.3.4`.

You'll be prompted to enter your password before being connected to the server.

If you need some automation, you can install `sshpass` using `sudo apt-get update && sudo apt-get install sshpass`.

:::note
The sshpass Linux utility is used by the script to allow a SFTP connection without to have to use the password in plain-text. [Get more info](https://www.redhat.com/sysadmin/ssh-automation-sshpass)
:::

Let's imagine your user is `christophe`, your password is `p@ssword` and the server IP is `1.2.3.4` then you can connect to your user like this: `SSHPASS="p@ssword" sshpass -e sftp christophe@1.2.3.4`.

Here above, we're creating a temporary OS variable called `SSHPASS` with our password in plain text then run `sshpass -e` followed by our sftp command so `sftp <username>@<hostname_or_ip>`.

## Using a proxy server

Using a proxy is not so intuitive. The flag to use is `-o ProxyCommand=''` and a specific command. The command is `/usr/bin/nc --proxy-type http --proxy PROXY:PORT %h %p` where:

* `proxy-type` should be initialized to `http` or `https` depending on your proxy.
* `--proxy` should be set to the proxy domain name (f.i. `my.proxy.be`) and perhaps followed by `:8080` i.e. the port to use
* then `%h %p` should be part of the command
  * `%h` is a placeholder that will be replaced by the hostname of the SFTP server you're trying to connect to.
  * `%p` is another placeholder that will be replaced by the port number of the SFTP server.

The final command will looks something like:

<Terminal>
$ sftp -o ProxyCommand='/usr/bin/nc --proxy-type http --proxy my.proxy.be:8080 %h %p' christophe@1.2.3.4
</Terminal>

And, if you want to use `sshpass`:

<Terminal>
$ {`SSHPASS="p@ssword" sshpass -e sftp -o ProxyCommand='/usr/bin/nc --proxy-type http --proxy my.proxy.be:8080 %h %p' christophe@1.2.3.4`}
</Terminal>

## Setting the port number to use for the SFTP server

If your SFTP server is not running on port `22`, you'll need to specify the port number by using the `-P` flag: `sftp <username>@<hostname_or_ip> -P <port_number>`.

## Running commands on the SFTP server then exit

Imagine you wish to retrieve ZIP files from your SFTP server.

As already seen, using `sshpass` we can bypass the authentication. We just need to make sure a `SSHPASS` variable exists just before calling the `sshpass` command.

Then, to be able to automate some commands on the SFTP server, we can use a *here-document* syntax.

The general look&feel will be this one:

```bash
(
    SSHPASS="<your_password_in_plain_text>"
    sshpass -e sftp <username>@<hostname_or_ip> << !
        <a_list_of_commands>
!
)
```

So, if your user is `christophe`, your password is `p@ssword` and the server IP is `1.2.3.4`, we can connect to the server and, for instance, jump in a folder called `input_folder` then display the list of files / folders and, finally, download all zip files present in the folder:

```bash
(
    SSHPASS="p@ssword"
    sshpass -e sftp christophe@1.2.3.4 << !
        cd input_folder
        ls -alh
        get *.zip
!
)
```
