@echo off

cls

docker run --rm -it -v %CD%:/data -w /data alpine/openssl enc -aes-256-cbc -salt -pbkdf2 -a -in /data/secrets.md -out /data/secrets.encrypted

# Put this part in comment if you want to keep the original, unencrypted, file.
IF EXIST secrets.encrypted (
  del secrets.md
)
