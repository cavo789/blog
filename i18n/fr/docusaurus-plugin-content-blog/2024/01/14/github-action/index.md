---
slug: github-action
title: GitHub - Utiliser les Actions pour déployer ce blog
date: 2024-01-14
description: Fini les déploiements FTP manuels ! Découvrez comment automatiser le déploiement de votre blog avec GitHub Actions. Ce guide pas à pas montre comment mettre en place le workflow et utiliser les secrets du repository pour une mise à jour automatique à chaque push.
authors: [christophe]
image: /img/v2/github_tips.webp
mainTag: github
tags:
  - docusaurus
  - github
language: fr
review_date: 2026-07-30
updates:
  - date: 2026-08-18
    note: FTP caveats added, and a pointer to the SSH/rsync workflow that replaced it
---
![GitHub - Utiliser les Actions pour déployer ce blog](/img/v2/github_tips.webp)

<TLDR>
Cet article explique comment remplacer les scripts de déploiement FTP manuels par un workflow GitHub Actions qui déploie automatiquement le blog à chaque push. Il couvre la création du fichier `.github/workflows/deploy.yml`, le stockage des identifiants FTP sous forme de secrets du repository, et l'utilisation d'un utilisateur FTP restreint au seul dossier de sortie du déploiement.
</TLDR>

Pendant les deux derniers mois, j'utilisais un script d'automatisation FTP (<Link to="/blog/winscp-synchronize-both">WinSCP en mode synchronisation</Link>) pour déployer le blog sur mon serveur FTP, comme décrit dans <Link to="/blog/site-creation">Site creation</Link>.

Cette façon de faire fonctionnait bien mais avait plusieurs problèmes inhérents, le plus important étant que je devais lancer le script manuellement (depuis mon ordinateur).

Si je modifiais un article directement depuis l'interface GitHub ou depuis un autre ordinateur (où WinSCP n'était pas installé, par exemple), il n'y avait aucun déploiement.

Avec GitHub Actions, ce problème n'existe plus. À chaque push, le blog est mis à jour.

<!-- truncate -->

<AlertBox variant="important" title="Le FTP fonctionne, mais ce n'est plus ce que j'utilise">
Tout ce qui suit fonctionne toujours, et c'est un point de départ parfaitement raisonnable si votre
hébergement ne propose que le FTP. Ce n'est cependant pas ce qui déploie ce blog aujourd'hui : le FTP
envoie votre mot de passe en clair et transfère le site fichier par fichier. Si votre hébergeur vous
donne un accès SSH, passez directement à
[la version SSH/rsync](#why-i-moved-to-ssh) à la fin de cet article.
</AlertBox>

## À quoi ressemble un déploiement aujourd'hui {#what-a-deployment-looks-like-now}

Je pousse un commit — depuis mon portable, depuis une autre machine, ou directement depuis l'éditeur web de GitHub — et la page `https://github.com/cavo789/blog/actions` affiche ceci d'elle-même :

![Mon action est en cours d'exécution](./images/action_is_running.webp)

En cliquant sur l'action en cours, le détail de chaque étape s'affiche et je peux suivre facilement :

![Envoi des fichiers](./images/pushing.webp)

Quatre minutes plus tard, l'action est verte et le blog est à jour en ligne. Je n'ai ouvert aucun client FTP, et je n'ai pas approché la machine où WinSCP est installé.

## Trois ingrédients {#three-ingredients}

Un fichier de workflow commité dans le repository, trois secrets de repository contenant les identifiants FTP, et un utilisateur FTP restreint au dossier de déploiement. C'est toute l'installation — aucun runner à héberger, aucun service auquel s'abonner.

## Mise en place {#setting-it-up}

Pour activer les `GitHub actions`, il faut d'abord créer un fichier dans le dossier `.github/workflows`. Le mien s'appellera `deploy.yml` avec ce contenu :

<Snippet filename=".github/workflows/deploy.yml" source="./files/deploy.yml" />

Comme vous pouvez le voir, j'ai besoin de trois secrets : `${{ secrets.ftp_server }}`, `${{ secrets.ftp_login }}` et `${{ secrets.ftp_password }}`.

<AlertBox variant="info" title="Veillez à utiliser un utilisateur FTP restreint">
N'utilisez pas un utilisateur trop privilégié. Créez-en un nouveau, uniquement pour votre blog, avec accès au seul dossier de sortie (comme `/var/www/html/public`) où votre blog doit être déployé.

</AlertBox>

Je dois les créer dans la page Settings de mon repository : `https://github.com/cavo789/blog/settings/secrets/actions` c'est-à-dire `Settings` -> `Secrets and variables` -> `Actions`.

Dans la zone `Repository secrets`, j'ai cliqué sur le bouton `New repository secret` et créé le premier : `FTP_LOGIN`, en fournissant le login. Même chose pour les deux autres secrets.

Ceci fait, je peux pousser mes modifications locales (le `.github/workflows/deploy.yml`) sur GitHub avec `git add .github/workflows/deploy.yml && git commit -m "chore: add deploy github action" && git push`.

## Pourquoi je suis passé au SSH {#why-i-moved-to-ssh}

Trois choses dans cette configuration m'ont assez gêné pour que je finisse par la remplacer, et
aucune ne concerne GitHub Actions — elles concernent toutes le FTP comme moyen de transport.

**Les identifiants circulent en clair.** Le FTP simple n'a aucun chiffrement. Le mot de passe, et
chaque octet du site, traversent le réseau lisibles par tout ce qui se trouve entre les deux. FTPS
(TLS explicite sur le même port) corrige cela et coûte une ligne de configuration : si vous restez
en FTP, utilisez-le au minimum.

**Un fichier à la fois.** Le FTP ouvre une connexion de données distincte par fichier. Sur un site
de quelques milliers de fichiers, la surcharge domine : le transfert passe son temps à négocier
plutôt qu'à envoyer. Ce sont les quatre minutes que vous avez vues plus haut — presque rien n'est
de la donnée réelle.

**Un tiers se place entre la clé et le serveur.** L'action qui fait le transfert est du code que je
ne contrôle pas, et je lui confie mes identifiants à chaque exécution. C'est un compromis
raisonnable pour le confort, mais c'est un compromis, et il vaut mieux le faire en conscience.

Le remplacement utilise `rsync` via SSH : chiffré par défaut, une seule connexion pour tout le site,
et seuls les fichiers dont le contenu a réellement changé passent sur le réseau.

## Conclusion {#conclusion}

Ce qui a disparu ici n'est pas une technologie, c'est une habitude : le petit script WinSCP que je devais penser à lancer, depuis le seul ordinateur où il était installé. Publier est maintenant un effet de bord du push, ce que je fais de toute façon.

Le déploiement n'est pas la seule chose qui mérite d'être automatisée sur GitHub ; <Link to="/blog/github-profile-last-blogposts">Automate your GitHub README with your latest blog posts</Link> utilise le même mécanisme pour garder ma page de profil à jour.
