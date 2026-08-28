
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
COLOR_GREEN=32
COLOR_YELLOW=33
COLOR_WHITE=37

_RED:="\033[1;${COLOR_RED}m%s\033[0m %s\n"
_GREEN:="\033[1;${COLOR_GREEN}m%s\033[0m %s\n"
_YELLOW:="\033[1;${COLOR_YELLOW}m%s\033[0m %s\n"
_WHITE:="\033[1;${COLOR_WHITE}m%s\033[0m %s\n"
# endregion

default: help

.PHONY: help
help: ## Show the help with the list of commands
	@clear
	@printf $(_WHITE) "List of commands to work with the Blog published on https://www.avonture.be"


	@awk 'BEGIN {FS = ":.*##"; printf "\nUsage:\n  make \033[36m<target>\033[0m\n\n"} /^[a-zA-Z_-]+:.*?##/ { printf "  \033[36m%-25s\033[0m %s\n", $$1, $$2 } /^##@/ { printf "\n\033[0;33m%s\033[0m\n", substr($$0, 5) } ' $(MAKEFILE_LIST)
	@echo ""

##@ Blog                    Blog helpers (!!  For production, please always add "TARGET=production" before like "TARGET=production make build" !!)

.PHONY: bash build down remove up
bash: _bash-$(TARGET) ## Open an interactive shell in the Docker container
build: _build-$(TARGET) ## Build dev/prod image. You can pass CLI flags via ARGS like ARGS="--no-cache"
down: _down-$(TARGET) ## Stop the container
remove: _remove-$(TARGET) ## Remove the image
up: _up-$(TARGET) ## Create the Docker container.

.PHONY: _bash-development
_bash-development:
	@printf $(_YELLOW) "Start an interactive shell in the Docker DEVELOPMENT container; type exit to quit"
	DOCKER_UID=${DOCKER_UID} DOCKER_GID=${DOCKER_GID} docker compose run --rm --entrypoint /bin/bash docusaurus

.PHONY: _bash-production
_bash-production:
	@printf $(_YELLOW) "Start an interactive shell in the Docker PROD container; type exit to quit"
	docker run -it cavo789/blog:node /bin/sh

.PHONY: _ensure-host-volumes
_ensure-host-volumes:
	@for dir in .docusaurus node_modules; do \
        if [ ! -d "$$dir" ]; then \
            printf $(_YELLOW) "-> Creating $$dir directory on host..."; \
            mkdir -p "$$dir"; \
        fi; \
    done

# Build the devcontainer image directly from the root Dockerfile (target: devcontainer).
# Optional — VSCode builds it automatically on "Reopen in Container".
# Run manually only to pre-warm the cache or force a rebuild: make build ARGS="--no-cache"
.PHONY: _build-development
_build-development: _ensure-host-volumes
	@printf $(_YELLOW) "-> Building DEVCONTAINER image..."
	@printf $(_WHITE) "Use 'TARGET=production make build' for the PRODUCTION image."
	@echo ""
	DOCKER_UID=${DOCKER_UID} DOCKER_GID=${DOCKER_GID} \
	    docker compose -f .devcontainer/compose.yaml build ${ARGS}
	@echo ""
	@printf $(_GREEN) "Build finished. Run 'make devcontainer' (or 'code .' then 'Reopen in Container')."
	@echo ""

# Build the PROD image i.e. a light nginx image
.PHONY: _build-production
_build-production:
	@printf $(_YELLOW) "-> Building PRODUCTION stand alone image..."
	@echo ""
	docker build --tag cavo789/blog:latest --target production ${ARGS} .
	@echo ""
	@printf $(_GREEN) "Production build finished. You can now publish this image."

.PHONY: devcontainer
devcontainer: ## Open the blog in Visual Studio Code in devcontainer
	@printf $(_YELLOW) "Open the blog in Visual Studio Code in devcontainer"
	code .

.PHONY: _down-development
_down-development:
	DOCKER_UID=${DOCKER_UID} DOCKER_GID=${DOCKER_GID} docker compose run --rm docusaurus yarn run clear || true
	DOCKER_UID=${DOCKER_UID} DOCKER_GID=${DOCKER_GID} docker compose down

.PHONY: _down-production
_down-production:
	@docker stop blog > /dev/null 2>&1 || true

.PHONY: _remove-development
_remove-development:
	@printf $(_YELLOW) "-> Removing devcontainer containers, images, and volumes..."
	@DOCKER_UID=${DOCKER_UID} DOCKER_GID=${DOCKER_GID} docker compose \
        -f .devcontainer/compose.yaml \
        --project-name blog_devcontainer \
        down --volumes --remove-orphans --rmi all 2>/dev/null || true
	@docker rmi -f vsc-blog-* > /dev/null 2>&1 || true
	@rm -rf .docusaurus build node_modules
	@echo ""

.PHONY: _remove-production
_remove-production: _down-production
	@docker rmi --force cavo789/blog:latest

.PHONY: _up-development
_up-development:
	@printf $(_YELLOW) "-> No need to create the container; just run 'make devcontainer' instead."
	@printf $(_WHITE) "Use 'TARGET=production make up' to start the PRODUCTION environment."
	@echo ""

# Path to the directory containing fullchain.pem and privkey.pem on the host.
# Override at call time: CERTS_DIR=/etc/letsencrypt/live/example.com make up
CERTS_DIR ?= $(HOME)/certs

.PHONY: _up-production
_up-production:
	@printf $(_YELLOW) "-> Create the PRODUCTION stand alone image..."
	@echo ""
	@-docker stop blog > /dev/null 2>&1 || true
	@-docker rm blog > /dev/null 2>&1 || true
	docker run -d \
		--publish 80:80 --publish 443:443 \
		--name blog \
		--read-only \
		--tmpfs /var/cache/nginx \
		--tmpfs /var/run \
		-v "$(CERTS_DIR)":/etc/nginx/certs:ro \
		cavo789/blog:latest
	@echo ""
	@printf $(_YELLOW) "Open the PROD blog (https://localhost)"

.PHONY: push
push: ## Push the image on Docker hub (only when TARGET=production in .env)
    # Make sure you're already logged in on docker.com, if not run "docker login" and proceed to make an authentication.
# 	docker build --tag cavo789/blog:latest --target final ${ARGS} .
	docker image push cavo789/blog:latest
