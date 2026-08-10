# Reader review : docker-compose-viz

**Détecté :** 2026-08-09
**Article :** blog/2024/06/08/docker-compose-viz/index.md
**Verdict :** RESTRUCTURE

## Problème

Time to value : **23 %** (preuve ligne 42 sur un corps de 53 lignes, T=30, E=83).
Drapeaux : abstraction-avant-preuve (le `<Snippet>` `compose.yaml` en l. 36 — une fixture —
arrive avant l'image générée par l'outil, l. 42).
Redondance : aucune, pas de répétition notable.

Test des 30 secondes : *"je continue, mais avec un petit effort d'abord"* — juste après le
`<!-- truncate -->`, le lecteur doit créer un dossier, copier un `compose.yaml` et lancer une
commande Docker avant de voir le résultat que l'article promet ("an at-a-glance view").
L'image générée existe déjà (l. 42) mais arrive après cette étape de préparation.

## Risque

Le lecteur ne voit pas tout de suite ce que `compose-viz` produit réellement ; il doit
d'abord recopier une fixture et lancer une commande sur la foi de la promesse du TLDR. Une
image déjà prête (celle de l. 42, générée à partir de l'exemple Joomla) suffirait à prouver
la valeur avant de demander cet effort.

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1 | Accroche + TLDR (inchangé) | l. 24-28 |
| 2 | "Voici ce que `compose-viz` génère" : l'image `joomla.webp` déjà produite, avec l'AlertBox d'interprétation | l. 42-47 |
| 3 | "Reproduisez-le vous-même" : créer le dossier, le `compose.yaml`, lancer la commande | l. 32-38 |
| 4 | AlertBox `--format` | l. 49-54 |
| 5 | "A more complex example" (inchangé) | l. 56-77 |
| 6 | "Docker config" (inchangé) | l. 79-83 |

Cible : time to value < 15 %. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.
