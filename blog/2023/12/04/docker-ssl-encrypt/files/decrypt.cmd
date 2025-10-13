@echo off

cls

docker run --rm -it -v C:\temp:/data -w /data alpine/openssl enc -aes-256-cbc -salt -pbkdf2 -a -d -in /data/secrets.encrypted
