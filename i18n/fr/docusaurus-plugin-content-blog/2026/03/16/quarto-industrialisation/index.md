---
slug: quarto-industrialisation
title: Quarto - Comment j'ai construit un écosystème auto-documenté pour plus de 50 projets
description: Plongée dans la conception d'un écosystème de documentation entièrement automatisé avec Quarto et Docker, transformant la documentation en un pipeline de build performant.
image: /img/v2/quarto-industrialisation.webp
series: Discovering Quarto
mainTag: doc-as-code
tags: [doc-as-code, quarto, docker, python, markdown, devcontainer, api]
authors: [christophe]
language: fr
ai_assisted: true
date: 2026-03-16
blueskyRecordKey: 3mh5um7gpgs2x
---
![Quarto - Comment j'ai construit un écosystème auto-documenté pour plus de 50 projets](/img/v2/quarto-industrialisation.webp)

<TLDR>
Cet article explique comment j'ai construit un écosystème auto-documenté pour plus de 50 projets avec Quarto et Docker : la documentation est automatisée et reste alignée avec le code.
</TLDR>

En tant que développeur, j'aime écrire du code et de la documentation, mais soyons honnêtes : garder une documentation à jour est difficile. À la seconde où vous l'écrivez, elle devient obsolète. C'est un problème que j'ai rencontré encore et encore au cours de ma carrière. Je voulais trouver un moyen d'automatiser la documentation, pour qu'elle reflète toujours l'état réel du code.

Vous construisez une belle API, vous écrivez un manuel, puis… vous modifiez votre code. La structure de la réponse n'est plus la même, le message d'erreur a changé, vous avez publié une v1.1 alors que votre documentation parlait encore de la v1.0, et ainsi de suite.

Que faire pour résoudre ce problème ? Peut-on automatiser la documentation ? Peut-on la rendre auto-actualisante ? Peut-on faire en sorte que ma documentation change quand mon code change ? Réponse courte : oui. Et c'est exactement ce que j'ai fait avec [Quarto](https://quarto.org/).

Voyons comment industrialiser notre documentation avec Quarto et Docker, en créant un écosystème auto-documenté qui passe à l'échelle sur plusieurs projets.

<!-- truncate -->

<QuickJump
  links={[
    { label: 'Le moment « Wow »', to: "#-the-wow-moment" },
    { label: "Installation — Le labo « Wow »", to: "#installation--the-wow-lab-build-your-first-doc-engine-in-5-minutes" },
  ]}
/>

## 🚀 Le moment « Wow » {#-the-wow-moment}

Une fois le labo en route (voir la section Installation plus bas), ouvrez le dossier dans VS Code, cliquez sur **"Reopen in Container"**, puis tapez dans le terminal : `./scripts/preview.sh`.

Vous obtiendrez quelque chose comme ceci :

![Script de prévisualisation](./images/devcontainer.webp)

Faites un `Ctrl + Click` sur l'URL (`http://localhost:`<Var name="port">4242</Var>) : votre navigateur s'ouvre avec le document Quarto rendu. Vous devriez voir les diagrammes Mermaid générés par nos scripts Python.

<BrowserWindow url="http://localhost:%%port=4242%%">
  ![Carte d'infrastructure automatisée](./images/automated_infrastructure_map.webp)
</BrowserWindow>

Sympa, non ? Mais d'où vient ce diagramme ? Il est généré par la fonction `render_project_arch()` de notre script `project_viz.py`. Ce script lit notre `compose.yaml` et notre `Dockerfile` pour comprendre la structure du projet, puis génère un diagramme Mermaid à partir de ça.

Regardons la sortie de notre script `file_stats.py`. Il analyse les fichiers du projet et produit un rapport rendu directement dans le document Quarto.

![Statistiques de fichiers](./images/file_stats.webp)

Et c'est en temps réel. Ajoutez un nouveau fichier au projet, sauvegardez, rafraîchissez le navigateur : le fichier apparaît dans les stats et le diagramme d'architecture se met à jour.

Le script `my_feature.py` génère un diagramme Mermaid simple à partir d'une liste d'éléments. Modifiez la liste dans le script, sauvegardez, et voyez le diagramme se mettre à jour en direct.

![My Feature](./images/my_feature.webp)

Enfin, le script `call_api.py` permet d'appeler une API en direct pendant le rendu. Vous pouvez donc récupérer de vraies données de votre environnement de production ou de staging et les inclure dans votre documentation, tout en gardant vos identifiants à l'abri grâce au Secrets Resolver.

![Appel d'API](./images/call_api.webp)

## Pourquoi ça fonctionne {#why-it-works}

Beaucoup pensent que le Doc-as-Code, c'est juste « mettre du Markdown dans Git ». Faux. Il s'agit d'**exécution au runtime**.

- Un document Quarto n'est pas du Markdown statique : un bloc de code `{python}` intégré au document **s'exécute pendant le rendu**, pas avant.
- `output: asis` dit à Quarto de traiter ce que la fonction Python affiche comme du Markdown brut (ou du Mermaid) plutôt que comme du texte littéral — une fonction qui retourne un diagramme devient donc un diagramme rendu, pas un listing de code.
- Comme le diagramme est généré à partir du `compose.yaml` et du `Dockerfile` *réels*, modifier l'infrastructure puis relancer le rendu met à jour le diagramme automatiquement — plus jamais de redessin manuel.

## Installation — Le labo « Wow » : construisez votre premier moteur de doc en 5 minutes {#installation--the-wow-lab-build-your-first-doc-engine-in-5-minutes}

Voici une configuration concrète, prête à l'emploi. Ce Dockerfile crée un environnement où Quarto peut « discuter » avec des scripts Python personnalisés pour générer des diagrammes Mermaid à la volée. *La partie Python-vers-Mermaid est détaillée à part dans <Link to="/blog/docker-python-mermaid">Documentation as Code - Transform Your Infrastructure into Beautiful Diagrams with Python and Mermaid</Link> ; ici, on la branche sur Quarto.*

### 1. L'orchestrateur (compose.yaml) {#1-the-orchestrator-composeyaml}

<Vars port="4242" labels={{ port: "Port de l'hôte" }} />

<Snippet filename="compose.yaml" source="./files/compose.yaml" defaultOpen={false} />

### 2. Le moteur (`Dockerfile`) {#2-the-engine-dockerfile}

On installe Quarto et on configure le `PYTHONPATH` pour que notre document puisse importer notre bibliothèque « Feature » maison depuis n'importe où.

<Snippet filename="Dockerfile" source="./files/Dockerfile" defaultOpen={false} />

### 3. L'expérience (.devcontainer/devcontainer.json) {#3-the-experience-devcontainerdevcontainerjson}

C'est ici que la magie opère. On indique à VS Code quelles extensions installer et comment se comporter. *<Link to="/blog/quarto-devcontainer">Make your Quarto project Devcontainer-Ready — No More Setup Headaches</Link> parcourt ce fichier ligne par ligne.*

<Snippet filename=".devcontainer/devcontainer.json" source="./files/.devcontainer/devcontainer.json" defaultOpen={false} />

### 4. Nos scripts Python {#4-our-python-scripts}

On va utiliser quelques scripts Python simples pour générer le contenu de la documentation. Par exemple, `my_feature.py` contient une fonction qui génère un diagramme Mermaid à partir d'une liste d'éléments, `file_stats.py` analyse les fichiers du projet et produit un rapport, et `project_viz.py` crée une représentation visuelle de la structure du projet.

<Snippet filename="scripts/call_api.py" source="./files/scripts/call_api.py" defaultOpen={false} />
<Snippet filename="scripts/file_stats.py" source="./files/scripts/file_stats.py" defaultOpen={false} />
<Snippet filename="scripts/my_feature.py" source="./files/scripts/my_feature.py" defaultOpen={false} />
<Snippet filename="scripts/project_viz.py" source="./files/scripts/project_viz.py" defaultOpen={false} />

### 5. Le document (`index.qmd`) {#5-the-document-indexqmd}

C'est ici qu'on écrit notre document Quarto. Au lieu de Markdown statique, on peut exécuter du code Python directement dans le document pour générer du contenu dynamique. Par exemple, on peut appeler notre script `my_feature.py` pour générer un diagramme Mermaid basé sur l'état actuel du code.

<Snippet filename="index.qmd" source="./files/index.txt" defaultOpen={false} />

Vous voyez les trois blocs `{python}` dans le document ? C'est là que la magie opère. C'est là qu'on exécute notre code Python. La sortie de ce code est rendue directement dans le document.

Quand Quarto rencontre le bloc ci-dessous, il exécute la fonction `render_project_arch()` de notre script `project_viz.py` (cette feature doit être présente dans le `PYTHONPATH`). La fonction génère un diagramme Mermaid basé sur l'état actuel du projet, et Quarto le rend directement dans le document.

````markdown
```{python}
#| echo: false
#| output: asis
from project_viz import render_project_arch
render_project_arch()
```
````

L'option `output: asis` dit à Quarto de traiter la sortie comme du Markdown brut. Autrement dit, si notre script Python sort un diagramme Mermaid, Quarto le rend comme un diagramme au lieu d'afficher simplement le code.

### Le projet complet {#the-full-project}

Voici la structure complète du projet. Vous pouvez copier cette configuration et la lancer sur votre machine pour voir comment ça marche en pratique. Le plus simple : cliquez sur le bouton `Generate install script` puis sur le bouton `Copy`. Ouvrez un terminal et collez la commande. Elle créera un dossier `/tmp/quarto_industrialisation` avec tous les fichiers et le setup Docker prêt à l'emploi.

<ProjectSetup folderName="/tmp/quarto_industrialisation" createFolder={true} >
  <Guideline>
    Lancez maintenant vscode avec `code .` et choisissez **Reopen in Container** quand la question vous est posée. Dans le terminal, exécutez `./scripts/preview.sh` et ouvrez le lien dans votre navigateur. Modifiez la liste dans `my_feature.py` et regardez le diagramme se mettre à jour en temps réel.
  </Guideline>
  <Snippet filename=".devcontainer/devcontainer.json" source="./files/.devcontainer/devcontainer.json" />
  <Snippet filename="scripts/call_api.py" source="./files/scripts/call_api.py" defaultOpen={false} />
  <Snippet filename="scripts/file_stats.py" source="./files/scripts/file_stats.py" />
  <Snippet filename="scripts/my_feature.py" source="./files/scripts/my_feature.py" />
  <Snippet filename="scripts/project_viz.py" source="./files/scripts/project_viz.py" />
  <Snippet filename="scripts/preview.sh" source="./files/scripts/preview.sh" />
  <Snippet filename="compose.yaml" source="./files/compose.yaml" />
  <Snippet filename="Dockerfile" source="./files/Dockerfile" />
  <Snippet filename="index.qmd" source="./files/index.txt" />
</ProjectSetup>

## Mon cas d'usage réel {#my-real-use-case}

Dans mon écosystème de 50 projets, j'ai repris ce concept de « labo » pour en faire une **image de base WritingDoc** de qualité industrielle.

La plupart des setups de documentation partent d'une image « minimale ». C'est une erreur. « Minimal » veut dire « démarrage lent ». J'ai fait l'inverse. Mon image est un monstre de 2,5 Go, mais elle suit une **philosophie « Zero-Wait »**.

J'ai tout intégré dedans : Quarto, Python, Node.js, Mermaid-CLI, et tous les linters imaginables. Quand un rédacteur ouvre un projet dans un DevContainer VS Code, il n'attend ni `apt-get` ni `pip install`. L'environnement est vivant et prêt dès l'ouverture de la fenêtre. Pour la version accessible aux débutants de cette idée, voyez <Link to="/blog/quarto-devcontainer">Rendez votre projet Quarto Devcontainer-Ready</Link> — cet écosystème, c'est le même principe poussé à 50 projets.

### Doc-as-Code : la magie de l'AST Python {#doc-as-code-the-python-ast-magic}

Le vrai facteur « Wow » a commencé quand j'ai arrêté de copier-coller du code dans du Markdown. J'ai écrit une suite de « Features » Python qui utilisent l'analyse **AST (Abstract Syntax Tree)** pour lire mon code source.

En réalité, j'ai plus de 40 « Features » différentes capables d'analyser mon code, d'en extraire des informations et de générer de la documentation automatiquement.

![Plus de 40 « Features » différentes capables d'analyser mon code, d'en extraire des informations et de générer de la documentation automatiquement.](./images/having_more_than_40_features.webp)

Quelques exemples de ces features :

<div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '1rem', margin: '1.5rem 0'}}>

<Card shadow="md">
<div className="card__header"><h4>🧠 Analyseurs sémantiques AST Python</h4></div>
<div className="card__body">Réalisent une analyse d'arbre syntaxique abstrait du code source pour en extraire la logique <em>sans l'exécuter</em>. Génèrent automatiquement des diagrammes UML, des tableaux d'API et des dictionnaires de données qui restent synchronisés avec le code.</div>
</Card>

<Card shadow="md">
<div className="card__header"><h4>🗄️ Introspection de base de données en direct</h4></div>
<div className="card__body">Se connecte à une instance PostgreSQL vivante pour générer des diagrammes ERD en temps réel (Mermaid), des flux de domaines fonctionnels et des dictionnaires de données complets avec aperçu des données.</div>
</Card>

<Card shadow="md">
<div className="card__header"><h4>🎨 Moteur Mermaid conscient du format</h4></div>
<div className="card__body">Détecte la cible de rendu (HTML → SVG, PDF/Word → PNG via Puppeteer à 300 DPI). Inclut un système de cache basé sur des empreintes pour ignorer les diagrammes inchangés.</div>
</Card>

<Card shadow="md">
<div className="card__header"><h4>🔐 Orchestrateur d'API authentifiées sécurisé</h4></div>
<div className="card__body">Récupère des données en direct depuis des environnements protégés pendant le rendu. Gère tout le handshake OAuth2/Bearer et utilise un <strong>Secrets Resolver</strong> (préfixe <code>env:</code>) pour que les identifiants ne touchent jamais Git.</div>
</Card>

<Card shadow="md">
<div className="card__header"><h4>🖥️ Capture de terminal haute fidélité</h4></div>
<div className="card__body">Capture une véritable exécution CLI dans une image SVG vectorielle, en préservant les couleurs ANSI, les bordures ASCII et l'intégrité de la mise en page sur les sorties HTML, PDF et Word.</div>
</Card>

<Card shadow="md">
<div className="card__header"><h4>⚙️ Cartographe d'infrastructure GitLab CI/CD</h4></div>
<div className="card__body">Reconstruit le pipeline effectif en résolvant les <code>includes</code> et <code>extends</code> récursifs. Génère une architecture visuelle des étapes CI/CD avec des descriptions de jobs lisibles.</div>
</Card>

<Card shadow="md">
<div className="card__header"><h4>🐳 Visualiseurs d'écosystème Docker</h4></div>
<div className="card__body">Cartographient les chaînes d'héritage des images, la topologie des services (ports, réseaux, volumes) et les séquences de build multi-stage en diagrammes clairs et compréhensibles.</div>
</Card>

<Card shadow="md">
<div className="card__header"><h4>📋 Tableau de bord des TODO « invisibles »</h4></div>
<div className="card__body">Scanne les commentaires HTML cachés (<code>&lt;!-- TODO: --&gt;</code>) dans tout le projet pour générer un backlog interne consolidé — invisible dans l'export PDF ou Word final destiné au client.</div>
</Card>

<Card shadow="md">
<div className="card__header"><h4>✨ Assistant de workspace dynamique</h4></div>
<div className="card__body">Gère automatiquement la sidebar Quarto selon la structure des fichiers et fournit en temps réel des snippets IntelliSense VS Code pour chaque variable et chaque script utilitaire du projet.</div>
</Card>

<Card shadow="md">
<div className="card__header"><h4>📊 Visualiseur de données multi-formats intelligent</h4></div>
<div className="card__body">Un moteur de rendu polymorphe pour CSV, JSON et XML. Gère les tableaux de comparaison horizontaux et les vues de détail verticales, avec sélection de nœuds en profondeur (XPath/notation pointée) et cache TTL.</div>
</Card>

<Card shadow="md">
<div className="card__header"><h4>🏗️ Générateur de projet conscient du langage</h4></div>
<div className="card__body">Utilise un système de tags par sous-ensembles (<code>file.python.fastapi.qmd</code>) pour générer instantanément une structure de documentation complète et adaptée aux technologies du projet.</div>
</Card>

</div>

### Visualiser l'invisible : Mermaid & cache {#visualizing-the-invisible-mermaid--caching}

Quarto sait rendre Mermaid.js quand la documentation est produite sous forme de site web, mais ça ne fonctionne pas pour les sorties hors ligne comme Word ou PDF.

J'ai résolu ça en construisant un **Advanced Mermaid Renderer**. Chez moi, le moteur de rendu est conscient du format. Si vous consultez la prévisualisation HTML, il sert des SVG nets. Si vous générez un `.docx` pour un décideur métier, il démarre automatiquement une instance Chromium headless (via Puppeteer), rend le diagramme à 300 DPI et intègre un PNG haute résolution.

Et comme je déteste attendre, j'ai implémenté un **système de cache basé sur le contenu**. Chaque diagramme et chaque snapshot d'API a son empreinte. Si la source n'a pas changé, le build saute le gros du travail et récupère l'image depuis le cache. Mes temps de build sont passés de plusieurs minutes à quelques secondes.

### La documentation « vivante » : appels d'API authentifiés {#the-living-documentation-authenticated-api-calls}

Je voulais que ma documentation soit une fenêtre sur le système en production. J'ai donc construit une feature capable d'effectuer de **vrais appels d'API REST pendant le rendu**.

Elle gère tout le handshake OAuth2 : elle interroge le serveur d'authentification, obtient un token Bearer, récupère les dernières données et masque les secrets avant d'afficher une « trace terminal » dans la documentation.

Inquiet pour la sécurité ? J'ai écrit un **Secrets Resolver** maison. En utilisant un préfixe `env:` dans mes fichiers Quarto, je peux récupérer des identifiants depuis un fichier `.secrets` local qui n'est jamais commité dans Git. Le framework les résout au runtime et les masque dans tous les fichiers de log. De la sécurité de niveau entreprise pour du Markdown.

### L'assistant « invisible » : daemons en arrière-plan & snippets {#the-invisible-assistant-background-daemons--snippets}

Je me suis rendu compte que, malgré toute cette automatisation, les rédacteurs devaient encore se souvenir des noms de variables ou des signatures de scripts. Pour corriger ça, j'ai créé le **WritingDoc Assistant**. C'est un **daemon** Python qui tourne en arrière-plan dans le container.

Il surveille mon `_variables.yml` et mon répertoire `features/`. Dès que je sauvegarde une modification, le daemon se réveille et génère des **snippets IntelliSense VS Code** à la volée.

- Je tape `v-` et j'obtiens la liste de toutes les variables du projet avec leur valeur actuelle.
- Je tape `feature-` et j'obtiens la liste de tous les scripts d'automatisation avec leur documentation complète.
- Je tape `r-` et il a déjà scanné tous mes fichiers pour me proposer des références croisées vers chaque titre et chaque figure du projet.

C'est comme avoir un bibliothécaire dédié qui vit dans mon éditeur et observe chacun de mes gestes pour me simplifier la vie.

Le daemon est démarré dans mon Devcontainer via la commande `nohup`, ce qui garantit qu'il tourne en arrière-plan sans bloquer le processus principal. Il surveille les changements en continu et met à jour les snippets en temps réel, pour une expérience toujours à jour. C'est un vrai bond en productivité.

### Centralisation à grande échelle {#centralization-at-scale}

Passer à 50 projets impliquait de ne pas avoir 50 configurations différentes. J'ai tout centralisé :

- **`_variables.yml`** : le « cerveau » du projet. Chaque nom, chaque lien, chaque réglage est ici. C'est la source unique de vérité.
- **`update_chapters.py`** : un script que j'ai écrit pour maintenir la sidebar Quarto. Il respecte la numérotation des dossiers et ignore les dossiers « draft », pour une table des matières parfaite à chaque fois.
- **Le glossaire** : un seul fichier YAML qui génère un glossaire alphabétique, avec ancres, sur l'ensemble du site.
- **Les références globales** : un fichier central pour toutes les URL externes, pour ne jamais chercher deux fois le même lien.

### Le résultat {#the-result}

Aujourd'hui, quand je démarre un nouveau projet, je lance une seule commande : `scaffold`. En quelques secondes, j'ai une structure complète adaptée à ma stack.

La documentation n'est plus un monument statique dédié au passé. C'est un reflet vivant du code. C'est rapide, c'est sécurisé, et c'est beau.

Voilà la puissance de la **documentation ingénierée**. On ne se contente plus d'écrire ; on compile notre savoir.

## 🎖️ Un dernier mot : pourquoi Quarto change tout {#️-a-final-word-why-quarto-changes-everything}

Rien de tout ça ne serait possible sans le travail visionnaire des développeurs derrière Quarto.

L'équipe Quarto a eu l'intelligence et la clairvoyance de construire quelque chose de différent : un pont entre le récit et l'exécution.

En nous permettant d'exécuter du vrai code (Python, R, Julia) directement dans le cycle de vie du document, ils ne nous ont pas simplement offert une meilleure version de [Pandoc](https://pandoc.org/). Ils nous ont donné un moteur de documentation extensible. C'est précisément cette capacité — lancer un script, analyser une API ou scanner un système de fichiers pendant le build — qui m'a permis de construire l'écosystème « WritingDoc ».

Aux développeurs de Quarto : **merci pour votre travail extraordinaire** et pour avoir offert au monde un outil open source qui permet enfin aux rédacteurs techniques de travailler comme des ingénieurs logiciels. Vous avez transformé la « corvée » de la documentation en une discipline d'ingénierie haute fidélité.
