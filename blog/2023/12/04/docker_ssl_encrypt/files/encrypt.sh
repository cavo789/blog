#!/usr/bin/env bash

(
  MY_PASSWORD="ThisIsMyLongPasswordNobodyWillBeAbleToCrackIt" &&
  docker run --rm -it -v $(pwd):/data -w /data -u $(id -u):$(id -g) alpine/openssl enc -aes-256-cbc -salt -pbkdf2 -a -in /data/secrets.md -out /data/secrets_encrypted.md -k ${MY_PASSWORD}
)
