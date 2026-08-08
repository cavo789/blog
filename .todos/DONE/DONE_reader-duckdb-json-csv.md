# Reader review : duckdb-json-csv

**Détecté :** 2026-08-08
**Clôturé :** 2026-08-08
**Article :** .unpublished/duckdb-json-csv/index.md
**Verdict :** DONE (restructuré selon le plan ci-dessous)

## Résumé de l'implémentation

Réordonnancement appliqué exactement selon la table — la démo (`terminal_duckdb.txt`, jointure CSV/JSON + window function) déplacée en position 2, le reste réordonné sans suppression de contenu.

## Problème

Time to value : **62 %** (preuve — `<Terminal source="./files/terminal_duckdb.txt">` sous
« Demo », l. 65 — sur un corps de 64 lignes après `<!-- truncate -->`, l. 25).
Drapeaux : abstraction-avant-preuve — trois `<Snippet>` (Dockerfile l. 42, compose.yaml l. 48,
wrapper `duckdb-query` l. 56) avant le premier `<Terminal>` (l. 65).
Redondance : « pas d'import, requête directe sur fichier » énoncé **3 fois** (TLDR l. 20,
l. 29-36, `<StepsCard>` l. 79) — cohérent, pas excessif.

Test des 30 secondes : « What Makes DuckDB Different » (l. 27-36) est un bon accroche technique,
avec même un exemple SQL en syntaxe. Mais ensuite, la construction Docker (Dockerfile, compose,
wrapper global) occupe toute la suite avant la moindre requête réellement exécutée. Je décroche
avant la démo — page 3 avant de voir une vraie requête tourner.

## Risque

La démo (jointure CSV/JSON, fonction fenêtre) est le vrai argument de vente de l'outil — c'est
elle qui montre en quoi DuckDB dépasse `awk`/`jq`. Elle est déjà écrite, seulement mal placée.

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1. Accroche | Inchangée | l. 23 |
| 2. Résultat | Démo : `orders.csv` + `users.json` + les 3 requêtes SQL réelles | l. 60-67 |
| 3. Pourquoi ça marche | « What Makes DuckDB Different » (déjà sans code lourd) | l. 27-36 |
| 4. Installation | Dockerfile + compose.yaml + wrapper global | l. 38-58 |
| 5. Plus de démos | Remarque « Same spirit as ai-data » à développer en comparaison concrète | l. 69-71 |
| 6. Sous le capot | — (rien de spécifique à isoler) | — |
| 7. Conclusion | Key Takeaways + Conclusion, inchangés | l. 73-89 |

Cible : time to value < 15 %. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.
