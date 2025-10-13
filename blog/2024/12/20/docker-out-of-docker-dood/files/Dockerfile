# syntax=docker/dockerfile:1

FROM alpine:latest

# hadolint ignore=DL3008
# Note: use docker.io and not docker if you are using another image than alpine (i.e. with apt-get and not apk)
RUN apk update && apk add docker

# hadolint ignore=DL3002
USER root
