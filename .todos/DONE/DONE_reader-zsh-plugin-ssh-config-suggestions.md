# Reader review : zsh-plugin-ssh-config-suggestions

**Détecté :** 2026-08-09
**Article :** blog/2025/02/13/zsh-plugin-ssh-config-suggestions/index.md
**Verdict :** RESTRUCTURE

## Problème

Time to value : **74 %** (preuve ligne 66 sur un corps de 35 lignes, l.40-75).
Drapeaux : install-avant-preuve (section "## Installation..." dès l.46, `git clone` l.48) et
abstraction-avant-preuve (`<Snippet filename="~/.zshrc">` l.52, `<Snippet filename="~/.ssh/config">`
l.60, tous deux avant la preuve).
Redondance : aucune notable.

Test des 30 secondes : "j'abandonne" — juste après le `<!-- truncate -->`, on enchaîne
installation Oh-My-Zsh (prérequis), clone du dépôt, édition de `.zshrc`, avant de voir le GIF
qui montre l'autosuggestion réellement à l'œuvre.

## Risque

Le GIF `zsh-plugin-ssh-config-suggestions.gif` (l.64-66), qui est la preuve visuelle exacte du
gain promis (`ssh ` + <kbd>TAB</kbd> → liste des alias), n'apparaît qu'après toute
l'installation. Le lecteur ne peut juger l'intérêt du plugin qu'après avoir déjà fait l'effort
de clone + édition.

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1. Le résultat | Le GIF d'autosuggestion + l'`AlertBox` sur l'espace après `ssh` | l. 62-70 |
| 2. Pourquoi ça marche | Le plugin lit `~/.ssh/config` et propose les alias en complétion (1-2 puces, sans code) | nouveau, distillé des l. 44-46 |
| 3. Installation | Clone du plugin + ajout dans `~/.zshrc` (l. 46-54) | l. 46-54 |
| 4. Configuration d'exemple | Contenu `~/.ssh/config` utilisé pour la démo | l. 58-60 |
| 5. Conclusion | Le lien existant vers `modular-zsh-workflow` | l. 74 |

Cible : time to value < 15 %. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.
