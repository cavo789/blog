---
slug: docker-python-devcontainer-microsoft
title: Docker - Even easier setup of Python
authors: [christophe]
image: /img/python_tips_social_media.jpg
tags: [devcontainer, docker, python]
enableComments: true
---
![Docker - Even easier setup of Python](/img/python_tips_banner.jpg)

Nothing to install, nothing to configure, nothing to create first.

Here is how to use VSCode and Docker to create a ready-to-user Python environment, whatever if you're under Windows, Linux or Mac.

The only prerequisites are: we should have Docker installed on your system, you should have Visual Studio Code and you've installed the [Docker for Visual Studio Code](https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-docker) addon in VSCode.

<!-- truncate -->

If you've these three things, just do this:

1. Start Visual Studio Code
2. Press <kbd>CTRL</kbd>+<kbd>SHIFT</kbd>+<kbd>P</kbd> to open the Command Palette.
    ![Opening the Command Palette]
3. Select *Dev Containers: Add Dev Container Configuration files...*
4. And follow the wizard:
    1. Search for *Python*
    2. Select the most recent version of Python, right now it's *3.12-bullseye*
    ![Installing Python 3.12](./images/python_3_12_bullseye.png)
    3. No need to install additional features, just press <kbd>Enter</kbd>    
    4. Same for optional files; not needed, just press <kbd>Enter</kbd>    

This done, VSCode will create a file called `.devcontainer/devcontainer.json`

![VSCode has created the .devcontainer/devcontainer.json file](./images/devcontainer_created.png)

See bottom right, please click on the `Reopen in Container` button.

Depending on the speed of your computer and if things were already downloaded, you'll get this screen:

![VSCode and his terminal](./images/terminal.png)

See the bottom part, a terminal window has been displayed and you've a prompt showing `vscode -> /workspaces/python $`.

Click in the terminal and type `python --version`:

![Version](./images/version.png)

Now, for the demo, create a new file called `main.py` with this line `print("Hello from your Python Devcontainer!")`. 

Save the file.

Click in the terminal and type `python main.py` to execute the script and tadaaaa:

![Running the script](./images/running_the_script.png)