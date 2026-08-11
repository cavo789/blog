# Reader review : quarto-project-variables

**Détecté :** 2026-08-11
**Article :** blog/2024/01/03/quarto-project-variables/index.md
**Verdict :** RESTRUCTURE

## Problème

Time to value : **52 %** (preuve — la capture `variables.webp` du rendu Quarto — ligne 85 sur un
corps de 105 lignes, `T = 30`).
Drapeaux : **abstraction-avant-preuve** — un `<StepsCard>` de trois étapes (l. 43), puis
`_variables.yml` (l. 56), puis un `documentation.md` complet de 18 lignes (l. 60), tout cela
avant la moindre image du résultat.
Redondance : 🟠 — « stocker les valeurs dans un fichier externe et les remplacer au rendu »
énoncé **4 fois** (TLDR l. 19, paragraphe « The best way is probably… » l. 26, StepsCard l. 43,
paragraphe « This solution is perfect… » l. 87).

Test des 30 secondes : *j'abandonne* — on me demande de créer trois fichiers (`_quarto.yml`
vide, `_variables.yml`, `documentation.md`) avant de m'avoir montré à quoi ressemble un
`{{< var version >}}` une fois rendu.

## Risque

Le lecteur d'une minute rate la seule chose qui prouve que ça marche : la capture
`variables.webp` (l. 85), où le short code est remplacé par la valeur réelle. Elle est déjà dans
l'article, à mi-parcours, derrière une liste d'étapes et deux blocs de code.

Défaut structurel à corriger au passage : **deux `## Environment variables` identiques**
(l. 89 et l. 113). Le second devrait être un `###` sous le premier (ou disparaître : c'est la
suite directe de la même démonstration). En l'état la table des matières affiche deux entrées
homonymes.

Point secondaire : pas de `## Conclusion`. L'article s'achève sur une remarque Laravel.

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1 | Hook inchangé (documentation longue, IP et chemins répétés partout) + `<!-- truncate -->` | l. 22-30 |
| 2 | `## What Quarto Variables Do For You` — le couple avant/après en 6 lignes : `Version {{< var version >}} is a minor upgrade.` dans le source, puis la capture `variables.webp` du rendu | l. 74-85 |
| 3 | Une phrase : « un `_variables.yml`, un `_quarto.yml` (même vide) et les short codes `{{< var >}}` / `{{< meta >}}` — c'est tout » | l. 26 + l. 43, condensé en une phrase |
| 4 | `## Setting It Up` — le `<StepsCard>` des trois fichiers, `_variables.yml`, puis le `documentation.md` complet ; `<AlertBox>` image Docker Quarto conservée ici | l. 32-72 |
| 5 | `## Environment variables` — `.env`, le `docker run --env-file`, le second `documentation.md` et la capture `environment.webp`. **Une seule section** : l'actuel second `## Environment variables` (l. 113) devient un `###` ou fusionne | l. 89-133 |
| 6 | `## Conclusion` — quand préférer les variables (valeur unique) et quand passer à autre chose, avec le lien existant vers `quarto-mustache` (structure de page entière) | l. 28 + l. 135 + nouveau |

Cible : time to value < 15 %. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.
