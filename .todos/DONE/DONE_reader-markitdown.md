# Reader review : markitdown

**Détecté :** 2026-08-08
**Clôturé :** 2026-08-08
**Article :** blog/2026/05/04/markitdown/index.md
**Verdict :** DONE (restructuré selon le plan ci-dessous)

## Résumé de l'implémentation

Réordonnancement appliqué selon la table — la première conversion (sortie Terminal via le wrapper `md-convert`) déplacée en position 2, avant la construction de l'image Docker.

## Problème

Time to value : **70 %** (preuve ligne 87 sur un corps de 77 lignes... calculé à `(87-33)/77`).
Drapeaux : **abstraction-avant-preuve** — le `<Snippet filename="Dockerfile">` (l. 47) précède le
premier `<Terminal>` de démonstration (l. 87).
Redondance : aucune détectée.

Test des 30 secondes : « trois blocs de code (Dockerfile, compose.yaml, script wrapper) avant de
voir si l'outil convertit vraiment quelque chose. »

## Risque

L'article ne montre aucune conversion réussie avant d'avoir demandé au lecteur de construire une
image Docker et un script wrapper. La preuve existe (Terminal l. 87) mais arrive en tout dernier,
juste avant la Conclusion.

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1 | Hook (inchangé) | avant l. 33 |
| 2 | Preuve : premier essai de conversion (sortie Terminal) | l. 69-87 |
| 3 | Pourquoi cette approche (bref, sans code) | — synthèse de l. 111-114 (article `assets-minification`, à adapter ici) |
| 4 | Installation : Dockerfile, compose.yaml, build | l. 41-63 |
| 5 | Le script wrapper `md-convert` | l. 71-81 |
| 6 | Conclusion (inchangée) | l. 89 |

Cible : time to value < 15 %. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.
