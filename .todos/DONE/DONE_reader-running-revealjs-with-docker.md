# Reader review : running-revealjs-with-docker

**Détecté :** 2026-08-08
**Clôturé :** 2026-08-08
**Article :** blog/2025/12/15/running-revealjs-with-docker/index.md
**Verdict :** DONE (restructuré selon le plan ci-dessous)

## Résumé de l'implémentation

Réordonnancement appliqué selon la table — la capture « The slideshow is running » déplacée en position 2. Une vraie section `## Conclusion` a été écrite (absente avant, l'article s'arrêtait sur un AlertBox d'export).

## Problème

Time to value : **62 %** (preuve ligne 104 sur un corps de 115 lignes [33-148]).
Drapeaux : abstraction-avant-preuve — 4 fichiers d'implémentation (`_quarto.yml`,
`.devcontainer/compose.yaml`, `.devcontainer/devcontainer.json`, `.devcontainer/Dockerfile`,
l. 59-62) sont affichés avant toute preuve visuelle.
Redondance : aucune répétition significative détectée.

Test des 30 secondes : *"j'abandonne"* — après l'accroche, l'article enchaîne directement sur
la création d'un projet Quarto et l'ajout de 4 fichiers de configuration ; aucune image du
diaporama en action n'est visible avant longtemps.

## Risque

La preuve la plus parlante (capture l. 104, *"The slideshow is running"*) existe déjà, mais
elle arrive après tout le montage du devcontainer. De plus, l'article n'a **aucune section
"## Conclusion"** — il s'arrête net sur un `AlertBox` d'export HTML, sans récap ni lien vers la
suite.

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1. Accroche | Intro (ras-le-bol de PowerPoint, écriture Markdown-first) | l. 25-31 |
| 2. Résultat | Capture "The slideshow is running" + une phrase ("écrit en Markdown, prévisualisé en live") | l. 104 |
| 3. Pourquoi ça marche | Puces : Quarto génère le reveal.js, le devcontainer isole l'environnement, export HTML/PDF inclus via Decktape | nouveau, condensé de l. 27-29 |
| 4. Installation | Projet Quarto (fichiers via ProjectSetup) + ouverture du devcontainer | l. 37-88 |
| 5. Démo supplémentaire | Prévisualisation, traduction du slide, export PDF, export HTML statique | l. 90-148 |
| 7. Conclusion (à créer) | Récap + lien vers la suite (ex. `/blog/quarto-devcontainer`) | à écrire |

Cible : time to value < 15 %. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.
