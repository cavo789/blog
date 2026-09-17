---
slug: docker-python-mermaid
title: Documentation as Code - Transformez votre infrastructure en diagrammes soignés avec Python et Mermaid
description: Automatisez votre Documentation as Code en construisant une stack dockerisée Python et Mermaid CLI pour générer des diagrammes d'architecture dynamiques directement depuis votre code.
authors: [christophe]
mainTag: doc-as-code
tags:
  - doc-as-code
  - docker
  - python
image: /img/v2/docker-python-mermaid.webp
series: Diagrams as code
date: 2026-04-20
ai_assisted: true
blueskyRecordKey: 3mjwbgrn2os2o
---

![Documentation as Code : transformez votre infrastructure en diagrammes soignés avec Python et Mermaid](/img/v2/docker-python-mermaid.webp)

<TLDR>Une documentation écrite à la main devient obsolète dès que le code change. Pour éviter ça, adoptez la Documentation as Code : construisez une image Docker sur mesure équipée de Python et du CLI Mermaid pour générer automatiquement vos visuels. Avec de simples scripts Python qui analysent vos fichiers compose.yaml ou parcourent vos répertoires de projet, vous produisez dynamiquement du pseudocode Mermaid et le rendez directement en diagrammes PNG propres et à jour (mindmaps, camemberts, etc.) avec une seule commande.</TLDR>

J'aime la documentation, et quoi de plus inefficace que d'écrire de la doc pour des choses qui peuvent s'auto-documenter ?

Comme vous le savez peut-être, j'adore Docker et je fais presque tout de manière dockerisée. Donc, dans chacun de mes projets, il y a un fichier `compose.yaml`. Si je veux le documenter pour mes collègues, je pourrais écrire : *Il y a trois services, un pour PHP, un pour Nginx, un pour PostgreSQL. Celui-là utilise un volume pour rendre les données persistantes sur le disque et blah blah blah. Le service Nginx publie sur le port xxx et la base de données est accessible via le port yyy.* Je peux faire ça, bien sûr, mais n'y a-t-il pas une meilleure façon de procéder ? Et si j'ajoute un nouveau service ou que je change un numéro de port ? Ma documentation serait déjà obsolète, sauf si...

Voyons comment automatiser la documentation avec Docker, Python et Mermaid.

<!-- truncate -->

<QuickJump
  links={[
    { label: "Voir le résultat", to: "#the-result" },
    { label: "Tous les fichiers nécessaires", to: "#all-needed-files" },
  ]}
/>

## Le résultat {#the-result}

Pointez le pipeline construit dans cet article vers un vrai `compose.yaml`, et une seule commande produit ceci :

![La mindmap du compose](./files/images/compose.webp)

Cette image a été entièrement générée depuis le fichier `compose.yaml` — aucun dessin manuel, aucun outil de diagramme. Modifiez le YAML, relancez la commande, et le diagramme se met à jour tout seul.

## Pourquoi Mermaid {#why-mermaid}

