# cspell:ignore beautifulsoup4,repost,maintag

SHELL:=bash

# Load .env file if there is one (if none, no error will be fired)
-include .env

DOCKER_UID:=$(shell id -u)
DOCKER_GID:=$(shell id -g)

# Should be in line with the container_name as defined in "compose.yaml"
DOCKER_CONTAINER_NAME:=docusaurus

# Needed by "make devcontainer"
DOCKER_VSCODE:=attached-container+$(shell printf "${DOCKER_CONTAINER_NAME}" | xxd -p)
DOCKER_APP_HOME:="/opt/docusaurus"

# region - Helpers
COLOR_RED=31
COLOR_YELLOW=33
COLOR_WHITE=37

_RED:="\033[1;${COLOR_RED}m%s\033[0m %s\n"
_YELLOW:="\033[1;${COLOR_YELLOW}m%s\033[0m %s\n"
_WHITE:="\033[1;${COLOR_WHITE}m%s\033[0m %s\n"
# endregion

# region - Initialization
# The TARGET variable is defined in the .env file and is initialized to "production" or "development"
ifeq ($(or "$(TARGET)","production"), "production")
COMPOSE_FILE=./.docker/compose.yaml:./.docker/compose-prod.yaml
PORT=80
else
COMPOSE_FILE=./.docker/compose.yaml:./.docker/compose-dev.yaml
PORT=3000
endif
# endregion

default: help

_checkEnv:
	@test -s .env || { printf $(_RED) "File .env missing. Please create yours by running \"cp .env.example .env\""; exit 1; }

.PHONY: help
help: ## Show the help with the list of commands
	@clear
	@printf $(_WHITE) "List of commands to work with the Blog published on https://www.avonture.be"
	@printf $(_WHITE) "Retrieve the last version on https://github.com/cavo789/blog"


	@awk 'BEGIN {FS = ":.*##"; printf "\nUsage:\n  make \033[36m<target>\033[0m\n\n"} /^[a-zA-Z_-]+:.*?##/ { printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2 } /^##@/ { printf "\n\033[0;33m%s\033[0m\n", substr($$0, 5) } ' $(MAKEFILE_LIST)
	@echo ""

##@ Blog                    Blog helpers (Note: the behavior will differs depending on the TARGET variable set in your .env file).

.PHONY: bash
bash: ## Open an interactive shell in the Docker container
	@printf $(_YELLOW) "Start an interactive shell in the Docker $(TARGET) container; type exit to quit"
ifeq ($(or "$(TARGET)","production"), "production")
	docker run -it cavo789/blog /bin/bash
else
	COMPOSE_FILE=${COMPOSE_FILE} DOCKER_UID=${DOCKER_UID} DOCKER_GID=${DOCKER_GID} docker compose exec ${ARGS} docusaurus /bin/bash
endif

.PHONY: build
build: _checkEnv ## Build the Docker image (tip: you can pass CLI flags to Docker using ARGS like f.i. ARGS="--progress=plain --no-cache").
	@printf $(_YELLOW) "Build the Docker $(TARGET) image. You can add arguments like, f.i. ARGS=\"--progress=plain --no-cache\""
	@echo ""
ifeq ($(or "$(TARGET)","production"), "production")
    # Build the Docker image as a stand alone one. We can then publish it on hub.docker.com if we want to
	docker build --tag cavo789/blog --target production ${ARGS} .
else
	COMPOSE_FILE=${COMPOSE_FILE} DOCKER_UID=${DOCKER_UID} DOCKER_GID=${DOCKER_GID} docker compose build ${ARGS}
endif
	@echo ""
	@printf $(_YELLOW) "Now, continue by running \"make up\"."

.PHONY: config
config: ## Show the Docker configuration
	@clear
	COMPOSE_FILE=${COMPOSE_FILE} docker compose config

.PHONY: devcontainer
devcontainer: ## Open the blog in Visual Studio Code in devcontainer
	@printf $(_YELLOW) "Open the blog in Visual Studio Code in devcontainer"
ifeq ($(or "$(TARGET)","production"), "production")
	@printf $(_RED) "This command is only possible when \"TARGET=development\" in the .env file"
	@exit 1
endif
	code --folder-uri vscode-remote://${DOCKER_VSCODE}${DOCKER_APP_HOME}
	./.docker/install-vscode-extensions.sh "${DOCKER_CONTAINER_NAME}" "node"

.PHONY: down
down: ## Stop the container
	docker run --rm -it --user root -v $${PWD}/:/project -w /project node /bin/bash -c "yarn run clear"
	COMPOSE_FILE=${COMPOSE_FILE} DOCKER_UID=${DOCKER_UID} DOCKER_GID=${DOCKER_GID} docker compose down

.PHONY: logs
logs: ## Show the log of Docusaurus
	@clear
	@printf $(_CYAN) "Press CTRL-C to stop to follow logs"
	@printf ""
	@docker logs --follow docusaurus

