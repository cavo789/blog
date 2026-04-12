# Default model
# MODEL ?= qwen2.5-coder:1.5b
MODEL ?= qwen2.5-coder:7b

# Get current user ID and Group ID
UID := $(shell id -u)
GID := $(shell id -g)

.PHONY: build run help

# Default help message
help:
	@echo "Usage: make run PATH=/path/to/your/project"
	@echo ""
	@echo "Options:"
	@echo "  build    Build the docker image"
	@echo "  run      Run the AI agent on a specific project directory"

build:
	docker build -t cavo789/ai-agent:latest .

run:
ifndef PROJECT_PATH
	$(error PROJECT_PATH is undefined. Usage: make run PROJECT_PATH=/absolute/path/to/project)
endif
	@if [ ! -d "$(PROJECT_PATH)" ]; then \
		echo "Error: Directory $(PROJECT_PATH) does not exist."; \
		exit 1; \
	fi
	docker run --rm \
		-v "$(PROJECT_PATH):/app/src" \
		--user $(UID):$(GID) \
		--add-host=host.docker.internal:host-gateway \
		cavo789/ai-agent:latest --path /app/src --docstring --tests --run-tests --model $(MODEL)
