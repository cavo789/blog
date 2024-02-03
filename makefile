SHELL:=bash

COLOR_YELLOW:=33

default: help

.PHONY: help
help: ## Show the help with the list of commands
	@clear
	@awk 'BEGIN {FS = ":.*##"; printf "\nUsage:\n  make \033[36m<target>\033[0m\n\n"} /^[a-zA-Z_-]+:.*?##/ { printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2 } /^##@/ { printf "\n\033[0;33m%s\033[0m\n", substr($$0, 5) } ' $(MAKEFILE_LIST)
	@echo ""

##@ Blog                    Blog helpers

.PHONY: bash
bash: ## Open an interactive shell in the Docker container
	@printf "\e[1;${COLOR_YELLOW}m%s\e[0m\n\n" "Start an interactive shell in the Docker container; type exit to quit"
	docker run --rm -it --user $${UID}:$${GID} -v $${PWD}/:/project -w /project node /bin/bash

.PHONY: code
code: ## Open Visual Studio Code
	@printf "\e[1;${COLOR_YELLOW}m%s\e[0m\n\n" "Open the blog in Visual Studio Code"
	code .

.PHONY: build
build: ## Generate a newer version of the build directory
	@printf "\e[1;${COLOR_YELLOW}m%s\e[0m\n\n" "Generate a newer version of the build directory"
	docker run --rm -it --user $${UID}:$${GID} -v $${PWD}/:/project -w /project node /bin/bash -c "yarn build"

.PHONY: start
start: ## Start the local webserver and open the webpage
	@printf "\e[1;${COLOR_YELLOW}m%s\e[0m\n\n" "Open the blog (http://localhost:3000)"	
	docker compose up --detach --build
	@sensible-browser http://localhost:3000

##@ Data quality            Code analysis

.PHONY: lint
lint: ## Lint markdown files
	@printf "\e[1;${COLOR_YELLOW}m%s\e[0m\n\n" "Lint markdown files"
	docker run --rm -it --user $${UID}:$${GID} -v $${PWD}:/md peterdavehello/markdownlint markdownlint --fix --config .markdownlint.json --ignore-path .markdownlint_ignore .

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
	
