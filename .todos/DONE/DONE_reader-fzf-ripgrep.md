# Reader review : fzf-ripgrep

**Détecté :** 2026-08-08
**Clôturé :** 2026-08-08
**Article :** blog/2026/06/08/fzf-ripgrep/index.md
**Verdict :** DONE (restructuré selon le plan ci-dessous)

## Résumé de l'implémentation

Réordonnancement appliqué selon la table — la capture du panneau de preview fzf+bat déplacée en position 2, avant les prérequis (ripgrep, bat).

## Problème

Time to value : **22 %** (preuve ligne 76 sur un corps de 213 lignes).
Drapeaux : **install-avant-preuve** — la section « Prerequisites » et les deux blocs
`<Prerequisite install="sudo apt install ripgrep">` / `<Prerequisite install="sudo apt install
bat">` (l. 32-64) précèdent tout élément de preuve.
Redondance : aucune détectée au-delà du seuil.

Test des 30 secondes : « je dois installer deux outils avant de voir si l'aperçu fzf+bat vaut le
coup » — la vraie démonstration du produit (le panneau de preview syntax-highlighted, l. 94-108)
n'apparaît qu'après l'installation complète.

## Risque

Le vrai "wow" de l'article n'est pas le comparatif ripgrep/grep (l. 76) mais la capture d'écran du
panneau de preview `bat` en action (l. 106, « Searching for DB_PASSWORD with preview ») — déjà
présente dans l'article, mais reléguée à 35 % de la lecture, après deux installations.

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1 | Hook + promesse (inchangé) | l. 22-28 |
| 2 | Preuve : capture du panneau de preview `fzf` + `bat` en action | l. 94-108 |
| 3 | Pourquoi ripgrep plutôt que grep (comparatif Terminal) | l. 66-78 |
| 4 | Prérequis : ripgrep et bat | l. 32-64 |
| 5 | Étape 1 — Connecter ripgrep à fzf | l. 80-92 |
| 6 | Étape 2 — Détail des flags du panneau de preview | l. 110-141 |
| 7 | Étape 3 — La fonction `rgf` | l. 143-166 |
| 8 | Scénarios réels | l. 168-214 |
| 9 | Pour aller plus loin | l. 216-243 |

Cible : time to value < 15 %. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.
