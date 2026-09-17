---
slug: docker-localhost-ssl
title: Docker - Configurer votre localhost pour utiliser SSL
date: 2024-08-17
description: Configurez votre localhost Docker pour utiliser SSL (HTTPS) sans avertissements du navigateur. Ce guide pas à pas utilise mkcert pour générer des certificats de confiance pour vos containers Apache, Nginx et PHP.
authors: [christophe]
image: /img/v2/docker_tips.webp
mainTag: ssl
tags:
  - apache
  - docker
  - php
  - ssl
language: fr
blueskyRecordKey: null
updates:
  - date: 2026-06-15
    note: Replaced raw `openssl` with `mkcert` for trusted local certificates covering both `localhost` and `127.0.0.1`; removed the obsolete Chrome flags workaround; added Windows/WSL2 CA import instructions.
---
<!-- cspell:ignore htdocs,newkey,keyout,a2enmod,a2ensite,a2dissite,libapache2,unexpire,badaboum,socache,shmcb,mkcert,CAROOT,certutil -->

![Docker - Configurer votre localhost pour utiliser SSL](/img/v2/docker_tips.webp)

<TLDR>
Ce guide ajoute SSL à un site Apache dockerisé pour que `https://localhost` fonctionne sans avertissement du navigateur. Au lieu d'un certificat auto-signé OpenSSL, il utilise mkcert pour générer un certificat localement approuvé couvrant à la fois `localhost` et `127.0.0.1`. Des sections bonus couvrent la même configuration pour nginx et PHP, ainsi que la façon d'importer la CA racine de mkcert dans Windows quand votre navigateur tourne en dehors de WSL2.
</TLDR>

Dans un <Link to="/blog/docker-html-site">article précédent</Link>, j'ai expliqué comment lancer un site HTML statique en quelques secondes.

Le résultat était un site tournant sur votre ordinateur, en `http`. Allons un pas plus loin et voyons comment configurer Docker pour utiliser `https`, c'est-à-dire SSL et le chiffrement.

Dans cet article, vous apprendrez à utiliser Apache, nginx et PHP sur votre machine et à pouvoir démarrer `https://localhost`.

*Une fois HTTPS opérationnel en local, l'article <Link to="/blog/apache-htaccess">Apache .htaccess file</Link> contient les directives pour le **forcer** en production (avec le préchargement HSTS). Et pour chiffrer des fichiers plutôt que du trafic, voyez <Link to="/blog/docker_ssl_encrypt">Encrypt sensitive data using SSL and Docker</Link>.*

<!-- truncate -->

Notre objectif principal est d'utiliser une [image Docker Apache](https://hub.docker.com/_/httpd) pour permettre l'accès à localhost en http ou en https. Pour cela, nous avons besoin d'un certificat SSL.

