---
slug: open-webui-advanced
title: "Open WebUI — au-delà du chat : modèles, RAG, Tools et clés d'API"
description: "Open WebUI est bien plus qu'une interface de chat pour Ollama. Presets de modèles avec system prompts, RAG sur vos documents locaux, recherche web, Tools en Python et clés d'API personnelles : de quoi construire un vrai workspace IA local."
authors: [christophe, claude]
image: /img/v2/exploring_webgui.webp
mainTag: ai
tags: [ai, docker, ollama, self-hosted]
date: 2026-10-26
ai_assisted: true
tried_it: false
---

![Open WebUI — au-delà du chat : modèles, RAG, Tools et clés d'API](/img/v2/exploring_webgui.webp)

<TLDR>
La fenêtre de chat d'Open WebUI, c'est la surface. En dessous : des presets de modèles avec system prompt et température fixes, une base de connaissances pour le RAG (uploadez des PDF et des fichiers Markdown, posez des questions, obtenez des réponses sourcées), l'intégration de la recherche web, un système de plugins Python (Tools et Functions) pour l'étendre, et des clés d'API personnelles pour piloter le tout depuis vos scripts. Cet article passe en revue chaque point, en partant d'une installation de base.
</TLDR>

Si vous avez installé Open WebUI pour discuter avec Ollama et que vous n'êtes pas allé plus loin, vous utilisez environ 20 % de ce qui est disponible. Le reste se trouve dans les onglets et les menus qu'on ne remarque pas quand on veut juste poser une question.

Cet article reprend là où <Link to="/blog/ollama-installation">le guide d'installation d'Ollama</Link> s'arrêtait — en supposant qu'Ollama tourne en local et qu'Open WebUI est accessible sur le port 4000 (ou là où vous l'avez déployé).

<!-- truncate -->

## Voir la chose en action {#seeing-it-work}

Open WebUI expose une API compatible OpenAI, protégée par une clé d'API personnelle. Ici, elle résume de vraies notes de réunion, appelée directement depuis un terminal :

<Terminal source="./files/terminal_summarize.txt" typewriter />

