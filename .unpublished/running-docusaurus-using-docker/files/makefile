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

_checkEnv:
	@test -s .env || { printf $(_RED) "File .env missing. Please create yours by running \"cp .env.example .env\""; exit 1; }

.PHONY: help
help: ## Show the help with the list of commands
	@clear
	@awk 'BEGIN {FS = ":.*##"; printf "\nUsage:\n  make \033[36m<target>\033[0m\n\n"} /^[a-zA-Z_-]+:.*?##/ { printf "  \033[36m%-25s\033[0m %s\n", $$1, $$2 } /^##@/ { printf "\n\033[0;33m%s\033[0m\n", substr($$0, 5) } ' $(MAKEFILE_LIST)
	@echo ""

##@ Blog                    Blog helpers (!!  Use TARGET=production for production actions !!)

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
build: _build-$(TARGET) ## Build dev/prod image. You pass CLI flags via ARGS like ARGS="--no-cache"

# Build the DEV image i.e. using docker compose and with all our environment variables
.PHONY: _build-development
_build-development: _checkEnv
	@printf $(_YELLOW) "-> Building DEVELOPMENT image using docker compose..."
	@printf $(_WHITE) "Use 'TARGET=PRODUCTION make build' for the PRODUCTION image."
	@echo ""
	DOCKER_UID=${DOCKER_UID} DOCKER_GID=${DOCKER_GID} docker compose build ${ARGS}
	@echo ""
	@printf $(_GREEN) "Development build finished. Now, continue by running \"make devcontainer\"."
	@echo ""

# Build the PROD image i.e. a light nginx image
.PHONY: _build-production
_build-production: _checkEnv
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
	@printf $(_YELLOW) "Open the PROD blog (https://localhost:${PORT})"
# endregion
