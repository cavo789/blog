---
slug: anythingllm-chat-with-your-docs
title: "AnythingLLM : discuter avec toute votre documentation éparpillée"
authors: [christophe, claude]
image: /img/v2/anythingllm.webp
mainTag: ai
tags: [ai, ollama, docker, self-hosted]
date: 2026-08-17
description: "AnythingLLM transforme un tas de fichiers Markdown, Quarto, PDF, DOCX, Excel et PowerPoint en quelque chose avec quoi vous pouvez réellement discuter, avec un modèle Ollama local derrière. La partie 1 l'installe sur une seule machine ; la partie 2 garde les documents sur mon PC de travail tout en empruntant le GPU qui dort à la maison."
language: fr
ai_assisted: true
series: "Ollama daily use"
blueskyRecordKey: 3mtaxwuyz3c2r
---

![AnythingLLM : discuter avec toute votre documentation éparpillée](/img/v2/anythingllm.webp)

<!-- cspell:ignoreCase anythingllm lancedb nomic mxbai mintplexlabs qwen tailscale wireguard seccomp qmd minilm -->

<TLDR>
AnythingLLM est une application self-hosted, pensée pour Docker, qui transforme vos propres documents — Markdown, Quarto, PDF, DOCX, Excel, PowerPoint, peu importe — en une base de connaissances consultable et interrogeable, avec des réponses qui citent le fichier exact d'où elles viennent. Elle n'embarque pas sa propre IA : elle parle à un fournisseur de LLM de votre choix, ce qui lui permet de réutiliser un serveur Ollama que vous faites déjà tourner ailleurs. Cet article l'installe deux fois : une fois entièrement sur une seule machine (mon PC de la maison), et une fois répartie sur deux — documents sur mon PC de travail, inférence GPU sur le PC de la maison — parce que certains documents n'ont tout simplement pas le droit de quitter la machine où ils vivent.
</TLDR>

Sous `~/repositories`, sur mon portable de travail, j'ai des dizaines de dossiers de projets, et chacun a discrètement accumulé son propre tas de documentation : un `README.md` ici, un rapport Quarto là, une spec PDF que quelqu'un m'a envoyée, une feuille Excel dont personne ne se souvient de l'objectif, un PowerPoint issu d'une réunion d'il y a six mois. Pris séparément, chaque fichier va très bien. Ensemble, c'est un cimetière — je *sais* que j'ai noté quelque part la réponse à « comment j'ai configuré ce VPN la dernière fois », dans un de ces dossiers, dans un de ces formats, mais le retrouver suppose soit de me rappeler le nom exact du fichier, soit de faire un grep en espérant que les mots correspondent.

Si vous avez déjà ouvert un terminal, tapé `grep -r "some term" ~/repositories`, obtenu quarante résultats sans intérêt et abandonné — vous avez déjà le problème dont parle cet article.

<!-- truncate -->

## Le voir fonctionner {#seeing-it-work}

Voici une vraie question posée à un vrai workspace — les 248 articles de ce blog, indexés avec le script plus bas. Poser la question, c'est un appel API, exactement la requête que le panneau de chat envoie quand vous tapez dedans :

<Terminal source="./files/terminal_chat_proof.txt" typewriter wrap={true} />

Relisez la question et remarquez ce qu'elle ne contient pas. Pas `chpwd`. Pas `for-each-ref`. Pas `committerdate`. Même pas les mots du titre de l'article qu'elle a trouvé — *Showing the last 3 updated branches when you jump in a git repo*. J'ai décrit un souvenir flou avec les mots que j'emploierais réellement deux ans plus tard, et j'ai récupéré le mécanisme, le hook auquel il est branché, le flag qui trie les branches, et un lien.

C'est précisément la requête que `grep` ne peut pas servir. `grep -r "chpwd"` l'aurait trouvé instantanément — si je m'étais souvenu du mot `chpwd`. Tout l'enjeu, c'est justement que non.

## Pourquoi ça fonctionne {#why-it-works}

