# Reader review : php-rector

**Détecté :** 2026-08-11
**Article :** blog/2024/02/14/php_rector/index.md
**Verdict :** RESTRUCTURE

## Problème

Time to value : **29 %** (preuve ligne 83, `./images/rector_say_hello.webp`, sur un corps de 162 lignes
après le `<!-- truncate -->` l. 36).

Drapeaux : **install-avant-preuve** — `## Install Rector` l. 67, `composer require rector/rector --dev`
l. 69 et le `<Snippet filename="rector.php">` l. 75 arrivent tous avant la capture qui montre ce que
Rector fait réellement.

Redondance : le sentiment « Rector est mon ami / mon coach » est énoncé **5 fois** (titre l. 3, l. 30,
AlertBox l. 65, l. 81, l. 188). 🔴 Ce n'est pas de l'information, c'est de l'enthousiasme — une
occurrence dans le hook et une dans la conclusion suffisent.

Test des 30 secondes : *je reste, mais de justesse* — le hook est bon (« j'ai appris PHP en PHP 5, mes
mauvaises habitudes »), la liste des 4 défauts du code (l. 57-62) est concrète. Mais juste après, on me
demande d'installer une dépendance Composer et d'écrire un fichier de config **avant** de m'avoir montré
une seule ligne de sortie de l'outil.

## Risque

Le lecteur d'une minute rate `images/rector_say_hello.webp` : la capture diff avant/après avec la section
`Applied rules:`. C'est **l'argument entier de l'article** — Rector ne corrige pas seulement, il nomme la
règle et la justifie. Cette capture est déjà produite, elle est simplement placée après le tunnel
d'installation.

Le tunnel est court (12 lignes) mais il est psychologiquement au mauvais endroit : il demande un
engagement (`composer require`) contre une promesse encore non prouvée.

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1 | Hook (inchangé) + `<!-- truncate -->` | l. 1-36 |
| 2 | Le code `sayHello.php` d'origine, puis les 4 puces « what's wrong » | l. 47-62 |
| 3 | **La capture `rector_say_hello.webp` immédiatement**, précédée d'une phrase : « voici ce que Rector en dit, sans que vous ayez rien installé » | l. 83 |
| 4 | `## Why It Works` — 3 puces sans code : Rector applique des *règles* nommées, il explique, il tourne en `--dry-run` par défaut | condensé de l. 85-95 |
| 5 | `## Install Rector` — `composer require` + `rector.php`, avec un renvoi vers `jakzal/phpqa` et le devcontainer PHP pour l'essayer sans rien installer | l. 67-77 + le lien déjà présent l. 32 |
| 6 | `## Run Rector` — l'anatomie de la commande (les 5 puces de flags) | l. 79-95, moins la capture déplacée |
| 7 | `## Applied rules` — les règles détaillées | l. 97-167 |
| 8 | `## Final code` + `## Last thing, make the change` | l. 169-190 |
| 9 | `## Conclusion` — **à créer** : ce qu'on retient, plus le renvoi existant vers `php-jakzal-phpqa` et `online-php-linter` | l. 192-198 (renommer `## Learn more` ou l'absorber) |

Dédoublonnage : ne garder « my friend, my coach » que dans le hook (l. 30) et la conclusion ; supprimer
l'AlertBox vide l. 65 et l'apostrophe l. 81.

Cible : time to value < 15 %. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.
