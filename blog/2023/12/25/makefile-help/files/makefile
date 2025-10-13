SHELL:=bash

COLOR_YELLOW:=33

.PHONY: bash
bash:
 @printf "\e[1;${COLOR_YELLOW}m%s\e[0m\n\n" "Start an interactive shell in the Docker container; type exit to quit"

.PHONY: code
code:
 @printf "\e[1;${COLOR_YELLOW}m%s\e[0m\n\n" "Open the blog in Visual Studio Code"

.PHONY: build
build:
 @printf "\e[1;${COLOR_YELLOW}m%s\e[0m\n\n" "Generate a newer version of the build directory"

.PHONY: deploy
deploy: build
 @printf "\e[1;${COLOR_YELLOW}m%s\e[0m\n\n" "Deploy static pages to the web server"

.PHONY: install
install:
 @printf "\e[1;${COLOR_YELLOW}m%s\e[0m\n\n" "Generate a newer version of the build directory"

.PHONY: start
start:
 @printf "\e[1;${COLOR_YELLOW}m%s\e[0m\n\n" "Open the blog (http://localhost:3000)"

.PHONY: watch
watch:
 @printf "\e[1;${COLOR_YELLOW}m%s\e[0m\n\n" "Run Docusaurus watcher and open the blog on the localhost. When done, just start a browser and surf to http://localhost:3000"
