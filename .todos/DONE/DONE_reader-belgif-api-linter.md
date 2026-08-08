# Reader review : belgif-api-linter

**Détecté :** 2026-08-08
**Clôturé :** 2026-08-08
**Article :** blog/2026/05/11/belgif-api-linter/index.md
**Verdict :** DONE (restructuré selon le plan ci-dessous)

## Résumé de l'implémentation

Réordonnancement appliqué selon la table — la sortie du linter + le bonus warnings déplacés en position 2, avant les trois `<Snippet>` d'implémentation. Une vraie section `## Conclusion` a été écrite (absente avant), refermant sur un lien vers l'article API REST.

## Problème

Time to value : **13 %** (preuve ligne 57 sur un corps de 213 lignes) — chiffre trompeur : le
drapeau ci-dessous prime.
Drapeaux : **abstraction-avant-preuve** — trois `<Snippet>` d'implémentation (`main.py`,
`compose.yaml`, `Dockerfile`, l. 44-46) précèdent le premier `<Terminal>` (l. 57).
Redondance : aucune détectée. Pas de section `## Conclusion` en fin d'article (atterrissage
absent — voir Risque).

Test des 30 secondes : « je dois lire trois fichiers d'une application FastAPI factice avant de
savoir ce que le linter Belgif apporte réellement. »

## Risque

La vraie preuve — le rapport de validation Belgif (`result.txt` l. 122, `warnings.txt` l. 132,
comparaison avant/après avec `compose_belgif_no_warnings.yaml` l. 138) — existe déjà dans
l'article mais à plus de 40 % de la lecture. En prime, l'article se termine sur « FastAPI tips »
(l. 144-243) sans `## Conclusion` : aucun atterrissage, aucun rappel du sujet principal.

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1 | Hook (inchangé) | avant l. 30 |
| 2 | Preuve : sortie du linter Belgif + rapport de warnings | l. 110-138 |
| 3 | Pourquoi les standards Belgif (sans code) | l. 89-96 |
| 4 | Installation : créer l'application FastAPI factice | l. 34-57 |
| 5 | Deuxième run avec la config Belgif | l. 97-109 |
| 6 | FastAPI tips (déjà marqué comme approfondissement) | l. 144-243 |
| 7 | **(à ajouter)** `## Conclusion` — rappel + lien suivant | — nouveau contenu nécessaire |

Cible : time to value < 15 % et un atterrissage explicite. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.
