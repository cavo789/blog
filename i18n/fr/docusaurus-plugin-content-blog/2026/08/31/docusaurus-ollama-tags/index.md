---
slug: docusaurus-ollama-tags
title: Jouons avec Ollama - Créer un analyseur d'articles de blog avec un LLM local
description: "Un devcontainer Dockerisé avec deux scripts Python : le premier envoie chaque article Markdown à un modèle Ollama local pour générer des tags, le second compare ces tags entre les articles pour suggérer lesquels devraient se lier entre eux. Aucune API cloud, aucun tag manuel."
authors: [christophe, claude]
image: /img/v2/ollama_docusaurus_tags.webp
mainTag: ai
tags: [ai, docusaurus, ollama]
date: 2026-08-31
ai_assisted: true
blueskyRecordKey: 3mubxxg7g7s2t
---

![Jouons avec Ollama - Créer un analyseur d'articles de blog avec un LLM local](/img/v2/ollama_docusaurus_tags.webp)

<TLDR>
Un devcontainer qui fait tourner Ollama à côté de deux scripts Python : `01_generate_tags.py` lit chaque article Markdown dans `data/posts`, envoie son contenu à un modèle local et enregistre les tags générés dans un fichier JSON. `02_analyze_and_link.py` compare ensuite les tags entre les articles pour suggérer lesquels devraient être reliés, et indique la fréquence de chaque tag dans le corpus. Tout tourne en local — aucune API cloud, aucun tag manuel.
</TLDR>

Tagger ses articles à la main, ça ne passe pas à l'échelle — et repérer, parmi quelques centaines d'articles, ceux qui vont réellement ensemble non plus. Je voulais voir si un modèle local, avec pour seule entrée le Markdown brut, pouvait générer des tags corrects puis utiliser ces tags pour suggérer lui-même des liens internes.

<!-- truncate -->

<QuickJump
  links={[
    { label: "Le résultat en action", to: "#the-result" },
    { label: "Installation", to: "#installation" },
  ]}
/>

## Le résultat {#the-result}

Une fois les deux scripts exécutés, `output/all_articles_with_tags.json` contient les tags générés pour chaque article :

![Les tags générés](./images/the_generated_tags.webp)

Le deuxième script compare ensuite ces tags entre les articles. `suggested_interlinks.json` est la première sortie intéressante :

<Snippet source="./files/output/suggested_interlinks.json" defaultOpen={true} />

Les articles 002 et 004 sont correctement identifiés comme liés — ils parlent tous les deux de LLM locaux. Les articles 001 et 003 sont laissés de côté, puisqu'ils traitent de sujets sans rapport. Plutôt pas mal !

Le second fichier de sortie, `tag_analysis.json`, montre les tags et leur nombre d'occurrences dans les articles. Sur ce petit échantillon, « local LLMs » apparaît dans deux articles (002 et 004) alors que tous les autres tags n'apparaissent qu'une seule fois :

<Snippet source="./files/output/tag_analysis.json" defaultOpen={true} />

## Pourquoi ça fonctionne {#why-it-works}

- Un script par responsabilité : le premier script ne parle qu'au LLM et produit des tags ; le second se contente de lire ces tags et de calculer les relations — aucun script ne fait les deux.
- Les tags sont le seul signal utilisé pour les liens. Deux articles partageant un tag sont considérés comme liés ; plus ils partagent de tags, plus la suggestion est forte.
- Rien ici n'est spécifique à Docusaurus — remplacez `data/posts` par n'importe quel dossier de fichiers Markdown et les deux mêmes scripts produisent le même type d'analyse.

## Installation {#installation}

### Copier la structure de répertoires et les fichiers {#copy-the-directory-structure-and-files}

Lancez la commande suivante dans votre terminal pour copier la structure de répertoires et les fichiers de ce tutoriel :

<ProjectSetup folderName="/tmp/tags" createFolder={true} >
  <Guideline>
  </Guideline>
  <Snippet filename=".devcontainer/devcontainer.json" source="./files/.devcontainer/devcontainer.json" />
  <Snippet filename=".devcontainer/Dockerfile" source="./files/.devcontainer/Dockerfile" />
  <Snippet filename="data/posts/001-intro-to-docker.md" source="./files/data/posts/001-intro-to-docker.txt" />
  <Snippet filename="data/posts/002-getting-started-with-ollama.md" source="./files/data/posts/002-getting-started-with-ollama.txt" />
  <Snippet filename="data/posts/003-advanced-python.md" source="./files/data/posts/003-advanced-python.txt" />
  <Snippet filename="data/posts/004-local-llms-future.md" source="./files/data/posts/004-local-llms-future.txt" />
  <Snippet filename="output/all_articles_with_tags.json" source="./files/output/all_articles_with_tags.json" />
  <Snippet filename="scripts/01_generate_tags.py" source="./files/scripts/01_generate_tags.py" />
  <Snippet filename="scripts/02_analyze_and_link.py" source="./files/scripts/02_analyze_and_link.py" />
  <Snippet filename="compose.yaml" source="./files/compose.yaml" />
  <Snippet filename="requirements.txt" source="./files/requirements.txt" />
</ProjectSetup>

Une fois terminé, lancez `code .` pour ouvrir le répertoire courant dans Visual Studio Code puis appuyez sur <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>P</kbd> et choisissez `Devcontainers: Reopen in Container` pour ouvrir le projet dans un container de développement.

Le build du container et l'installation des dépendances prendront quelques minutes. Une fois le devcontainer démarré, vous verrez dans Docker Desktop que les deux containers tournent :

![Les containers tournent](./images/containers_are_running.webp)

### Télécharger le modèle LLM {#download-the-llm-model}

Revenez ensuite à votre terminal (sur votre host) et lancez la commande suivante pour télécharger le modèle LLM :

<Terminal wrap={true}>
$ docker exec -it tags-ollama-1 ollama pull llama3:8b
</Terminal>

![Télécharger le modèle LLM](./images/download_the_llm_model.webp)

### Tester le service Ollama {#test-the-ollama-service}

Nous venons de télécharger le modèle LLM, vérifions maintenant que le service Ollama fonctionne correctement. Lancez la commande suivante dans votre terminal (sur votre host) :

<Terminal wrap={true}>
$ curl --silent http://localhost:11444/api/tags | jq
</Terminal>

![Test du service Ollama](./images/testing_ollama_tags.webp)

<AlertBox variant="note" title="Si vous n'avez pas jq">
La commande `jq` sert à formater la sortie JSON pour la rendre plus lisible. Si `jq` n'est pas installé chez vous, consultez <Link to="/blog/linux-jq">The jq utility for Linux</Link> pour apprendre à l'installer et à l'utiliser, ou lancez simplement la commande `curl` sans lui pour voir la réponse JSON brute.
</AlertBox>

```bash
curl --silent http://localhost:11444/api/generate \
  -d '{\
    "model": "llama3:8b", \
    "prompt": "Explain in one sentence why Docker is so amazing.", \
    "stream": false \
  }' | jq .response
```

![Pourquoi Docker est génial ?](./images/docker_is_great.webp)

Le service fonctionne, et on voit que l'endpoint `tags` est disponible. C'est cet endpoint que nos scripts Python utiliseront pour envoyer le contenu des articles et récupérer les tags générés.

## Autres démos {#more-demos}

### Lancer le script de génération de tags {#run-the-tag-generation-script}

Retournez dans Visual Studio Code, ouvrez le terminal (dans VSCode) et exécutez le fichier `scripts/01_generate_tags.py`. Ce script lit tous les fichiers markdown du répertoire `data/posts`, envoie leur contenu au modèle LLM qui tourne dans le container, et enregistre les tags générés dans un fichier JSON.

![Exécution du script de génération de tags](./images/running_01_generate_tags.webp)

Et effectivement, vous constatez que le fichier `output/all_articles_with_tags.json` a été créé — les tags montrés plus haut dans « Le résultat » sont exactement ce que cette exécution a produit.

<AlertBox variant="info" title="Port de l'host vs port du container">
Remarquez que `scripts/01_generate_tags.py` appelle `http://ollama:11434/api/generate`, et non `http://ollama:11444/api/generate` comme les commandes `curl` ci-dessus.

**Sur votre host**, `curl` doit utiliser `11444` — le port publié par `compose.yaml` (`"11444:11434"`). Mais `01_generate_tags.py` tourne **à l'intérieur du container `app`**, sur le même réseau Docker Compose qu'`ollama`. De là, `11444` n'existe pas : sur ce réseau, les containers se joignent via le port du container lui-même, `11434`. Mélanger le nom du service (résolvable uniquement à l'intérieur du réseau Compose) et le port publié sur l'host est un piège classique, et ça se termine par un `Connection refused`.
</AlertBox>

