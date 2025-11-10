# Christophe Avonture - Blog

<div align="center">
<img width="200" src="https://raw.githubusercontent.com/cavo789/blog/main/static/img/docusaurus.png" />
</div>

<div align="center">
<img src="https://img.shields.io/badge/dynamic/json.svg?label=@docusaurus/core&query=$.dependencies[%22@docusaurus/core%22]&url=https://raw.githubusercontent.com/cavo789/blog/main/package.json" />
</div>

## Clone this repository

Start a console and run `cd ~ && git clone https://github.com/cavo789/blog.git && cd blog` to clone this repository if needed.

Then run `make install` to install dependencies.

*If you don't have `make` on your computer, please run `sudo apt-get update && sudo apt-get -y install make`.*

## Build, run and start the blog in production mode

Just run `TARGET=production make build` to create the Docker image then `TARGET=production make up` to run a container based on that image.

This done, the site is now running, and you can access to it using `https://localhost`. *If you don't have the site running, please wait a little and refresh the page. Sometimes it helps to create a new browser tab and surf to `https://localhost` again.*

If you want to remove the image later on, just run `TARGET=production make remove` and that's all.

## Build, run and open the blog as a developer

This time, please run `make build && make devcontainer`. Once in VSCode, press <kbd>F1</kbd> and select the option **Dev Containers: Rebuild without cache and Reopen in Container**.  *If you don't have this command, please make sure to install the VSCode [Dev Container from Microsoft](https://marketplace.visualstudio.com/publishers/Microsoft).*

Wait until the devcontainer is fully created then so to `https://localhost:3000` to surf on the site.

This is the development i.e. if you make changes to VSCode files, they will be reflected in your browser.

## Bash console

Depending on if you're working with the production image or with devcontainer, please run `TARGET=production make bash` (for the production image) or just `make bash` for the devcontainer.

You'll then start an interactive console in the Docker container.

### Deployment

For this repository, the deployment is made using GitHub actions. By pushing changes to GitHub, there is a `CI/CD` pipeline who'll be started by GitHub, download Node, run `yarn build` and, once HTML files have been generated in the `build` folder, an FTP copy job will copy every file from GitHub to the host where the blog is running.
