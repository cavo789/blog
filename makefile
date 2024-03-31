SHELL:=bash

COLOR_YELLOW:=33

DOCKER_CONTAINER_NAME:="docusaurus"
DOCKER_VSCODE:=$(shell printf "${DOCKER_CONTAINER_NAME}" | xxd -p)
DOCKER_APP_HOME:="/app"

default: help

.PHONY: help
help: ## Show the help with the list of commands
	@clear
	@awk 'BEGIN {FS = ":.*##"; printf "\nUsage:\n  make \033[36m<target>\033[0m\n\n"} /^[a-zA-Z_-]+:.*?##/ { printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2 } /^##@/ { printf "\n\033[0;33m%s\033[0m\n", substr($$0, 5) } ' $(MAKEFILE_LIST)
	@echo ""

##@ Blog                    Blog helpers

.PHONY: bash
bash: build up ## Open an interactive shell in the Docker container
	@printf "\e[1;${COLOR_YELLOW}m%s\e[0m\n\n" "Start an interactive shell in the Docker container; type exit to quit"
	docker run --rm -it --user $${UID}:$${GID} -v $${PWD}/:/project -w /project node /bin/bash

.PHONY: build
build: ## Build the Docker image
	@printf "\e[1;${COLOR_YELLOW}m%s\e[0m\n\n" "Build the Docker image"	
	docker compose build

.PHONY: up
up: build ## Create the Docker container
	@printf "\e[1;${COLOR_YELLOW}m%s\e[0m\n\n" "Create the Docker container"	
	docker compose up --detach

.PHONY: devcontainer
devcontainer: ## Open the blog in Visual Studio Code in devcontainer
	@printf "\e[1;${COLOR_YELLOW}m%s\e[0m\n\n" "Open the blog in Visual Studio Code in devcontainer"
	code --folder-uri vscode-remote://attached-container+${DOCKER_VSCODE}${DOCKER_APP_HOME}

.PHONY: build up start
start: ## Start the local web server and open the webpage
	@printf "\e[1;${COLOR_YELLOW}m%s\e[0m\n\n" "Open the blog (http://localhost:3000)"	
	@sensible-browser http://localhost:3000

.PHONY: static
static: ## Generate a newer version of the build directory; i.e. create static files
	@printf "\e[1;${COLOR_YELLOW}m%s\e[0m\n\n" "Generate a newer version of the build directory; i.e. create static files"
	docker run --rm -it --user $${UID}:$${GID} -v $${PWD}/:/project -w /project node /bin/bash -c "yarn build"

##@ Data quality            Code analysis

.PHONY: lint
lint: ## Lint markdown files
	@printf "\e[1;${COLOR_YELLOW}m%s\e[0m\n\n" "Lint markdown files"
	docker run --rm -it --user $${UID}:$${GID} -v $${PWD}:/md peterdavehello/markdownlint markdownlint --fix --config .config/.markdownlint.json --ignore-path .config/.markdownlint_ignore .

.PHONY: spellcheck
spellcheck: ## Check for spell checks errors (https://github.com/streetsidesoftware/cspell)
	@printf "\e[1;${COLOR_YELLOW}m%s\e[0m\n\n" "Run spellcheck"
	docker run --rm -it --user $${UID}:$${GID} -v $${PWD}:/src -w /src ghcr.io/streetsidesoftware/cspell:latest lint . --unique --gitignore --quiet --no-progress --config .vscode/cspell.json

##@ Docusaurus              Utilities for Docusaurus installation, updates, ...

# .PHONY: install
# install: ## The very first time, after having cloned this blog, you need to install Docusaurus before using it.
# 	@printf "\e[1;${COLOR_YELLOW}m%s\e[0m\n\n" "Generate a newer version of the build directory"
# 	docker run --rm -it --user $${UID}:$${GID} -v $${PWD}/:/project -w /project node /bin/bash -c "npx docusaurus-init && yarn add docusaurus-init"

.PHONY: upgrade
upgrade: ## Upgrade docusaurus and npm dependencies
	@clear
	@printf "\e[1;${COLOR_YELLOW}m%s\e[0m\n\n" "Upgrade docusaurus and npm dependencies"
	docker run --rm -it --user $${UID}:$${GID} -v $${PWD}/:/project -w /project node /bin/bash -c "yarn upgrade"
	@printf "\e[1;${COLOR_YELLOW}m%s\e[0m\n\n" "Current version of docusaurus"
	docker run --rm -it -v $${PWD}/:/project -w /project node /bin/bash -c "npx docusaurus -V"
	
