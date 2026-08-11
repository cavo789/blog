# Reader review : docker-quarto

**Détecté :** 2026-08-11
**Article :** blog/2023/12/21/docker-quarto/index.md
**Verdict :** RESTRUCTURE

## Problème

Time to value : **56 %** (première preuve — la capture `pdf_version.webp` l. 123 — sur un corps de
143 lignes, truncate l. 43).
Le `<Terminal source="./files/terminal-2.txt">` de la l. 64 n'est pas une preuve : c'est la sortie
d'un `docker build` de 183 secondes, donc de l'installation.

Drapeaux :

- **abstraction-avant-preuve** : `<Snippet filename="Dockerfile">` l. 60, avant tout résultat ;
- **install-avant-preuve** : l'article impose un `docker build -t cavo789/quarto .` (« environ trois
  minutes la première fois », image de 1,55 Go) comme premier geste demandé au lecteur.

Redondance : 🟢.
Landing : présente et bonne — `## Going further` (l. 184-186) récapitule et pointe vers
`quarto-devcontainer` et `quarto-extensions`.

Test des 30 secondes : *« je décroche »* — on me demande de construire une image Docker de 1,55 Go
avant de m'avoir montré un seul document produit par Quarto.

## Risque

L'ironie est que l'article contient déjà le chemin sans effort, à la section
`### Use an existing image` (l. 84-86) : une commande `docker run` avec l'image officielle
`ghcr.io/quarto-dev/quarto:latest`, zéro build. Elle est *après* les trois minutes de build, alors
qu'elle rend celles-ci facultatives.

Le lecteur d'une minute ne voit donc ni le PDF généré (l. 123), ni les trois captures de slideshow
revealjs (l. 173-179), ni le fait qu'il peut essayer immédiatement sans rien construire. Il voit un
Dockerfile.

Cet article est de plus le point d'entrée de la série *Discovering Quarto* : deux autres articles
(`quarto-conditional-display`, `quarto-powerpoint`) y renvoient dès leur première AlertBox. Un
lecteur envoyé ici pour « avoir Quarto » se heurte d'abord à un build.

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1 | `## Render your first PDF, without installing anything` — le `docker run … ghcr.io/quarto-dev/quarto:latest quarto render test.md --to pdf` + la capture `pdf_version.webp` | l. 84-86 (commande) + l. 123 (capture) |
| 2 | `## The source file` — le `test.md` d'exemple | l. 88-105 |
| 3 | `## And the same file as a slideshow` — le rendu revealjs et ses captures | l. 125-183 |
| 4 | `## Build your own image (optional — skip it if the official one is enough)` — le Dockerfile, le `docker build`, `terminal-2.txt`, la taille de l'image, l'AlertBox sur le nom | l. 51-83 |
| 5 | `<AlertBox variant="info" title="Docker CLI reminder">` conservée près de la première commande | l. 106-120 |
| 6 | `## Going further` inchangée | l. 184-186 |

Cible : time to value < 15 %. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.
