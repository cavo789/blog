# Reader review : frankenphp-docker-joomla

**Détecté :** 2026-08-11
**Article :** blog/2023/11/21/frankenphp/index.md
**Verdict :** RESTRUCTURE

## Problème

Time to value : **41 %** (capture `running_frankenphp.webp` l. 58 sur un corps de 51 lignes) —
et encore, cette capture n'est qu'un flot de logs de démarrage. La vraie preuve, le site Joomla
servi par FrankenPHP (`frankenphp_joomla_homepage.webp`), est en **l. 82**, soit **88 %**.

Drapeaux : **abstraction-avant-preuve** — `<Snippet>` du `compose.yaml` (l. 50) avant toute
capture ; et surtout **délégation-avant-preuve** : l. 41-45, on envoie le lecteur sur un dépôt
GitHub tiers avec « follow the instructions given by Alexandre in his `Getting Started` readme
file » avant de lui avoir montré le moindre résultat.

Redondance : 🟢. Corps de 580 mots, aucun titre `##` — l'article est un bloc unique de
7 `<AlertBox>` intercalés dans la narration.

Pas de landing : le dernier élément de l'article est une `<AlertBox variant="highlyImportant">`
qui dit « Ouch, it's terribly slow to run — j'ai attendu plus de 15 minutes ». Le lecteur repart
sur un aveu d'échec, sans récapitulatif ni lien de sortie.

## Risque

Le lecteur d'une minute vient voir à quoi ressemble Joomla sur FrankenPHP, une techno annoncée
3,5× plus rapide que PHP-FPM. On lui demande : d'aller sur GitHub, de lire le readme de
quelqu'un d'autre, de remplacer un `compose.yaml`, de lancer un `pull`, puis d'attendre
« quelques minutes » en ignorant des dizaines de `[ERROR] Connection refused`. La capture qui
justifie tout ça existe déjà (l. 82) — elle est simplement en avant-dernière position.

L'honnêteté finale (15 minutes d'attente) est une qualité de l'article, pas un défaut : elle est
juste au mauvais endroit. Remontée en tête, à côté du résultat, elle devient un contrat clair
(« voici ce que vous obtenez, voici ce que ça coûte ») au lieu d'une punition finale.

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1. Hook | inchangé, jusqu'au `<!-- truncate -->` | l. 1-37 |
| 2. Le résultat | `## What FrankenPHP Gives You` : la capture du site Joomla en https servi par FrankenPHP, immédiatement suivie de l'AlertBox « 15 minutes la première fois » comme contrat honnête | l. 82-84 + l. 86-88 |
| 3. Pourquoi ça marche | 3 puces sans code : serveur applicatif PHP moderne (Caddy embarqué), 3,5× PHP-FPM d'après la doc, image Joomla toute faite d'Alexandre Elisé | l. 30-32 + l. 39-45 |
| 4. Installation | `## Getting It Running` : le `compose.yaml` prêt à l'emploi (garder l'AlertBox « ne buildez pas l'image vous-même »), puis `docker compose pull` et `docker compose up` | l. 47-56 |
| 5. Plus de démos | les logs de démarrage + la patience MySQL + la récupération des identifiants dans les logs + la note SSL/port dynamique | l. 58-80 |
| 6. Sous le capot *(optionnel)* | le renvoi vers `docker-healthy` : pourquoi c'est exactement le problème que résolvent les healthchecks | l. 70 |
| 7. Conclusion | **à écrire** : ce que vaut FrankenPHP en local aujourd'hui, et lien de sortie vers `docker-joomla-right-to-the-point` (setup PHP-FPM classique, déjà lié en l. 34) | — |

Ajouter au passage les titres `##` manquants : l'article n'en a aucun dans le corps, ce qui rend
impossible tout survol.

Cible : time to value < 15 %. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.
