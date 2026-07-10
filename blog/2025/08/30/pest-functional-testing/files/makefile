# Default value. To override it, run something like "WEBSITE=my_website make start"
WEBSITE ?= https://www.avonture.be

UID:=$(shell id -u)
GID:=$(shell id -g)

.PHONY: build
build:
	clear
	docker build --build-arg OS_USERID=${UID} --build-arg OS_GROUPID=${GID} --tag pestphp .

.PHONY: remove
remove:
	docker rm demo_pest --force

.PHONY: up
up:
	docker run --detach -v ./tests:/var/www/html/tests --name demo_pest pestphp

.PHONY: bash
bash:
	docker exec -it demo_pest /bin/bash

.PHONY: start
start:
	docker exec -it demo_pest sh -c "WEBSITE=$(WEBSITE) vendor/bin/pest"
