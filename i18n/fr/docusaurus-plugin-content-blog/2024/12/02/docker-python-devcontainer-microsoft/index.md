---
slug: docker-python-devcontainer-microsoft
title: Docker - Une installation de Python encore plus simple
date: 2024-12-02
description: Simplifiez votre développement Python. Ce guide montre comment utiliser Docker et les Devcontainers de Microsoft pour un environnement Python incroyablement facile à mettre en place et reproductible.
authors: [christophe]
image: /img/v2/devcontainer.webp
series: Coding using a devcontainer
mainTag: python
tags:
  - devcontainer
  - docker
  - python
language: fr
updates:
  - date: 2026-07-30
    note: "Updated Python version example from 3.12-bullseye to 3.13-bookworm (current stable; Debian 12 Bookworm is now the default base)."
---
![Docker - Une installation de Python encore plus simple](/img/v2/devcontainer.webp)

<!-- cspell:ignore substeps -->

<TLDR>
Cet article montre la méthode la plus rapide à ce jour pour obtenir un devcontainer Python : avec Docker et l'extension Docker de VSCode installés, utilisez l'assistant intégré « Dev Containers: Add Dev Container Configuration files... » de la Command Palette pour générer automatiquement `.devcontainer/devcontainer.json` pour Python, puis cliquez sur « Reopen in Container » — aucun fichier à créer à la main.
</TLDR>

Rien à installer, rien à configurer, rien à créer au préalable.

Dans <Link to="/blog/docker-python-devcontainer">un article précédent</Link> (et sa <Link to="/blog/docker-python-devcontainer-windows">suite spécifique à Windows</Link>), j'ai écrit à la main les fichiers `Dockerfile`, `compose.yaml` et `devcontainer.json`. Il s'avère que VSCode peut tout générer pour vous.

Voici comment utiliser VSCode et Docker pour créer un environnement Python prêt à l'emploi, que vous soyez sous Windows, Linux ou Mac.

*L'assistant est la voie la plus rapide, mais écrire les fichiers vous-même est ce qui vous permet de contrôler exactement ce qui entre dans l'image — et de garder les outils de développement hors de la production, comme expliqué dans <Link to="/blog/docker-prod-devcontainer">One Docker Image for Production and Devcontainers - The Clean Way</Link>.*

<StepsCard
  title="Les seuls prérequis sont :"
  variant="prerequisites"
  steps={[
    "Vous devez avoir Docker installé sur votre système",
    "Vous devez avoir Visual Studio Code",
    "Vous avez installé l'extension <a href=\"https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-docker\">Docker for Visual Studio Code</a> dans VSCode",
  ]}
/>

<!-- truncate -->

Voici le résultat. Une fois le devcontainer démarré, créez un nouveau fichier appelé `main.py` avec cette ligne `print("Hello from your Python Devcontainer!")`.

Sauvegardez le fichier.

Cliquez dans le terminal et tapez `python main.py` pour exécuter le script et tadaaa :

![Exécution du script](./images/running_the_script.webp)

Un environnement Python fonctionnel, terminal et interpréteur prêts, et pas un seul fichier créé à la main. Voici comment VSCode le construit pour vous.

<StepsCard
  title="Si vous avez ces trois choses, faites simplement ceci :"
  variant="steps"
  steps={[
    'Démarrez Visual Studio Code',
    'Appuyez sur <kbd>CTRL</kbd>+<kbd>SHIFT</kbd>+<kbd>P</kbd> pour ouvrir la Command Palette.',
    'Sélectionnez **Dev Containers: Add Dev Container Configuration files...**',
    {
      content: "Et suivez l'assistant :",
      substeps: [
        "Cherchez **Python**",
        "Sélectionnez la version la plus récente de Python, actuellement `3.13-bookworm`",
        "Pas besoin d'installer de fonctionnalités supplémentaires, appuyez juste sur <kbd>Enter</kbd>",
        "Idem pour les fichiers optionnels ; pas nécessaires, appuyez juste sur <kbd>Enter</kbd>"
      ]
    }
  ]}
/>

Cela fait, VSCode va créer un fichier appelé `.devcontainer/devcontainer.json`.

![VSCode a créé le fichier .devcontainer/devcontainer.json](./images/devcontainer_created.webp)

Regardez en bas à droite, cliquez sur le bouton `Reopen in Container`.

Selon la vitesse de votre ordinateur et si les éléments ont déjà été téléchargés, vous obtiendrez cet écran :

![VSCode et son terminal](./images/terminal.webp)

Regardez la partie inférieure : une fenêtre de terminal s'est affichée et vous avez un prompt affichant `vscode -> /workspaces/python $`.

Cliquez dans le terminal et tapez `python --version` :

![Version](./images/version.webp)
