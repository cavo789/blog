# Reader review : xdebug-docker-vscode

**Détecté :** 2026-08-08
**Clôturé :** 2026-08-08
**Article :** .unpublished/xdebug-docker-vscode/index.md
**Verdict :** DONE (restructuré selon le plan ci-dessous)

## Résumé de l'implémentation

Réordonnancement appliqué selon la table — la démo (breakpoint atteint) déplacée en position 2, avant les trois blocs de configuration.

## Problème

Time to value : **71 %** (preuve — le `<Terminal>` montrant le point d'arrêt atteint — en
ligne 73 sur un corps de 68 lignes après `<!-- truncate -->`).
Drapeaux : **abstraction-avant-preuve** — quatre `<Snippet>` d'implémentation (Dockerfile l.35,
xdebug.ini l.37, compose.yaml l.49, launch.json l.59) précèdent la démo du breakpoint atteint.
Redondance : aucune notable.

Test des 30 secondes : "encore un article qui empile trois blocs de configuration avant de me
montrer que ça marche" — le lecteur ne sait pas si l'installation vaut l'effort avant d'avoir
lu les trois quarts de l'article.

## Risque

Le lecteur presse rate la preuve la plus convaincante — le breakpoint qui s'arrête réellement
dans VSCode alors que le code tourne dans le conteneur (l.71-75) — reléguée après trois blocs
de configuration (Dockerfile, réseau Docker, launch.json) qu'il n'a aucune raison de croire
utiles tant qu'il n'a pas vu le résultat.

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1 | `## The Three Pieces` — intro conceptuelle, zéro code (inchangée) | l.27-29 |
| 2 | `## Demo` — script `index.php`, instructions VSCode, `<Terminal>` montrant le breakpoint atteint | l.65-75 |
| 3 | `## 1. Installing Xdebug` — Dockerfile + xdebug.ini | l.31-43 |
| 4 | `## 2. The Docker Networking Detail` — compose.yaml + AlertBox | l.45-53 |
| 5 | `## 3. VSCode Configuration` — launch.json + AlertBox | l.55-63 |
| 6 | `## Key Takeaways` (StepsCard, inchangé) | l.77-89 |
| 7 | `## Conclusion` (inchangée) | l.91-93 |

Cible : time to value < 15 %. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.
