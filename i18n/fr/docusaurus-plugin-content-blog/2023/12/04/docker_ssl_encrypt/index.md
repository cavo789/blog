---
slug: docker_ssl_encrypt
title: Chiffrer des données sensibles avec SSL et Docker
date: 2023-12-04
description: Chiffrez et déchiffrez vos fichiers sensibles avec l'image OpenSSL dans Docker. Inclut des scripts simples pour Linux et Windows pour protéger vos secrets avant de les stocker dans Git ou dans le cloud.
authors: [christophe]
image: /img/v2/encryption.webp
mainTag: ssl
tags:
  - docker
  - ssl
language: fr
review_date: 2026-07-30
---
![Chiffrer des données sensibles avec SSL et Docker](/img/v2/encryption.webp)

<TLDR>
Cet article partage des scripts Linux et DOS qui chiffrent/déchiffrent des fichiers avec OpenSSL via l'image Docker `alpine/openssl` (AES-256-CBC avec PBKDF2), pratiques pour stocker des secrets en toute sécurité dans des repositories Git ou sur des disques cloud. Il montre aussi comment adapter le script de déchiffrement pour afficher le contenu déchiffré uniquement dans la console, sans jamais l'écrire sur le disque.
</TLDR>

Pour 1 000 raisons ou plus, vous voulez chiffrer un fichier contenant du texte. Quel logiciel installer ? Eh bien... aucun autre que Docker !

En utilisant une image [Docker Alpine/OpenSSL](https://hub.docker.com/r/alpine/openssl), c'est si simple de chiffrer/déchiffrer des fichiers avec OpenSSL.

<!-- truncate -->

<QuickJump
  links={[
    { label: "À quoi ça ressemble", to: "#what-this-looks-like" },
    { label: "Les scripts", to: "#the-scripts" },
  ]}
/>

## À quoi ça ressemble {#what-this-looks-like}

Imaginez un fichier texte comme `secrets.md` avec ce contenu :

<Snippet filename="secrets.md" source="./files/secrets.txt" />

Et maintenant, la seule commande qui compte vraiment dans cet article :

<Terminal typewriter wrap={true}>
{`$ docker run --rm -it -v $(pwd):/data -w /data -u $(id -u):$(id -g) alpine/openssl enc -aes-256-cbc -salt -pbkdf2 -a -in /data/secrets.md -out /data/secrets_encrypted.md -k \${MY_PASSWORD}`}
</Terminal>

Et voici le fichier `secrets_encrypted.md` qu'elle vient de créer :

<Snippet filename="secrets_encrypted.md" source="./files/secrets_encrypted.txt" />

À partir de maintenant, vous pouvez supprimer `secrets.md` puisque vous avez la version chiffrée.

## Pourquoi ça fonctionne {#why-it-works}

- Le chiffrement est AES-256-CBC, la clé est dérivée de votre mot de passe avec PBKDF2 et un salt : deux chiffrements du même fichier avec le même mot de passe ne produisent pas les mêmes octets.
- Tout se passe dans le container `alpine/openssl`, supprimé juste après (`--rm`) : pas d'OpenSSL, aucun matériel de clé et aucun fichier temporaire laissé sur votre machine.
- Le flag `-a` demande du Base64 plutôt que du binaire, c'est pourquoi le résultat est du texte que vous pouvez committer, coller dans un ticket ou déposer sur un disque cloud.

## Les scripts {#the-scripts}

Plutôt que de taper cette ligne à chaque fois, mettez-la dans un script. Créez un nouveau fichier sur votre disque avec ce contenu. Voici le script `encrypt.sh`, et voici le script `decrypt.sh`.

<ProjectSetup folderName="docker-ssl-encrypt">
  <Snippet filename="encrypt.sh" source="./files/encrypt.sh" />
  <Snippet filename="decrypt.sh" source="./files/decrypt.sh" />
</ProjectSetup>

Mettez à jour la variable `MY_PASSWORD` dans les deux scripts pour utiliser le vôtre.

Pour récupérer le contenu d'origine, lancez simplement le script `decrypt.sh` : vous allez déchiffrer le fichier `secrets_encrypted.md` et obtenir un nouveau fichier appelé `secrets_decrypted.md`.

<Details label="Les deux mêmes scripts pour DOS (cliquez pour les détails)">

À titre d'illustration, le script de chiffrement DOS, `encrypt.cmd`, vous demandera un mot de passe (puisque le paramètre `-k` ne fait pas partie de l'instruction). Si le fichier chiffré a bien été créé, l'original sera supprimé de votre disque.

