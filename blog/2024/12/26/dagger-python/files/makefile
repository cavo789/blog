DAEMON_NAME=dagger_daemon
DOCKER_SOCK=-v /var/run/docker.sock:/var/run/docker.sock

.PHONY:build
build:
	docker build -t ${DAEMON_NAME} -f .docker/Dockerfile .

.PHONY:bash
bash:
	docker run -it --rm ${DOCKER_SOCK} -v .:/app/src --entrypoint /bin/bash ${DAEMON_NAME}

.PHONY:help
help:
	docker run -it --rm ${DOCKER_SOCK} -v .:/app/src ${DAEMON_NAME} call --help

.PHONY:lint
lint:
	docker run -it --rm ${DOCKER_SOCK} -v .:/app/src ${DAEMON_NAME} call lint
