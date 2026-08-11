# Reader review : php-devcontainer

**Détecté :** 2026-08-09
**Article :** blog/2024/02/23/php-devcontainer/index.md
**Verdict :** RESTRUCTURE

## Problème

Time to value : **46 %** (capture PHP-CS-Fixer en action l. 91 sur un corps de 96 lignes après
`<!-- truncate -->`).
Drapeaux : **install-avant-preuve** — la toute première chose après le `truncate` est
`### 1. Install the php_devcontainer skeleton` avec un bloc `curl`/`tar` (l. 55-59), avant toute
preuve visuelle.

Test des 30 secondes : le titre promet "in a matter of seconds" mais le lecteur doit lire deux
sections d'installation avant de voir un seul outil réellement à l'œuvre.

## Risque

La section "You are ready to use tools" (l. 87-95) contient la vraie preuve de valeur — une
capture de PHP-CS-Fixer corrigeant du code — mais elle arrive après le téléchargement du
squelette ET l'ouverture du Dev Container. C'est exactement le contenu qui justifierait le
titre, mal placé.

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1 | Résultat : capture PHP-CS-Fixer corrigeant du code + une phrase sur les autres outils préinstallés (PHPCS/PHPCBF, SonarLint, Rector) | l. 87-95 |
| 2 | Installation — nouveau projet : télécharger le squelette, ouvrir VSCode, rebasculer en Dev Container | l. 49-85 |
| 3 | Installation — projet existant : même squelette appliqué à un repo déjà là | l. 99-142 |

Cible : time to value < 15 %. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.
