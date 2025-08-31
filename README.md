# Christophe Avonture - Blog

<div align="center">
<img width="200" src="https://raw.githubusercontent.com/cavo789/blog/main/static/img/docusaurus.png" />
</div>

<div align="center">
<img src="https://img.shields.io/badge/dynamic/json?style=for-the-badge&logo=meta&color=blueviolet&label=Docusaurus&query=peerDependencies%5B%22%40docusaurus%2Fcore%22%5D&url=https%3A%2F%2Fraw.githubusercontent.com%2Fcavo789%2Fblog%2Fmain%2Fpackage.json" />
</div>

## Clone this repository

Start a console and run `cd ~ && git clone https://github.com/cavo789/blog.git && cd blog` to clone this repository if needed.

Then run `make install` to install dependencies.

*If you don't have `make` on your computer, please run  `sudo apt-get update && sudo apt-get -y install make` .*

## Build, run and start the blog in production mode

Make sure to initialize the `.env` with `MODE=production`.

Run `make build && make up && make start` on your local machine to build the Docker image, create the container and open your browser and start to surf on the blog locally.

In this mode (`MODE=production`), Docker will create a self-container image and container too without any sharing with your host machine.

This mode is near what you'll have on your production server and use fast mechanism to deliver files.

## Build, run and open the blog as a developer

Make sure to initialize the `.env` with `MODE=development`.
Run `make build && make up && make start && make devcontainer` on your local machine to build the Docker image, create the container and open Visual Studio Code so you can start to create new articles.

In this mode (`MODE=development`), Docker will listen changes you'll do on your computer and will reflect changes automatically in the Docker container. You just need to refresh the web page to get the latest version.

This mode is suitable for adding new articles.

## Bash console

Run `( export MODE=prod && make bash )` or `( export MODE=dev && make bash )` if you need to start an interactive console in the Docker container.

This is the case when, f.i., you will need to run a `npm` (or `yarn`) command like `yarn add @cmfcmf/docusaurus-search-local`.

## Open the blog on your machine

Just run `( export MODE=prod && make start )` or `( export MODE=dev && make start )` to start the Docusaurus watcher and open the local website.

Once started, every changes done in the blog will be reflected to the browser without reloading.

### Deployment

For this repository, the deployment is made using GitHub actions. By pushing changes to github, there is a `CI/CD` pipeline who'll be started by GitHub, download NodeJs, run `yarn build` and, once HTML files have been generated in the `build` folder, a FTP copy job will copy every files from GitHub to the host where the blog is running.
