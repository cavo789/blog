# Reader review : quarto-industrialisation

**Détecté :** 2026-08-08
**Clôturé :** 2026-08-08
**Article :** blog/2026/03/16/quarto-industrialisation/index.md
**Verdict :** DONE (restructuré selon le plan ci-dessous)

## Résumé de l'implémentation

Réordonnancement appliqué selon la table — le « Wow Moment » (capture du diagramme généré) déplacé en position 2, avant le dump des 5 fichiers du labo. Le principe `{python}`/`output: asis` reformulé sans code en position 3 (« Why It Works »).

## Problème

Time to value : **35 %** (preuve l. 116 sur un corps de 238 lignes, l. 32-270).
Drapeaux : **abstraction-avant-preuve** — la section "🛠️ The Wow Lab" annonce un labo de 5 minutes mais
enchaîne cinq `<Snippet>` d'implémentation (`compose.yaml`, `Dockerfile`, `devcontainer.json`, 4 scripts
Python, `index.qmd`) avant qu'aucun résultat ne soit montré.
Redondance : aucune majeure.

Test des 30 secondes : le titre de la section promet un "Wow Lab" rapide, mais ce qui suit immédiatement
est un dump de code, pas un wow. Le lecteur qui voulait voir le résultat avant d'investir doit défiler
au-delà de 5 blocs de code.

## Risque

Les deux captures qui montrent vraiment l'écosystème en action (`devcontainer.webp` l. 116,
`automated_infrastructure_map.webp` l. 120) sont fortes, mais noyées après le dump de fichiers. Le nom de
la section ("Wow Lab", "5 minutes") crée une attente que la structure actuelle ne tient pas.

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1 | Hook + promesse (inchangé) | l. 18-30 |
| 2 | Le "Wow Moment" : `preview.sh`, capture du diagramme généré | l. 109-136 |
| 3 | Pourquoi ça marche (le principe `{python}` / `output: asis`, sans dump de fichiers) | l. 75-88 (reformulé, sans les 5 Snippets) |
| 4 | Installation : les 6 fichiers du labo, via `<ProjectSetup>` | l. 44-107 |
| 5 | Mon cas réel (les 50 projets) et la suite | l. 138+ |

Cible : time to value < 15 %. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.
