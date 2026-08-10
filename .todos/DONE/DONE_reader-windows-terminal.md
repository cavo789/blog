# Reader review : windows-terminal

**Détecté :** 2026-08-09
**Article :** blog/2024/04/01/windows-terminal/index.md
**Verdict :** RESTRUCTURE

## Problème

Time to value chiffré : 12 % (preuve ligne 43 sur un corps de 84 lignes, l. 33-117) — mais
drapeau **installation-avant-preuve** : la section `## Installation` (l. 35-37) précède la
première image de résultat (`windows_terminal.webp`, l. 43, sous `## Customize your profile`).
Redondance : aucune détectée.

Test des 30 secondes : « la toute première section après la troncature me parle
d'installation (déjà dans Windows 11, ou via le Store) avant de me montrer à quoi ressemble un
terminal personnalisé — l'effort est demandé avant la preuve, même si l'écart n'est que de deux
paragraphes. »

## Risque

L'article est le hub de la série Windows Terminal (fond d'écran, split panes, profil SSH ont
chacun leur propre article détaillé) : l'ouverture doit donner envie d'explorer la série. Or la
première chose lue est une note d'installation, pas la capture d'écran qui vend l'intérêt du
multi-onglets personnalisé.

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1 | `## Customize your profile` (démo + image `windows_terminal.webp`) | l. 39-65 |
| 2 | `## Installation` | l. 35-37 |
| 3 | `## Add a new profile` | l. 67-87 |
| 4 | `## Set the default profile` | l. 89-91 |
| 5 | `## Set the default folder for Ubuntu` | l. 93-99 |
| 6 | `## Open multiple tabs during the startup process` | l. 101-113 |
| 7 | `## Going further` | l. 115-117 |

Cible : time to value < 15 %. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.
