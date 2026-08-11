# Reader review : docker-mindmap

**Détecté :** 2026-08-11
**Article :** blog/2023/12/16/docker-mindmap/index.md
**Verdict :** RESTRUCTURE

## Problème

Time to value : **100 %** — il n'y a aucune preuve dans l'article. Corps de 57 lignes
(truncate l. 28, fin l. 85).

Les deux `<Terminal>` (l. 70 et l. 74) ne montrent pas la carte mentale : ce sont deux
`ls -alh` quasi identiques, l'un listant `mindmap.md`, l'autre listant `mindmap.md` +
`mindmap.html`. Aucune image, aucun SVG, aucune capture du rendu. Le dossier
`blog/2023/12/16/docker-mindmap/` ne contient que `files/` — pas de `images/`.

Drapeaux : **abstraction-avant-preuve** — le `<Snippet filename="sample.md">` de 30 lignes
(l. 34-64) est le premier bloc du corps, avant toute sortie.

Redondance : 🟢 (les deux `ls` forment un avant/après légitime, mais ils occupent la place
de la vraie preuve).

Test des 30 secondes : **j'abandonne** — un article intitulé « Build a mind map using Docker
and Markdown » qui ne montre jamais de carte mentale ; on me demande de copier 30 lignes de
Markdown et de lancer un `docker run` sur la foi du titre.

## Risque

Le lecteur d'une minute repart sans jamais savoir à quoi ressemble le résultat : ni le rendu
interactif (branches pliables, zoom), ni même une vignette. Le seul argument visuel de
l'article — « Really cool » l. 81 — est une affirmation, pas une preuve.

Tout le reste de la matière est déjà là et correcte : le Markdown source, la commande Docker
complète et versionnée (`leopoul/markmap:1.0.0`), la note WSL. Il manque **un seul asset**.

Asset : l'article frère <Link to="/blog/vscode-docker-markmap"> dispose déjà de rendus
Markmap réutilisables —
`blog/2025/07/25/vscode-docker-markmap/images/extension_rendering_basic.webp` et
`markmap_online.webp`. Le mieux reste de générer une capture du `mindmap.html` produit par
le `sample.md` de cet article (c'est reproductible en 2 minutes avec la commande de la
l. 72), et de la placer dans un nouveau `images/`.

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1 | Accroche + promesse, `<!-- truncate -->` | l. 22-28 (inchangé) |
| 2 | **Le résultat** : capture du `mindmap.html` rendu + la commande `docker run` en une ligne, sous la capture | **asset à produire** + l. 72 |
| 3 | « Et voici le texte qui a produit ça » : le Markdown source | l. 34-64 (`<Snippet sample.md>`) |
| 4 | Le pas-à-pas : `mkdir`, création du fichier, `docker run`, `ls` prouvant le `.html` créé | l. 66-70, l. 72-74 |
| 5 | `<AlertBox>` WSL — ouvrir le HTML depuis la console Linux | l. 76-79 |
| 6 | L'éditeur en ligne (markmap.js.org/repl) comme alternative sans Docker | l. 30-32 |
| 7 | `## Go further` (options JSON) + Conclusion renvoyant vers `vscode-docker-markmap` et `json-crack` | l. 83-85 + l. 26 |

Note : le lien vers l'éditeur en ligne passe **après** la démo Docker (mouvement 6). Dans la
version actuelle, il est la toute première phrase du corps et détourne le lecteur de
l'article vers un site tiers avant qu'il n'ait rien vu.

Cible : time to value < 15 %. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.
