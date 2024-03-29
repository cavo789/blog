# Christophe Avonture - Blog

This website is built using [Docusaurus](https://docusaurus.io/).

Below a list of instructions to help when working with the

## Clone this repository

Start a console and run `cd ~ && git clone https://github.com/cavo789/blog.git && cd blog` to clone this repository if needed.

Then run `make install` to install dependencies.

*If you don't have `make` on your computer, please run  `sudo apt-get update && sudo apt-get -y install make` .*

## Open the editor

Run `make code` to open vscode.

## Bash console

Run `make bash` if you need to start an interactive console in the Docker container.

This is the case when, f.i., you will need to run a `npm` (or `yarn`) command like `yarn add @cmfcmf/docusaurus-search-local`.

## Local Development

Run `make start` to start the Docusaurus watcher and open the local website.

Once started, every changes done in the blog will be reflected to the browser without reloading.

## Build

Optional.

Run `make build` if you wish to rebuild files in the `/build` folder.

### Deployment

For this repository, the deployment is made using GitHub actions. By pushing changes to github, there is a `CI/CD` pipeline who'll be started by GitHub, download NodeJs, run `yarn build` and, once HTML files have been generated in the `build` folder, a FTP copy job will copy every files from GitHub to the host where the blog is running.
