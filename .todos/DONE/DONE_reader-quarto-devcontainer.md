# Reader review : quarto-devcontainer

**Détecté :** 2026-08-08
**Article :** blog/2025/11/03/quarto-devcontainer/index.md
**Verdict :** RESTRUCTURE

## Problème

Time to value : **60 %** (preuve l. 153/157 sur un corps de 180 lignes, l. 45-225).
Drapeaux : install-avant-preuve (section "Extra information" / installation de `sudo` et
Chromium l. 82-100) et abstraction-avant-preuve (`<ProjectSetup>`/`<Snippet>` l. 69-73, trois
fichiers de configuration avant toute preuve visuelle).
Redondance : correcte.

Test des 30 secondes : "j'abandonne" — le premier écran (l. 45-85) montre un téléchargement
de projet, un screenshot de VSCode vide, puis l'annonce "we'll need to create three files"
avec les trois Snippets. Aucune preuve que le devcontainer Quarto fonctionne réellement.

## Risque

Le vrai résultat (l. 153/157 : le devcontainer ouvert et `quarto preview` qui tourne déjà,
rechargement automatique à la sauvegarde) est l'argument central de l'article — "en moins
d'une minute" promis dans le TLDR — et il n'apparaît qu'après la création de trois fichiers
et deux avertissements d'installation (sudo, Chromium).

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1 | Hook + promesse (inchangé) | l. 33-43 |
| 2 | `## Let's get a simple Quarto project first` (téléchargement, ouverture VSCode) | l. 47-57 |
| 3 | Screenshot devcontainer ouvert + `quarto preview` déjà lancé (déplacé tôt) | l. 146-157 |
| 4 | `## We'll need to create three files` (ProjectSetup) | l. 59-80 |
| 5 | `## Extra information` (sudo) et `## Build arguments` (Chromium) — marquer "optionnel/à lire si besoin" | l. 82-133 |
| 6 | `## Opening our project as a Devcontainer` (détail complet, incl. le screenshot déjà teasé) | l. 134-165 |
| 7 | Reste (`## What have we done?`, synchronisation, terminal, pre-commit, Conclusion) | l. 161-225 |

Le screenshot en position 3 est un teaser du résultat déjà présent plus loin dans l'article ;
rien n'est retiré, la section 6 garde tout le détail (comment ouvrir le devcontainer pas à
pas) pour le lecteur qui continue.

Cible : time to value < 15 %. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.
