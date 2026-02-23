---
slug: zsh-docker-functions
title: ZSH Functions - Customizing Your Shell for Docker Management
description: A collection of ZSH functions to enhance your terminal experience, including interactive Docker container management with fzf. Start new sessions, stop containers, and more with ease.
authors: [christophe]
image: /img/v2/zsh.webp
mainTag: zsh
tags: [customization, docker, fzf, linux, zsh]
draft: true
date: 2026-12-31
---
![ZSH Functions - Customizing Your Shell for Docker Management](/img/v2/zsh.webp)

<TLDR>
Enhance your terminal workflow with custom ZSH functions for interactive Docker management. This article presents tools like `dex`, `dstop`, and `dnuke` that utilize `fzf` to let you quickly access shells, stop containers, view logs, and clean up resources without memorizing commands.
</TLDR>

On a daily basis, I use a few ZSH functions that I find useful. These functions can be added to your `~/.zshrc` file to enhance your terminal experience while working with Docker. They provide quick and interactive ways to manage your Docker containers **without having to remember specific commands or container IDs** (and let's be honest, it's easy to forget them!).

In this article, I'll share some of the ZSH functions I use for Docker management, including how to start a new terminal session in a running container, stop containers, access logs (even if the container is stopped), and clean up unused resources. These functions leverage `fzf` for an interactive selection process, making it easier to manage your Docker environment directly from your terminal.

<!-- truncate -->

Because these functions rely on `fzf`, if you don't have `fzf` installed, you can install it using your package manager (e.g., `sudo apt-get install fzf` on Debian-based systems).

## Start a new terminal session in a running Docker container

Imagine you want to quickly access a running Docker container without having to remember its name or ID. The `dex` function allows you to do just that. It lists all running containers and lets you select one to start a new terminal session inside it.

So, by simply running `dex` in your terminal, you can easily access any of your running Docker containers. This is especially useful when you have multiple containers running and want to quickly jump into one of them without having to look up its name or ID.

![Using dex to start a new terminal session in a running Docker container](./images/dex.webp)

<AlertBox variant="tip" title="Press Enter to select the container and start the session or press Ctrl+E to get the command in your prompt for editing (useful if you want to modify the command before running it like disabling the entrypoint, mounting a volume, ...).">
</AlertBox>

<AlertBox variant="tip" title="Root access">
Press <kbd>Ctrl</kbd>+<kbd>R</kbd> while selecting a container with `dex` to start the session with root access. This is useful when you need to perform administrative tasks inside the container that require elevated privileges.
</AlertBox>

## Stop one or more running Docker containers

`dstop` is another useful function that allows you to stop one or more running Docker containers. Similar to `dex`, it uses `fzf` to provide an interactive interface for selecting the containers you want to stop. You can select multiple containers by using the multi-select feature of `fzf` i.e. pressing <kbd>Tab</kbd> to select multiple containers before pressing <kbd>Enter</kbd> to stop them.

Press <kbd>CTRL</kbd>+<kbd>A</kbd> to select all containers at once.

In the right pane, you can see information about the selected container(s) such as the container name, image, status, and ports. This can help you make informed decisions about which containers to stop. You can too see the live resource usage of the selected container(s) (CPU, memory, network I/O, block I/O) to identify which containers are consuming the most resources before deciding to stop them.

![Using dstop to stop one or more running Docker containers](./images/dstop.webp)

## Access to logs of a running Docker container

The `dlogs` function allows you to access the logs of a running Docker container. It also uses `fzf` to provide an interactive interface for selecting the container whose logs you want to view.

In the right pane, you can see the logs of the selected container in real-time. This is particularly useful for debugging purposes, as you can monitor the logs as they are generated. You can use the scroll button of your mouse to scroll through the logs.

![dlogs function to access logs of a running Docker container](./images/dlogs.webp)

## Make some cleaning, remove unused Docker containers, images, volumes and networks

The dnuke function acts as an intelligent, interactive **Docker Cleanup Wizard** designed to reclaim disk space without the risk of blindly deleting resources. Unlike a standard `docker system prune`, `dnuke` first scans your environment and presents a dynamic **Execution Plan**, showing you exactly what can be cleaned up (stopped containers, dangling images, unused volumes, and build cache).

It processes cleanup in granular steps, allowing you to skip specific categories if needed. By default, it operates in a "safe" mode, targeting only dangling (untagged) images.

`dnuke` supports CLI flags to customize its behavior:

* **Deep Clean**: Use `dnuke -a` (or `--all`) to remove **all** unused images, not just dangling ones (similar to `docker image prune -a`).
* **Non-Interactive**: Use `dnuke -y` (or `--force`) to bypass the wizard and automatically confirm all steps.
* **Help**: Run `dnuke --help` to see the full list of options and usage examples.

If the environment is already clean, the wizard detects it immediately and exits without asking unnecessary questions.

![Getting dnuke help to see available options](./images/dnuke_help.webp)

![Running dnuke to clean up unused Docker resources](./images/dnuke.webp)

## One to rule them all

The `dops` function is a wrapper around the other functions. It allows you to quickly access the other functions by using a single command. Simply run `dops` in your terminal, and it will list all the available functions. You can then select the function you want to use, and it will execute the corresponding command.

Now, edit your `~/.zshrc` file and add the following line to source the `docker.zsh` file: `[[ -f ~/.zsh/docker.zsh ]] && source ~/.zsh/docker.zsh`. This will make the functions available in your terminal.

![Using dops to access the interactive menu for Docker management functions](./images/dops.webp)

## How to install

Edit your `~/.zshrc` file and add the following lines at the end of the file:

```zsh
fpath=(~/.zsh/docker-fns $fpath)

autoload -Uz _d_check_env _d_print_cmd _d_has_running_containers
autoload -Uz dex dlogs dnuke dops dstop

# Setup alias for the interactive menu
alias d='dops'

# Print quick reference menu only in interactive sessions to avoid breaking scripts
if [[ -o interactive ]]; then
    echo -e "\033[1;30mDocker Utils loaded:\033[0m"
    echo -e "  \033[0;36mdex\033[0m   (exec/root) \033[0;36mdlogs\033[0m (logs/json)   \033[0;36mdstop\033[0m (stop/kill)"
    echo -e "  \033[0;36mdnuke\033[0m (clean)     \033[0;36mdops\033[0m  (menu/alias \033[1;32md\033[0m)"
fi
```

Now, create the `~/.zsh/docker-fns` directory and move the individual function files (`dex.zsh`, `dlogs.zsh`, `dnuke.zsh`, `dops.zsh`, `dstop.zsh`) into that directory. This way, you can keep your functions organized and easily maintainable.

<ProjectSetup folderName="~/.zsh/docker-fns" createFolder={true} >
  <Guideline>
    Now, edit your `~/.zshrc` file and add the lines mentioned above, in the blog post, to source the `docker.zsh` file and make the functions available in your terminal. This will allow you to use the `dex`, `dlogs`, `dnuke`, `dops`, and `dstop` functions for managing your Docker containers directly from your terminal.
  </Guideline>
  <Snippet filename="_d_check_env" source="./files/_d_check_env" />
  <Snippet filename="_d_print_cmd" source="./files/_d_print_cmd" />
  <Snippet filename="_d_has_running_containers" source="./files/_d_has_running_containers" />
  <Snippet filename="dex" source="./files/dex" />
  <Snippet filename="dlogs" source="./files/dlogs" />
  <Snippet filename="dnuke" source="./files/dnuke" />
  <Snippet filename="dops" source="./files/dops" />
  <Snippet filename="dstop" source="./files/dstop" />
</ProjectSetup>
