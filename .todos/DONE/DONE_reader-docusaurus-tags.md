# Reader review : docusaurus-tags

**Détecté :** 2026-08-08
**Clôturé :** 2026-08-08
**Article :** blog/2026/02/02/docusaurus-tags/index.md
**Verdict :** DONE (restructuré selon le plan ci-dessous)

## Résumé de l'implémentation

Réordonnancement appliqué selon la table — la démo (`make tags-manager ARGS="list"` + capture `list.webp`) déplacée en position 2, avant le dump intégral du script.

## Problème

Time to value : **57 %** (preuve l. 80, capture `list.webp`, sur un corps de 87 lignes, l. 30-117).
Drapeaux : **abstraction-avant-preuve** — le script Python complet (`<Snippet>` l. 56) est donné en
entier avant toute preuve que l'outil fonctionne.

Test des 30 secondes : la promesse ("nettoyer le chaos de tags") est concrète et vendeuse, mais le
lecteur doit lire une description du script complet et une commande Docker complexe avant de voir le
premier résultat (`list.webp`).

## Risque

La capture `list.webp` (l. 80) est la preuve la plus convaincante de l'article — elle montre les
suggestions intelligentes en action — et elle est actuellement précédée par le dump intégral du script.

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1 | Hook + promesse (inchangé) | l. 18-28 |
| 2 | Démo : `make tags-manager ARGS="list"` + capture `list.webp` | l. 72-80 |
| 3 | The Solution : ce que fait l'outil (List/Suggest/Rename/Delete) + Smart Suggestions | l. 32-50 |
| 4 | How to Run It (Docker, Makefile) | l. 58-70 |
| 5 | Le script complet | l. 52-56 |
| 6 | Renommer / supprimer un tag (exemples) | l. 82-96 |
| 7 | Bonus `tags.yml` + Conclusion (inchangés) | l. 98-117 |

Cible : time to value < 15 %. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.
