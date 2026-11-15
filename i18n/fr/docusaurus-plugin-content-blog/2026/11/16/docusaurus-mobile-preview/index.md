---
slug: docusaurus-mobile-preview
title: "Prévisualiser votre site Docusaurus local sur votre téléphone"
authors: [christophe, claude]
image: /img/v2/docusaurus-mobile-preview.webp
mainTag: docusaurus
tags: [docusaurus, devcontainer, docker]
date: 2026-11-16
description: "Tester une fonctionnalité qui n'existe que sur téléphone (un geste de secousse, une invite d'installation PWA, tout ce qui demande un vrai accéléromètre ou un vrai écran d'accueil) n'oblige pas à déployer d'abord. Le serveur de développement lancé dans le devcontainer de ce blog est déjà accessible depuis un téléphone sur le même Wi-Fi — une adresse IP, un avertissement de certificat à accepter, aucun plugin, aucune nouvelle dépendance. On voit comment trouver l'IP de votre ordinateur, pourquoi ça fonctionne (binding 0.0.0.0, port publié par Docker, pourquoi HTTPS n'est pas négociable), quoi faire quand le réseau empêche les appareils de se voir, et d'où vient réellement cet avertissement de certificat."
language: fr
ai_assisted: true
---

<!-- cspell:ignore ipconfig devcontainer mkcert avonture -->

![Prévisualiser votre site Docusaurus local sur votre téléphone](/img/v2/docusaurus-mobile-preview.webp)

<TLDR>
Tester une fonctionnalité propre au téléphone — un geste de secousse, une invite d'installation PWA, tout ce qui demande un vrai accéléromètre ou un vrai écran d'accueil — donnait l'impression qu'il fallait déployer d'abord, juste pour voir si ça se déclenche. Faux : le serveur de développement déjà lancé dans le devcontainer de ce blog (`yarn start --host 0.0.0.0`, HTTPS, port 3000 publié par Docker dans `compose.yaml`) est accessible dès maintenant depuis un téléphone sur le même Wi-Fi — aucun plugin, aucune nouvelle dépendance, aucun déploiement. Trouvez l'IP locale de l'ordinateur (`ipconfig` sous Windows), ouvrez `https://<that-ip>:3000` depuis le navigateur du téléphone, acceptez un avertissement de certificat, et voilà. On voit pourquoi ça marche, quoi faire quand le réseau empêche les appareils de se voir (le partage de connexion du téléphone), et d'où vient réellement cet avertissement de certificat.
</TLDR>

Une fonctionnalité qui n'a de sens que sur un téléphone — un geste de secousse comme celui derrière [l'easter egg du suricate de ce blog](/blog/docusaurus-shake-easter-egg), une vibration haptique, une invite « Ajouter à l'écran d'accueil » — est pénible à valider depuis un portable. La simuler est possible, mais ça prouve que le code tourne, pas que la fonctionnalité marche vraiment sur un vrai téléphone. Le réflexe est de déployer d'abord et de vérifier sur le site réel, ce qui transforme « est-ce que ça marche » en un aller-retour de plusieurs minutes pour chaque micro-ajustement.

Ce n'est pas une fatalité : le serveur de développement qui tourne déjà dans le devcontainer de ce blog était accessible depuis un téléphone sur le même Wi-Fi depuis le début.

<!-- truncate -->

## Trouvez l'IP de votre ordinateur, puis ouvrez-la {#find-your-computers-ip-then-just-visit-it}

Le téléphone a besoin de l'adresse que votre ordinateur possède sur votre réseau domestique. Elle change d'un réseau à l'autre : le `192.168.0.218` utilisé ci-dessous est seulement l'adresse de l'auteur ; la vôtre y ressemblera (`192.168.0.x`, `192.168.1.x` ou `10.0.0.x` sont les formes habituelles).

Sous Windows, ouvrez un terminal Windows (Command Prompt ou PowerShell) — sur Windows lui-même, pas dans un terminal WSL ou devcontainer — et lancez `ipconfig` :

<Terminal title="Terminal Windows" source="./files/ipconfig-output.txt" />

