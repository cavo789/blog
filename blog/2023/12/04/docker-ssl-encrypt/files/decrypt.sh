#!/usr/bin/env bash

(
  MY_PASSWORD="ThisIsMyLongPasswordNobodyWillBeAbleToCrackIt" &&
  docker run --rm -it -v $(pwd):/data -w /data -u $(id -u):$(id -g) alpine/openssl enc -aes-256-cbc -salt -pbkdf2 -a -d -in /data/secrets_encrypted.md -out //data/secrets_decrypted.md -k ${MY_PASSWORD}
)
