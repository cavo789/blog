# Reader review : docusaurus-plugin-replace

**Détecté :** 2026-08-08
**Article :** blog/2025/09/18/docusaurus-plugin-replace/index.md
**Verdict :** RESTRUCTURE

## Problème

Time to value : **63 %** (preuve l. 62-68 sur un corps de 32 lignes, l. 42-74).
Drapeaux : abstraction-avant-preuve (`<Snippet>` du plugin complet l. 52, puis `<Snippet>` de
la configuration l. 58, tous deux avant la sortie console qui prouve que ça fonctionne).
Redondance : aucune, article court.

Test des 30 secondes : mitigé — l'article tient en un seul écran donc tout est visible en
scrollant, mais l'ordre demande de lire deux blocs de code (le plugin remark, la config)
avant de voir la moindre preuve que le remplacement fonctionne réellement.

## Risque

La sortie console (l. 62-68 : `🔎 Replacing 'vscode' with 'VSCode' in file: ...`) est la
preuve que le plugin fonctionne, et elle arrive après le code complet du plugin et sa
configuration. C'est l'anti-pattern "expliquer un fichier avant de montrer son effet".

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1 | Hook + promesse (inchangé) | l. 26-40 |
| 2 | Sortie console prouvant le remplacement (déplacée tôt, en teaser) | l. 62-68 |
| 3 | `## The plugin` (code du plugin, incluant la preuve déjà teasée) | l. 44-52 |
| 4 | `## Adding the plugin in your configuration` (inchangé) | l. 54-74 |

Le teaser en position 2 réutilise le bloc de sortie déjà présent dans l'article ; rien n'est
supprimé, la section 3 garde le code complet du plugin pour le lecteur qui veut l'implémenter.

Cible : time to value < 15 %. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.