### Lancer le script d'analyse et de liens {#run-the-analyze-and-link-script}

Le second script, `scripts/02_analyze_and_link.py`, lit les tags générés depuis ce fichier JSON et produit les fichiers `suggested_interlinks.json` et `tag_analysis.json` montrés plus haut.

![Exécution du script d'analyse et de liens](./images/running_02_analyze_and_link.webp)

## Sous le capot (à sauter si vous voulez juste l'utiliser) {#under-the-hood-skip-this-if-you-just-want-to-use-it}

### Choisir le bon modèle {#choosing-the-right-model}

Dans cet article, j'ai pris `llama3:8b` comme point de départ. Mais la vraie force d'Ollama, c'est la possibilité de changer de « cerveau » selon la tâche. Le registre Ollama propose une immense bibliothèque de modèles, mais le bon choix dépend de votre matériel — en particulier de votre RAM et de votre GPU.

#### Comparaison des modèles en un coup d'œil {#model-comparison-at-a-glance}

| Modèle | Cas d'usage idéal | Avantages | Inconvénients | Matériel requis |
| :--- | :--- | :--- | :--- | :--- |
| **Llama 3 (8B)** | Discussion informelle, scripts simples, tâches rapides. | Extrêmement rapide, léger, tourne presque partout. | Capacité de raisonnement plus faible sur la logique complexe. | ~8 Go de RAM |
| **Mistral (7B)** | Code, écriture créative, raisonnement général. | Souvent plus « humain » et plus concis. | Peut être moins rigoureux que Llama 3 sur les données structurées. | ~8 Go de RAM |
| **Llama 3 (70B)** | Analyse approfondie, code complexe, raisonnement lourd. | Intelligence proche de l'humain, très peu d'hallucinations. | Gourmand en ressources ; génération plus lente. | ~48 Go de RAM et plus |

#### Lequel choisir ? {#which-one-should-you-pick}

- **Prenez `llama3:8b`** si vous débutez ou si votre RAM est limitée. Il est parfait pour du prototypage rapide et des tâches d'automatisation simples qui ne demandent pas de raisonnement logique poussé.
- **Essayez `mistral`** si vous trouvez les réponses de Llama 3 un peu trop rigides. Beaucoup de développeurs préfèrent Mistral pour son côté créatif et son efficacité. C'est un excellent modèle « du quotidien » pour l'aide au code en général.
- **Passez à `llama3:70b`** si vous faites des tâches qui exigent une grande précision — refactoring de bases de code complexes, débogage logique poussé, ou traitement de gros jeux de données où la justesse est critique. Ce modèle étant énorme, il réduit fortement les « hallucinations », ce qui en fait le choix le plus fiable pour un travail professionnel.

#### Télécharger vos modèles {#downloading-your-models}

Vous pouvez ajouter n'importe lequel de ces modèles à votre environnement local immédiatement. Lancez simplement les commandes suivantes dans votre terminal :

**Pour récupérer le modèle standard Llama 3 (8B) :**

<Terminal wrap={true}>
$ docker exec -it tags-ollama-1 ollama pull llama3:8b
</Terminal>

**Pour récupérer le très performant Llama 3 (70B) :**

<Terminal wrap={true}>
$ docker exec -it tags-ollama-1 ollama pull llama3:70b
</Terminal>

**Pour récupérer le modèle Mistral :**

<Terminal wrap={true}>
$ docker exec -it tags-ollama-1 ollama pull mistral
</Terminal>

> **Note :** le modèle `70b` est bien plus gros (~40 Go). Assurez-vous d'avoir assez d'espace disque et, surtout, au moins 48 Go de RAM disponibles pour que le modèle tourne sans ralentir votre système.

<AlertBox variant="tip" title="Pas assez de RAM ?">
Sur ma machine avec 64 Go de RAM, je peux faire tourner le modèle `70b`, mais il consomme beaucoup de ressources. Avec moins de RAM, mieux vaut rester sur `8b` ou `mistral` pour une expérience plus fluide.
</AlertBox>

## Conclusion {#conclusion}

Deux petits scripts Python et un modèle local ont transformé un dossier d'articles Markdown en un index de tags et une série de suggestions de liens internes — aucune API cloud, aucun tag manuel, et rien dans ce pipeline n'est spécifique à Docusaurus. Faites pointer `data/posts` vers n'importe quel dossier de fichiers Markdown et les deux mêmes scripts feront le même travail.

Transformer une suggestion du type « les articles 002 et 004 sont liés » en un vrai `<Link>` dans le texte reste ici une étape manuelle — la suite logique, c'est que le second script propose la phrase exacte et le texte du lien, et pas seulement la paire de fichiers.