Cherchez l'adaptateur qui affiche une ligne `IPv4 Address` : `Wi-Fi` si l'ordinateur est en sans-fil, `Ethernet` s'il est branché par câble, comme dans l'exemple ci-dessus. Ignorez les adaptateurs marqués `Media disconnected`, par exemple un VPN inactif, et ignorez `127.0.0.1` ainsi que toute adresse `172.x` remontée par WSL ou par les adaptateurs Docker : celles-ci n'ont de sens que pour l'ordinateur lui-même, pas pour un autre appareil du réseau.

Sous macOS, lancez `ipconfig getifaddr en0` dans un terminal. Sur un ordinateur sous Linux natif, lancez `hostname -I` et prenez la première adresse. Ne lancez pas `hostname -I` dans WSL2 : il renvoie l'adresse du réseau virtuel interne de WSL (une adresse `172.x`), que le téléphone ne peut pas joindre. Sous Windows, `ipconfig` est la commande à utiliser, même quand le devcontainer tourne via WSL2.

Saisissez votre propre adresse dans le champ ci-dessous ; l'URL qui suit se met à jour :

<Vars ip="192.168.0.218" labels={{ ip: "IP locale de votre ordinateur" }} />

Ensuite, depuis le téléphone — sur le même réseau Wi-Fi — ouvrez cette adresse dans un navigateur, sur le port que le serveur de développement utilise déjà :

<BrowserWindow url="https://%%ip=192.168.0.218%%:3000/">
  ![La page d'accueil Docusaurus qui se charge dans le navigateur d'un téléphone via le réseau local](./images/homepage_on_phone.webp)
</BrowserWindow>

Le navigateur signalera d'abord le certificat comme non fiable — c'est attendu, et sans risque ici ; le pourquoi exact est dans [Sous le capot](#under-the-hood-skip-this-if-you-just-want-to-use-it) plus bas. Passé cet avertissement, c'est bien le vrai serveur de développement : live reload, le HTML réel, et — la raison qui valait la peine de creuser — les vraies API capteurs et navigateur, celles qui ne se comportent correctement qu'en dehors d'une simulation.

## Pourquoi ça fonctionne {#why-it-works}

- **Le serveur de développement écoute déjà sur toutes les interfaces, pas seulement sur l'ordinateur.** `docker-entrypoint.sh` le lance avec `yarn start --host 0.0.0.0` ; sans ce flag, il ne répondrait qu'aux requêtes venant de son propre container, invisible pour tout le reste — y compris l'adaptateur Wi-Fi de l'ordinateur.
- **Docker publie le port sur le réseau de l'ordinateur.** Le `compose.yaml` du devcontainer déclare `ports: - "3000:3000"`, et Docker Desktop lie un port publié sur chaque interface réseau de l'ordinateur, Wi-Fi compris. C'est ce qui rend le serveur de développement joignable depuis le téléphone. Le port forwarding de VS Code (le panneau **Ports**) n'intervient pas : il ne redirige que vers `localhost` sur l'ordinateur.
- **HTTPS est volontaire, pas accidentel.** Une liste grandissante d'API navigateur — capteurs de mouvement, accès au presse-papiers, service workers, caméra et micro — refusent de fonctionner hors d'un contexte sécurisé. Un serveur de développement qui répondrait en HTTP simple masquerait précisément le comportement qu'aura un vrai site HTTPS déployé.
- **Le même Wi-Fi est la seule exigence.** Rien ne transite par internet, aucune configuration de routeur, aucun compte — le téléphone et l'ordinateur doivent juste pouvoir se voir sur le sous-réseau local. L'exception courante est traitée juste après.

## Quand votre téléphone n'y arrive pas {#when-your-phone-cant-reach-it}

Certains réseaux refusent : le Wi-Fi invité et pas mal de réseaux publics ou d'entreprise activent **l'isolation des clients**, qui empêche volontairement les appareils d'un même réseau de se joindre, même connectés au même point d'accès. Si le téléphone part en timeout au lieu d'afficher un avertissement de certificat, c'est la raison la plus probable — et revérifier l'adresse IP dix fois n'y changera rien.

Le contournement le plus simple est de créer un réseau où l'isolation ne s'applique pas : activez le **partage de connexion mobile** du téléphone et connectez-y l'ordinateur. Le téléphone et l'ordinateur sont alors sur le même petit réseau, contrôlé par le téléphone. Relancez `ipconfig`, car l'ordinateur reçoit une nouvelle adresse sur ce réseau, puis ouvrez `https://<new-ip>:3000` depuis le téléphone comme avant. Gardez un œil sur les données mobiles si l'ordinateur se met à télécharger des mises à jour pendant ce temps.

## Sous le capot (passez si vous voulez juste l'utiliser) {#under-the-hood-skip-this-if-you-just-want-to-use-it}

**Pourquoi l'avertissement de certificat apparaît.** Le certificat du serveur de développement n'est pas auto-signé : `docker-entrypoint.sh` le génère avec `mkcert`, signé par une autorité de certification locale que l'ordinateur reconnaît déjà. Le téléphone y voit deux problèmes. D'abord, il n'a jamais entendu parler de cette autorité locale, dont le certificat racine n'existe que sur l'ordinateur. Ensuite, le certificat a été émis pour `localhost` et `127.0.0.1` uniquement, et le téléphone demande votre IP locale (`192.168.0.218` dans l'exemple). La connexion reste chiffrée ; ce que le téléphone ne peut pas confirmer, c'est l'*identité* du serveur, ce qui est acceptable pour un ordinateur dont vous savez déjà qu'il est le vôtre.

