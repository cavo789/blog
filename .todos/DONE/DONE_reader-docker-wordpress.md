# Reader review : docker-wordpress

**Détecté :** 2026-08-11
**Article :** blog/2023/12/28/docker-wordpress/index.md
**Verdict :** RESTRUCTURE

## Problème

Time to value : **59 %** (preuve — la capture `run_wp.webp` du WordPress qui tourne — ligne 78
sur un corps de 86 lignes, `T = 27`).
Drapeaux : **install-avant-preuve** — trois sections d'installation (`## First step, we need a
network` l. 33, `## Second step` l. 48, `## Third step` l. 66) et quatre `docker run`/`docker
network create` avant la moindre image.
Redondance : 🟢 — chaque étape apporte un fait neuf.

Test des 30 secondes : *je reste, mais sans savoir où je vais* — la promesse « trois commandes »
est faite dès le titre, or les trois commandes sont dispersées sur trois sections de 15 lignes
chacune. Je ne vois jamais le bloc de trois lignes que le titre m'a promis.

## Risque

L'ironie de cet article : **le bloc « trois commandes » existe déjà** — c'est
`./files/terminal-1.txt`, rendu ligne 113… soit *après* la `## Conclusion` (l. 107), en dernière
ligne du fichier, sans une phrase pour l'introduire. C'est exactement le movement 2 dont
l'article a besoin, posé à l'endroit où plus personne ne lit.

**Bug à corriger obligatoirement pendant le déplacement :** `terminal-1.txt` contredit le corps
de l'article. Il épingle `mysql:8.0.13` et `wordpress:6.4.2-php8.2-apache`, alors que le corps
utilise `mysql:8.4` et `wordpress:php8.3-apache`. Le lecteur qui copie le bloc récapitulatif
n'obtient pas ce que l'article vient de lui montrer. Aligner `terminal-1.txt` sur le corps.

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1 | Hook inchangé (« un WordPress en trois commandes, impossible ? ») + `<!-- truncate -->` | l. 21-27 |
| 2 | `## Three Commands, One WordPress Site` — le `<Terminal source="./files/terminal-1.txt" />` **corrigé** (versions alignées sur le corps), suivi de `run_wp.webp` et `installing_wordpress.webp` et de la phrase « site disponible sur `http://127.0.0.1:8080` » | l. 113 (déplacé) + l. 78-80 + l. 76 |
| 3 | Une phrase : pas de `compose.yaml` ici — un réseau partagé suffit pour que les deux conteneurs se parlent, toute la configuration passe par des variables d'environnement | l. 29-31 + l. 74 |
| 4 | `## Step by step` — les trois sections actuelles inchangées (réseau, base de données, WordPress), avec leurs `<AlertBox>` | l. 33-86 |
| 5 | `## Optional, start phpmyadmin` inchangée | l. 87-97 |
| 6 | `## Remove containers` inchangée (`terminal-2.txt`) | l. 99-105 |
| 7 | `## Conclusion` inchangée, **et rien après elle** — le `<Terminal>` orphelin de la l. 113 est parti en movement 2 | l. 107-111 |

Cible : time to value < 15 %. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.
