# Reader review : zsh-plugin-autosuggestions

**Détecté :** 2026-08-09
**Article :** blog/2024/03/29/zsh-plugin-autosuggestions/index.md
**Verdict :** RESTRUCTURE

## Problème

Time to value : **100 %** (preuve ligne 58 sur un corps de 24 lignes après `<!-- truncate -->`
— la seule capture de l'article est la toute dernière ligne).
Drapeaux : **install-avant-preuve** (clone git l. 40-42) et **abstraction-avant-preuve**
(`<Snippet>` du `.zshrc` l. 46), tous les deux avant la capture.

Test des 30 secondes : le lecteur lit "Installation" et un `git clone` avant de voir la
moindre preuve que la suggestion grise fonctionne — rien ne distingue encore cet article d'une
doc README classique.

## Risque

La capture `autosuggestions.webp` (l. 58) montre exactement la promesse du TLDR (suggestion en
gris, acceptable par <kbd>TAB</kbd>) mais arrive après l'installation complète : le lecteur qui
décide en 30 secondes ne la voit jamais.

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1 | Résultat : capture `autosuggestions.webp` + une phrase sur ce qui se passe (historique → suggestion grise → <kbd>TAB</kbd>) | l. 58, 52-56 |
| 2 | Installation : clone du repo + ajout dans `plugins=(...)` du `.zshrc` | l. 38-48 |
| 3 | Conclusion (à ajouter — l'article n'en a pas) | — |

Cible : time to value < 15 %. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.
