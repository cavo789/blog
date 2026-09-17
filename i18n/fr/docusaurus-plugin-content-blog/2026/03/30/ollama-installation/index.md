---
slug: ollama-installation
title: Installer Ollama et obtenir une IA locale
description: Apprenez à déployer Ollama en local via Docker pour faire tourner des LLM privés et gratuits, et activer l'autocomplétion de code par IA dans VSCode.
authors: [christophe]
image: /img/v2/playing_with_ollama.webp
series: "Ollama daily use"
mainTag: ai
tags:
  - ai
  - ollama
date: 2026-03-30
ai_assisted: true
blueskyRecordKey: 3miaxwivces2d
updates:
  - date: 2026-07-27
    note: "Updated the Continue section: config.json is deprecated in favor of config.yaml, noted Continue's acquisition by Cursor, and swapped the heavier-task model recommendation to qwen3-coder:30b."
---

![Installer Ollama et obtenir une IA locale](/img/v2/playing_with_ollama.webp)

<TLDR>Ce guide explique comment installer Ollama en local avec Docker pour faire tourner gratuitement de grands modèles de langage tout en gardant une confidentialité totale des données. Il détaille comment choisir les modèles adaptés à la mémoire disponible sur votre machine, pour des tâches comme l'autocomplétion rapide de code ou le refactoring complexe. Vous apprendrez aussi à intégrer ces outils directement dans votre workflow via Open WebUI et l'extension Continue pour VSCode.</TLDR>

Dans un de mes derniers articles à propos de mon composant <Link to="/blog/gemini-tldr">résumé TL;DR</Link>, j'ai écrit un script Python pour consommer l'API Gemini et boum, après quelques requêtes à peine, j'ai reçu une erreur de quota maximum dépassé.

Et si on pouvait régler ça gratuitement ? Comment ? Tout simplement en installant un LLM en local, sur notre machine. Fini les quotas.

<!-- truncate -->

## Essayez dans votre terminal {#try-it-in-your-terminal}

<Vars
  name="ollama"
  port="11434"
  webui_name="open-webui"
  port_webui="4000"
  labels={{ name: "Container Ollama", port: "Port Ollama", webui_name: "Container Open WebUI", port_webui: "Port Open WebUI" }}
/>

Une fois Ollama lancé et un modèle téléchargé (voir la section Installation plus bas), la commande est `ollama run <model_name>` :

<Terminal typewriter wrap={true}>
$ docker exec -it %%name=ollama%% ollama run llama3.1:8b
</Terminal>

Vous pouvez maintenant poser n'importe quelle question, par exemple une comparaison entre Quarto et Docusaurus :

![Demander une comparaison entre Quarto et Docusaurus](./images/test_quarto_docusaurus_comparaison.webp)

Ou demander une blague :

![Obtenir une blague](./images/test_joke.webp)

Tapez `/bye` pour quitter.

<AlertBox variant="info" title="Plus rapide la deuxième fois">

Vous avez constaté un délai avant l'apparition du prompt ? Relancez exactement la même commande ; vous verrez, c'est immédiat cette fois puisque le modèle est déjà chargé en RAM.

Et si vous n'utilisez pas le modèle pendant cinq minutes, Ollama le déchargera et libérera votre RAM.

</AlertBox>

### Dois-je parler anglais avec le modèle ? {#should-i-speak-english-with-the-model}

En fait, non — comme pour une page web, vous pouvez utiliser votre propre langue. Dans l'exemple ci-dessous, vous verrez aussi une autre façon de poser une question : au lieu de passer par un terminal interactif, vous pouvez taper votre question directement sur la ligne de commande.

![Poser une question en français](./images/test_asking_in_french.webp)

## Avez-vous besoin d'un LLM local ? {#do-you-need-a-local-llm}

La raison la plus importante est sans doute la confidentialité : l'avoir en local, sur votre machine, signifie que vos documents restent chez vous. Vous ne partagerez pas votre codebase, par exemple, avec des sociétés d'IA. *C'est exactement pour cette raison que j'aimais <Link to="/blog/vscode-tabnine">Tabnine</Link>, qui fonctionne aussi hors ligne — Ollama pousse simplement l'idée beaucoup plus loin.*

Pensez aussi à l'automatisation : vous pourrez exécuter des scripts d'automatisation sans craindre d'atteindre un quota. Et pas de facture non plus : comme tout tourne sur votre machine, c'est entièrement gratuit.

## Installer et lancer Ollama {#installing-and-running-ollama}

Vous vous en doutez, en amoureux de Docker, je n'installerai pas Ollama à la main.

Créons le fichier `compose.yaml` sur votre disque. J'utilise quelques containers Docker tous les jours et je range leurs fichiers de configuration dans un dossier `~/tools` ; faisons pareil ici.

