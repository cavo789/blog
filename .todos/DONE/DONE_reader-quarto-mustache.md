# Reader review : quarto-mustache

**Détecté :** 2026-08-09
**Article :** blog/2025/05/15/quarto-mustache/index.md
**Verdict :** RESTRUCTURE

## Problème

Time to value : **29 %** (preuve ligne 80 sur un corps de 150 lignes, `<!-- truncate -->` en
ligne 36).
Drapeaux : **abstraction-avant-preuve** — un `<Snippet filename="_quarto.yml">` (l. 50) montrant
un fichier de configuration apparaît avant la première preuve visuelle (l. 80, capture du rendu
HTML).
Redondance : aucune détectée, ce n'est pas le problème ici.

Test des 30 secondes : le lecteur voit d'abord `mkdir`, puis un fichier `_quarto.yml` à créer, puis
un second `<Snippet>` — trois blocs d'installation/config avant de voir à quoi ressemble le résultat.
"J'abandonne" — je ne sais toujours pas ce que ce templating produit visuellement après 45 lignes de
setup.

## Risque

Le lecteur ne voit la preuve que le moteur "Contextual Canvas" fonctionne (`render_canvas.webp`,
l. 80) qu'après avoir créé un dossier temporaire, un fichier `_quarto.yml`, un fichier
`documentation/canvas.md` et un template `_partials/run.md`. L'idée (templating façon Mustache
pour documenter des dizaines de fonctionnalités similaires) est déjà bien expliquée avant le
`<!-- truncate -->` (l. 26-34), mais la démonstration concrète arrive trop tard.

De plus, l'article se termine abruptement sur un bloc de code (l. 185, syntaxe *raw content*),
sans section `## Conclusion` — pas de récapitulatif, pas de lien vers la suite (alors qu'un lien
existe déjà en amont vers `/blog/quarto-industrialisation`, l. 28).

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1 | Hook + promesse (inchangé) | l. 26-34 |
| 2 | **Résultat d'abord** : capture `render_canvas.webp` montrant la page rendue, avec 2-3 phrases expliquant ce qu'on regarde (le contenu du template `_hello.md`/`canvas.md` a été injecté) | l. 80 (image) + l. 82 (explication) |
| 3 | "## Create some files" — recréer les étapes pour reproduire ce résultat (mkdir, `_quarto.yml`, `canvas.md`, `run.md`, `canvas_2.md`) | l. 38-78 (inchangé) |
| 4 | "## Let's discover the basics" — reste de la démo (second exemple `builder.md`) | l. 88-125 |
| 5 | "### What have we just done" — récap technique | l. 98-111 (à replacer après la démo complète) |
| 6 | "## My use case" | l. 127-131 |
| 7 | "## Testing if a variable is defined or not" (optionnel, marquer comme approfondissement) | l. 133-157 |
| 8 | "## Raw contents" (optionnel, marquer comme approfondissement) | l. 159-185 |
| 9 | **Nouveau** : `## Conclusion` — récap + lien vers `/blog/quarto-industrialisation` et `/blog/quarto-extensions` | à écrire |

Cible : time to value < 15 %. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.
