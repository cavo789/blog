# Reader review : docusaurus-docker

**Détecté :** 2026-08-11
**Article :** blog/2024/02/04/docusaurus-docker/index.md
**Verdict :** RESTRUCTURE

## Problème

Time to value : **65 %** (preuve ligne 123, `./images/homepage.webp` dans un `<BrowserWindow>`, sur un
corps de 138 lignes après le `<!-- truncate -->` l. 33).

Drapeaux :

- **abstraction-avant-preuve** — `<Snippet filename="/tmp/docusaurus/Dockerfile">` l. 45, suivi de
  `#### Dockerfile - explanations line by line` l. 47, puis `.dockerignore` l. 67 et `compose.yaml`
  l. 73 : quatre fichiers et leur explication ligne par ligne avant la moindre capture ;
- **install-avant-preuve** — `sudo apt-get update && sudo apt-get install tree` l. 100 (marqué optionnel,
  mais placé avant la preuve).

Redondance : 🟢, rien à signaler. L'article est dense et chaque section apporte un fait neuf.

Landing : correcte — `## What's next?` (l. 166) renvoie vers `docusaurus-docker-own-blog` et
`docker-docusaurus-prod`. Ne pas y toucher.

Test des 30 secondes : *j'abandonne* — je viens voir « Docusaurus tourne dans Docker », et les 15
premières lignes du corps me font écrire un `Dockerfile` puis lire son explication ligne par ligne. Je
ne sais toujours pas à quoi ressemblera le résultat.

## Risque

Le lecteur d'une minute rate trois captures déjà produites et parfaitement encadrées en
`<BrowserWindow>` : `homepage.webp` (l. 123), `posts.webp` (l. 130) et `with-new-post.webp` (l. 156).
Ce sont exactement les images qui répondent à « est-ce que ça marche vraiment et est-ce que ça a l'air
bien ? ».

Effet secondaire du placement actuel : la section `#### Dockerfile - explanations line by line`
(l. 47-56) est de la mécanique interne — légitime, mais elle est à 10 % de l'article alors qu'elle
appartient au mouvement « sous le capot ».

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1 | Hook + promesse (inchangé) | l. 1-33 |
| 2 | **`## Three Files, One Command`** — la commande `docker compose up --detach --build` puis immédiatement `homepage.webp` en `<BrowserWindow>` et `posts.webp` | l. 108-113 + l. 123-131 |
| 3 | `## Why It Works` — 3 puces sans code : l'image crée le squelette Docusaurus au build, le dossier `blog` est monté depuis l'hôte, le hot-reload suit vos fichiers | condensé de l. 47-56 (reformulé sans référence aux numéros de ligne du Dockerfile) |
| 4 | `## Create your own Docusaurus image` — `Dockerfile`, `.dockerignore`, `compose.yaml`, puis les 3 articles de démo et l'arbre de fichiers | l. 35-102 |
| 5 | `### Run Docusaurus` — la commande, le port, l'AlertBox « which port number » | l. 104-121 |
| 6 | `### Improved look & feel` — créer un vrai article et le voir apparaître (`vscode.webp`, `vscode-article.webp`, `with-new-post.webp`) | l. 140-158 |
| 7 | `## Under the Hood — the Dockerfile, line by line (skip if you just want it running)` | l. 47-56, retitré |
| 8 | `## Stop and restart` | l. 160-164 |
| 9 | `## What's next?` (inchangé) | l. 166-171 |

Note : l'AlertBox `tree` (l. 99-102) descend naturellement avec le mouvement 4 ; elle n'est plus
avant la preuve.

Cible : time to value < 15 %. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.