Le script de déchiffrement, `decrypt.cmd`, vous demandera le mot de passe et affichera le contenu déchiffré dans la console (puisque le paramètre `-out` ne fait pas partie de l'instruction).

<ProjectSetup folderName="docker-ssl-encrypt">
  <Snippet filename="encrypt.cmd" source="./files/encrypt.cmd" />
  <Snippet filename="decrypt.cmd" source="./files/decrypt.cmd" />
</ProjectSetup>

</Details>

## Déchiffrer dans la console, sans écrire de fichier {#decrypt-on-the-console-dont-write-a-file}

Éditez le script `decrypt.sh` (ou `decrypt.cmd`) et cherchez `-out /data/secrets_decrypted.md`. Supprimez cette partie.

Maintenant, quand vous lancerez `decrypt.sh`, le contenu déchiffré sera affiché uniquement dans la console, rien ne sera écrit sur le disque. Vos secrets sont en sécurité.

## Cas d'usage {#use-case}

En plus du simple besoin de chiffrement, un cas d'usage est de stocker des fichiers confidentiels dans des systèmes en ligne, par exemple un système de versioning comme Github, ou sur des disques cloud (par exemple Google Drive).

<AlertBox variant="caution" title="Chiffrer ne suffit pas">
Il suffit d'un `git add` oublié pour qu'un secret en clair finisse dans votre historique. Ajoutez un filet de sécurité : <Link to="/blog/git-precommit">Git - pre-commit-hooks</Link> liste des hooks comme *Gitleaks* et *Trufflehog* qui refusent le commit quand un identifiant est détecté.
</AlertBox>

## Les arguments d'openssl (passez cette section si vous voulez juste l'utiliser) {#the-openssl-arguments-skip-this-if-you-just-want-to-use-it}

La commande `enc` d'openssl accepte ces arguments :

| Option         | Description                                                    |
| -------------- | -------------------------------------------------------------- |
| `enc`          | Encodage avec des ciphers                                       |
| `-aes-256-cbc` | Le cipher de chiffrement à utiliser                             |
| `-salt`        | Renforce le chiffrement                                         |
| `-pbkdf2`      | Génère une dérivation de clé PBKDF2 à partir du mot de passe    |
| `-a`           | Les données chiffrées seront en Base64 et non en binaire        |
| `-d`           | Action de déchiffrement (si `-d` est absent, on chiffre)        |
| `-in`          | Indique le fichier d'entrée                                     |
| `-out`         | Indique le fichier de sortie                                    |
| `-k`           | Fournit le mot de passe à utiliser                              |

## Conclusion {#conclusion}

Un fichier contenant vos identifiants FTP est devenu cinq lignes de Base64, grâce à un outil que vous n'avez jamais installé et qui n'existe plus sur votre machine. Deux scripts, un mot de passe à retenir, et vos secrets peuvent désormais voyager par Git ou sur un disque cloud.

Le chiffrement protège le fichier auquel vous avez pensé ; les fichiers `.env` éparpillés dans vos projets sont ceux que vous allez oublier, et <Link to="/blog/compare-env-files-cli">comparer des fichiers .env en ligne de commande</Link> est un bon moyen de garder un œil dessus.
