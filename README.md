# Christophe Avonture - Blog

This website is built using [Docusaurus](https://docusaurus.io/).

Below a list of instructions to help when working with the 

## Open the editor

Run `make code` to open vscode.

## Bash console

Run `make bash` if you need to start an interactive console in the Docker container.

## Local Development

Run `make start` to start the Docusaurus watcher and open the local website.

Once started, every changes done in the blog will be reflected to the browser without reloading.

## Build

Optional.

Run `make build` if you wish to rebuild files in the `/build` folder.

### Deployment

Run `make deploy` to build the static files and then connect to the webserver using ftp and automate the publication of static files.
