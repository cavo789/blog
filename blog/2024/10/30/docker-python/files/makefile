# cspell:ignore ifdef,pydocstyle,isort,mypy
default: help

# Folder where Python binaries are installed
BIN=/usr/local/bin

# Name of our Docker container
CONTAINER=app_python

# The project type
DOCKER_PROJECT_TYPE=Python

# Name of our Docker environment file
DOCKER_ENV_FILE=.docker.env

# The environment file we'll use
ENV=--env-file ${DOCKER_ENV_FILE}

# The list of  Docker compose yaml file we'll use
YAML=COMPOSE_FILE=compose.yaml

COLOR_CYAN:=36
_CYAN := "\033[1;${COLOR_CYAN}m%s\033[0m %s\n"

# Required for `make devcontainer`: we need to convert a string like "python" to
# an hexadecimal string. (printf "python" | xxd -p will return 63325f66646d5f706870)
DOCKER_VSCODE:=$(shell printf "${CONTAINER}" | xxd -p)

.PHONY: bash
bash: ## App - Start an interactive shell inside your application container
	${YAML} docker compose ${ENV} exec -it ${CONTAINER} /bin/bash

.PHONY: build
build: ## App - Build a fresh Docker image for this project
	${YAML} docker compose ${ENV} build ${ARGS}

.PHONY: config
config: ## App - Show the docker configuration
	${YAML} docker compose ${ENV} config

.PHONY: devcontainer
devcontainer: ## App - Open the PHP container in vscode (you can f.i. directly start your debugging session)
	code --folder-uri vscode-remote://attached-container+${DOCKER_VSCODE}/app

.PHONY: help
help: ## App - Show the help with the list of commands
	@clear

    # Parse this file, search for `##` followed by a description
	@awk 'BEGIN {FS = ":.*##"; printf "\nUsage:\n  make \033[36m<target>\033[0m\n\n"} /^[a-zA-Z_-]+:.*?##/ { printf "  \033[36m%-21s\033[0m %s\n", $$1, $$2 } /^##@/ { printf "\n\033[0;33m%s\033[0m\n", substr($$0, 5) } ' $(MAKEFILE_LIST)

	@echo ""

.PHONY: remove
remove: ## App - Stop containers and remove them (you will lose updated files if you do not have locally)
	${YAML} docker compose ${ENV} down --remove-orphans --rmi all --volumes

.PHONY: up
up: ## App - Based on the created Docker images (made with `make build`), create containers and start them
	${YAML} docker compose ${ENV} up --detach

##@ Quality assurance

.PHONY: doc-style
doc-style: ## QA - pydocstyle is a static analysis tool for checking compliance with Python docstring conventions
	@clear
	${YAML} docker compose ${ENV} exec ${CONTAINER} ${BIN}/pydocstyle /app/src

.PHONY: format
format: ## QA - Format the script using Black
	@clear
	@${YAML} docker compose ${ENV} exec ${CONTAINER} ${BIN}/black /app/src

.PHONY: lint
lint: ## QA - Lint the script using Pylint - Run  analyses your code without actually running it
	@clear
	${YAML} docker compose ${ENV} exec ${CONTAINER} ${BIN}/pylint /app/src

.PHONY: mypy
mypy: ## QA - Mypy is a program that will type check your Python code
	@clear
	${YAML} docker compose ${ENV} exec ${CONTAINER} ${BIN}/mypy --cache-dir /tmp/mypy