Remplacez `qwen2.5-coder:3b` par un des ids affichés par la seconde commande sur votre machine — la [section sur le nom du modèle](#4-pick-a-model-name-the-api-knows) explique pourquoi. Trois puces, basées sur les chiffres et les dates réellement présents dans le texte — pas une reformulation générique. C'est exactement la requête qu'envoie la fenêtre de chat — la [section sur les clés d'API](#api-keys) plus bas montre comment obtenir le `$TOKEN`, et la [section Tools](#tools-and-functions) empaquette le même prompt sous forme de Tool réutilisable.

<AlertBox variant="tip" title="Traduire en...">
Ajoutez simplement `Answer in French.` dans le system prompt pour obtenir des réponses en français.

```bash
- **Decision:** Migrer le staging de PostgreSQL 12 à PostgreSQL 16, échéance du 15 octobre.
- **Action:** Tom rédige un plan de remise en arrière pour une vérification avec Sarah avant le 15 octobre.
- **Budget:** Approuvé un budget de 4,200 EUR pour un contractor externe pour la migration.
```

</AlertBox>

## Pourquoi ça marche {#why-it-works}

- **Les presets de modèles** sont une combinaison sauvegardée de modèle de base, system prompt et température — passer de « Code Reviewer » à « Brainstorm Partner » se fait dans une liste déroulante, sans retaper le contexte à chaque fois.
- **Knowledge (RAG)** indexe vos propres documents et y ancre les réponses, en citant le passage source — le modèle répond à partir de ce que vous lui avez donné, pas de ses données d'entraînement.
- **La recherche web** donne au modèle des informations actuelles, au-delà de sa date de coupure d'entraînement ; activable message par message ou par défaut dans un preset.
- **Tools et Functions** sont du code Python qui tourne dans le container — les Tools que le modèle peut appeler, et les Functions réservées aux admins (Pipes, Filters, Actions) qui étendent la plateforme elle-même.
- **Les clés d'API** permettent à n'importe quel script d'atteindre tout ce qui précède via un endpoint compatible OpenAI.

Ces cinq fonctionnalités sont réellement indépendantes ; elles partagent juste une fenêtre de chat. Ce ne sont pas cinq vues sur la même chose.

## Rappel d'installation {#setup-reminder}

Si Open WebUI ne tourne pas encore chez vous, voici le `compose.yaml` minimal ; la procédure complète, avec captures d'écran, se trouve dans la <Link to="/blog/ollama-installation#using-a-web-interface">section Open WebUI du guide d'installation d'Ollama</Link>.

<Snippet source="./files/compose.yaml" language="yaml" />

<Terminal>
docker compose up -d
# open http://localhost:4000 {#open-httplocalhost4000}
</Terminal>

Le volume `open-webui` conserve toutes vos données — conversations, documents uploadés, modèles personnalisés, functions — au fil des redémarrages et des mises à jour du container. Ne l'oubliez pas.

<AlertBox variant="info" title="Note de version">
Open WebUI évolue vite. Les chemins de menu de cet article ont été vérifiés sur la documentation officielle en octobre 2026. Un changement récurrent d'une release à l'autre : tout ce qui concerne **tous** les utilisateurs (recherche web, paramètres des documents, Functions, clés d'API) se trouve dans l'**Admin Panel**, tandis que les briques personnelles (Models, Knowledge, Tools) sont dans le **Workspace**.
</AlertBox>

## Presets de modèles — même modèle Ollama, personas différents {#model-presets--same-ollama-model-different-persona}

Ollama n'a qu'un seul modèle `qwen3-coder:30b`. Mais vous voulez peut-être lui parler comme à un relecteur de code intransigeant à un moment, et comme à un partenaire de brainstorming juste après — avec des system prompts et des réglages de température différents pour chacun.

### Workspace → Models → + New Model

Donnez-lui un nom (« Code Reviewer »), sélectionnez le modèle de base dans Ollama, puis configurez :

- **System prompt** : l'instruction qui cadre chaque conversation avec ce preset. Pour un relecteur de code : *"You are a strict code reviewer. Focus on correctness, security, and maintainability. Point out issues directly. Do not suggest cosmetic changes."*
- **Temperature** : basse (0.1–0.3) pour une sortie déterministe et structurée ; haute (0.7–0.9) pour les tâches créatives. La valeur par défaut est généralement 0.8.
- **Context length** : combien de tokens de l'historique de conversation inclure. L'augmenter permet au modèle de se souvenir de plus de choses dans une longue conversation, au prix de plus de VRAM.

Sauvegardez le preset. Il apparaît maintenant dans le sélecteur de modèle en haut de chaque chat. Vous passez de « Code Reviewer » à « Brainstorm Partner » ou « Explain Like I'm Five » aussi facilement que d'un onglet à l'autre.

<AlertBox variant="tip" title="Des emojis dans les noms de modèles">
Open WebUI affiche les noms de modèles dans la liste du sélecteur. Un préfixe emoji (`🔍 Code Reviewer`, `🧠 Brainstorm`, `🐣 ELI5`) rend la liste beaucoup plus lisible d'un coup d'œil.
</AlertBox>

## Knowledge — du RAG sur vos documents locaux {#knowledge--rag-on-your-local-documents}

### Workspace → Knowledge → + New Knowledge

Une collection Knowledge est un groupe de documents qu'Open WebUI indexe et utilise pour ancrer ses réponses. Contrairement à un chat brut, les réponses d'une query RAG citent les passages précis dont elles sont issues. Si le Q&R sur documents est tout ce dont vous avez besoin, <Link to="/blog/anythingllm-chat-with-your-docs">AnythingLLM</Link> est une alternative dédiée qui dialogue avec la même instance Ollama.

### Ce que vous pouvez uploader

- des fichiers PDF (les documents scannés fonctionnent si le texte est extractible)
- des fichiers Markdown
- du texte brut, DOCX, XLSX
- des URL de pages web (Open WebUI récupère et indexe le contenu)

### Workflow

1. Créez une collection Knowledge, par exemple « Project Documentation »
2. Uploadez vos documents (glisser-déposer dans la vue de la collection)
3. Attendez l'indexation — un indicateur de progression montre chaque fichier en cours de traitement
4. Dans un chat, cliquez sur le bouton `+` → **Knowledge** → sélectionnez votre collection
5. Posez vos questions : *"What does the API authentication section say about token expiry?"*

Open WebUI récupère les passages les plus pertinents et les inclut dans le contexte du modèle. Le modèle répond à partir de vos documents, pas de ses données d'entraînement — et cite le document et la section utilisés.

### Cas d'usage concrets

- la documentation technique d'un projet sur lequel vous travaillez
- une collection de notes Markdown que vous voulez interroger
- un ensemble de specs PDF ou de RFC à recouper
- vos propres articles de blog (interroger vos propres écrits)

<AlertBox variant="info" title="Modèles d'embedding">
Le RAG nécessite un modèle d'embedding pour indexer les documents. Par défaut, Open WebUI utilise Ollama pour les embeddings s'il est disponible, sinon un sentence transformer intégré. Vous pouvez changer le modèle d'embedding dans **Admin Panel → Settings → Documents → Embedding Model**. Un modèle d'embedding dédié (comme `nomic-embed-text`) améliore la qualité de la recherche et consomme moins de VRAM que de passer par votre LLM principal.
</AlertBox>

## Intégration de la recherche web {#web-search-integration}

### Admin Panel → Settings → Web Search

Activez-la et choisissez un moteur de recherche. Les options incluent SearXNG (auto-hébergé — il s'accorde naturellement avec une installation locale d'Open WebUI), DuckDuckGo, Google, Brave et d'autres. Pour SearXNG, vous pointez vers l'URL de votre propre instance et aucune clé d'API n'est nécessaire.

Avec la recherche web active, vous pouvez l'activer message par message via l'icône de recherche dans la barre d'outils du chat, ou l'activer par défaut pour un preset de modèle. Quand elle est active, Open WebUI interroge le moteur de recherche, récupère les premiers résultats et inclut leur contenu dans le contexte du modèle — lui donnant des informations actuelles au-delà de sa date de coupure d'entraînement.

## Tools et Functions — étendre Open WebUI avec Python {#tools-and-functions}

Open WebUI dispose de deux systèmes de plugins Python, gérés à deux endroits différents :

- **Tools** (**Workspace → Tools**) : des fonctions que le modèle peut décider d'appeler pendant un chat, comme les outils MCP. Tout utilisateur qui en a la permission peut en ajouter.
- **Functions** (**Admin Panel → Functions**) : des extensions de la plateforme elle-même, réservées aux admins, pour tous les utilisateurs. Leur type est déduit du nom de la classe :
  - les **Pipes** apparaissent comme un modèle sélectionnable et remplacent entièrement l'appel au modèle (appeler une API externe, chaîner des modèles, etc.)
  - les **Filters** modifient les messages à l'entrée ou à la sortie — pré-traiter votre prompt, post-traiter la réponse
  - les **Actions** ajoutent un bouton sous un message

Le plugin le plus simple est un Tool. En voici un qui encapsule un prompt de résumé — exactement celui qui se cache derrière la démo en début d'article :

<Snippet source="./files/summarize-function.py" language="python" />

Pour l'installer : **Workspace → Tools → + New Tool → coller → Save**.

Activez-le ensuite pour un chat avec le bouton `+` (ou attachez-le définitivement à un preset de modèle). Collez du texte, demandez un résumé, et le modèle appelle `summarize`, qui formule la requête selon le nombre de mots et la langue configurés.

Tools et Functions peuvent faire bien plus — interroger une base de données, appeler une API REST, lire des fichiers sur l'host — parce que ce sont du Python exécuté dans le container Open WebUI. Le pattern `Valves` (un modèle Pydantic) fournit des réglages configurables par l'admin, affichés dans le panneau de paramètres du plugin.

<AlertBox variant="caution" title="C'est du code arbitraire">
Tools et Functions exécutent du Python arbitraire sur votre serveur. Lisez le code avant d'en installer un — une fiche sur le site communautaire n'est pas un audit de sécurité.
</AlertBox>

<AlertBox variant="tip" title="Plugins communautaires">
Le [site communautaire](https://openwebui.com/) d'Open WebUI propose des Tools et des Functions prêts à importer pour les tâches courantes : scraping web, exécution de code, génération d'images, traduction, et plus encore.
</AlertBox>

## Clés d'API — appeler Open WebUI depuis vos scripts {#api-keys}

L'appel `curl` en début d'article envoie `Authorization: Bearer $TOKEN`. Ce token est une clé d'API personnelle, et elle est désactivée par défaut. Trois interrupteurs séparent une installation fraîche d'une clé fonctionnelle.

### 1. Activer la fonctionnalité (admin) {#1-turn-the-feature-on-admin}

**Admin Panel → Settings → General → Authentication**, activez **Enable API Key**, puis **Save**.

C'est l'interrupteur général : tant qu'il est éteint, personne — pas même un admin — ne peut générer de clé. Dans la même section, **API Key Endpoint Restrictions** permet de limiter les routes qu'une clé peut appeler (par exemple uniquement `/api/models,/api/chat/completions`).

### 2. Autoriser les utilisateurs à créer des clés (admin) {#2-allow-users-to-create-keys-admin}

Les utilisateurs non-admin ont aussi besoin de la permission **API Keys** :

- **Pour tout le monde** : **Admin Panel → Users → Groups → Default Permissions → Features Permissions**, activez **API Keys**, puis **Save**.
- **Pour quelques personnes seulement** (recommandé) : **Admin Panel → Users → Groups**, créez ou sélectionnez un groupe, ajoutez les utilisateurs, puis **Permissions → Features Permissions → API Keys**.

### 3. Créer la clé (utilisateur) {#3-create-the-key-user}

Cliquez sur votre icône de profil (en bas à gauche) → **Settings → Account**. La ligne **API keys** n'est qu'un titre : les contrôles se trouvent sur la ligne juste en dessous, **Secrets**. Cliquez sur **Show** sur cette ligne, puis sur **Create new secret key**. Une fois la clé créée, **Copy API Key** la place dans votre presse-papiers ; elle commence par `sk-`.

<Terminal>
$ export TOKEN="sk-..."
$ curl -H "Authorization: Bearer $TOKEN" http://localhost:4000/api/models
</Terminal>

Une liste JSON de modèles signifie que la clé fonctionne. Une clé porte exactement les permissions de l'utilisateur qui l'a créée — elle voit les mêmes modèles, les mêmes collections Knowledge et les mêmes Tools — alors créez-la depuis un compte qui n'a pas plus de droits que ce dont le script a besoin.

### 4. Choisir un nom de modèle que l'API connaît {#4-pick-a-model-name-the-api-knows}

Le champ `model` d'une requête doit être l'**`id` exact** d'un modèle de votre instance — nom et tag compris. Tout le reste renvoie :

```json
{"detail":"Model not found"}
```

Ce message n'a rien à voir avec la clé : il signifie que le nom envoyé n'est pas dans la liste. Affichez les ids valides — le filtre `jq` ne garde que le champ `id` de chaque entrée (voir <Link to="/blog/linux-jq">The jq utility for Linux</Link> si la syntaxe vous est inconnue) :

<Terminal>
$ curl -s -H "Authorization: Bearer $TOKEN" http://localhost:4000/api/models | jq -r '.data[].id'
</Terminal>

Copiez-en un dans `MODEL`, comme dans l'exemple en début d'article.

## Sous le capot (passez si vous voulez juste l'utiliser) {#under-the-hood-skip-this-if-you-just-want-to-use-it}

### Gestion des conversations {#conversation-management}

Quelques fonctionnalités qui rendent l'usage quotidien plus confortable :

**Folders** : organisez vos conversations dans des dossiers nommés (clic droit sur une conversation dans la barre latérale). Pratique quand vous maintenez des fils séparés pour différents projets.

**Tags** : taguez vos conversations pour les filtrer rapidement. La barre latérale a un filtre par tag en bas.

**Partage de conversation** : générez un lien partageable pour n'importe quelle conversation (l'icône de partage dans l'en-tête du chat). Utile pour montrer à un collègue l'échange exact sans copier-coller.

**Regenerate** : survolez n'importe quelle réponse du modèle et cliquez sur le bouton de régénération (les flèches circulaires) pour obtenir une réponse différente avec le même prompt et les mêmes réglages. Le modèle est stochastique — la température fait qu'un même prompt produit des sorties différentes.

### Accéder à Open WebUI depuis d'autres appareils {#accessing-open-webui-from-other-devices}

Si Ollama tourne sur votre station de travail principale et qu'Open WebUI écoute sur le port 4000, les autres appareils de votre réseau local peuvent y accéder via `http://your-ip:4000`. L'article <Link to="/blog/accessing-ollama-across-your-local-network">Accessing Ollama across your local network</Link> couvre la configuration réseau — Open WebUI se place devant Ollama, la même approche s'applique donc.

Pour du HTTPS sur le réseau local (utile si vous voulez utiliser les API caméra ou micro dans le navigateur), placez un reverse proxy comme Caddy devant Open WebUI.

## Conclusion {#conclusion}

La valeur d'Open WebUI se cumule à mesure que vous empilez ces fonctionnalités. Un preset de modèle avec le bon system prompt et la bonne température supprime la friction de réexpliquer votre contexte à chaque chat. Une base de connaissances RAG ancre les réponses dans vos vrais documents. La recherche web ajoute l'information actuelle. Tools et Functions ajoutent des capacités que le modèle de base n'a pas, et une clé d'API ouvre tout cela à vos scripts — l'appel de résumé en début d'article en est le plus petit exemple.

La fenêtre de chat n'est qu'un début — passez une après-midi dans Workspace et Settings, et vous découvrirez un environnement IA local réellement configurable, qui vaut le temps investi à le mettre en place correctement.
