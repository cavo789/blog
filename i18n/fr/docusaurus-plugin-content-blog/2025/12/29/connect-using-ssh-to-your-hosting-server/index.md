---
slug: connect-using-ssh-to-your-hosting-server
title: Comment se connecter à votre serveur d'hébergement en SSH
authors: [christophe]
mainTag: ssh
description: Apprenez à vous connecter à votre serveur d'hébergement en SSH avec une authentification par clé et un simple alias pour un accès facile.
tags:
  - self-hosted
  - ssh
image: /img/v2/planethoster-using-ssh.webp
series: SSH - From your first key to remote development
date: 2025-12-29
blueskyRecordKey: 3mb4feo4u7c2t
---
![Comment se connecter à votre serveur d'hébergement en SSH](/img/v2/planethoster-using-ssh.webp)

<TLDR>
Ce guide explique comment configurer SSH pour une authentification par clé, sans mot de passe, vers votre serveur d'hébergement. Il détaille la collecte des informations de connexion, la génération et la copie d'une clé publique SSH, et la création d'un alias dans `~/.ssh/config`. Résultat : un accès en une seule commande, comme `ssh planethoster`.
</TLDR>


Ce guide explique comment configurer SSH pour vous connecter à votre serveur d'hébergement via un alias court, sans devoir saisir un mot de passe à chaque connexion.

Vous allez apprendre à rassembler les informations nécessaires, générer une paire de clés SSH, copier votre clé publique sur le serveur et configurer `~/.ssh/config` pour obtenir un raccourci pratique.

Pour cet article, partons du principe que vous avez un compte d'hébergement PlanetHoster. À la fin de ce guide, vous pourrez vous connecter à votre serveur PlanetHoster avec une simple commande du type `ssh planethoster`.

<!-- truncate -->

## Le résultat {#the-result}

Une fois la clé et l'alias `~/.ssh/config` en place (voir plus bas), démarrer une session tient en une commande — immédiat, sans demande de mot de passe :

![Succès](./images/success.webp)

## Pourquoi ça marche {#why-it-works}

- Votre clé **publique** est copiée dans le fichier `~/.ssh/authorized_keys` du serveur — le serveur peut vérifier votre identité sans jamais voir de mot de passe.
- Un court bloc dans `~/.ssh/config` regroupe l'host, le port, l'utilisateur et la clé sous un seul alias — `ssh planethoster` au lieu d'une commande à quatre options à retenir.
- Une fois la clé en place, il n'y a plus rien à taper ni à retaper — le « mot de passe à chaque fois » évoqué en ouverture de cet article, c'est fini.

## Installation {#installation}

<StepsCard
  title="Vous devez obtenir les informations suivantes :"
  variant="prerequisites"
  steps={[
    "Le nom d'utilisateur pour la connexion",
    "Le nom du serveur (ou son adresse IP)",
    "Le numéro de port à utiliser",
    "Le mot de passe associé au compte utilisateur."
  ]}
/>


Pour les trois premiers éléments, connectez-vous au [tableau de bord PlanetHoster](https://my.planethoster.com/v2/hosting-management/overview).

Vous arrivez sur la page du tableau de bord. Dans la barre latérale gauche, allez dans **Hébergement Web --> Gestion du compte** et cliquez sur la flèche pour ouvrir la page :

![Ouvrir votre panneau de contrôle](./images/web_hosting.webp)

En haut de [la page](https://mg.n0c.com/), vous trouverez les trois informations nécessaires :

- Le *Current user* : le nom d'utilisateur à utiliser pour SSH.
- Le nom de votre serveur (et son adresse IP).
- Le port SSH à utiliser (probablement `5022`).

![La page de votre tableau de bord Planethoster](./images/planethoster_dashboard.webp)

La quatrième information à rassembler est le mot de passe associé à votre compte utilisateur.

*Si vous passez par un autre hébergeur, les étapes pour obtenir ces informations seront différentes. Reportez-vous à la documentation de votre fournisseur.*

<StepsCard
  title="Pour la suite de cet article, partons de ces valeurs :"
  variant="prerequisites"
  steps={[
    "Utilisateur : `john_doe`",
    "Nom du serveur : `node30-eu.n0c.com`",
    "Numéro de port : `5022`",
    "Mot de passe : `p@ssword`"
  ]}
/>

### D'abord, essayez une connexion SSH manuelle {#first-just-try-with-a-manual-ssh-connection}

Dans une console Linux (ou Windows Powershell), lancez la commande suivante :

<Terminal typewriter wrap={true}>
$ ssh -p 5022 john_doe@node30-eu.n0c.com
</Terminal>

Un mot de passe vous sera demandé ; saisissez celui de votre compte.

Si tout est correctement configuré, vous obtenez un shell. Vous serez dans le répertoire home de votre utilisateur (et non à la racine du système).

Tapez `ls -al` pour lister les fichiers et `pwd` ou `whoami` pour confirmer que vous êtes bien dans votre répertoire home :

![Voir le répertoire racine via SSH](./images/ssh_logged_in.webp)

<AlertBox variant="caution" title="Que faire en cas de timeout">
Si la commande `ssh` met longtemps puis se termine par un timeout, c'est probablement que vous utilisez des informations incorrectes, comme un mauvais nom d'utilisateur. Ne réessayez pas plusieurs fois d'affilée, sinon vous allez bloquer votre adresse IP : votre hébergeur peut détecter plusieurs tentatives de connexion échouées, les interpréter comme une menace de sécurité et bloquer votre IP. Si cela arrive, même avec la bonne commande, vous ne pourrez plus vous connecter à cause de l'IP blacklistée.

Dans ce cas, il faudra attendre un certain temps (cela dépend de l'hébergeur). Le mieux, si vous êtes bloqué, est d'ouvrir un ticket de support et de demander le déblocage de votre IP.
</AlertBox>

### Créer une clé SSH pour se connecter à PlanetHoster {#create-an-ssh-key-to-connect-to-planethoster}

À l'étape précédente, nous avons confirmé que la connexion au serveur fonctionne avec nos identifiants. Améliorons maintenant la connexion en mettant en place une authentification par clé SSH. Cela permettra de se connecter sans mot de passe par la suite.

#### Créer une clé SSH {#create-an-ssh-key}

Sur votre machine locale, lancez dans votre terminal une commande du type `ssh-keygen -t ed25519 -C "john_doe" -f ~/.ssh/id_ed25519_hosting`. *Le même mécanisme de clé est utilisé pour dialoguer avec GitHub, comme décrit dans <Link to="/blog/github-connect-using-ssh">GitHub - Connect your account using SSH and start to work with git@ protocol</Link>.* Cela crée une clé SSH privée nommée `~/.ssh/id_ed25519_hosting` (et la clé publique associée `~/.ssh/id_ed25519_hosting.pub`).

Une passphrase vous sera demandée. Vous pouvez en définir une pour plus de sécurité, ou la laisser vide par confort (dans cet article, je n'utilise pas de passphrase).

<AlertBox variant="info">
Curieux ? Lancez `cat ~/.ssh/id_ed25519_hosting.pub` pour voir le contenu de votre clé publique. La clé ressemblera à `ssh-ed25519 BASE64_STRING john_doe`.
</AlertBox>

#### Copier votre clé sur le serveur {#copy-your-key-to-the-server}

Pour pouvoir vous connecter sans mot de passe, vous devez copier votre clé publique sur le serveur.

Lancez `ssh-copy-id -i ~/.ssh/id_ed25519_hosting -p 5022 john_doe@node30-eu.n0c.com` pour copier votre clé publique sur le serveur d'hébergement.

Votre mot de passe vous sera demandé une dernière fois.

<Terminal typewriter wrap={true} source="./files/terminal-1.txt" />

Vérifiez que vous voyez bien un message indiquant que la ou les clés ont été ajoutées avec succès.

Dès à présent, vous pourrez vous connecter sans fournir de mot de passe.

Lancez la commande ci-dessous pour tester :

<Terminal typewriter wrap={true}>
$ ssh -i ~/.ssh/id_ed25519_hosting -p 5022 john_doe@node30-eu.n0c.com
</Terminal>

Comme prévu, vous serez connecté immédiatement, sans demande de mot de passe, grâce à notre clé SSH.

#### Simplifier la commande avec un fichier de configuration SSH {#simplify-the-command-with-an-ssh-config-file}

La commande précédente est assez longue, non ? Peut-on la simplifier ? Oui !

Simplifions-la pour n'avoir qu'à taper `ssh planethoster`.

Pour cela, lancez `vi ~/.ssh/config` (ou votre éditeur préféré) pour ouvrir votre fichier de configuration SSH. Si le fichier n'existe pas encore, créez-le.

Ajoutez le bloc ci-dessous à la fin du fichier (pensez à adapter les valeurs à votre configuration) :

<Snippet filename="~/.ssh/config" source="./files/config" />

Enregistrez et fermez le fichier (astuce : c'est `:w!` dans vi).

Ensuite, définissez les bonnes permissions sur votre clé en lançant `chmod 0600 ~/.ssh/id_ed25519_hosting*`. Les fichiers de clés (privée et publique) ne seront ainsi accessibles que par vous.

<AlertBox variant="note" title="WARNING: UNPROTECTED PRIVATE KEY FILE!">
Si vous ne définissez pas les bonnes permissions avec `chmod`, vous obtiendrez une erreur comme celle-ci en tentant de vous connecter :

```text
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@         WARNING: UNPROTECTED PRIVATE KEY FILE!          @
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
Permissions 0644 for '/home/john_doe/.ssh/id_ed25519_hosting' are too open.
```

</AlertBox>

#### Établir une connexion SSH simplifiée {#establish-an-easy-ssh-connection}

Désormais, pour démarrer une connexion SSH vers votre host, ouvrez un terminal et lancez `ssh planethoster` (ou l'alias que vous avez défini). Si tout est bien configuré, vous serez connecté **immédiatement** et **sans demande de mot de passe** — exactement le résultat montré en début d'article.

## Autres démos {#more-demos}

### Dépannage et astuces {#troubleshooting--tips}

- Si une connexion échoue, lancez le client SSH en mode verbeux pour voir la sortie de debug : `ssh -vvv -p 5022 john_doe@node30-eu.n0c.com` (autrement dit, ajoutez `-vvv` comme option supplémentaire).
- Si vous voyez une erreur `WARNING: UNPROTECTED PRIVATE KEY FILE!`, vérifiez les permissions locales de votre clé privée et utilisez `chmod 600` comme montré plus haut.
- Si besoin, connectez-vous au serveur et vérifiez que votre clé est bien présente dans `~/.ssh/authorized_keys` et que `~/.ssh` et `authorized_keys` ont les bonnes permissions (lancez simplement `vi ~/.ssh/authorized_keys` pour ouvrir le fichier, l'éditer et supprimer les clés indésirables).

## Conclusion {#conclusion}

Ce guide a montré comment mettre en place un accès SSH par clé vers un serveur d'hébergement et créer un raccourci `ssh planethoster`.

Une fois que vous aurez accumulé une dizaine d'alias dans `~/.ssh/config`, les retenir deviendra le nouveau problème ; <Link to="/blog/ssh-with-fuzzy-finder">Master your ssh command and select the host from a list</Link> les transforme en un sélecteur interactif.
