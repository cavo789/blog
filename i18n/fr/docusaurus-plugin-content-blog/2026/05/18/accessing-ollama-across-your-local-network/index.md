---
slug: accessing-ollama-across-your-local-network
title: Accéder à Ollama depuis votre réseau local
authors: [christophe]
date: 2026-05-18
image: /img/v2/using_ollama_local_network.webp
description: Apprenez à mettre en place un serveur Ollama dédié sur votre réseau local et à y connecter votre éditeur de code pour obtenir un assistant IA privé et gratuit.
series: "Ollama daily use"
mainTag: ai
tags:
  - ai
  - ollama
language: fr
ai_assisted: true
blueskyRecordKey: 3mm44p55oik2p
updates:
  - date: 2026-07-31
    note: "The Continue VSCode extension was acquired by Cursor on June 18, 2026 and has been shut down. The VSCode integration section has been rewritten to reflect the current landscape."
---
![Accéder à Ollama depuis votre réseau local](/img/v2/using_ollama_local_network.webp)

<AlertBox variant="caution" title="L'extension Continue est arrêtée">
L'extension VSCode [Continue](https://marketplace.visualstudio.com/items?itemName=Continue.continue) présentée dans cet article a été rachetée par Cursor le 18 juin 2026 et le produit autonome a été arrêté — la date limite d'export des données utilisateur (15 juillet 2026) est passée et le repository est désormais en lecture seule. La section sur l'intégration VSCode ci-dessous a été réécrite en conséquence.
</AlertBox>

<TLDR>
Ce guide vous montre comment découpler vos charges IA lourdes en installant un serveur Ollama dédié sur votre réseau local. Vous allez apprendre à trouver l'IP de votre serveur, à vérifier la connectivité avec `curl` et à connecter une extension VSCode qui prend en charge Ollama comme backend. Résultat : un assistant IA rapide, gratuit et totalement privé, qui remplace les alternatives cloud comme GitHub Copilot.
</TLDR>

Dans un article précédent, nous avons installé Ollama, un ou plusieurs modèles IA (LLM) et une interface web appelée **Open WebUI**.

Nous avons appris à jouer avec Ollama localement, sur une seule machine, mais pas encore à y accéder depuis un autre ordinateur — par exemple depuis votre réseau domestique.

C'est ce que nous allons faire dans cet article. L'idée : utiliser un ordinateur comme *serveur* (celui qui fait le gros du travail) et un autre comme *client* (votre portable de tous les jours) pour y accéder.

Le serveur doit avoir autant de mémoire vidéo (VRAM) et de mémoire vive (RAM) que possible pour faire tourner l'IA correctement. Le client, lui, se contente d'envoyer des requêtes web sur le réseau : un ordinateur classique, moins puissant, fait parfaitement l'affaire.

*Si les containers de ce serveur n'arrivent pas à se joindre une fois tout en place, <Link to="/blog/docker-networking-troubleshooting">Troubleshooting for Docker containers - Accessing the other one</Link> déroule le diagnostic étape par étape — un proxy est souvent le coupable.*

<!-- truncate -->

Dans cet article, nous allons mettre en place cette architecture. Référez-vous à mon article précédent (<Link to="/blog/ollama-installation">Installing Ollama and get local AI</Link>) pour la configuration du **serveur IA local**.

![Notre IA locale](./images/diagram.webp)

## Utiliser un réseau local {#using-a-local-network}

Vous avez très probablement déjà un réseau local (LAN) à la maison — généralement géré par votre routeur Wi-Fi. Vous pouvez l'utiliser pour accéder à Ollama en toute sécurité depuis chez vous, sans envoyer de données sur Internet. Personnellement, j'utilise un simple switch réseau (un **D-Link DGS-108**) pour relier mes machines en câble et obtenir la meilleure vitesse, mais une bonne connexion Wi-Fi fonctionne aussi !

Cette configuration offre un débit élevé (1000 Mbps) avec quasiment aucun délai (latence), ce qui est parfait pour notre cas d'usage.

## Trouver l'adresse IP de votre serveur {#finding-your-servers-ip-address}

Pour vous connecter à votre serveur, il vous faut son adresse IP — voyez ça comme le numéro de téléphone interne de la machine sur votre réseau.

Mon serveur tourne sous Windows 11 : je la trouve en ouvrant une fenêtre Powershell et en lançant la commande `ipconfig | Select-String -Pattern "IPv4"`. Sur mon serveur, la sortie ressemble à ceci : `IPv4 Address. . . . . . . . . . . : 192.168.0.218`. Notez ce numéro !

## Configurer l'ordinateur client {#setting-up-the-client-computer}

