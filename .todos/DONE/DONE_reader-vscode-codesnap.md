# Reader review : vscode-codesnap

**Détecté :** 2026-08-09
**Article :** blog/2024/04/19/vscode-codesnap/index.md
**Verdict :** RESTRUCTURE

## Problème

Time to value : **83 %** (preuve ligne 40 sur un corps de 12 lignes, l. 30-42).
Drapeaux : aucun (ni installation ni abstraction avant la preuve).
Redondance : aucune, article très court.

Test des 30 secondes : « le corps entier (12 lignes) explique comment utiliser l'extension
avant de me montrer un exemple de capture réussie — sur un article aussi court, le résultat
devrait être la toute première chose que je vois après la troncature. »

## Risque

L'image `codesnap.webp` (exemple de capture PHP) est la seule preuve visuelle après la
troncature et elle arrive à l'avant-dernière ligne. Sur un corps de 12 lignes, ça revient à
demander au lecteur de lire tout l'article avant de voir le résultat.

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1 | Image d'exemple (résultat : capture PHP stylée) | l. 40 |
| 2 | Étapes : sélection des lignes + bouton `Polaroid` | l. 32-36 |
| 3 | Clôture + lien police JetBrains Mono | l. 42 |

Cible : time to value < 15 %. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.