Lancez `mkdir ~/tools/ollama && cd $_` puis créez un `compose.yaml` avec ce contenu :

<Snippet filename="compose.yaml" source="./files/compose.yaml" defaultOpen={false} />

Toujours dans le dossier `~/tools/ollama`, lancez simplement `docker compose up --detach` pour télécharger ollama et le faire tourner dans un container Docker.

## Télécharger un modèle LLM {#download-an-llm-model}

D'abord, réfléchissez à votre cas d'usage. Vous voudrez très probablement de la vitesse et de la précision.

Pour la vitesse, prenez un « petit » LLM comme `llama3.1:8b`. Un exemple : vous comptez utiliser une extension VSCode et vous avez besoin de rapidité pour l'autocomplétion.

Pour la précision, vous accepterez peut-être d'attendre un peu plus longtemps pour obtenir de meilleurs résultats.

Commencez par regarder combien de RAM libre vous avez.

```bash
$ free -h
               total        used        free      shared  buff/cache       available
Mem:            15Gi       5.4Gi       2.4Gi       9.7Mi       7.8Gi       9.9Gi
Swap:          4.0Gi        11Mi       4.0Gi
```

Regardez la dernière colonne **available**. J'ai environ 10 Go libres, je peux donc facilement choisir un modèle d'environ 4,7 Go, comme `llama3.1:8b`.

Ouvrez un nouveau terminal et lancez cette commande :

<Terminal typewriter wrap={true}>
$ docker exec -it %%name=ollama%% ollama pull llama3.1:8b
</Terminal>

<AlertBox variant="note" title="On utilise Docker, non ?">

Puisque nous avons installé ollama comme container Docker, nous devons utiliser la syntaxe `docker exec -it ollama` suivie de la CLI ollama.

C'est pour cela que nous lançons, par exemple, `docker exec -it ollama ollama pull llama3.1:8b`.

</AlertBox>

Si vous relancez `free -h`, regardez à nouveau la colonne `Available`. J'avais ~9,9 Go avant, j'ai maintenant ~5,5 Go.

<AlertBox variant="note" title="Où sont stockés les LLM ?">

Comme nous utilisons Docker, regardez le fichier `compose.yaml`. Nous utilisons un volume Docker auto-géré `ollama_data`.

Comme n'importe quel autre volume, rien ne viendra polluer notre disque. Si un jour nous voulons supprimer Ollama, il suffira de supprimer le container Docker et le volume associé. Et voilà.

</AlertBox>

### Besoin de plus de puissance ? {#more-power-needed}

Il existe énormément de modèles ; regardez le suffixe à la fin de `llama3.1:8b` : `8b` signifie 8 milliards de paramètres. Plus il y en a, plus le modèle a de connaissances, mais cela a un prix : la taille.

Si vous avez plus de 32 Go de RAM, vous pouvez sans doute aussi utiliser `gemma2:27b` (27 milliards de paramètres, environ 17 Go), `mixtral:8x7b` (environ 26 Go) ou `llama3:70b` (70 milliards de paramètres, ~45 Go).

Plus le nombre de paramètres est élevé, meilleurs sont les résultats — mais plus la réponse est lente. À vous de déterminer, pour votre propre cas d'usage (votre matériel, votre GPU, vos besoins...), un ou deux LLM que vous utiliserez.

Par exemple, un modèle très rapide (donc petit) pour les interactions courtes — vous ne voulez pas attendre 30 secondes une réponse — et un plus puissant pour les tâches lourdes comme le refactoring de code ou la génération d'une codebase.

#### Que signifie 8x7b ? {#what-does-8x7b-mean}

Si vous regardez mixtral, vous remarquerez le suffixe `8x7b`. Cela indique que le modèle utilise une architecture **Mixture of Experts** (MoE) : il est **composé de 8 réseaux de neurones experts distincts, chacun avec 7 milliards de paramètres**.

Quand vous utilisez ce type de modèle, un routeur intégré analyse d'abord votre prompt pour déterminer quels experts sont les mieux placés pour répondre.

Prenons un exemple : imaginez que vous demandiez à Mixtral de générer une fonction Python. Le routeur traite d'abord le contexte de votre question. Puis il active de façon transparente uniquement les experts les plus pertinents pour cette tâche (en général deux sur huit) afin de produire la meilleure réponse possible.

Parce qu'il utilise ses experts de manière sélective, mixtral est un modèle incroyablement polyvalent et très efficace — à condition que votre machine ait assez de RAM pour charger l'ensemble en mémoire !

### Obtenir la liste des modèles {#getting-the-list-of-models}

Si vous voulez récupérer les modèles déjà installés :

<Terminal typewriter wrap={true}>
$ docker exec -it %%name=ollama%% ollama list
</Terminal>

