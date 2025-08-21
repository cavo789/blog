---
slug: docker_ssl_encrypt
title: Encrypt sensitive data using SSL and Docker
authors: [christophe]
image: /img/encrypt_social_media.jpg
mainTag: ssl
tags: [docker, encryption, ssl]
enableComments: true
---
![Encrypt sensitive data using SSL and Docker](/img/encrypt_banner.jpg)

For 1,000 reasons or more, you want to encrypt a file containing text. Which software should you install? Well ... none other than Docker!

By using a [Docker Alpine/OpenSSL](https://hub.docker.com/r/alpine/openssl) image, it's so easy to encrypt/decrypt files using OpenSSL.

<!-- truncate -->

## Linux scripts

Create a new file on your disk with this content. This is the `encrypt.sh` script.

<Snippet filename="encrypt.sh">

```bash
#!/usr/bin/env bash

(
  MY_PASSWORD="ThisIsMyLongPasswordNobodyWillBeAbleToCrackIt" &&
  docker run --rm -it -v $(pwd):/data -w /data -u $(id -u):$(id -g) alpine/openssl enc -aes-256-cbc -salt -pbkdf2 -a -in /data/secrets.md -out /data/secrets_encrypted.md -k ${MY_PASSWORD}
)
```

</Snippet>

And this is the `decrypt.sh` script:

<Snippet filename="decrypt.sh">

```bash
#!/usr/bin/env bash

(
  MY_PASSWORD="ThisIsMyLongPasswordNobodyWillBeAbleToCrackIt" &&
  docker run --rm -it -v $(pwd):/data -w /data -u $(id -u):$(id -g) alpine/openssl enc -aes-256-cbc -salt -pbkdf2 -a -d -in /data/secrets_encrypted.md -out //data/secrets_decrypted.md -k ${MY_PASSWORD}
)
```

</Snippet>

Update the `MY_PASSWORD` variable in both scripts to use yours.

## DOS scripts

For the illustration purpose, the DOS encryption script, `encrypt.cmd`, will ask you for a password (since the `-k` parameter is not part of the instruction). If the encrypted file has been created, the original one will be removed from your disk.

Here is the content of the `encrypt.cmd` DOS script:

<Snippet filename="encrypt.cmd">

```text
@echo off

cls

docker run --rm -it -v %CD%:/data -w /data alpine/openssl enc -aes-256-cbc -salt -pbkdf2 -a -in /data/secrets.md -out /data/secrets.encrypted

# Put this part in comment if you want to keep the original, unencrypted, file.
IF EXIST secrets.encrypted (
  del secrets.md
)
```

</Snippet>

The decryption script, `decrypt.cmd` will ask you for the password and will display the decrypted content on the console (since the `-out` parameter is not part of the instruction).

Here is the content of the `decrypt.cmd` DOS script:

<Snippet filename="decrypt.cmd">

```text
@echo off

cls

docker run --rm -it -v C:\temp:/data -w /data alpine/openssl enc -aes-256-cbc -salt -pbkdf2 -a -d -in /data/secrets.encrypted
```

</Snippet>

## Use case

In addition to simple encryption need, one use case is to store confidential files in online systems, e.g. a versioning system such as Github, or on cloud disks (e.g. Google drive).

## Command line arguments

The openssl `enc` command accepts those arguments:

| Option         | Description                                             |
| -------------- | ------------------------------------------------------- |
| `enc`          | Encoding with Ciphers                                   |
| `-aes-256-cbc` | The encryption cipher to be used                        |
| `-salt`        | Adds strength to the encryption                         |
| `-pbkdf2`      | Generate a PBKDF2 key derivation of a supplied password |
| `-a`           | Encrypted data should be in Base64 and not binary       |
| `-d`           | Decrypt action (if `-d` is missing, action is encrypt)  |
| `-in`          | Specifies the input file                                |
| `-out`         | Specifies the output file                               |
| `-k`           | Provide the password to use                             |

## Decrypt on the console, don't write a file

Edit the `decrypt.sh` (or `decrypt.cmd`) script and search for `-out /data/secrets_decrypted.md`. Remove that part.

Now, when you'll run `decrypt.sh` the decrypted content will be displayed on the console only, nothing will be written on the disk. Your secrets are safe.

## Example

Imagine a text file like `secrets.md` with this content:

<Snippet filename="secrets.md">

```markdown
# My password

## My secret site

### FTP server

* Name: `127.0.0.1`
* Login: `admin`
* Password: `admin`

### Admin interface

* URL: `https://..../admin`
* Login: `admin`
* Password: `admin`
```

</Snippet>

By running the `encrypt.sh` script, the file `secrets_encrypted.md` will be created on your disk and will have this content:

<Snippet filename="secrets_encrypted.md">

```text
U2FsdGVkX18jyyHAiaDcwolgvrCmB9SutNFhOFosDZvYA+t/8F5PWsxU+YIb0xLj
/0swl1Mvh9XBcg3FwpQn5CGm5ltb3zKiExPO8WoTuYOmlJj2PN5eLJv3GWVVJ8/t
q31xBBAlbI0k+a3pWiETl1qEmh4hwc4jeC5NOByYSAojiIdCNF0W5+VVkUlBeKGb
sv8tpDWEb/dgHrfFPtZD5MqeNQw71/ndORZC1ZDIT/Ju6O7a6rd9ph0aQuPz49PU
SzDUePUgn9wbR0tZvNM1JA1LkN1kDaguJ940TdKns+Q=
```

</Snippet>

From now, you can remove `secrets.md` since you've the encrypted version.

To retrieve the original content, just run the `decrypt.sh` script.

By running that command (or by running `decrypt.sh`), you'll decrypt the file `secrets_encrypted.md` and get a newer one called `secrets_decrypted.md`.