- [AnythingLLM](https://anythingllm.com/) est une application open-source, self-hosted, construite autour du Retrieval-Augmented Generation (RAG) sur vos propres fichiers, organisés en **workspaces** — un par projet, par client ou par sujet, sans aucune fuite entre eux.
- **C'est un client, pas un LLM.** AnythingLLM ne livre pas de modèle à lui : il appelle un **LLM Provider** que vous configurez : OpenAI, Anthropic ou, la partie intéressante pour nous, **Ollama**. Si vous faites déjà tourner Ollama quelque part, AnythingLLM n'est qu'une chose de plus qui lui parle.
- Chaque réponse revient avec une référence au fichier source et au chunk d'où elle a été extraite — une citation, pas une supposition qu'il faut croire sur parole.
- Il lit ce que `grep` ne peut même pas ouvrir : la spec PDF, la feuille Excel, le deck PowerPoint. C'est l'autre moitié de la raison pour laquelle il complète `rg` plutôt que de le remplacer. Il coexiste aussi avec Open WebUI — Open WebUI est un client de chat généraliste pour Ollama, AnythingLLM est spécifiquement le layer de RAG documentaire, et les deux parlent volontiers à la même instance Ollama.

<AlertBox variant="tip" title="Ce que vous gagnez pour l'effort d'installation">
Une question en langage naturel sur tout le contenu d'un workspace, avec le fichier source nommé dans la réponse. Cette seule fonctionnalité vaut les vingt minutes de configuration Docker ci-dessous — elle transforme « je sais que j'ai noté ça quelque part » en une vraie réponse.
</AlertBox>

Quatre choses suivent, et vous pouvez les lire dans l'ordre qui vous plaît :

- <Link to="#install">**L'installer**</Link> — un `compose.yaml`, plus la vérification de trente secondes qui vous évite un embedder qui renvoie silencieusement du bruit.
- <Link to="#ingest">**Y faire entrer des documents**</Link> — pourquoi il n'y a pas de bouton « indexer ce dossier », et le script qui a indexé 248 articles en 94 secondes.
- <Link to="#search">**Chercher depuis le terminal**</Link> — un `curl`, puis la même chose sous forme de commande shell avec des résultats cliquables.
- <Link to="#two-machines">**Documents ici, GPU là-bas**</Link> — la répartition sur deux machines, pour les documents qui n'ont pas le droit de voyager.

## Partie 1 — Installer AnythingLLM sur une seule machine {#install}

C'est le cas simple : AnythingLLM et Ollama vivent sur la même machine, mon PC de la maison avec 24 Go de VRAM disponibles.

<AlertBox variant="note" title="Prérequis">
On suppose ici qu'Ollama tourne déjà comme container Docker, comme je l'ai installé dans <Link to="/blog/ollama-installation">Installing Ollama and get local AI</Link>. Rien de ce qui suit ne réexplique cette partie.
</AlertBox>

### Le fichier compose.yaml {#the-composeyaml-file}

Fidèle à mon habitude d'un dossier par outil sous `~/tools`, créons `~/tools/anythingllm/compose.yaml` :

<Vars port="3001" labels={{ port: "Host port" }} />

<Snippet filename="compose.yaml" source="./files/compose.yaml" defaultOpen={true} />

Avant de le démarrer, créez le fichier `.env` qu'il référence, qui contient un secret aléatoire utilisé par AnythingLLM pour signer les tokens de session :

<Terminal title="user@home-pc: ~/tools/anythingllm">
$ echo "JWT_SECRET=$(openssl rand -hex 32)" > .env
</Terminal>

<AlertBox variant="caution" title="À propos de cap_add: SYS_ADMIN">
AnythingLLM utilise un Chromium headless en coulisses pour certaines fonctions documentaires et de web-scraping, et Chromium veut cette capability pour faire tourner son sandbox dans un container. C'est une concession de privilège plus large que ce que j'aimerais accorder par défaut — le projet a une discussion ouverte pour la remplacer par un profil seccomp plus étroit, mais à ce jour, `SYS_ADMIN` est ce qu'attend l'image officielle. Bon à savoir, pas de quoi perdre le sommeil sur un LAN domestique.
</AlertBox>

`OLLAMA_BASE_PATH` et `EMBEDDING_BASE_PATH` pointent tous les deux vers `192.168.0.218` — la même adresse IP de serveur maison que j'ai utilisée dans <Link to="/blog/accessing-ollama-across-your-local-network">Accessing Ollama across your local network</Link>. Remplacez-la par l'IP de votre propre serveur. Notez que même si Ollama et AnythingLLM tournent ici sur exactement la même machine, j'utilise quand même l'IP du LAN plutôt que `localhost` — ce détail compte plus loin, là où il cesse d'être un détail pour devenir tout l'enjeu.

Téléchargez le modèle d'embedding côté Ollama avant de démarrer AnythingLLM — il est petit (quelques centaines de Mo) et indispensable pour que quoi que ce soit soit embeddé :

<Terminal title="user@home-pc: ~/tools/anythingllm" wrap={true}>
$ docker exec -it ollama ollama pull mxbai-embed-large
</Terminal>

<AlertBox variant="caution" title="Alignez la taille des chunks sur le modèle d'embedding, sinon rien ne sera embeddé">
`EMBEDDING_MODEL_MAX_CHUNK_LENGTH` ci-dessus est à `400` pour une raison. Lancez `docker exec ollama ollama show mxbai-embed-large` et vous verrez **context length 512** — fixez la taille des chunks au-delà et *chaque* document échoue à l'embedding, avec `Ollama Failed to embed: the input length exceeds the context length` enterré dans `docker logs anythingllm`. L'interface ne donne aucun indice : l'upload réussit, le document apparaît dans la bibliothèque, et le workspace reste simplement vide. `OLLAMA_EMBEDDING_BATCH_SIZE` n'est que de la vitesse — la valeur par défaut de 1 envoie un chunk par appel HTTP, ce qui transforme quelques centaines de documents en un très long après-midi.
</AlertBox>

### Vérifiez que votre embedder discrimine vraiment {#check-that-your-embedder-actually-discriminates}

J'utilisais au départ `nomic-embed-text` ici — c'est le modèle que tout le monde recommande pour ce travail. Il a embeddé les 248 articles sans une seule erreur, puis a répondu « il n'y a aucun article couvrant spécifiquement WordPress » à propos d'un blog qui contient un article intitulé *Quickly install WordPress in just three commands*.

Rien n'avait échoué. Les embeddings étaient simplement dénués de sens, et une stack RAG n'a aucun moyen de vous le dire : elle récupère les vecteurs les plus proches qu'elle trouve et les passe au modèle, quels qu'ils soient. Donc avant de faire confiance à un embedder, passez trente secondes à prouver qu'il sépare un texte proche d'un texte sans rapport :

<Snippet filename="embedder-sanity-check.py" source="./files/embedder-sanity-check.py" />

<Terminal source="./files/embedder_check.txt" wrap={true} />

Deux phrases qui veulent dire la même chose doivent scorer bien au-dessus d'une phrase sans rapport. `mxbai-embed-large` les sépare de **+0,49** ; sur ma machine, `nomic-embed-text` a atteint **+0,05**, ce qui est du bruit. Je n'ai jamais remonté la cause racine — les tags `:latest` et `:v1.5` se comportaient de façon identique, et les réglages `OLLAMA_FLASH_ATTENTION` / `OLLAMA_KV_CACHE_TYPE` d'Ollama n'ont rien changé — mais le correctif ne dépend pas de la cause. Faites le test, et si la séparation est faible, changez de modèle plutôt que de questions.

Ensuite, démarrez AnythingLLM :

<Terminal title="user@home-pc: ~/tools/anythingllm">
$ docker compose up --detach

[+] Running 1/1
 ✔ Container anythingllm  Started
</Terminal>

### Configuration au premier lancement {#first-run-setup}

Rendez-vous sur `http://localhost:`<Var name="port">3001</Var> (ou <Code>http://192.168.0.218:<Var name="port">3001</Var></Code> depuis une autre machine du réseau). L'assistant d'onboarding demande :

<StepsCard
  variant="steps"
  title="Onboarding AnythingLLM"
  steps={[
    { content: "**LLM Provider** — sélectionnez Ollama, collez l'URL de votre serveur (`http://192.168.0.218:11434`), choisissez le modèle que vous avez déjà téléchargé (`qwen2.5:14b-instruct` tient confortablement dans 24 Go de VRAM à côté du modèle d'embedding)" },
    { content: "**Embedding Provider** — sélectionnez Ollama à nouveau, même URL, choisissez `mxbai-embed-large`" },
    { content: "**Vector Database** — laissez la valeur par défaut, LanceDB ; il est embarqué, aucun container supplémentaire à faire tourner" },
    { content: "**Create your first workspace** — nommez-le d'après un vrai projet, pas \"test\"" }
  ]}
/>

<BrowserWindow url="http://localhost:%%port=3001%%/workspace/blog">
    ![Where did I mention Mermaid](./images/mermaid.webp)
</BrowserWindow>

## Faire entrer vos documents {#ingest}

Dans le workspace, la boîte de dialogue d'upload accepte exactement le mélange que je décrivais plus haut : déposez un `README.md`, un rapport Quarto `.qmd`, un PDF, un DOCX, une feuille Excel, un deck PowerPoint — en sélection multiple, autant que le sélecteur de fichiers de l'OS vous laisse en prendre d'un coup. AnythingLLM parse chaque format lui-même ; vous n'avez rien à convertir au préalable.

Dès que les documents affichent un statut « embedded » vert, posez une vraie question dans le panneau de chat — quelque chose que vous seriez normalement allé chercher à la main, exactement comme la preuve en terminal plus haut a obtenu sa réponse. La réponse revient avec le document source nommé à côté, donc vous pouvez aller vérifier au lieu de croire le modèle sur parole.

### Vous ne lui donnez pas un chemin — et ça surprend tout le monde {#you-dont-give-it-a-path--and-that-surprises-everyone}

C'est la partie que j'ai mal comprise la première fois, alors soyons explicites : **il n'existe aucun champ, nulle part dans AnythingLLM, où vous tapez `/home/me/repositories` pour lui faire indexer ce dossier.** Deux choses s'additionnent pour rendre ça impossible :

- Le serveur tourne dans un container, et le `compose.yaml` ci-dessus monte exactement un volume — `anythingllm_storage`. Votre dossier de documents n'existe tout simplement pas à l'intérieur de ce container.
- Ajouter un bind mount n'aiderait pas non plus, parce que cette boîte de dialogue *Upload* est le sélecteur de fichiers de **votre navigateur**, qui tourne sur votre machine. Il ne peut pas voir à l'intérieur du container, et le container n'apprend jamais d'où vient le fichier — les octets arrivent en HTTP comme n'importe quel autre envoi de formulaire.

Donc AnythingLLM ne lit jamais vos fichiers là où ils sont. Il **copie** chacun d'eux dans son volume de stockage, le parse en JSON, le découpe en chunks et les embedde. C'est exactement le fait sur lequel repose toute l'argumentation de la partie 2 ci-dessous, et il vaut la peine de l'intégrer tôt : *les documents vivent là où tourne le container*.

Reste une vraie question : comment y faire entrer quelques centaines de fichiers sans cliquer quelques centaines de fois dans un sélecteur de fichiers ?

### Indexer une arborescence entière avec une seule commande {#indexing-a-whole-folder-tree-with-one-command}

L'interface graphique est l'une des trois portes, et les deux autres sont mieux adaptées au traitement en masse :

- **L'API développeur** — un endpoint REST qui prend un fichier par appel. Enveloppez-le dans une boucle et vous pouvez lui donner tout ce que vous savez trouver avec `find`. C'est celle que nous allons utiliser.
- **Les data connectors** (*Settings → Data Connectors*) — des importeurs prêts à l'emploi pour GitHub, GitLab, Confluence, Obsidian, ainsi qu'un crawler de site en profondeur. Si vos documents vivent déjà dans un repository, pointer le connecteur GitHub dessus ne demande aucun script. Donnez-lui quand même un token d'accès : sans authentification, il est bridé par la limite de débit publique de GitHub et ne récupère souvent que les fichiers de premier niveau.
- **Le crawler de site web**, si le contenu est publié quelque part. Le plus simple de tous, mais vous indexez du HTML rendu — navigation, pied de page et barre latérale inclus — au lieu de la source.

J'ai choisi l'API, parce que ce que je veux vraiment indexer, c'est ce blog : 248 articles, chacun un `index.md` dans son propre dossier daté. Générez une clé sous *Settings → Tools → Developer API*, et un seul appel ressemble à ceci :

<Terminal wrap={true} source="./files/terminal-upload.txt" />

Le champ `addToWorkspaces` est ce qui en fait une opération en une étape : sans lui, le document arrive dans la bibliothèque de documents d'AnythingLLM mais n'est embeddé nulle part, et il faudrait encore aller cocher des cases dans l'interface.

<AlertBox variant="caution" title="Le piège : 241 fichiers nommés index.md">
Docusaurus place chaque article dans son propre dossier sous le nom `index.md`, et AnythingLLM cite ses sources **par nom de fichier**. Uploadez-les tels quels et chaque réponse se termine par `Source: index.md` — 241 fois, impossible à distinguer. La citation est toute la raison d'utiliser cet outil, donc il faut corriger ça au moment de l'upload : `curl` permet de surcharger le nom transmis avec `-F "file=@path/index.md;filename=the-slug.md"`, et le slug est juste là, dans le frontmatter.
</AlertBox>

Ça, plus le fait de sauter les fichiers inchangés depuis la dernière fois, c'est tout ce que fait le script :

<Snippet filename="anythingllm-index.sh" source="./files/anythingllm-index.sh" />

Créez d'abord un workspace nommé `blog` dans l'interface, puis lancez-le depuis la racine du repository du blog :

<Terminal source="./files/index_run.txt" wrap={true} />

### Une étape manuelle : le system prompt du workspace {#one-manual-step-the-workspace-system-prompt}

Le script gère tout ce que l'API d'upload permet, mais il y a une chose qu'il ne peut pas atteindre : la façon dont le modèle lit ce qu'il reçoit. Collez ceci dans *Workspace Settings → Chat Settings → Prompt* — c'est ce qui fait sortir les dates correctes, et ce qui empêche le modèle de reconstruire des URLs dont il se souvient à moitié :

<Snippet filename="Workspace system prompt" source="./files/workspace-prompt.txt" defaultOpen={true} />

<AlertBox variant="tip" title="Demandez en français, obtenez 02/03/2024">
Avec ce prompt en place, *« Quand ai-je publié l'article sur Tabnine ? »* répond **02/03/2024** — bonne valeur, bon format, bonne langue. Sans lui, la même question renvoie `8/10/2026, 9:56:01 AM` : le jour où j'ai lancé l'indexeur, dans un format américain que personne n'avait demandé. Sauter cette étape est le moyen sûr de finir avec un workspace qui a l'air correct et qui ment sur toutes les dates ; <Link to="#where-that-wrong-date-comes-from">la dernière section</Link> explique d'où vient cette seconde date.
</AlertBox>

### Garder l'index à jour {#keeping-the-index-up-to-date}

Une habitude à désapprendre avant de construire quoi que ce soit là-dessus : **AnythingLLM ne rescanne jamais rien de lui-même.** Un document embeddé est une copie figée ; modifier le Markdown original sur le disque ne change rien dans le workspace, et un fichier tout neuf lui est simplement invisible.

Il *existe* une fonction de synchronisation automatique, mais elle ne couvre pas ce cas : dans le déploiement Docker, elle ne surveille que les liens de sites web et les documents ramenés par un data connector. Les fichiers uploadés manuellement — tout ce que produit la route API — sont explicitement hors périmètre. (L'application desktop surveille bien les fichiers locaux, toutes les 10 minutes, mais seulement tant qu'elle est ouverte.)

D'où le fichier d'état que le script conserve. Le relancer, c'est la synchronisation :

<StepsCard
  variant="steps"
  title="Garder le workspace à jour"
  steps={[
    { content: "**Un nouvel article** — son chemin n'est pas dans `.anythingllm-indexed`, donc il est uploadé et embeddé" },
    { content: "**Un article modifié** — son checksum ne correspond plus, donc l'ancienne copie est d'abord supprimée, puis la nouvelle uploadée ; sans cette suppression, le workspace répondrait à partir de deux versions du même texte" },
    { content: "**Tout le reste** — checksum inchangé, sauté sans aucun appel HTTP" }
  ]}
/>

Les chiffres plaident mieux que moi : indexer les 248 articles depuis zéro a pris **1 minute 34**, et le second passage — où rien n'avait changé — a pris **0,26 seconde** et fait exactement un appel HTTP, la recherche du workspace. C'est assez peu coûteux pour l'accrocher à chaque publication : une ligne dans votre script de déploiement, un hook `post-commit`, ou une entrée cron nocturne.

<AlertBox variant="important" title="Un workspace par projet">
Pour ma documentation dans `~/repositories`, je garde quand même un workspace par projet plutôt que de tout déverser dans un seul — ça garde l'espace vectoriel focalisé, donc une question sur le projet A n'est pas diluée par des chunks sans rapport du projet B. Le script prend le workspace cible via `ANYTHINGLLM_WORKSPACE`, donc la même boucle couvre les deux organisations.
</AlertBox>

## Chercher depuis le terminal {#search}

Avec 248 articles embeddés, le bénéfice est à un seul `curl`. Exportez la clé une fois — je garde la mienne dans `~/.zshrc`, mais un simple `export` dans le shell fait aussi bien l'affaire — et interrogez le workspace :

<Terminal source="./files/query_devcontainer.txt" wrap={true} />

Trois choses rendent cette réponse utile plutôt que simplement impressionnante :

- **`"mode": "query"`** restreint le modèle à ce qu'il a réellement récupéré. L'autre valeur, `"chat"`, lui permet de se rabattre sur ses connaissances générales quand le workspace n'a rien de pertinent — et c'est exactement comme ça qu'on obtient une réponse assurée sur un article que vous n'avez jamais écrit. Pour chercher dans votre propre corpus, `query` est le réglage honnête.
- **Les URLs sont réelles**, pas reconstruites. C'est le champ `chunkSource` dans le script : AnythingLLM copie les métadonnées préfixées par `link://` dans l'en-tête de chaque chunk, donc l'URL réelle voyage avec le texte jusque dans le contexte du modèle. Sans ça, vous obtenez des noms de fichiers, et un modèle laissé à deviner des URLs les inventera avec plaisir.
- **`jq -r '.textResponse'`** suffit pour lire ; enlevez-le pour voir la charge utile complète, où `sources[]` vous donne chaque chunk récupéré avec son `title`, son `docSource` (le chemin dans le repo) et un `score` de similarité.

### `ai-blog-search` : le script portable {#ai-blog-search-the-portable-script}

Taper ce `curl` chaque fois devient vite lassant, donc il vit dans un script — même résolution de clé/URL que l'indexeur, plus le formatage des sources :

<Snippet filename="anythingllm-search.sh" source="./files/anythingllm-search.sh" />

Branchez votre shell dessus, en exportant la clé une fois :

```zsh title="~/.zshrc"
export ANYTHINGLLM_API_KEY="your-key-here"
ai-blog-search() { (cd ~/repositories/blog && .scripts/anythingllm-search.sh "$@"); }
```

<Terminal source="./files/search_run.txt" wrap={true} />

Deux décisions de conception là-dedans ont gagné leur place à la dure.

**Un `sessionId` aléatoire à chaque appel.** Sans ça, chaque requête atterrit dans le thread par défaut du workspace et le modèle lit ses propres réponses précédentes comme contexte. J'ai perdu un temps sincèrement embarrassant sur un workspace qui persistait à dire qu'il n'avait aucun article WordPress — longtemps après que la récupération avait été corrigée et renvoyait les bons chunks. Il se citait *lui-même*, depuis la tentative ratée précédente. Une commande de recherche n'a rien à faire avec un historique de conversation.

**Deux listes de résultats au lieu d'une.** Regardez l'exécution ci-dessus : la moitié sémantique nomme trois articles Joomla, la moitié `grep` en trouve neuf. Cet écart n'est pas un bug à corriger par réglage — la recherche vectorielle s'arrête au `topN` du workspace et classe par similarité, donc deux ou trois longs articles remplissent les places avec leurs propres chunks. Passer `topN` de 20 à 60 a ajouté exactement un résultat. Le script lance donc aussi un simple `grep` sur `title`/`slug`/`description`/tags. La recherche sémantique trouve ce que vous n'arriviez pas à formuler ; `grep` garantit que vous n'avez rien loupé. Afficher les deux est la réponse honnête.

Transformer une phrase en termes de `grep` demande une astuce qui vaut la peine d'être volée : après avoir écarté les mots-outils évidents, le script écarte aussi tout mot survivant qui correspond à **plus de 10 % du blog**. « Docker » enterrerait tout sous la moitié du corpus ; « joomla » correspond à neuf articles et c'est précisément ce que vous demandiez. La rareté fait le travail qu'aucune liste de stopwords ne peut faire, et elle se fiche de la langue dans laquelle vous avez demandé.

<AlertBox variant="caution" title="Le RAG n'est pas un index de recherche">
C'est l'ajustement mental le plus important. « Quels articles mentionnent X » est une question pour `grep` ou la recherche du site — exacte, complète, instantanée. Le RAG gagne sa place sur l'autre type de question : celle sur `chpwd` en haut de cet article, où vous vous souvenez de l'*idée* mais pas d'un seul mot que vous avez réellement utilisé, ou là où la réponse est enterrée dans un PDF que `grep` ne peut pas lire du tout. Attendre une énumération exhaustive d'un classement par similarité, c'est attendre la mauvaise chose du bon outil.
</AlertBox>

### La même chose sous forme de fonction zsh {#the-same-thing-as-a-zsh-function}

Le script ci-dessus est la version portable — il tourne dans un devcontainer, en CI, dans un hook `post-commit`, partout où il y a `bash` et `jq`. Pour l'usage quotidien je préfère taper un mot, donc il existe aussi comme membre de la <Link to="/blog/ollama-git-precommit">famille `ai-*`</Link> : déposez-le dans `~/.zsh/fns/`, et il s'enregistre auprès du dispatcher `ai` exactement comme le font `ai-review` et `ai-commit`.

<Snippet filename="~/.zsh/fns/ai-blog-search.zsh" source="./files/ai-blog-search.zsh" />

Voici un exemple d'utilisation :

![Searching for articles about Code Quality](./images/ai-blog-search.webp)

C'est l'intrus de cette série, et ça vaut la peine de dire pourquoi : toutes les autres fonctions `ai-*` appellent `_ollama_query`, alors que celle-ci parle à AnythingLLM — qui possède l'index vectoriel et appelle Ollama lui-même, pour les embeddings et pour la réponse. Elle apporte donc son propre garde-fou `_anythingllm_check` plutôt que de réutiliser `_ollama_check`, et déclare `AI_PARAMS[blog-search]="text"` pour que le menu `ai` demande la question avant de l'exécuter.

<AlertBox variant="tip" title="Le détail zsh qui vous coûte un après-midi">
`?` et `*` sont des caractères de glob, et une question naturelle se termine par l'un des deux. Sans l'`alias ai-blog-search='noglob ai-blog-search'` en bas de ce fichier, `ai-blog-search which posts cover Joomla?` meurt avec `zsh: no matches found` avant même d'entrer dans la fonction. L'alias doit aussi venir *après* la définition de la fonction — zsh développe les alias au moment du parsing, donc il refuse de définir une fonction dont le nom est déjà un alias. Et comme cet alias survit ensuite dans votre shell, le fichier le supprime à nouveau à l'entrée (`(( $+aliases[ai-blog-search] )) && unalias ai-blog-search`) ; sans ce garde-fou, le fichier marche une fois puis casse chaque `source ~/.zshrc` suivant avec `parse error near '()'`.
</AlertBox>

Deux implémentations d'une même idée, c'est un vrai coût, alors soyez délibéré : le script bash est l'outil du repo et la seule source de vérité pour la logique ; la fonction zsh est le véhicule du quotidien, et reste autonome parce que toute la promesse de cette série est « déposez le fichier et ça marche ». Si vous n'interrogez jamais que depuis le repository du blog, prenez la version bash et sautez entièrement cette section.

À ce stade, tout — les documents eux-mêmes, leurs embeddings, les fichiers LanceDB — vit dans le volume `anythingllm_storage`, sur le PC de la maison. Très bien pour cette machine. Pas bien du tout pour ce qui suit.

## Partie 2 — Documents sur une machine, GPU sur une autre {#two-machines}

Voici la contrainte qui change tout : ma vraie documentation — ce qui est sous `~/repositories` — vit sur mon PC de **travail**, et elle y reste. Pas synchronisée, pas copiée, pas uploadée ailleurs par confort.

Ça écarte l'option la plus simple, qui serait « il suffit d'ouvrir <Code>http://192.168.0.218:<Var name="port">3001</Var></Code> depuis le navigateur de mon PC de travail et d'uploader les fichiers là ». Techniquement ça marcherait — mais uploader un fichier sur cette page envoie son contenu par le réseau vers le container du PC de la maison, où AnythingLLM stocke le texte parsé, les embeddings vectoriels et une copie en cache, à l'intérieur d'`anythingllm_storage`, sur un disque qui n'est pas le mien au bureau. C'est exactement le genre de copie que j'ai exclu. Le navigateur n'est que la fenêtre ; les documents eux-mêmes atterrissent là où le **serveur** derrière cette page tourne réellement.

La solution découle donc directement de là : faire tourner le **serveur** AnythingLLM lui-même sur le PC de travail — même container Docker, même `compose.yaml` — et ne solliciter le PC de la maison que pour la seule chose qui ne touche pas au contenu des documents : le modèle qui fait le vrai travail de réflexion.

```text
Work PC (Docker)                          Home PC
┌─────────────────────────┐               ┌──────────────────────┐
│ anythingllm container   │  inference    │ ollama container     │
│  - documents            │ ────────────► │  - qwen2.5:14b       │
│  - vectors (LanceDB)    │ ◄──────────── │  - mxbai-embed-large │
│  - STORAGE_DIR          │   tokens back │  - 24GB VRAM         │
└─────────────────────────┘               └──────────────────────┘
```

Seuls les prompts et les chunks de texte récupérés nécessaires pour y répondre traversent le réseau pour cette unique requête — rien n'est stocké de l'autre côté.

### Ce qui change réellement dans le fichier compose {#what-actually-changes-in-the-compose-file}

Rien de structurel — c'est exactement le même `compose.yaml` que dans la partie 1, qui tourne via Docker Desktop sur le PC de travail à la place. La seule chose qui change, c'est l'adresse vers laquelle pointent `OLLAMA_BASE_PATH` et `EMBEDDING_BASE_PATH`, et cette adresse dépend de l'endroit où se trouve physiquement le PC de travail :

```yaml title="compose.yaml — the two lines that change"
      - OLLAMA_BASE_PATH=http://192.168.0.218:11434      # same LAN, e.g. working from home
      - EMBEDDING_BASE_PATH=http://192.168.0.218:11434
```

Quand le PC de travail est sur le même réseau domestique, c'est tout — `192.168.0.218` est joignable exactement comme dans <Link to="/blog/accessing-ollama-across-your-local-network">l'article précédent</Link>, et le reste de cette installation est un copier-coller de la partie 1.

### Et quand il n'est pas à la maison {#and-when-it-isnt-home}

Cinq jours par semaine, ce PC de travail n'est pas du tout sur le LAN de la maison. Une simple adresse IP dans une plage privée `192.168.x.x` n'est tout bonnement pas joignable depuis le bureau — c'est tout l'intérêt d'un réseau privé.

<AlertBox variant="tip" title="La solution pratique : un VPN maillé">
Des outils comme Tailscale ou WireGuard donnent à chaque appareil — PC de la maison inclus — une adresse stable qui reste joignable quel que soit le réseau sur lequel il se trouve, sans ouvrir de ports sur votre routeur domestique vers Internet. Installez-le sur le PC de la maison, installez-le sur le PC de travail, et le même schéma `OLLAMA_BASE_PATH` ci-dessus continue de fonctionner — simplement avec l'adresse attribuée par le VPN au lieu de `192.168.0.218`. Cette configuration mérite son propre article plutôt qu'un paragraphe expédié ici, alors considérez ceci comme une bande-annonce.
</AlertBox>

<AlertBox variant="caution" title="Ollama n'a aucune authentification propre">
Exposer `192.168.0.218:11434` à l'intérieur d'un LAN privé est une chose ; le rendre joignable de n'importe où via un VPN est un cran d'exposition supplémentaire. L'API d'Ollama ne demande pas de mot de passe — quiconque peut atteindre ce port peut interroger vos modèles. Un VPN maillé comme Tailscale limite cette surface aux appareils que vous avez explicitement autorisés, et c'est précisément pour ça que c'est la réponse recommandée ici plutôt qu'une redirection de port sur le routeur.
</AlertBox>

### Recréer les workspaces, cette fois pour de bon {#recreate-the-workspaces-this-time-for-real}

Le container tournant maintenant sur le PC de travail, refaites l'onboarding de la partie 1 — même LLM provider, même modèle d'embedding, pointant vers l'adresse qui atteint actuellement le PC de la maison. Puis commencez à créer un workspace par repository sous `~/repositories`, en alimentant chacun avec sa propre documentation.

Cette fois, les documents ne quittent jamais la machine devant laquelle vous êtes assis. La seule chose qui fait l'aller-retour vers le PC de la maison, c'est une question et la poignée de chunks de texte nécessaires pour y répondre — exactement la répartition que je voulais au départ.

## Sous le capot (sautez si vous voulez juste l'utiliser) {#under-the-hood-skip-this-if-you-just-want-to-use-it}

Tout ce qui précède suffit pour faire tourner ça. Ce qui suit est le seul morceau des entrailles d'AnythingLLM qui vaille la peine d'être connu, parce qu'il explique pourquoi le script d'indexation fait quelque chose qui paraît sinon arbitraire.

### D'où vient cette mauvaise date {#where-that-wrong-date-comes-from}

Trois champs, et seulement trois, atteignent le modèle. Quoi qu'ait accepté l'API au moment de l'upload, AnythingLLM construit cet en-tête et le préfixe à **chaque** chunk :

<Terminal wrap={true}>
&lt;document_metadata&gt;
sourceDocument: Tabnine - AI Autocomplete & Chat for Javascript, Python, ... (published 2024-03-02)
published: 8/10/2026, 9:56:01 AM
source: https://www.avonture.be/blog/vscode-tabnine
&lt;/document_metadata&gt;
</Terminal>

`published` vient du collector : `published: createdDate(fullFilePath)`, obtenu par un stat sur le fichier temporaire qu'il vient de recevoir. Pas la `date` de votre frontmatter — le jour où vous avez lancé l'indexeur. Et `metadata.published` est silencieusement ignoré à l'upload, donc il n'y a aucun moyen de le corriger.

Il ne reste donc exactement que deux leviers, et c'est pourquoi le script actionne les deux : le titre porte la vraie date ajoutée sous la forme `(published YYYY-MM-DD)`, et `chunkSource` porte l'URL réelle parce qu'un préfixe `link://` est la seule chose qui se transforme en ligne `source:`. Tout le reste de ce que vous passez à l'upload — `docSource`, `description`, `docAuthor` — est stocké, récupérable via l'API, et jamais montré au modèle.

C'est aussi pourquoi le system prompt n'est pas une décoration optionnelle. Deux dates contradictoires se trouvent dans cet en-tête sur chaque chunk, et rien dans les données ne dit laquelle croire.

## Points clés à retenir {#key-takeaways}

La seule chose à retenir en prose : **les documents vivent là où tourne le container, pas là où se trouve le navigateur.** Tout le reste de cette page en découle — où le déployer, pourquoi il n'y a pas de case « indexer ce dossier », et pourquoi la voie de masse est l'API plutôt que l'interface graphique.

Le reste est de la matière à consulter, et voici les valeurs qui m'ont coûté un après-midi chacune :

<StepsCard
  variant="remember"
  title="Réglages qui cassent tout silencieusement quand ils sont faux"
  steps={[
    { content: "`EMBEDDING_MODEL_MAX_CHUNK_LENGTH=400` — doit rester sous le contexte de l'embedder (`ollama show <model>` ; 512 pour `mxbai-embed-large`). Au-dessus, **tous** les embeddings échouent et le workspace reste vide sans aucune erreur dans l'interface" },
    { content: "`OLLAMA_EMBEDDING_BATCH_SIZE=16` — pure vitesse ; la valeur par défaut de 1 envoie un chunk par appel HTTP" },
    { content: "`topN` = 20, dans *Workspace Settings → Vector Database* — la valeur par défaut de 4 répond aux questions portant sur tout le corpus à partir d'un seul article. Au-delà d'environ 20, ça n'apporte presque rien" },
    { content: "**System prompt du workspace** — pas optionnel : c'est lui qui tranche entre les deux dates contradictoires présentes dans chaque en-tête de chunk, et qui corrige le formatage des dates une fois pour toutes" },
    { content: "`\"mode\": \"query\"` dans chaque appel API — `\"chat\"` laisse le modèle répondre depuis ses connaissances générales et inventer des articles que vous n'avez jamais écrits" },
    { content: "**Un `sessionId` neuf à chaque appel** — sans ça, le modèle lit ses propres réponses précédentes, et une mauvaise réponse se répète à l'infini" },
    { content: "`ANYTHINGLLM_API_KEY` (*Settings → Tools → Developer API*), plus `AI_BLOG_DIR` et `AI_BLOG_SITE_URL` pour la fonction zsh" }
  ]}
/>

## Conclusion {#conclusion}

Ce qui a commencé par « je n'arrive jamais à retrouver cette config que j'ai notée quelque part » s'est transformé en une quantité vraiment modeste de travail Docker : un `compose.yaml`, pointé vers un modèle que je faisais déjà tourner pour autre chose. Ce qui vaut la peine d'être retenu, ce n'est pas le YAML — c'est la prise de conscience qu'un bouton « upload » d'interface web est une requête vers l'endroit où vit son serveur, et c'est exactement le détail qui décide si vos documents restent en place ou migrent discrètement vers une machine que vous n'aviez pas prévue. Une fois ça compris, l'installation sur deux machines n'était pas un compromis ; c'était juste la forme évidente dès lors que le GPU et les documents ne vivent pas au même endroit. Maintenant, chaque fois que je me surprends à vouloir faire `grep -r` en espérant, j'interroge le workspace à la place.

La leçon inconfortable, c'est l'autre : une stack RAG ne peut pas vous dire qu'elle est cassée. La mienne a indexé 248 articles sans une seule erreur, puis a nié avoir quoi que ce soit sur WordPress. Si vous ne retenez qu'une habitude de cet article, retenez le test de cosinus de trente secondes avant de faire confiance à un embedder — et si vous voulez que votre terminal réponde davantage à vos questions en local, la <Link to="/blog/ollama-git-precommit">famille `ai-review`, `ai-secrets` et `ai-commit`</Link> est d'où vient celle-ci. Le VPN maillé qui fait fonctionner l'installation sur deux machines depuis le bureau, c'est l'article que je vous dois ensuite.