.PHONY: remove
remove: ## Remove the image
    #--volumes
	COMPOSE_FILE=${COMPOSE_FILE} docker compose down --remove-orphans --rmi all
    #-docker image rmi blog-docusaurus
    # Remove the old build folder if present
	@rm -rf .docusaurus
    # Don't remove these files / folders so the next build won't download anymore dependencies
    # @rm -rf node_modules *.lock package-lock.json

.PHONY: start
start: ## Start the local web server and open the webpage
	@printf $(_YELLOW) "Open the $(TARGET) blog (https://localhost:${PORT})"
	@sensible-browser https://localhost:${PORT}

.PHONY: up
up: ## Create the Docker container
	@printf $(_YELLOW) "Create the Docker $(TARGET) container"
	@echo ""
ifeq ($(or "$(TARGET)","production"), "production")
	docker run -d --publish 80:80 --name blog cavo789/blog
else
	COMPOSE_FILE=${COMPOSE_FILE} DOCKER_UID=${DOCKER_UID} DOCKER_GID=${DOCKER_GID} docker compose up --detach ${ARGS}
endif
	@echo ""
	@printf $(_YELLOW) "Now, continue by running \"make start\"."

.PHONY: push
push: ## Push the image on Docker hub (only when TARGET=production in .env)
ifneq ($(or "$(TARGET)","production"), "production")
	@printf $(_RED) "This command is only possible when \"TARGET=production\" in the .env file"
	@exit 1
endif
    # Make sure you're already logged in on docker.com, if not run "docker login" and proceed to make an authentication.
	docker image push cavo789/blog:latest

##@ Data quality            Code analysis

.PHONY: lint
lint: ## Lint markdown files
	@printf $(_YELLOW) "Lint markdown files"
	docker run --rm -it --user ${DOCKER_UID}:${DOCKER_GID}) -v $${PWD}:/md peterdavehello/markdownlint markdownlint --fix --config .config/.markdownlint.json --ignore-path .config/.markdownlint_ignore .

.PHONY: spellcheck
spellcheck: ## Check for spell checks errors (https://github.com/streetsidesoftware/cspell)
	@printf $(_YELLOW) "Run spellcheck"
	docker run --rm -it --user ${DOCKER_UID}:${DOCKER_GID}) -v $${PWD}:/src -w /src ghcr.io/streetsidesoftware/cspell:latest lint . --unique --gitignore --quiet --no-progress --config .vscode/cspell.json

.PHONY: upgrade
upgrade: ## Upgrade docusaurus and npm dependencies
	@clear
	@printf $(_YELLOW) "Upgrade docusaurus and npm dependencies"
	docker run --rm -it --user root -v $${PWD}/:/project -w /project node /bin/bash -c "yarn upgrade"
	docker run --rm -it --user root -v $${PWD}/:/project -w /project node /bin/bash -c "yarn upgrade @docusaurus/core@latest @docusaurus/plugin-ideal-image@latest @docusaurus/plugin-sitemap@latest @docusaurus/preset-classic@latest @docusaurus/theme-search-algolia@latest @docusaurus/module-type-aliases@latest @docusaurus/types@latest"
	@printf $(_YELLOW) "Current version of docusaurus"
	docker run --rm -it -v $${PWD}/:/project -w /project node /bin/bash -c "npx docusaurus -V"

##@ Utilities

.PHONY: add-date
add-date: ## Add the "date:" key in the YAML front matter if missing
	@clear
	./.scripts/add-date-in-blog-post.sh

.PHONY: add-language
add-language: ## Add the "inLanguage: en-GB" key in the YAML front matter if missing
	@clear
	./.scripts/add-language-in-blog-post.sh

.PHONY: check-images
check-images: ## Browse some pages and run some checks on images
	@clear
	docker run -it --rm \
        -v ${PWD}/.scripts:/app \
        -w /app \
        --entrypoint /bin/sh \
        mcr.microsoft.com/playwright/python:v1.55.0-jammy \
        -c "pip install --root-user-action=ignore beautifulsoup4 pillow playwright requests >/dev/null && python check-images.py"

.PHONY: invalid-language
invalid-language: ## Show invalid languages in docblock like ```env (not supported by Prism)
	@clear
	./.scripts/find-invalid-language.sh
.PHONY: snippets
snippets: ## Replace <detail><summary>(filename)</summary>(content)</detail> with <Snippets filename="(filename)">(content)</Snippets>
	@clear
	./.scripts/replace-details-with-snippets.sh

.PHONY: not-yet-shared
not-yet-shared: ## Get the list of blog posts not yet shared on BlueSky
	@clear
	./.scripts/find-posts-without-bluesky-repost.sh

.PHONY: no-main-tag
no-main-tag: ## Get the list of blog posts without mainTag defined in his YAML front matter
	@clear
	./.scripts/find-posts-without-maintag-yaml.sh

.PHONY: most-used-tags
most-used-tags: ## Get the list of the most used tags
	@clear
	docker run -it --rm -v ${PWD}:/app -w /app python sh -c "pip install pyyaml && python .scripts/most-used-tags.py"
