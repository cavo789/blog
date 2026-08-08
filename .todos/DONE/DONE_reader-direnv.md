# Reader review : direnv

**Détecté :** 2026-08-08
**Clôturé :** 2026-08-08
**Article :** .unpublished/direnv/index.md
**Verdict :** DONE (restructuré selon le plan ci-dessous)

## Résumé de l'implémentation

Réordonnancement appliqué exactement selon la table — rien de supprimé, la preuve existante (cd/cd .. avec chargement/déchargement) déplacée en position 2, la section `.envrc`/`PATH_add` réécrite sans code en position 3, les deux `<Snippet>` déplacés en position 4.

## Problème

Time to value : **30 %** (preuve — `<Terminal>` montrant `direnv: loading` / `direnv: export`,
l. 78 — sur un corps de 180 lignes après `<!-- truncate -->`, l. 24).
Drapeaux : install-avant-preuve — `## Install` est le tout premier titre après `truncate`
(l. 26), avec `sudo apt install direnv` comme toute première commande (l. 31). C'est l'exemple
canonique cité par `blog-post-structure` (« `## Prerequisites` / `apt install` avant toute
preuve »).
Redondance : « charge/décharge automatiquement au `cd`  » énoncé **3 fois** (TLDR l. 17,
l. 22, Conclusion l. 198) — cohérent, promesse → démonstration → rappel, pas redondant.

Test des 30 secondes : le TLDR explique déjà très bien ce que fait l'outil. Mais la première
chose lue dans le corps de l'article est une commande d'installation — avant d'avoir vu
`direnv` charger quoi que ce soit. J'abandonne : je sais déjà ce que ça fait grâce au TLDR, je
veux voir que ça marche, pas installer un paquet.

## Risque

La preuve existe déjà et est bien écrite (le triptyque `cd` → chargement → `cd ..` →
déchargement, l. 76-89) — elle est simplement 50 lignes trop bas.

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1. Accroche | Inchangée | l. 20-22 |
| 2. Résultat | `cd`/`cd ..` avec chargement et déchargement automatique des variables | l. 48-89 |
| 3. Pourquoi ça marche | Ce que contient `.envrc`, `PATH_add` (résumé, sans dump du fichier complet) | l. 95-105 |
| 4. Installation | `apt install` + hook shell + premier `.envrc` | l. 26-46 |
| 5. Plus de démos | Cas Docker Compose, environnements multiples | l. 107-155 |
| 6. Sous le capot (optionnel) | Ce qu'il faut commiter, direnv + VSCode, comparaison avec l'approche manuelle | l. 157-195 |
| 7. Conclusion | Inchangée | l. 196-204 |

Cible : time to value < 15 %. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.
