# Reader review : ollama-ai-explain (dossier .unpublished/ai-explain)

**Détecté :** 2026-08-08
**Clôturé :** 2026-08-08
**Article :** .unpublished/ai-explain/index.md
**Verdict :** DONE (restructuré selon le plan ci-dessous)

## Résumé de l'implémentation

Réordonnancement appliqué exactement selon la table — la démo `ai-explain deploy.sh` déplacée en position 2, « Prerequisites » + le `<Snippet>` de la fonction regroupés en position 4 (Installation), le reste réordonné sans suppression de contenu.

## Problème

Time to value : **15 %** (preuve — le `<Terminal>` `ai-explain deploy.sh` — ligne 49, sur un
corps de 150 lignes après `<!-- truncate -->`, l. 27). Le pourcentage seul serait vert, mais
deux drapeaux binaires déclenchent le verdict.
Drapeaux : install-avant-preuve (`## Prerequisites`, l. 29, juste après `<!-- truncate -->`) et
abstraction-avant-preuve (`<Snippet source="./files/ai-explain.zsh">`, l. 37, avant le premier
`<Terminal>`, l. 49).
Redondance : « deux modes, fichier ou pipe » énoncé **2 fois** (TLDR l. 18, prose l. 41-45) —
correct.

Test des 30 secondes : la première chose lue après l'accroche est une section « Prerequisites »
qui renvoie vers un autre article de la série (`_ollama.zsh`) — avant même de savoir ce que
`ai-explain` fait concrètement pour moi. Même schéma que `ollama-git-precommit`, déjà traité
(`.todos/reader-ollama-git-precommit.md`) : c'est un motif systémique de la série
« Ollama daily-use functions ».

## Risque

Le lecteur qui n'a pas suivi toute la série bute sur une dépendance avant d'avoir vu la valeur —
alors que la preuve (`ai-explain deploy.sh` → explication en clair) est déjà écrite et à
seulement 22 lignes de l'ancre `truncate`. Il suffit de l'avancer.

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1. Accroche | Inchangée | l. 21-26 |
| 2. Résultat | `ai-explain deploy.sh` et son explication en clair | l. 47-77 |
| 3. Pourquoi ça marche | Résumé en une ligne des 3 modes d'entrée (pipe/fichier/inline), sans le code | l. 41-45 |
| 4. Installation | Prérequis (`_ollama.zsh` de la série) + la fonction (`<Snippet>`) | l. 29-39 |
| 5. Plus de démos | Stack trace, pipe de commande, dispatcher `ai` | l. 78-151 |
| 6. Sous le capot (optionnel) | « When ai-explain is most useful » | l. 152-161 |
| 7. Conclusion | Clôture de série, inchangée | l. 162-177 |

Cible : time to value < 15 %. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.
