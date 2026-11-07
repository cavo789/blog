---
slug: tmux-ssh-persistent-sessions
title: "tmux: Your SSH Connection Drops, Your Work Keeps Running"
authors: [christophe, claude]
image: /img/v2/ssh.webp
mainTag: ssh
tags: [ssh, linux, bash, docker]
date: 2026-11-07
description: "Start a long task on a remote server, lose your SSH connection, reconnect and find everything still running. Try tmux in a throwaway Docker lab without installing anything."
ai_assisted: true
draft: true
---

![tmux: Your SSH Connection Drops, Your Work Keeps Running](/img/v2/ssh.webp)

<TLDR>
A task started in a plain SSH session usually dies with the connection. tmux runs your shell on the server, independently of your SSH connection, so you can lose the network, close your laptop and come back to the same screen with the task still running. A disposable Docker lab lets you test this without touching a real server, and only three commands are needed for daily use.
</TLDR>

Damn. A database migration is 80% done on a remote server, the Wi-Fi hiccups, and the terminal freezes on `client_loop: send disconnect: Broken pipe`. Is the migration still running? Did it stop halfway? Now you get to find out, with your heart beating a little faster than you would like.

By the end of this article, a dropped connection will cost you nothing more than typing one command to get back to your work.

<!-- truncate -->

## Seeing It in Action with Docker

*Already know tmux? [Skip to the daily commands](#the-three-commands-you-will-really-use) — this chapter is only a throwaway lab to try it risk-free.*

Here is the whole trick. The connection dies during a deployment, and the deployment doesn't care:

<Terminal>
{`demo@server:~$ long-deploy
[08:08:06] Deploying... step 5/300
client_loop: send disconnect: Broken pipe

$ ssh demo@server
demo@server:~$ tmux attach -t deploy
[08:09:44] Deploying... step 54/300`}
</Terminal>

Want to see it with your own eyes? No server to risk here: this small image acts as your remote machine, with SSH, tmux and a fake five-minute deployment script:

<Snippet filename="Dockerfile" source="./files/Dockerfile" defaultOpen={false} />

Save it in an empty folder, then build and start the "server":

<Terminal>
$ docker build -t tmux-lab .
$ docker run -d --name tmux-lab --hostname server -p 127.0.0.1:2222:22 tmux-lab
</Terminal>

Connect with the password `demo`. The two `-o` options simply stop this temporary host from being recorded in your `known_hosts`:

<Terminal wrap={true}>
$ ssh -p 2222 -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null demo@localhost
</Terminal>

Now, on the "server", start a named tmux session, and run the deployment inside it:

<Terminal>
{`demo@server:~$ tmux new -s deploy
demo@server:~$ long-deploy
[08:08:02] Deploying... step 3/300
[08:08:04] Deploying... step 4/300
[08:08:06] Deploying... step 5/300`}
</Terminal>

Now do what you are never supposed to do: **close the terminal window**. Not politely — just click the cross, exactly like a network failure would. Wait a little, open a new terminal, connect with the same `ssh` command, then:

<Terminal>
{`demo@server:~$ tmux ls
deploy: 1 windows (created Sat Nov  7 08:07:58 2026)
demo@server:~$ tmux attach -t deploy
[08:09:40] Deploying... step 52/300
[08:09:42] Deploying... step 53/300
[08:09:44] Deploying... step 54/300`}
</Terminal>

The counter kept going while you were away. So cool, no? Press <kbd>Ctrl</kbd>+<kbd>c</kbd> to stop the script, then clean up from your own machine once you've finished playing:

<Terminal>
$ docker rm -f tmux-lab
</Terminal>

## Why the Session Survives

- SSH only carries your keyboard and your screen; tmux is a small server process on the remote machine, and it is tmux that owns your shell.
- When the connection drops, tmux loses a viewer, not a program, so everything inside continues as if nothing had happened.
- Sessions live in the memory of the remote machine: they survive a network cut, but a server reboot ends them.

## The Three Commands You Will Really Use

Most servers already have tmux. If not, it is one package away, on the **server**, not on your computer: `sudo apt install tmux` on Debian and Ubuntu.

| Goal | Command |
| --- | --- |
| Create a named session | `tmux new -s deploy` |
| List the sessions | `tmux ls` |
| Come back to a session | `tmux attach -t deploy` |

You can also leave on purpose. Press <kbd>Ctrl</kbd>+<kbd>b</kbd>, release, then <kbd>d</kbd> for *detach*. The task keeps running and you can go home, then attach again from another computer.

`Ctrl+b` is the prefix of every tmux shortcut. These are worth remembering next:

| Shortcut (after `Ctrl+b`) | Effect |
| --- | --- |
| `d` | Detach, and leave everything running |
| `c` | Create a new window |
| `n` / `p` | Next / previous window |
| `%` / `"` | Split the pane side by side / top and bottom |
| `[` | Scroll through the history; `q` to quit |

That `[` matters from the first day: inside tmux, your terminal's scrollbar no longer shows the session's history.

## Everyday Situations

The simplest habit is the one that saves you: **type `tmux new -s something` before anything you wouldn't want to restart**. A few cases where you will recognize yourself:

- **The slow job.** A `docker compose build`, a database dump, an `rsync` of several gigabytes: start it, detach, and check it after lunch.
- **The log watcher.** One window with `docker logs -f my-app`, another for your commands, and both are still there tomorrow morning.
- **The risky upgrade.** During a `do-release-upgrade` or a package upgrade, a dropped connection in the middle is the last thing you want.

## Always Land in tmux

Once you've adopted it, let SSH do the typing. Add a dedicated host to your `~/.ssh/config`:

```text title="~/.ssh/config"
Host myserver-tmux
    HostName myserver.example.com
    User christophe
    RequestTTY yes
    RemoteCommand tmux new -A -s main
```

`tmux new -A -s main` attaches to the `main` session if it exists and creates it otherwise. So `ssh myserver-tmux` always brings you back to where you stopped, and a separate `Host` entry keeps your normal SSH, `scp` and `rsync` untouched. If that file is still a mess, these <Link to="/blog/ssh-config-tips">SSH config tips</Link> will sort it out.

## Conclusion

At the beginning of this article, a broken pipe meant a moment of panic and a half-finished migration. With tmux, it's only a small interruption: reconnect, attach, and the work is right there, still moving. On a local machine, your terminal's tabs and panes already do most of the job, which is why I keep tmux for what it does best, the remote servers. The next time you start something long over SSH, type `tmux new -s` first; your future self, on a bad hotel Wi-Fi, will thank you.