La liste complète des modèles existants est en ligne : [https://ollama.com/library](https://ollama.com/library)

## Utiliser une interface web {#using-a-web-interface}

Vous pouvez installer une interface web pour dialoguer avec Ollama ; la plus utilisée est **Open WebUI**.

Éditons notre fichier `compose.yaml` et ajoutons un nouveau service :

<Snippet filename="compose.yaml" source="./files/compose_webui.yaml" defaultOpen={false} />

Lancez `docker compose up --detach` pour télécharger l'image `open-webui` (~1,7 Go) et créer le container.

Maintenant, rendez-vous simplement sur `http://localhost:`<Var name="port_webui">4000</Var> et vous aurez votre interface ; vous pouvez commencer à interagir avec votre LLM local.

<BrowserWindow url="http://localhost:%%port_webui=4000%%">
  ![Demander des idées de cadeau pour ma femme](./images/open_webui.webp)
</BrowserWindow>

Regardez en haut à gauche : vous y voyez la liste des modèles installés.

![La liste des modèles est disponible dans l'interface Open WebUI](./images/open_webui_models.webp)

## Utiliser une extension VSCode {#using-a-vscode-extension}

Si vous voulez ajouter de l'IA dans VSCode, vous pouvez installer [Continue - open-source AI agent](https://marketplace.visualstudio.com/items?itemName=Continue.continue).

![Installation de l'extension Continue dans VSCode](./images/install_continue_extension.webp)

<AlertBox variant="important" title="Le statut de Continue en juillet 2026">
Continue a fait l'objet d'un acqui-hire par Cursor (Anysphere) en juin 2026, et le projet open source autonome a été arrêté : la v2.0.0 (19 juin 2026) est la dernière release, et le repository GitHub est désormais en lecture seule — plus aucun correctif de sécurité, adaptateur de modèle ou correction de compatibilité éditeur de la part de l'équipe d'origine. L'approche « votre propre LLM » avec Ollama, la seule utilisée dans cette section, fonctionne toujours très bien dans cette dernière release. Bon à savoir avant d'y investir du temps, mais ce n'est pas une raison pour renoncer complètement à l'autocomplétion locale.
</AlertBox>

Continue a besoin d'un fichier de configuration **dans votre dossier utilisateur Windows** — pas du côté WSL, du moins lors de mes tests d'origine ; à revérifier sur les versions actuelles si cela ne correspond pas à ce que vous observez.

<AlertBox variant="note" title="config.yaml, pas config.json">
Les anciennes versions de Continue (antérieures à la 1.0) utilisaient `config.json`. Ce format est désormais déprécié — les versions actuelles utilisent `~/.continue/config.yaml`, avec les modèles listés sous des `roles` explicites (`chat`, `edit`, `autocomplete`). Les snippets ci-dessous utilisent ce format actuel.
</AlertBox>

Ouvrez un terminal Powershell, lancez `cd ~/.continue ; notepad config.yaml` et collez le contenu de ce fichier :

<Snippet filename=".continue/config.yaml" source="./files/continue/config.yaml" defaultOpen={false} />

![Configurer l'extension Continue](./images/configure_continue_extension.webp)

Redémarrez VSCode ou, dans le panneau Continue, trouvez l'option `Local config` et sélectionnez `Refresh`.

Quand vous voyez le nom de votre modèle dans la liste des modèles chargés, Continue est prêt à traiter votre première question.

![Sélection d'un modèle dans l'extension Continue](./images/continue_select_model.webp)

À partir de là, vous pouvez utiliser Continue pour poser des questions sur votre codebase, générer des tests unitaires, refactorer du code, etc.

La vitesse dépendra évidemment du modèle choisi et de votre matériel.

### Utiliser l'autocomplétion {#using-autocompletion}

Quand vous tapez du texte dans VSCode, vous voulez une autocomplétion immédiate, pas attendre une seconde ou plus.

Pour cela, il vous faut un modèle plus rapide ; prenons `qwen2.5-coder:1.5b` (1,5 milliard de paramètres, environ 1 Go).

<Terminal typewriter wrap={true}>
$ docker exec -it %%name=ollama%% ollama pull qwen2.5-coder:1.5b
</Terminal>

Mettez à jour votre fichier `.continue/config.yaml` (côté Windows) avec ce nouveau contenu :

<Snippet filename=".continue/config.yaml" source="./files/continue/config_with_autocompletion.yaml" defaultOpen={false} />

Maintenant que j'ai ajouté le modèle `qwen2.5-coder:1.5b` dans mon fichier de config, créons un fichier `calculate.sh` avec ce contenu :

<Snippet filename="calculate.sh" source="./files/calculate.sh" defaultOpen={true} />

... et rien de plus.

Après une seconde à peine, VSCode propose de compléter la fonction avec le bon code :

![L'autocomplétion de Continue en action](./images/continue_autocompletion.webp)

J'ai accepté la suggestion et tapé `function main` ; là encore, après une seconde, le reste du code a été autocomplété.

Puis j'ai tapé `function help`, accepté la proposition, et enfin accepté les dernières lignes du script.

En moins de 5 secondes, j'ai donc obtenu un script complet avec le bon code et les bons commentaires. Le tout sans écrire une seule ligne de code, juste en acceptant les suggestions du LLM.

<Snippet filename="calculate.sh" source="./files/calculate_autocompleted.sh" defaultOpen={false} />

Et ça marche du premier coup !

<Terminal typewriter wrap={true} source="./files/terminal-1.txt" />

### Utiliser un LLM plus puissant selon vos attentes {#using-more-powerful-llm-depending-on-your-expectations}

<AlertBox variant="note" title="Mis à jour le 27-07-2026">
Cette section recommandait initialement `gemma2:27b`, un modèle dense de 27 milliards de paramètres. Je suis depuis passé à `qwen3-coder:30b` pour ce rôle — même astuce Mixture-of-Experts que celle expliquée plus haut pour Mixtral : 30 milliards de paramètres au total, mais seulement ~3,3 milliards actifs par token, ce qui le rend nettement plus rapide qu'un modèle dense de taille comparable tout en tenant confortablement dans 24 Go de VRAM (environ 19 Go sur disque avec la quantization par défaut). La capture plus bas montre toujours le test d'origine avec `gemma2:27b` — la config et la commande pull ci-dessous reflètent la recommandation actuelle.
</AlertBox>

Si vous avez un CPU et/ou un GPU puissant avec 24 Go ou plus, vous pouvez ajouter un modèle plus costaud comme `qwen3-coder:30b` :

<Snippet filename=".continue/config.yaml" source="./files/continue/config_with_expert.yaml" defaultOpen={false} />

<Terminal typewriter wrap={true}>
$ docker exec -it %%name=ollama%% ollama pull qwen3-coder:30b
</Terminal>

Ce modèle est nettement plus précis que l'assistant rapide et — grâce à l'architecture Mixture-of-Experts — reste raisonnablement véloce malgré sa taille. Gardez-le pour les tâches d'analyse de code intensives : refactoring, génération de tests unitaires complexes, etc.

Voici le test d'origine, où je demandais un refactoring à `gemma2:27b` — c'était vraiment lent, même sur ma machine (i9 - 64 Go) :

![Refactorer mon fichier courant avec Continue](./images/continue_refactor_current_file.webp)

Et l'autocomplétion appliquée au `readme.md` :

![Utiliser l'autocomplétion pour le fichier readme.md](./images/readme_autocompletion.webp)

<Details label="Bonus">

### CanIRun.ai {#canirunai}

Le site [https://www.canirun.ai/](https://www.canirun.ai/) détecte automatiquement votre configuration CPU, GPU et mémoire — strictement en local, sans transmettre les données de votre système à un serveur externe — et affiche instantanément une évaluation réaliste des modèles d'IA que votre machine peut faire tourner correctement.

En visitant cette page, le système calcule quels modèles d'IA peuvent tourner sur votre matériel et à quelle vitesse. Aucune donnée n'est envoyée à un serveur. Tout est calculé côté client.

### Libérer de la RAM avec ollama stop {#freeing-up-ram-with-ollama-stop}

Si vous avez besoin de récupérer immédiatement la mémoire de votre système, vous pouvez forcer le déchargement d'un modèle avec `docker exec -it ` <Var name="name">ollama</Var> ` ollama stop <model_name>`.

Cette étape manuelle n'est généralement pas nécessaire : Ollama est conçu pour décharger automatiquement les modèles de votre RAM après quelques minutes d'inactivité. C'est juste une commande pratique à garder sous le coude quand vous avez besoin d'un contrôle immédiat sur vos ressources !

### Supprimer un modèle {#remove-a-model}

Lancez simplement `docker exec -it ` <Var name="name">ollama</Var> ` ollama rm <model_name>`.

### Le fichier .wslconfig {#wslconfig-file}

Si vous utilisez WSL2, c'est une bonne idée de créer un fichier `.wslconfig` dans votre partition Windows afin de définir quelques réglages par défaut pour WSL, comme la quantité maximale de RAM qu'il peut utiliser.

Sur ma machine, j'utilise ces réglages :

<Snippet filename=".wslconfig" source="./files/.wslconfig" defaultOpen={true} />

Pour créer ce fichier, ouvrez un nouveau terminal Powershell, lancez `cd ~` pour aller dans votre dossier utilisateur (côté Windows) puis `notepad .wslconfig` pour ouvrir ce fichier (et le créer si besoin).

<AlertBox variant="tip">

Pensez à lancer `wsl --shutdown` dans une console Powershell si vous avez créé ou modifié le fichier `.wslconfig`.

</AlertBox>

</Details>
