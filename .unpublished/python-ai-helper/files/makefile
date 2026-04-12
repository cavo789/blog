# Default model
MODEL ?= qwen2.5-coder:7b

# Get current user ID and Group ID
UID := $(shell id -u)
GID := $(shell id -g)

.PHONY: build run help

help:
	@echo "Usage: make run PROJECT_PATH=/path/to/your/project"
	@echo ""
	@echo "make run PROJECT_PATH=/path/to/project       -> Run on folder"
	@echo "make run PROJECT_PATH=/path/to/file.py      -> Run on single file"
	@echo "make compose-run PROJECT_PATH=/path        -> Run using Compose (hot-reload)"

build:
	docker build --build-arg USER_ID=$(UID) --build-arg GROUP_ID=$(GID) -t cavo789/ai-agent:latest .

run:
ifndef PROJECT_PATH
	$(error PROJECT_PATH is undefined. Usage: make run PROJECT_PATH=/absolute/path/to/project)
endif
	@if [ ! -e "$(PROJECT_PATH)" ]; then \
		echo "Error: Target $(PROJECT_PATH) does not exist."; \
		exit 1; \
	fi
	@# Calculate Mount Source and Target Name for single-file support
	$(eval MOUNT_SRC=$(shell [ -f $(PROJECT_PATH) ] && realpath $$(dirname $(PROJECT_PATH)) || realpath $(PROJECT_PATH)))
	$(eval TARGET_NAME=$(shell [ -f $(PROJECT_PATH) ] && basename $(PROJECT_PATH) || echo "."))
	docker run --rm \
		-v "$(MOUNT_SRC):/app/project" \
		--user $(UID):$(GID) \
		--read-only \
		--tmpfs /tmp:mode=1777 \
		--add-host=host.docker.internal:host-gateway \
		cavo789/ai-agent:latest --path /app/project/$(TARGET_NAME) --docstring --tests --run-tests --model $(MODEL) --verbose

compose-run:
ifndef PROJECT_PATH
	$(error PROJECT_PATH is undefined. Usage: make compose-run PROJECT_PATH=/path/to/target)
endif
	@# Calculate Mount Source and Target Name only at runtime
	$(eval MOUNT_SRC=$(shell [ -f $(PROJECT_PATH) ] && realpath $$(dirname $(PROJECT_PATH)) || realpath $(PROJECT_PATH)))
	$(eval TARGET_NAME=$(shell [ -f $(PROJECT_PATH) ] && basename $(PROJECT_PATH) || echo "."))

	UID=$(UID) GID=$(GID) \
	MOUNT_SRC=$(MOUNT_SRC) \
	TARGET_NAME=$(TARGET_NAME) \
	docker compose run --rm ai-agent --path /app/project/$(TARGET_NAME) --docstring --verbose