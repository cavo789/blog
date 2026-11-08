---
slug: markitdown
title: Markitdown - Convertir des fichiers et des documents MS Office en Markdown
date: 2026-05-04
description: Convertissez facilement vos documents MS Office (Word, Excel) et vos PDF en Markdown avec l'outil Markitdown de Microsoft. Avec les instructions pas à pas pour l'installer via Docker.
authors: [christophe]
image: /img/v2/markdown.webp
mainTag: markdown
tags:
  - docker
  - excel
  - markdown
language: fr
updates:
  - date: 2026-07-30
    note: "markitdown updated from v0.1.5 to v0.1.7; Dockerfile and AlertBox version reference updated."
  - date: 2026-11-08
    note: "md-convert is now a shell function for zsh and bash (~/.zsh/fns or ~/.bash/fns), the Dockerfile lives in ~/tools/markitdown; compose.yaml is gone."
blueskyRecordKey: 3mkzumi3cf22g
---
![Markitdown - Convertir des fichiers et des documents MS Office en Markdown](/img/v2/markdown.webp)

<!-- cspell:ignore markitdown -->

<TLDR>Cet article explore l'utilisation de Markitdown, l'utilitaire de Microsoft très performant pour convertir des fichiers comme des documents Word, des feuilles Excel ou des PDF en Markdown propre. Pour garder votre système local sain et éviter de gérer des dépendances Python globales, l'auteur propose un guide pas à pas pour installer l'outil dans un container Docker isolé et léger. Le tutoriel couvre la création d'un Dockerfile personnalisé et d'une fonction shell `md-convert`, pour zsh ou bash. Avec ce montage, vous lancez vos conversions depuis n'importe quel dossier, directement dans votre terminal, en toute sécurité.</TLDR>

Récemment, un ami m'a parlé d'un outil de Microsoft appelé [Markitdown](https://github.com/microsoft/markitdown/) : un utilitaire pour convertir des PDF et des fichiers MS Office (comme `.docx` ou `.xlsx`) en Markdown. En regardant le repository GitHub, il a l'air très costaud. Ils annoncent la conversion des PDF, PowerPoint, Word, Excel, images, audio, HTML et des formats texte comme CSV, JSON ou XML — et même le parcours des fichiers ZIP. C'est une sacrée promesse ! Comme il est toujours utile de convertir rapidement les `.docx` de collègues qui n'écrivent pas en Markdown, je voulais le tester sérieusement.

Dans cet article, nous allons créer une image Docker et une petite fonction de conversion appelée `md-convert`, appelable depuis n'importe où sur votre disque, pour convertir facilement des fichiers `docx`, `xlsx` et `pdf` en Markdown grâce à Markitdown.

<AlertBox variant="note" title="Besoin seulement d'une plage Excel ou d'un fichier CSV en tableau Markdown ?">
Markitdown est un outil généraliste, donc lourd. Si votre besoin est plus étroit — transformer une plage Excel copiée ou un fichier CSV en tableau Markdown — mes outils en ligne <Link to="/blog/markdown-xls2md">XLS2MD</Link> et <Link to="/blog/markdown-csv2md">CSV2MD</Link> vont plus vite, sans Docker.
</AlertBox>

<!-- truncate -->

## Première conversion {#first-conversion}

Une fois l'image et la fonction `md-convert` installées (voir la section Installation plus bas), convertir un document tient en une commande, depuis n'importe quel dossier :

<Terminal typewriter source="./files/terminal-1.txt" />

## Pourquoi cette approche {#why-this-approach}

Comme toujours, je commence par créer une image Docker pour ne pas devoir installer Python sur ma machine ni gérer l'utilitaire et toutes ses dépendances.

<AlertBox variant="info" title="J'adore Docker aussi pour ça">
C'est exactement pour ça que Docker est indispensable : l'isolation complète. Tout tourne dans le container. Une fois mes expérimentations terminées, je supprime l'image et il ne reste rien sur mon disque, à part le Dockerfile nécessaire pour la recréer à la demande. *Si ce raisonnement est nouveau pour vous, <Link to="/blog/docker-definition-like-im-five">Docker - Explain me like I'm five - What's Docker for?</Link> l'explique avec une analogie culinaire.*
</AlertBox>

## Installation {#installation}

### Créer notre image Docker {#create-our-docker-image}

Le Dockerfile obtient une adresse définitive, `~/tools/markitdown`, pour pouvoir reconstruire l'image à tout moment (nouvelle machine, `docker image prune`, nouvelle version de Markitdown) :

<ProjectSetup folderName="~/tools/markitdown" createFolder={true}>
  <Guideline>
    Lancez maintenant 'docker build -t markitdown ~/tools/markitdown' pour créer l'image Docker.
  </Guideline>
<Snippet filename="Dockerfile" source="./files/Dockerfile" />
</ProjectSetup>

<AlertBox variant="info" title="Extensions supportées">
Regardez la ligne `pip install --prefix=/python "markitdown[docx,xlsx,pdf]==0.1.7"` dans notre `Dockerfile` ; nous pourrions remplacer `docx,xlsx,pdf` par `all` pour pouvoir convertir toutes les extensions supportées par Markitdown, mais notre image Docker finale serait plus volumineuse.

Ou alors, ajoutez simplement les extensions dont vous avez besoin. Référez-vous à la documentation officielle pour ça.
</AlertBox>

Construisez-la :

```bash
docker build -t markitdown ~/tools/markitdown
```

### Rendre `md-convert` disponible partout {#make-md-convert-available-everywhere}

Ce qui transforme cette image en commande, c'est une fonction, dans son propre fichier, placée dans un dossier que votre shell charge au démarrage (l'organisation expliquée dans <Link to="/blog/modular-zsh-workflow">mon workflow ZSH modulaire</Link>). Elle monte le **dossier courant** dans le container, en lecture seule partout ailleurs, sans privilèges, et jetable après chaque conversion :

