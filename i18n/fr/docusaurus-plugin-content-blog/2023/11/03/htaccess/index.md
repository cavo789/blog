---
slug: apache-htaccess
title: Le fichier .htaccess d'Apache
date: 2023-11-03
description: Maîtrisez votre fichier .htaccess Apache avec des astuces essentielles pour la sécurité, les redirections, le contrôle d'accès aux fichiers, la Content Security Policy (CSP), le forçage du HTTPS et l'optimisation des performances.
authors: [christophe]
image: /img/v2/htaccess.webp
mainTag: apache
tags:
  - apache
  - linux
language: fr
review_date: 2026-07-30
---
<!-- cspell:ignore webm -->
![Le fichier .htaccess d'Apache](/img/v2/htaccess.webp)

<TLDR>
Voici une large référence de snippets `.htaccess` prêts à l'emploi : en-têtes Content Security Policy, blocage de fichiers par nom / extension / préfixe point (fichiers cachés), affichage inline forcé ou téléchargement forcé, forçage du HTTPS+www avec preload HSTS, mode maintenance, compression gzip et en-têtes expires, contrôle d'accès par IP, protection contre le clickjacking et le MIME-sniffing, désactivation de l'exécution de scripts ou du listing de répertoires, protection par mot de passe de fichiers/dossiers, différents schémas de redirection, et blocage de l'indexation d'un dossier par les moteurs de recherche.
</TLDR>

Quelques trucs et astuces pour votre fichier .htaccess (Apache).

*Ces directives fonctionnent sur n'importe quel serveur Apache, y compris celui, jetable, que vous pouvez démarrer localement en quelques secondes avec <Link to="/blog/docker-html-site">Running an HTML site in seconds using Docker</Link> — une manière pratique de tester une règle de redirection avant de la pousser en production.*

<!-- truncate -->

## CSP - Content Security Policy {#csp---content-security-policy}

Utilisez les lignes suivantes comme source d'inspiration :

<Snippet filename=".htaccess" source="./files/csp.htaccess" />

## Fichiers {#files}

### Bloquer l'accès à certains fichiers selon leur nom {#block-access-to-some-files-based-on-their-names}

Bloquer les requêtes vers ces fichiers :

<Snippet filename=".htaccess" source="./files/block_filenames.htaccess" />

### Bloquer l'accès à certains fichiers selon leur extension {#block-access-to-some-files-based-on-their-extensions}

Bloquer l'accès à tous les fichiers sauf ceux dont l'extension est mentionnée dans la liste ci-dessous :

Première option :

<Snippet filename=".htaccess" source="./files/block_fileextensions_option1.htaccess" />

Deuxième option :

<Snippet filename=".htaccess" source="./files/block_fileextensions_option2.htaccess" />

### Bloquer l'accès aux fichiers et dossiers cachés {#block-access-to-hidden-files--directories}

Bloquer l'accès à un fichier ou un dossier dont le nom commence par un point (autrement dit, un fichier ou un dossier caché) :

<Snippet filename=".htaccess" source="./files/block_hidden_files_folders.htaccess" />

## Forcer {#force}

### Forcer l'affichage {#force-display}

Ne laissez pas le navigateur télécharger ces fichiers, mais dites-lui comment les afficher (du texte dans l'exemple) :

<Snippet filename=".htaccess" source="./files/.part6.htaccess" />

#### Empêcher le téléchargement {#prevent-downloading}

Par exemple, forcer le téléchargement des fichiers PDF :

<Snippet filename=".htaccess" source="./files/.part7.htaccess" />

#### Forcer https et www, compatible hstspreload {#force-https-and-www-compatible-hstspreload}

> Une fois implémenté dans votre .htaccess, un accès à `yoursite.com` ou `http://yoursite.com` doit rediriger vers `https://www.yoursite.com`.

Testez aussi votre site avec [https://hstspreload.org/](https://hstspreload.org/) pour vérifier que votre preloading est correct (vert).

<Snippet filename=".htaccess" source="./files/.part8.htaccess" />

## Divers {#misc}

### Désactiver l'affichage des erreurs {#disable-error-reporting}

Ne pas afficher les erreurs (exactement comme le fait `error_reporting(0)`)

<Snippet filename=".htaccess" source="./files/.part9.htaccess" />

#### Activer l'affichage des erreurs {#enable-error-reporting}

Afficher les erreurs (exactement comme le fait `error_reporting = E_ALL`).

À n'utiliser que sur un serveur de développement, sinon vous exposez des informations sensibles à vos visiteurs.

<Snippet filename=".htaccess" source="./files/.part10.htaccess" />

#### Activer un mode maintenance {#enable-a-maintenance-mode}

Rediriger toutes les requêtes faites vers votre site vers une page spécifique (appelée `maintenance.php` ci-dessous). N'oubliez pas de remplacer le code `ADD_YOUR_IP_HERE` par votre adresse IP actuelle.

<Snippet filename=".htaccess" source="./files/.part11.htaccess" />

## Optimisation {#optimization}

### Compresser les fichiers selon leur type ou leur extension {#compress-files-based-on-their-type-or-extensions}

<Snippet filename=".htaccess" source="./files/.part12.htaccess" />

### Ajouter une expiration (en-têtes expires) {#add-expiration-expires-headers}

Activer les ETags

<Snippet filename=".htaccess" source="./files/.part13.htaccess" />

## Protection {#protection}

*Durcir votre `.htaccess` vous protège pour l'avenir ; si vous suspectez que le site a **déjà** été compromis, commencez par <Link to="/blog/aesecure-quickscan">aeSecure - QuickScan - Free viruses scanner</Link>.*

### Refuser tout accès {#deny-all-access}

<Snippet filename=".htaccess" source="./files/.part14.htaccess" />

### Refuser tout accès sauf le vôtre {#deny-all-access-except-you}

Remplacez simplement `xxx.xxx.xxx.xxx` par votre adresse IP.

<Snippet filename=".htaccess" source="./files/.part15.htaccess" />

### Empêcher le navigateur de faire du MIME-sniffing {#stops-a-browser-from-trying-to-mime-sniff}

<Snippet filename=".htaccess" source="./files/.part16.htaccess" />

### Éviter le clickjacking et activer la protection XSS des navigateurs {#avoid-clickjacking-and-enable-xss-protection-for-browsers}

<Snippet filename=".htaccess" source="./files/.part17.htaccess" />

### Désactiver l'exécution des scripts {#disable-script-execution}

Placez ces lignes dans, par exemple, `/tmp/.htaccess` pour empêcher l'exécution de scripts dans le dossier `/tmp`.

<Snippet filename="/tmp/.htaccess" source="./files/no_execution.htaccess" />

### Interdire le listing des répertoires {#disallow-listing-for-directories}

Ne laissez pas le serveur web fournir la liste des fichiers / dossiers comme le fait une commande `dir`.

<Snippet filename=".htaccess" source="./files/.part18.htaccess" />

### htpasswd {#htpasswd}

- Générateur de `.htpasswd` : [http://aspirine.org/htpasswd.html](http://aspirine.org/htpasswd.html)

#### Mot de passe sur un fichier {#file-password}

<Snippet filename=".htaccess" source="./files/.part19.htaccess" />

#### Mot de passe sur un dossier {#folder-password}

Placez ces lignes dans un fichier nommé `.htaccess` dans le dossier à protéger (par ex. `folder_name`) :

<Snippet filename="folder_name/.htaccess" source="./files/folder_password.htaccess" />

### Whitelist - Interdire l'accès à tous les fichiers sauf ceux mentionnés {#whitelist---disallow-access-to-all-files-except-the-ones-mentioned}

<Snippet filename=".htaccess" source="./files/.part20.htaccess" />

## Redirection {#redirect}

### Rediriger un site entier {#redirect-an-entire-site}

<Snippet filename=".htaccess" source="./files/.part21.htaccess" />

### Redirection permanente {#permanent-redirection}

<Snippet filename=".htaccess" source="./files/.part22.htaccess" />

### Redirection temporaire {#temporary-redirection}

<Snippet filename=".htaccess" source="./files/.part23.htaccess" />

### Rediriger un sous-dossier {#redirect-a-subfolder}

Par exemple, rediriger `/category/apple.php` vers `apple.php`

<Snippet filename=".htaccess" source="./files/.part24.htaccess" />

ou régler des problèmes d'orthographe en redirigeant par exemple toutes les requêtes vers le dossier `fruit` vers sa forme au pluriel.

<Snippet filename=".htaccess" source="./files/.part25.htaccess" />

Autre exemple : rediriger les URL de `/archive/2020/...` vers `/2020/...`.

<Snippet filename=".htaccess" source="./files/.part26.htaccess" />

## Moteurs de recherche {#search-engine}

### Interdire l'indexation {#disallow-indexing}

Placez ces lignes dans, par exemple, `yoursite/administrator` pour informer les moteurs de recherche que vous ne les autorisez pas à indexer les fichiers de ce dossier (et de ses sous-dossiers).

<Snippet filename="administrator/.htaccess" source="./files/administrator.htaccess" />