<AlertBox variant="note" title="Du pseudocode en entrée, une image en sortie">
[Mermaid](https://mermaid.js.org/) transforme un petit bloc de texte — son propre *pseudocode* — en diagramme rendu. Regardez cet [exemple](https://mermaid.live/edit#pako:eNpFjctqwzAQRX9FzNoNtmzJtrYtfUALhWbT4o1ijR0RWRMUmTYN-fcqCU3uauZw7swBejIICqKd0FmPnWcp0UaH7NnuIoU9o4F9UG-1Y29orGbvTseBwnRxeZ5zptir9Rs0L_4KqwQfdY8ros0FnqPYE9Ho8OqJhD5pXs6rG5OJLb9tjBgggzFYAyqGGTOYMEz6tMLhZHcQ1zhhByqNBgc9u9hB54-pttX-i2j6bwaaxzWoQbtd2uat0REfrB6DvinoDYZ7mn0EVYi6Ph8BdYAfUHdFVS7aVuZlK9uiraumzGAPipcLIaXkKTWvmrqRxwx-z4-LBW8L0XDR5GVTiroSxz-rtW0b) : à gauche, le pseudocode — lisible d'un coup d'œil ; à droite, l'image rendue.
</AlertBox>

![Un exemple de timeline depuis le Mermaid Live Editor](./images/timeline.webp)

Rendez-vous sur le [Mermaid Live Editor](https://mermaid.live/edit) et jouez avec les *Sample Diagrams* en bas à gauche pour découvrir tout ce que l'outil propose. Un script Python peut générer ce même pseudocode depuis n'importe quelle source lisible — un `compose.yaml`, une arborescence de dossiers, n'importe quelles données que vous avez déjà — et le CLI Mermaid le rend en PNG transparent.

## Installation — créons l'image Docker {#installation--lets-create-the-docker-image}

Le Dockerfile que nous allons utiliser est celui-ci. Il est assez simple.

<Snippet filename="Dockerfile" source="./files/Dockerfile" defaultOpen={false} />

Pour construire cette image, lancez `docker build -t yourself/docker-python-mermaid .` dans votre terminal :

<Terminal typewriter wrap={true}>
$ docker build -t yourself/docker-python-mermaid .
</Terminal>

La taille finale de l'image sera d'environ 2 Go.

![Construction de l'image](./images/build.webp)

## Préparer le rendu Mermaid {#prepare-mermaid-rendering}

Il nous faut deux fichiers externes pour le rendu.

Le premier va configurer Puppeteer :

<Snippet filename="puppeteer-config.json" source="./files/puppeteer-config.json" defaultOpen={false} />

Et le second va nous permettre d'utiliser notre propre mise en forme (police, couleurs, ...) lors du rendu du pseudocode en image :

<Snippet filename="mermaid-config.json" source="./files/mermaid-config.json" defaultOpen={false} />

## Enfin, il nous faut un script Python {#finally-we-need-a-python-script}

Nous avons notre image Docker, nous avons nos fichiers de configuration. Il ne reste plus qu'à écrire un script Python qui va faire « quelque chose », générer du pseudocode Mermaid et rendre ce pseudocode sous forme d'image.

Que peut-on faire ? Tout ce que vous voulez ! Utilisez simplement votre moteur d'IA préféré et demandez-lui de créer le script Python correspondant.

Essayons deux choses :

### Nous allons lire un compose.yaml Docker et créer une mindmap {#well-read-a-docker-composeyaml-and-create-a-mindmap}

Le script ci-dessous va lire un fichier `compose.yaml` et générer une mindmap visuelle. *Il existe aussi un outil prêt à l'emploi pour ça, voir <Link to="/blog/docker-compose-viz">How to generate a graph from compose.yaml</Link>, mais écrire le script nous-mêmes nous donne une liberté totale sur la sortie.*

<Snippet filename="mindmap.py" source="./files/scripts/mindmap.py" defaultOpen={false} />

Voici le `compose.yaml` bidon que je vais utiliser comme exemple :

<Snippet filename="compose.yaml" source="./files/samples/compose.yaml" defaultOpen={false} />

Maintenant, le meilleur moment : lancez cette commande pour produire l'image :

<Terminal typewriter wrap={true} source="./files/terminal-3.txt" />

Une seule ligne de commande produit la mindmap montrée en haut de cet article. Cette image a été générée par le script Python `mindmap.py` après traitement de notre fichier `compose.yaml`. Nous pouvons maintenant modifier notre fichier YAML, relancer la commande `docker run`, et l'image sera mise à jour automatiquement.

<AlertBox variant="note" title="Couleurs">
Souvenez-vous : il suffit de modifier le fichier `mermaid-config.json` si vous voulez une autre palette de couleurs.
</AlertBox>

## Plus d'exemples {#more-examples}

### Un autre exemple {#another-example}

Ce script va examiner notre structure de fichiers, identifier les fichiers présents et créer une mindmap également :

<Snippet filename="project-dna.py" source="./files/scripts/project-dna.py" defaultOpen={false} />

<Terminal typewriter wrap={true} source="./files/terminal-2.txt" />

![La mindmap project-dna](./files/images/project-dna.webp)

Cette mindmap ne se contente pas de montrer nos dossiers : elle regroupe les fichiers dans des catégories comme `Code`, `Configuration`, `Assets`, etc.

### Dernier exemple {#last-example}

Cette fois, un camembert :

<Snippet filename="pie.py" source="./files/scripts/pie.py" defaultOpen={false} />

<Terminal typewriter wrap={true} source="./files/terminal-1.txt" />

![Le camembert project-dna](./files/images/pie.webp)

## Tous les fichiers nécessaires {#all-needed-files}

<ProjectSetup folderName="/tmp/mermaid" createFolder={true} >
  <Guideline>
    Maintenant, lancez 'docker build -t yourself/docker-python-mermaid .' pour
    créer l'image Docker.
  </Guideline>
<Snippet filename="Dockerfile" source="./files/Dockerfile" defaultOpen={false} />
<Snippet filename="puppeteer-config.json" source="./files/puppeteer-config.json" defaultOpen={false} />
<Snippet filename="mermaid-config.json" source="./files/mermaid-config.json" defaultOpen={false} />
<Snippet filename="scripts/mindmap.py" source="./files/scripts/mindmap.py" defaultOpen={false} />
<Snippet filename="scripts/pie.py" source="./files/scripts/pie.py" defaultOpen={false} />
<Snippet filename="samples/compose.yaml" source="./files/samples/compose.yaml" defaultOpen={false} />
<Snippet filename="scripts/project-dna.py" source="./files/scripts/project-dna.py" defaultOpen={false} />
</ProjectSetup>

## Conclusion {#conclusion}

En combinant la puissance de parsing de Python avec l'élégance de rendu de Mermaid, nous avons transformé une documentation statique en un actif dynamique.

Si l'approche *Documentation as Code* vous plaît, jetez un œil à deux autres de mes articles qui vont dans la même direction : <Link to="/blog/docker-diagram-as-code">Docker - Diagrams as code</Link> et <Link to="/blog/python-pydot">Python - Generate flows using pydot</Link>.
