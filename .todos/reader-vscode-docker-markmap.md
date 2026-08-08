# Reader review : vscode-docker-markmap

**Détecté :** 2026-08-08
**Article :** blog/2025/07/25/vscode-docker-markmap/index.md
**Verdict :** RESTRUCTURE

## Problème

Time to value : **26 %** (premier rendu réel — le mindmap sur le bac à sable en ligne — l. 52,
sur un corps de 82 lignes).
Drapeaux : abstraction-avant-preuve — le `<Snippet>` du fichier `overview.qmd` à créer (l. 37)
précède la première image de résultat (l. 52).

Test des 30 secondes : le titre promet un mindmap "attractive"; le lecteur doit d'abord créer un
dossier et un fichier Markdown généré par IA avant de voir le moindre rendu, même basique.

## Risque

Le rendu final (Quarto, l. 107, "The final result with Quarto") est la vraie preuve de la
promesse du titre ("more attractive") mais n'apparaît qu'à 93 % de l'article. Rien n'est perdu à
la déplacer : elle existe déjà et n'a besoin que d'être montrée plus tôt, en teaser.

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1 | Hook + promesse (inchangé) | l. 25-29 |
| 2 | **Déplacé devant** : capture "The final result with Quarto" en teaser du résultat visé | l. 107 |
| 3 | Création du fichier `overview.qmd` (inchangé) | l. 33-46 |
| 4 | Render the markmap online (inchangé) | l. 48-54 |
| 5 | Installing the VSCode extension + configuration (inchangé) | l. 56-83 |
| 6 | Rendering as an HTML page using Quarto, avec le rendu final déjà teasé en 2 (inchangé) | l. 85-107 |
| 7 | Conclusion (inchangée) | l. 109-113 |

Cible : time to value < 15 %. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.