Sur votre deuxième ordinateur (le client), vérifions d'abord qu'il peut « parler » à votre serveur. On utilise pour cela une commande réseau appelée `ping`. Ouvrez votre terminal et tapez `ping 192.168.0.218` (remplacez par l'IP de votre serveur) :

<Terminal typewriter wrap={true} source="./files/terminal-1.txt" />

Cette sortie signifie que notre deuxième ordinateur accède au serveur avec une latence quasi nulle (`time < 1ms`).

### Lancer Open WebUI {#running-open-webui}

Vérifiez d'abord qu'Ollama et **Open WebUI** tournent toujours sur la machine serveur. Si c'est le cas, vous devriez pouvoir ouvrir un navigateur sur votre ordinateur client et aller sur `http://192.168.0.218:4000`. Comme nous avons déjà validé la connexion réseau, vous devriez voir l'écran de connexion d'Open WebUI. Une fois connecté, vous accéderez à l'interface Ollama, verrez vos modèles IA disponibles et pourrez démarrer une conversation !

### Vérifier la connexion une seconde fois {#double-checking-the-connection}

Juste avant de passer à notre éditeur de code (VSCode) pour configurer notre assistant IA, assurons-nous que le moteur IA écoute bien.

Pour obtenir la liste des modèles IA installés sur votre serveur, lancez simplement cette commande : `curl http://192.168.0.218:11434/api/tags` (ajoutez `| jq` à la fin si vous l'avez installé, pour un affichage plus lisible).

Et si vous voulez tester l'IA elle-même — par exemple lui demander ce qu'est un `Dockerfile` — lancez cette commande dans la console de votre ordinateur client :

```bash
$ curl -X POST http://192.168.0.218:11434/api/generate \
    -H "Content-Type: application/json" \
    -d '{
        "model": "qwen2.5-coder:1.5b-base",
        "prompt": "What is a Dockerfile? Please explain it like I''m five.",
        "stream": false
        }'
```

<AlertBox variant="note" title="Vérifiez le nom de votre modèle">
Assurez-vous que le modèle LLM `qwen2.5-coder:1.5b-base` est bien présent ; sinon, utilisez-en un autre issu de votre propre liste.
</AlertBox>

## Configurer votre éditeur de code (VSCode) {#configure-your-code-editor-vscode}

L'article d'origine utilisait **Continue**, qui a depuis été arrêté (voir l'encadré en haut de cette page). Bonne nouvelle : le principe reste le même quelle que soit l'extension utilisée.

Toute extension VSCode qui prend en charge Ollama comme backend vous offre les deux mêmes fonctionnalités :

1. **Autocomplétion en ligne** : des suggestions de code en temps réel pendant que vous tapez, basées sur l'inférence **FIM** (Fill-In-the-Middle).
2. **Interface de chat** : discutez directement avec votre assistant IA pour trouver des bugs, réécrire du code ou poser des questions.

Au moment où j'écris ces lignes, les alternatives open source les plus actives qui supportent nativement un endpoint Ollama sont **Cline** et **RooCode** (un fork de Cline activement maintenu). Les deux sont disponibles sur le Marketplace VSCode.

Quelle que soit l'extension choisie, le principe de configuration est toujours identique : pointez l'extension vers l'adresse de votre serveur Ollama (`http://192.168.0.218:11434`, en remplaçant l'IP par la vôtre), sélectionnez `Ollama` comme provider, puis choisissez un modèle dans votre liste installée (`ollama list` sur le serveur pour voir ce qui est disponible).

<AlertBox variant="info" title="Utilisateurs WSL : installez l'extension côté Linux">
Si vous utilisez WSL2, veillez à installer l'extension côté **Linux** et non côté Windows. Ouvrez VSCode connecté à votre session WSL et installez l'extension depuis le terminal avec `code --install-extension <extension-id> --force`.
</AlertBox>

## Conclusion {#conclusion}

En suivant ce guide, nous avons découplé nos charges IA lourdes de notre environnement de développement quotidien. Mettre en place un « serveur IA » dédié sur votre réseau local vous permet d'exploiter des LLM puissants sans vider la batterie de votre machine principale ni monopoliser sa RAM et son CPU.

En connectant à ce serveur une extension VSCode compatible Ollama, vous obtenez une alternative privée, auto-hébergée et entièrement gratuite aux assistants IA cloud comme GitHub Copilot. Comme tout passe par votre LAN, votre code et vos prompts ne quittent jamais votre réseau local : confidentialité totale et zéro abonnement.

Que vous génériez du code, receviez des suggestions d'autocomplétion ou posiez des questions sur votre codebase, votre assistant IA local n'est plus qu'à une requête réseau de distance !