Si cliquer sur cet avertissement à chaque session de test vous lasse, l'approche `mkcert` de [Configurez votre localhost Docker pour utiliser SSL sans avertissements du navigateur](/blog/docker-localhost-ssl) règle les deux problèmes en deux changements. Ajoutez l'IP locale aux noms couverts par le certificat (`mkcert ... localhost 127.0.0.1 <your-lan-ip>`), puis installez sur le téléphone le fichier `rootCA.pem` pointé par `mkcert -CAROOT` comme autorité de certification de confiance. Ensuite, le téléphone accepte le certificat comme n'importe quel autre, sans avertissement.

**Et si le port n'est pas publié ?** Un devcontainer démarré depuis une simple `image` ou un `Dockerfile`, sans entrée `ports:` dans un fichier Compose (ni `appPort` dans `devcontainer.json`), n'est joignable que par le port forwarding de VS Code, et ce forwarding n'écoute que sur `localhost`. Le téléphone ne peut alors pas l'atteindre. La solution est de publier le port : ajoutez `"3000:3000"` à la liste `ports:` du service, ou `"appPort": [3000]` dans `devcontainer.json`, puis reconstruisez le container. Vérifié sur l'installation de ce blog ([Windows + WSL2 + Docker Desktop](/blog/vscode-devcontainer)).

## Conclusion {#conclusion}

Aucun déploiement, aucun plugin, aucune nouvelle dépendance — un serveur de développement déjà configuré pour ça (`--host 0.0.0.0`, HTTPS, un port publié par Docker) s'avère déjà accessible depuis un vrai téléphone sur le même Wi-Fi, à une adresse IP et un avertissement de certificat près. Cet avertissement coûte un clic, une fois : pas de quoi renoncer à tester sur un vrai appareil — un geste de secousse, une vibration haptique ou une invite d'installation ne se prouvent vraiment que là.

<StepsCard
  variant="remember"
  title="Les deux chemins d'accès"
  steps={[
    "**Même Wi-Fi :** `ipconfig` (Windows) pour l'adresse IPv4 locale de l'ordinateur, puis `https://<that-ip>:3000` depuis le téléphone — acceptez l'avertissement de certificat une fois",
    "**Isolation des clients qui bloque le trafic entre appareils :** activez le partage de connexion du téléphone, connectez-y l'ordinateur, relancez `ipconfig` pour la nouvelle adresse",
    "**Avertissement de certificat trop récurrent :** ajoutez l'IP locale au certificat `mkcert` et installez le `rootCA.pem` de mkcert sur le téléphone — voir [Configurez votre localhost Docker pour utiliser SSL sans avertissements du navigateur](/blog/docker-localhost-ssl)",
  ]}
/>
