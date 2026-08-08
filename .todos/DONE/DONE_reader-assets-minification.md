# Reader review : assets-minification

**Détecté :** 2026-08-08
**Clôturé :** 2026-08-08
**Article :** blog/2026/04/13/assets-minifcation/index.md
**Verdict :** DONE (restructuré selon le plan ci-dessous)

## Résumé de l'implémentation

Réordonnancement appliqué selon la table — la capture « Running the minification » déplacée en position 2, « Why This Approach » (sans code) en position 3, le reste réordonné sans suppression.

## Problème

Time to value : **80 %** (preuve ligne 101 sur un corps de 93 lignes).
Drapeaux : **install-avant-preuve** (Prerequisites + `apt-get install yq`, l. 56-59) **et**
**abstraction-avant-preuve** (`<Snippet filename="manifest.yaml">`, l. 43) — les deux précèdent la
capture d'écran de résultat (l. 101).
Redondance : aucune détectée.

Test des 30 secondes : « on m'explique l'architecture YAML, on me demande d'installer `yq`, de
créer plusieurs fichiers — et je n'ai toujours rien vu tourner. »

## Risque

Le résultat concret (« Running the minification », l. 101, cinq secondes chrono) est déjà présent
et déjà accompagné d'une preuve visuelle — mais à 80 % de la lecture, après toute l'installation.

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1 | Hook (inchangé) | l. 19-26 |
| 2 | Preuve : capture « Running the minification » | l. 99-103 |
| 3 | Pourquoi cette approche (sans code) | l. 109-114 |
| 4 | Architecture générale (high-level) | l. 29-36 |
| 5 | Installation : prérequis, manifest.yaml, build.sh | l. 56-93 |
| 6 | Regarder les flags de l'image Docker | l. 105-107 |
| 7 | Conclusion | l. 116-120 |

Cible : time to value < 15 %. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.
