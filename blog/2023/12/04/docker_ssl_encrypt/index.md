---
slug: docker_ssl_encrypt
title: Encrypt sensitive data using SSL and Docker
date: 2023-12-04
description: Securely encrypt and decrypt sensitive files using the OpenSSL image in Docker. Includes simple scripts for Linux and Windows to protect your secrets before storing them in Git or the cloud.
authors: [christophe]
image: /img/v2/encryption.webp
mainTag: ssl
tags:
  - docker
  - ssl
language: en
review_date: 2026-07-30
---
![Encrypt sensitive data using SSL and Docker](/img/v2/encryption.webp)

<TLDR>
This article shares Linux and DOS scripts that encrypt/decrypt files with OpenSSL via the `alpine/openssl` Docker image (AES-256-CBC with PBKDF2), useful for safely storing secrets in Git repositories or cloud drives. It also shows how to tweak the decrypt script to print the decrypted content to the console only, without ever writing it back to disk.
</TLDR>

For 1,000 reasons or more, you want to encrypt a file containing text. Which software should you install? Well ... none other than Docker!

By using a [Docker Alpine/OpenSSL](https://hub.docker.com/r/alpine/openssl) image, it's so easy to encrypt/decrypt files using OpenSSL.

<!-- truncate -->

<QuickJump
  links={[
    { label: "What this looks like", to: "#what-this-looks-like" },
    { label: "The scripts", to: "#the-scripts" },
  ]}
/>

## What this looks like

Imagine a text file like `secrets.md` with this content:

<Snippet filename="secrets.md" source="./files/secrets.txt" />

Now the only command that really matters in this article:

<Terminal typewriter wrap={true}>
{`$ docker run --rm -it -v $(pwd):/data -w /data -u $(id -u):$(id -g) alpine/openssl enc -aes-256-cbc -salt -pbkdf2 -a -in /data/secrets.md -out /data/secrets_encrypted.md -k \${MY_PASSWORD}`}
</Terminal>

And here is the `secrets_encrypted.md` file it just created:

<Snippet filename="secrets_encrypted.md" source="./files/secrets_encrypted.txt" />

From now on, you can remove `secrets.md` since you have the encrypted version.

## Why it works

- The cipher is AES-256-CBC, the key is derived from your password with PBKDF2 and a salt: two encryptions of the same file with the same password don't produce the same bytes.
- Everything happens inside the `alpine/openssl` container, which is removed right after (`--rm`): no OpenSSL, no key material and no temporary file left on your machine.
- The `-a` flag asks for Base64 instead of binary, which is why the result is plain text you can commit, paste in a ticket or drop on a cloud disk.

## The scripts

Rather than typing that line every time, put it in a script. Create a new file on your disk with this content. This is the `encrypt.sh` script, and this is the `decrypt.sh` script.

<ProjectSetup folderName="docker-ssl-encrypt">
  <Snippet filename="encrypt.sh" source="./files/encrypt.sh" />
  <Snippet filename="decrypt.sh" source="./files/decrypt.sh" />
</ProjectSetup>

Update the `MY_PASSWORD` variable in both scripts to use yours.

To retrieve the original content, just run the `decrypt.sh` script: you'll decrypt the file `secrets_encrypted.md` and get a newer one called `secrets_decrypted.md`.

<Details label="The same two scripts for DOS (click for the details)">

For the illustration purpose, the DOS encryption script, `encrypt.cmd`, will ask you for a password (since the `-k` parameter is not part of the instruction). If the encrypted file has been created, the original one will be removed from your disk.

The decryption script, `decrypt.cmd` will ask you for the password and will display the decrypted content on the console (since the `-out` parameter is not part of the instruction).

<ProjectSetup folderName="docker-ssl-encrypt">
  <Snippet filename="encrypt.cmd" source="./files/encrypt.cmd" />
  <Snippet filename="decrypt.cmd" source="./files/decrypt.cmd" />
</ProjectSetup>

</Details>

## Decrypt on the console, don't write a file

Edit the `decrypt.sh` (or `decrypt.cmd`) script and search for `-out /data/secrets_decrypted.md`. Remove that part.

Now, when you'll run `decrypt.sh` the decrypted content will be displayed on the console only, nothing will be written on the disk. Your secrets are safe.

## Use case

In addition to simple encryption need, one use case is to store confidential files in online systems, e.g. a versioning system such as Github, or on cloud disks (e.g. Google drive).

<AlertBox variant="caution" title="Encrypting is not enough">
It only takes one forgotten `git add` for a plain-text secret to end up in your history. Add a safety net: <Link to="/blog/git-precommit">Git - pre-commit-hooks</Link> lists hooks such as *Gitleaks* and *Trufflehog* that refuse the commit when a credential is detected.
</AlertBox>

## The openssl arguments (skip this if you just want to use it)

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

## Conclusion

A file with your FTP credentials became five lines of Base64, using a tool you never installed and that no longer exists on your machine. Two scripts, one password to remember, and your secrets can now travel through Git or a cloud drive.

Encryption protects the file you thought about; the `.env` files scattered around your projects are the ones you'll forget, and <Link to="/blog/compare-env-files-cli">Compare .env files using the CLI</Link> is a good way to keep an eye on them.
