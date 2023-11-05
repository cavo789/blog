# Christophe Avonture - Blog

This website is built using [Docusaurus](https://docusaurus.io/).

Below a list of instructions to help when working with the 

## Clone this repository

Start a console and run `cd ~ && git clone https://github.com/cavo789/blog.git && cd blog` to clone this repository if needed.

## Open the editor

Run `make code` to open vscode.

## Bash console

Run `make bash` if you need to start an interactive console in the Docker container.

This is the case when, f.i., you will need to run a `npm` (or `yarn`) command like `yarn add @cmfcmf/docusaurus-search-local`.

## Local Development

Run `make watch` to start the Docusaurus watcher and open the local website.

Once started, every changes done in the blog will be reflected to the browser without reloading.

## Build

Optional.

Run `make build` if you wish to rebuild files in the `/build` folder.

### Deployment

Run `make deploy` to build the static files and then connect to the webserver using ftp and automate the publication of static files.