Nous allons utiliser [mkcert](https://github.com/FiloSottile/mkcert), un outil qui crée une autorité de certification (CA) locale et émet des certificats signés par celle-ci. Une fois la CA installée dans le magasin de confiance de votre navigateur, `https://localhost` fonctionne sans aucun avertissement de sécurité — et `curl` fonctionne sans `--insecure`.

Ensuite, dans la section Bonus, nous ferons la même chose pour nginx et pour PHP.

## Commençons avec juste http {#lets-start-with-just-http}

Première chose : créons notre bac à sable, c'est-à-dire un petit site que nous utiliserons pour cet article.

Après une rapide recherche sur github.com, j'ai trouvé un joli template html5/css3 gratuit d'une seule page : [https://github.com/peterfinlan/Sedna](https://github.com/peterfinlan/Sedna).

### Créer un dossier temporaire et télécharger un site statique d'exemple {#create-a-temporary-folder-and-download-a-sample-static-site}

Téléchargeons le site de démo **Sedna** dans un dossier temporaire sur notre disque dur, décompressons le fichier, renommons le dossier par défaut `Sedna-master` en `src` et lançons le site avec Docker :

<Vars port="80" name="static-site" labels={{ port: "Port de l'host", name: "Nom du container" }} />

<Terminal typewriter>
$ mkdir -p /tmp/https_localhost && cd $_
$ wget https://github.com/peterfinlan/Sedna/archive/refs/heads/master.zip
$ unzip master.zip && rm master.zip && mv Sedna-master src
$ docker run -d --name %%name=static-site%% -p %%port=80%%:80 -v ./src:/usr/local/apache2/htdocs httpd:2.4
</Terminal>

Une fois ces commandes lancées, rendez-vous sur <Code>http://localhost:<Var name="port">80</Var></Code> et vous obtiendrez ceci :

<BrowserWindow url="http://localhost:%%port=80%%">
  ![Site tournant en http](./images/running_http.webp)
</BrowserWindow>

<AlertBox variant="info" title="Terriblement simple, non ?" />

Le site tourne avec le protocole http mais https n'est pas encore possible. Alors, continuons...

Pour l'instant, supprimez le container en cours d'exécution ; nous le recréerons plus tard :

<Terminal typewriter>
$ docker container rm %%name=static-site%% --force
</Terminal>

### Création de quelques fichiers dont nous aurons besoin {#creation-of-some-files-we-will-need}

Comme nous l'avons vu, nous pouvons lancer `docker run -d --name` <Var name="name">static-site</Var> `-p` <Var name="port">80</Var>`:80 -v ./src:/usr/local/apache2/htdocs httpd:2.4` et bingo, le site tourne en http.

Nous ne pouvons pas utiliser cette seule ligne pour https car, entre autres, nous avons besoin d'un certificat SSL et nous devons configurer Apache pour l'utiliser.

Pour rester propre et maintenable, créons quelques fichiers.

Assurez-vous d'être dans le dossier `/tmp/https_localhost` et créez les fichiers suivants.

<Snippet filename="Dockerfile" source="./files/Dockerfile" />

Le deuxième fichier dont nous aurons besoin s'appelle `compose.yaml` avec le contenu suivant :

<Snippet filename="compose.yaml" source="./files/compose.yaml" />

<AlertBox variant="info" title="compose.yaml est strictement équivalent à docker-compose.yml" />

Le troisième fichier dont nous aurons besoin doit être créé dans un dossier `httpd` et doit s'appeler `my-site.conf` avec le contenu suivant :

<Snippet filename="httpd/my-site.conf" source="./files/my-site.conf" />

<AlertBox variant="note" title="Pour un container basé sur Apache, le site doit être copié dans le dossier /usr/local/apache2/htdocs et non /var/www/html ; ce dernier est pour une image PHP." />

Tout est maintenant en place pour activer l'accès http. Toujours dans le dossier `/tmp/https_localhost`, lancez simplement `docker compose up -d --build` pour construire notre image Docker personnalisée et démarrer un container, c'est-à-dire lancer le site.

Vous obtiendrez quelque chose comme ceci dans la console :

![Docker run http](./images/docker_run_http.webp)

Si nous regardons Docker Desktop, liste des containers, nous verrons notre projet (appelé `https_localhost` puisque c'est le nom de notre dossier dans cet article) et nous verrons notre service `apache` tourner sur le port 80.

![Docker Desktop - Tourne sur le port 80](./images/docker_desktop_80.webp)

En accédant à <Code>http://localhost:<Var name="port">80</Var></Code> avec le navigateur, nous obtenons notre site, opérationnel :

<BrowserWindow url="http://localhost:%%port=80%%">
  ![Site tournant en http](./images/running_http.webp)
</BrowserWindow>

Bien, nous avons donc la confirmation que les trois fichiers créés ci-dessus fonctionnent et nous donnent un accès http. Allons plus loin avec https.

## Commençons le voyage vers https {#lets-begin-the-journey-to-https}

Nous avons trois actions principales à mener :

1. Créer notre certificat SSL,
2. Apprendre à Apache comment gérer notre certificat et
3. Mettre à jour quelques-uns de nos fichiers Docker.

### Créer le certificat SSL {#create-the-ssl-certificate}

Toujours dans notre dossier `/tmp/https_localhost`, créez un dossier appelé `ssl` ; c'est là que nous créerons notre certificat.

D'abord, installez [mkcert](https://github.com/FiloSottile/mkcert) si ce n'est pas déjà fait :

<Prerequisite
  name="mkcert"
  install="sudo apt install mkcert"
  check="mkcert -version"
  checkOutput="v1.4.4"
  typewriter
/>

Générez ensuite la CA locale et le certificat :

<Terminal typewriter>
$ mkdir -p ssl
$ mkcert -install
$ mkcert -cert-file ssl/server.crt -key-file ssl/server.key localhost 127.0.0.1
</Terminal>

`mkcert -install` crée une CA locale et l'enregistre dans le magasin de confiance de votre système. `mkcert` émet ensuite `server.crt` et `server.key` — les deux fichiers arrivent directement dans le dossier `ssl/`.

Le certificat couvre à la fois `localhost` (DNS) et `127.0.0.1` (IP), donc accéder au site par l'une ou l'autre adresse fonctionne sans avertissement du navigateur.

<AlertBox variant="info" title="Valable deux ans">
Les certificats générés par mkcert sont valables deux ans. Pour les renouveler, relancez simplement la commande `mkcert`.
</AlertBox>

<AlertBox variant="note" title="Pour une image Apache, les fichiers doivent être nommés ainsi, server.crt et server.key">
Comme expliqué sur [https://hub.docker.com/_/httpd](https://hub.docker.com/_/httpd), les deux fichiers doivent être nommés ainsi : `server.crt` et `server.key`.
</AlertBox>

### Mise à jour de notre fichier de configuration Apache {#updating-our-apache-configuration-file}

Nous devons mettre à jour notre fichier de configuration Apache et ajouter un Virtual host pour le port 443, le port standard pour SSL.

Éditez le fichier `httpd/my-site.conf` existant et ajoutez le contenu ci-dessous.

<Snippet filename="httpd/my-site.conf" source="./files/my-site.part2.conf" />

<AlertBox variant="highlyImportant" title="Les chemins sont cruciaux !">
Les noms de dossiers et de fichiers ont une importance majeure. Les deux fichiers de certificat doivent être enregistrés dans le dossier `/usr/local/apache2/conf/` et être nommés `server.crt` et `server.key`. Ceci parce que nous utilisons une image Docker Apache ; ce n'est pas la même chose si vous utilisez, par exemple, une image PHP+Apache.
</AlertBox>

### Mise à jour de notre fichier compose.yaml {#updating-our-composeyaml-file}

Éditez le fichier `compose.yaml` existant et ajoutez la nouvelle ligne surlignée ci-dessous

<Snippet filename="compose.yaml" source="./files/compose.part2.yaml" />

Nous devons donc simplement exposer le port 443 du container vers notre host. Ce port est le port standard du protocole https.

### Et, enfin, mise à jour de notre fichier Dockerfile {#and-finally-updating-our-dockerfile-file}

Le dernier fichier à mettre à jour est notre `Dockerfile` existant, avec les nouvelles lignes ci-dessous :

<Snippet filename="Dockerfile" source="./files/Dockerfile.part2" />

Ici, il y a pas mal de choses à faire. Nous devons installer (`apt-get install`) quelques binaires Linux pour permettre plus tard l'utilisation de `a2enmod` et du protocole SSL.

Nous devons copier notre certificat SSL et notre clé privée (fichiers `server.crt` et `server.key`) au bon endroit.

Nous devons aussi mettre à jour le fichier `httpd.conf` par défaut d'Apache pour inclure certains fichiers et certains modules.

Enfin, nous devons activer SSL et le mod rewrite d'Apache, désactiver les sites standards (`000-default` et `default-ssl`) et activer le nôtre (appelé `my-site`).

### Prêt à lancer le site en http et en https {#ready-to-run-the-site-using-both-http-and-https}

À ce stade, vous devriez avoir une structure de dossiers comme celle-ci :

![La structure des dossiers](./images/files.webp)

1. Un dossier appelé `httpd` contenant un fichier appelé `my-site.conf`, le fichier de configuration d'Apache,
2. Un dossier appelé `src` avec les fichiers du site statique HTML (beaucoup de fichiers, venant de Github),
3. Un dossier appelé `ssl` avec le certificat SSL que nous avons créé (un certificat public appelé `server.crt` et une clé privée appelée `server.key`),
4. Un fichier appelé `compose.yaml` et
5. Un fichier appelé `Dockerfile`

## Lancer le site {#run-the-site}

Nous devons mettre à jour notre image Docker puisque nous avons modifié le Dockerfile, donc lançons `docker compose up -d --build`.

Si nous retournons dans Docker Desktop, nous devrions voir ceci :

![Docker Desktop - Tourne sur les ports 80 et 443](./images/docker_desktop_80_443.webp)

Nous avons permis à notre site de tourner sur le port 80 (http) et 443 (https).

Maintenant que tout est en place, rendez-vous sur `https://localhost/` et vous obtiendrez le site :

<BrowserWindow url="https://localhost/">
  ![Site tournant en https](./images/running_https.webp)
</BrowserWindow>

Parce que nous avons utilisé `mkcert -install` plus tôt, le navigateur fait déjà confiance à la CA locale qui a signé notre certificat — le cadenas est donc vert et il n'y a aucun avertissement de sécurité.

<AlertBox variant="info" title="Vous utilisez Windows ou WSL2 ?">
`mkcert -install` enregistre la CA dans le magasin système Linux. Si votre navigateur tourne sur Windows, vous devez aussi importer la CA racine dans Windows. Voyez la [section Bonus ci-dessous](#bonus---install-the-mkcert-root-ca-in-your-browser) pour les instructions.
</AlertBox>

<AlertBox variant="danger" title="Attention aux noms de fichiers et de dossiers">
J'ai passé de nombreuses heures — trop — à écrire cet article. Ça semblait simple ; plusieurs articles ici et là donnent l'impression que ce serait facile, mais ça ne l'était pas.

C'est parce que la majorité des exemples que j'ai trouvés utilisaient une image PHP ou Nginx et pas Apache. Les noms de fichiers et de dossiers ne sont pas les mêmes, et il faut utiliser soigneusement ceux qu'Apache exige. Ce n'était pas explicite du tout.

</AlertBox>

## Utiliser curl {#using-curl}

Parce que `mkcert -install` a enregistré la CA locale dans le magasin de confiance du système, `curl` fonctionne sans aucun flag supplémentaire :

<Terminal typewriter>
$ curl https://localhost
</Terminal>

Si vous êtes sur une machine où la CA n'est pas installée (ou si vous avez sauté `mkcert -install`), vous obtiendrez :

<Terminal typewriter>
$ curl https://localhost
curl: (60) SSL certificate problem: unable to get local issuer certificate
</Terminal>

Dans ce cas, vous pouvez soit passer la CA explicitement, soit utiliser `--insecure` comme contournement rapide :

<Terminal typewriter>
$ curl --cacert "$(mkcert -CAROOT)/rootCA.pem" https://localhost
$ curl --insecure https://localhost
</Terminal>

## Bonus - Configurer nginx pour utiliser SSL {#bonus---configure-nginx-to-use-ssl}

Si vous ne voulez pas Apache mais nginx, utilisez plutôt les fichiers ci-dessous.

C'est globalement la même chose mais vous remarquerez quelques différences, comme dans les chemins et le fait que nous n'avons pas besoin d'installer de dépendances supplémentaires pour PHP.

<Snippet filename="Dockerfile" source="./files/Dockerfile.part3" />

Le deuxième fichier dont nous aurons besoin s'appelle `compose.yaml` avec le contenu suivant :

<Snippet filename="compose.yaml" source="./files/compose.part3.yaml" />

<AlertBox variant="info" title="compose.yaml est strictement équivalent à docker-compose.yml" />

Le troisième fichier dont nous aurons besoin doit être créé dans un dossier `httpd` et doit s'appeler `my-site.conf` avec le contenu suivant :

<Snippet filename="httpd/my-site.conf" source="./files/my-site.part3.conf" />

## Bonus - Configurer PHP pour utiliser SSL {#bonus---configure-php-to-use-ssl}

Si vous ne voulez pas Apache mais PHP (parce que vous devez exécuter du code PHP), utilisez plutôt les fichiers ci-dessous.

C'est globalement la même chose mais vous remarquerez quelques différences, comme dans les chemins et le fait que nous n'avons pas besoin d'installer de dépendances supplémentaires pour PHP.

Créez un fichier appelé `Dockerfile` avec le contenu suivant :

<Snippet filename="Dockerfile" source="./files/Dockerfile.part4" />

Le deuxième fichier dont nous aurons besoin s'appelle `compose.yaml` avec le contenu suivant :

<Snippet filename="compose.yaml" source="./files/compose.part4.yaml" />

<AlertBox variant="info" title="compose.yaml est strictement équivalent à docker-compose.yml" />

Le troisième fichier dont nous aurons besoin doit être créé dans un dossier `httpd` et doit s'appeler `my-site.conf` avec le contenu suivant :

<Snippet filename="httpd/my-site.conf" source="./files/my-site.part4.conf" />

## Bonus - Installer la CA racine mkcert dans votre navigateur {#bonus---install-the-mkcert-root-ca-in-your-browser}

Quand vous lancez `mkcert -install`, la CA locale est ajoutée au magasin de confiance de votre OS actuel. C'est suffisant pour les navigateurs natifs Linux (par exemple Firefox ou Chrome tournant directement dans Ubuntu).

Si votre navigateur tourne sur **Windows** — y compris quand vous travaillez dans WSL2 ou un devcontainer Docker — vous devez aussi importer la CA racine dans le magasin de certificats Windows. Ça ne se fait qu'une fois par machine.

### Trouver le fichier de la CA racine {#find-the-root-ca-file}

<Terminal typewriter>
$ mkcert -CAROOT
/home/christophe/.local/share/mkcert
$ ls $(mkcert -CAROOT)
rootCA-key.pem  rootCA.pem
</Terminal>

`rootCA.pem` est le certificat public de votre CA locale. Gardez `rootCA-key.pem` privé — quiconque le possède peut signer des certificats auxquels votre système fera confiance.

### Importer dans Windows (depuis WSL2 ou PowerShell) {#import-into-windows-from-wsl2-or-powershell}

**Depuis WSL2**, vous pouvez utiliser directement le `certutil.exe` de Windows (WSL2 a accès aux exécutables Windows) :

<Terminal typewriter>
$ CAROOT=$(mkcert -CAROOT)
$ certutil.exe -addstore -f "ROOT" "$(wslpath -w "$CAROOT/rootCA.pem")"
</Terminal>

**Depuis un terminal PowerShell lancé en tant qu'Administrateur** :

<Terminal typewriter>
PS> certutil -addstore -f "ROOT" "$env:USERPROFILE\.local\share\mkcert\rootCA.pem"
</Terminal>

Ou manuellement : double-cliquez sur `rootCA.pem` → *Installer le certificat* → *Ordinateur local* → *Placer tous les certificats dans le magasin suivant* → *Autorités de certification racines de confiance*.

Après l'import, redémarrez Chrome ou Edge et `https://localhost` (ou `https://127.0.0.1`) affichera un cadenas vert sans avertissement.

### Magasin de confiance système Linux uniquement {#linux-system-trust-store-only}

Si vous avez seulement besoin que `curl` ou d'autres outils en ligne de commande fassent confiance à la CA (sans l'installer dans Windows), copiez la CA racine dans le magasin système :

<Terminal typewriter>
$ sudo apt-get install -y ca-certificates
$ sudo cp "$(mkcert -CAROOT)/rootCA.pem" /usr/local/share/ca-certificates/mkcert-rootCA.crt
$ sudo update-ca-certificates
</Terminal>

<AlertBox variant="note" title="Le fichier doit avoir l'extension .crt quand il est placé dans /usr/local/share/ca-certificates" />

Après cela, `curl https://localhost` fonctionne sans aucun flag supplémentaire.
