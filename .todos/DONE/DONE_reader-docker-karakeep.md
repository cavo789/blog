# Reader review : docker-karakeep

**Détecté :** 2026-08-08
**Article :** blog/2025/07/18/docker-karakeep/index.md
**Verdict :** RESTRUCTURE

## Problème

Time to value : **41 %** (preuve — la capture `karakeep - Logon screen` — en ligne 67 sur un
corps de 74 lignes après `<!-- truncate -->`; la vraie démonstration de valeur, `Awesome
Docker` avec la miniature capturée automatiquement, n'arrive qu'en ligne 81, soit 59 %).
Drapeaux : **abstraction-avant-preuve** — le `<Snippet>` `compose.yaml` (l.43) et deux
`<AlertBox>` de configuration sont lus avant tout écran de karakeep en action.
Redondance : "bookmark" cité 6 fois — 🔴, mais réparti sur des sections distinctes (ajout,
listes, import/export), pas une redite du même fait.

Test des 30 secondes : "on me fait écrire un `compose.yaml`, gérer des UID/GID Docker, avant
de savoir à quoi ressemble l'outil" — la vraie preuve (l'aperçu automatique d'une page web
capturée par karakeep) est la partie la plus vendeuse de l'article et elle est en bas de page.

## Risque

La capture `Awesome Docker` (l.81) montre exactement ce qui différencie karakeep d'un simple
gestionnaire de favoris — la génération automatique d'un aperçu. C'est l'argument qui donne
envie d'installer l'outil, et il arrive après le `compose.yaml` complet.

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1 | `## Add a bookmark` — capture `Awesome Docker` (preuve : capture auto d'un aperçu) déplacée en premier, avec une phrase de contexte | l.75-83 |
| 2 | `## Why it works` — 3-4 puces sans code : recherche puissante, notes + images + bookmarks unifiés, auto-hébergé | nouveau, condensé depuis l.25-33 |
| 3 | `## Let's install karakeep` — `compose.yaml`, permissions UID/GID, `docker compose up`, écran de connexion et dashboard | l.39-73 |
| 4 | `## Adding to a list` | l.85-101 |
| 5 | `## Extra features` (Import/Export) | l.103-107 |
| 6 | `## Conclusion` — à ajouter (l'article se termine sur un lien externe, pas de landing) | nouveau |

Cible : time to value < 15 %. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.
