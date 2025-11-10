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
	@printf $(_WHITE) "List of commands to work with the Blog published on https://www.avonture.be"


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
	docker run -it cavo789/blog:node /bin/sh

# region: BUILD
.PHONY: build
build: _build-$(TARGET) ## Build dev/prod image. You can pass CLI flags via ARGS like ARGS="--no-cache"

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
	docker build --tag cavo789/blog:latest --target production ${ARGS} .
	@echo ""
	@printf $(_GREEN) "Production build finished. You can now publish this image."
# endregion

.PHONY: config
config: ## Show the Docker configuration
	@clear
	docker compose config

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

.PHONY: logs
logs: ## Show the log of Docusaurus
	@clear
	@printf $(_CYAN) "Press CTRL-C to stop to follow logs"
	@printf ""
	@docker logs --follow docusaurus

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
	@docker rmi --force cavo789/blog:latest

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
	docker run -d --publish 443:443 --name blog cavo789/blog:latest
	@echo ""
	@printf $(_YELLOW) "Open the PROD blog (https://localhost:${PORT})"
# endregion

.PHONY: push
push: ## Push the image on Docker hub (only when TARGET=production in .env)
    # Make sure you're already logged in on docker.com, if not run "docker login" and proceed to make an authentication.
	docker build --tag cavo789/blog:latest --target final ${ARGS} .
 	docker image push cavo789/blog:latest

##@ Utilities

.PHONY: add-date
add-date: ## Add the "date:" key in the YAML front matter if missing based on the tree structure (i.e. blog/YYYY/MM/DD/slug/index.md)
	@clear
	./.scripts/add-date-in-blog-post.sh

.PHONY: check-images
check-images: ## Browse some pages and run some checks on images
	@clear
	docker run -it --rm \
        -v ${PWD}/.scripts:/app \
        -w /app \
        --entrypoint /bin/sh \
        mcr.microsoft.com/playwright/python:v1.55.0-jammy \
        -c "pip install --root-user-action=ignore beautifulsoup4 pillow playwright requests >/dev/null && python check-images.py"

.PHONY: extract-inline-snippets
extract-inline-snippets: ## Extract inline snippets
	@clear
	docker run -it --rm -v ${PWD}:/app -w /app python sh -c "python .scripts/extract_inline_snippets.py"

.PHONY: invalid-language
invalid-language: ## Show invalid languages in docblock like ```env (not supported by Prism)
	@clear
	./.scripts/find-invalid-language.sh

.PHONY: snippets
snippets: ## Replace <detail><summary>(filename)</summary>(content)</detail> with <Snippets filename="(filename)">(content)</Snippets>
	@clear
	./.scripts/replace-details-with-snippets.sh

.PHONY: tags-manager
tags-manager: ## Tags manager
	@clear
ifeq ($(strip $(ARGS)),)
	@echo "--------------------------------------------------------"
	@echo "🚨 ERROR: Missing command arguments (ARGS)."
	@echo "--------------------------------------------------------"
	@echo "USAGE EXAMPLE:"
	@echo "  make tags-manager ARGS=\"delete tag\""
	@echo ""
	@echo "  make tags-manager ARGS=\"list\""
	@echo "  make tags-manager ARGS=\"list --sort count\""
	@echo "  make tags-manager ARGS=\"list --sort name\""
	@echo ""
	@echo "  make tags-manager ARGS=\"rename old,new\""
	@echo ""
	@echo "  make tags-manager ARGS=\"--help\""
	@echo ""
	@echo "For full help, run: make tags-manager ARGS=\"--help\""
	@echo "--------------------------------------------------------"
	@exit 1
else
	@echo "--- Running Tags Manager with arguments: $(ARGS) ---"
	docker run -it --rm -v ${PWD}:/app -w /app python sh -c "pip install oyaml python-frontmatter > /dev/null 2>&1 && python .scripts/tags-manager.py $(ARGS)"
endif


.PHONY: yaml-manager
yaml-manager: ## YAML front matter manager (run make yaml-manager ARGS="--help" for more info)
	@clear

ifeq ($(strip $(ARGS)),)
	@echo "--------------------------------------------------------"
	@echo "🚨 ERROR: Missing command arguments (ARGS)."
	@echo "--------------------------------------------------------"
	@echo "USAGE EXAMPLE:"
	@echo "  make yaml-manager ARGS=\"add-key --help\""
	@echo "  make yaml-manager ARGS=\"add-key language,en\""
	@echo ""
	@echo "  make yaml-manager ARGS=\"check-duplicates --help\""
	@echo "  make yaml-manager ARGS=\"check-duplicates\""
	@echo ""
	@echo "  make yaml-manager ARGS=\"check-mandatory --help\""
	@echo "  make yaml-manager ARGS=\"check-mandatory\""
	@echo ""
	@echo "  make yaml-manager ARGS=\"check-seo --help\""
	@echo "  make yaml-manager ARGS=\"check-seo\""
	@echo ""
	@echo "  make yaml-manager ARGS=\"cleanup-variants --help\""
	@echo "  make yaml-manager ARGS=\"cleanup-variants language lang,langue\""
	@echo ""
	@echo "  make yaml-manager ARGS=\"find-missing --help\""
	@echo "  make yaml-manager ARGS=\"find-missing language\""
	@echo ""
	@echo "  make yaml-manager ARGS=\"find-present --help\""
	@echo "  make yaml-manager ARGS=\"find-present updated\""
	@echo ""
	@echo "  make yaml-manager ARGS=\"list-keys --help\""
	@echo "  make yaml-manager ARGS=\"list-keys\""
	@echo ""
	@echo "  make yaml-manager ARGS=\"list-values --help\""
	@echo "  make yaml-manager ARGS=\"list-values\""
	@echo ""
	@echo "  make yaml-manager ARGS=\"remove-key --help\""
	@echo "  make yaml-manager ARGS=\"remove-key old_key\""
	@echo ""
	@echo "  make yaml-manager ARGS=\"reorder --help\""
	@echo "  make yaml-manager ARGS=\"reorder\""
	@echo ""
	@echo "For full help, run: make yaml-manager ARGS=\"--help\""
	@echo "--------------------------------------------------------"
	@exit 1
else
	@echo "--- Running Yaml Manager with arguments: $(ARGS) ---"
	docker run -it --rm -v ${PWD}:/app -w /app python sh -c "pip install oyaml python-frontmatter > /dev/null 2>&1 && python .scripts/yaml-manager.py $(ARGS)"
endif
