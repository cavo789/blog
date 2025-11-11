# cspell:ignore beautifulsoup4,repost,maintag,oyaml

SHELL:=bash

# Load .env file if there is one (if none, no error will be fired)
-include .env

DOCKER_UID:=$(shell id -u)
DOCKER_GID:=$(shell id -g)

# If not defined on the command line, default to development
# Use "TARGET=production make build" f.i. to switch to PROD and then build the PROD image
TARGET ?= development

# region - Helpers
COLOR_RED=31
COLOR_YELLOW=33
COLOR_WHITE=37

_RED:="\033[1;${COLOR_RED}m%s\033[0m %s\n"
_YELLOW:="\033[1;${COLOR_YELLOW}m%s\033[0m %s\n"
_WHITE:="\033[1;${COLOR_WHITE}m%s\033[0m %s\n"
# endregion

default: help

.PHONY: help
help: ## Show the help with the list of commands
	@clear
	@awk 'BEGIN {FS = ":.*##"; printf "\nUsage:\n  make \033[36m<target>\033[0m\n\n"} /^[a-zA-Z_-]+:.*?##/ { printf "  \033[36m%-25s\033[0m %s\n", $$1, $$2 } /^##@/ { printf "\n\033[0;33m%s\033[0m\n", substr($$0, 5) } ' $(MAKEFILE_LIST)
	@echo ""

##@ Blog                    Blog helpers (!!  For production, please always add "TARGET=production" before like "TARGET=production make build" !!)

.PHONY: bash
bash: _bash-$(TARGET)  ## Open an interactive shell in the Docker container

.PHONY: _bash-development
_bash-development:
	@printf $(_YELLOW) "Start an interactive shell in the Docker DEVELOPMENT container; type exit to quit"
	docker compose run --rm docusaurus /bin/bash

.PHONY: _bash-production
_bash-production:
	@printf $(_YELLOW) "Start an interactive shell in the Docker PROD container; type exit to quit"
	docker run -it my/blog:node /bin/sh

# region: BUILD
.PHONY: build
build: _build-$(TARGET) ## Build dev/prod image. You can pass CLI flags via ARGS like ARGS="--no-cache"

# Build the DEV image i.e. using docker compose and with all our environment variables
# Pre-create folders to avoid permission problems while building devcontainer
.PHONY: _build-development
_build-development:
	@printf $(_YELLOW) "-> Building DEVELOPMENT image using docker compose..."
	@printf $(_WHITE) "Use 'TARGET=PRODUCTION make build' for the PRODUCTION image."
	@echo ""
	@if [ ! -d ".docusaurus" ]; then \
		printf $(_YELLOW) "-> Creating .docusaurus directory on host..."; \
		mkdir -p .docusaurus; \
	fi
	@if [ ! -d "node_modules" ]; then \
		printf $(_YELLOW) "-> Creating node_modules directory on host..."; \
		mkdir -p node_modules; \
	fi
	DOCKER_UID=${DOCKER_UID} DOCKER_GID=${DOCKER_GID} docker compose build ${ARGS}
	@echo ""
	@printf $(_GREEN) "Development build finished. Now, continue by running \"make devcontainer\"."
	@echo ""

# Build the PROD image i.e. a light nginx image
.PHONY: _build-production
_build-production:
	@printf $(_YELLOW) "-> Building PRODUCTION stand alone image..."
	@echo ""
	docker build --tag my/blog:latest --target production ${ARGS} .
	@echo ""
	@printf $(_GREEN) "Production build finished. You can now publish this image."
# endregion

.PHONY: devcontainer
devcontainer: ## Open the blog in Visual Studio Code in devcontainer
	@printf $(_YELLOW) "Open the blog in Visual Studio Code in devcontainer"
	code .

.PHONY: down
down: _down-$(TARGET) ## Stop the container

.PHONY: _down-development
_down-development:
	docker run --rm -it --user root -v $${PWD}/:/project -w /project node /bin/bash -c "yarn run clear"
	docker compose down

.PHONY: _down-production
_down-production:
	@docker stop blog > /dev/null 2>&1 || true

.PHONY: remove
remove: _remove-$(TARGET) ## Remove the image

.PHONY: _remove-development
_remove-development:
    #--volumes
	docker compose down --remove-orphans --rmi all
    #-docker image rmi blog-docusaurus
    # Remove the old build folder if present
	@rm -rf .docusaurus
    # Don't remove these files / folders so the next build won't download anymore dependencies
    # @rm -rf node_modules *.lock package-lock.json
	@echo ""

.PHONY: _remove-production
_remove-production: _down-production
	@docker rmi --force my/blog:latest

# region: UP
.PHONY: up
up: _up-$(TARGET) ## Create the Docker container.

.PHONY: _up-development
_up-development:
	@printf $(_YELLOW) "-> No need to create the container; just run 'make devcontainer' instead."
	@printf $(_WHITE) "Use 'TARGET=production make up' to start the PRODUCTION environment."
	@echo ""

.PHONY: _up-production
_up-production:
	@printf $(_YELLOW) "-> Create the PRODUCTION stand alone image..."
	@echo ""
	@-docker stop blog > /dev/null 2>&1 || true
	@-docker rm blog > /dev/null 2>&1 || true
	docker run -d --publish 443:443 --name blog my/blog:latest
	@echo ""
	@printf $(_YELLOW) "Open the PROD blog (https://localhost)"
# endregion

.PHONY: push
push: ## Push the image on Docker hub (only when TARGET=production in .env)
    # Make sure you're already logged in on docker.com, if not run "docker login" and proceed to make an authentication.
# 	docker build --tag my/blog:latest --target final ${ARGS} .
	docker image push my/blog:latest