<Snippet filename="md-convert.sh" source="./files/md-convert.sh" defaultOpen={true} />

Le code est identique pour zsh et bash ; seuls le dossier et le chargement diffèrent.

<Tabs groupId="shell">
<TabItem value="zsh" label="zsh" default>

**1. Créez le fichier** dans `~/.zsh/fns/` :

<ProjectSetup folderName="~/.zsh/fns">
  <Snippet filename="md-convert.zsh" source="./files/md-convert.sh" defaultOpen={false} />
</ProjectSetup>

**2. Chargez le dossier depuis `~/.zshrc`.** C'est déjà fait si vous avez suivi un de mes articles « Ollama au quotidien ». Sinon, ajoutez ceci à la fin de `~/.zshrc` :

```zsh title="~/.zshrc"
for fn_file in ~/.zsh/fns/*.zsh; do
  source "$fn_file"
done
```

**3. Ouvrez un nouveau terminal** (ou lancez `exec zsh`).

</TabItem>
<TabItem value="bash" label="bash">

**1. Créez le fichier** dans `~/.bash/fns/` :

<ProjectSetup folderName="~/.bash/fns">
  <Snippet filename="md-convert.sh" source="./files/md-convert.sh" defaultOpen={false} />
</ProjectSetup>

**2. Chargez le dossier depuis `~/.bashrc`.** Ajoutez ceci à la fin de `~/.bashrc` (le test `-r` évite une erreur si le dossier est vide) :

```bash title="~/.bashrc"
for fn_file in ~/.bash/fns/*.sh; do
  [[ -r "$fn_file" ]] && source "$fn_file"
done
```

**3. Ouvrez un nouveau terminal** (ou lancez `exec bash`).

</TabItem>
</Tabs>

Vérifiez que le shell connaît la fonction : `type md-convert` doit répondre `md-convert is a shell function`.

Si l'image manque, `md-convert` n'échoue pas sur une erreur Docker cryptique : il affiche la commande `docker build` exacte à lancer ou, quand `~/tools/markitdown/Dockerfile` a disparu lui aussi, vous renvoie vers cet article.

<AlertBox variant="note" title="Vous venez de la version précédente de cet article ?">
Elle installait `md-convert` comme script dans `/usr/local/bin/`. Supprimez-le (`sudo rm /usr/local/bin/md-convert`) : la fonction prend le relais, et l'ancien script traînerait sinon sur votre disque.
</AlertBox>

## Conclusion {#conclusion}

Grâce à Markitdown et à la fonction `md-convert` que nous venons de construire, convertir des documents bureautiques en Markdown propre devient simple, sûr et natif dans votre terminal.

Consultez le [repository officiel](https://github.com/microsoft/markitdown/) pour la liste complète des formats supportés :

- PDF
- PowerPoint
- Word
- Excel
- Images (métadonnées EXIF et OCR)
- Audio (métadonnées EXIF et transcription vocale)
- HTML
- Formats texte (CSV, JSON, XML)
- Archives ZIP (parcours récursif du contenu)
- URL YouTube
- EPUB
- ... et plus encore !

Dans ce guide, nous avons délibérément compilé uniquement les extensions Word, Excel et PDF (`[docx,xlsx,pdf]`) pour garder notre image Docker légère et strictement cadrée. Vous pouvez bien sûr étendre les capacités de l'outil selon vos besoins. Ajustez simplement les extras du `pip install` dans `~/tools/markitdown/Dockerfile` et reconstruisez votre image.

Référez-vous à la section [Optional Dependencies](https://github.com/microsoft/markitdown/#optional-dependencies) de la documentation officielle pour explorer tout le potentiel de cet utilitaire.

<AlertBox variant="tip" title="PDF complexes, tableaux denses, pages scannées ?">
Markitdown analyse chaque format avec une librairie dédiée : c'est rapide et léger, mais ça aplatit parfois une mise en page complexe. Quand le document compte vraiment, je passe maintenant à une seconde image, plus lourde, construite exactement de la même façon : voir <Link to="/blog/docling">Docling - Convert PDF, Word, PowerPoint, Excel and HTML to Markdown, GPU-Accelerated</Link>, qui utilise de vrais modèles de mise en page et de structure de tableaux (sur le GPU, si vous en avez un).
</AlertBox>
