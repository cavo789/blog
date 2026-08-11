# Reader review : makefile-help

**Détecté :** 2026-08-11
**Article :** blog/2023/12/25/makefile-help/index.md
**Verdict :** RESTRUCTURE

## Problème

Time to value : **63 %** (premier écran d'aide réellement affiché l. 96, corps de 110 lignes,
truncate l. 27). L'écran d'aide *final* — celui du titre, avec les sections groupées
(`terminal-1.txt`) — est l. 129, soit **93 %**.
Le `<Terminal source="./files/terminal-3.txt">` de la l. 61 n'est pas une preuve : c'est un
`ls -alh` qui montre qu'un fichier `makefile` existe.

Drapeaux :

- **install-avant-preuve** : `<StepsCard variant="prerequisites">` l. 29 puis
  `## Install GNU Make if needed` l. 38 avec son `sudo apt-get -y install make`, avant toute sortie ;
- **abstraction-avant-preuve** : `<Snippet filename="makefile">` l. 52, avant toute exécution.

Redondance : 🟠 — la phrase « l'indentation doit se faire avec des tabulations » et le principe
« une description se préfixe par `##` » sont chacun énoncés dans le corps *et* re-signalés en
AlertBox ; le `<StepsCard>` de prérequis (l. 29-37) répète mot pour mot ce que dit la section
`## Install GNU Make if needed` juste dessous.
Landing : correcte (l. 133-137 : le makefile du blog + lien vers `makefile_tips`).

Test des 30 secondes : *« je décroche »* — le titre me promet un écran d'aide ; le premier écran
me montre une carte de prérequis, `which make`, `apt-get install` et un `ls -alh`.

## Risque

L'article a le meilleur argument possible et ne s'en sert pas : `./files/terminal-1.txt` est un
écran d'aide `make` complet, coloré, groupé par sections. Montré en tête, il vend l'article en deux
secondes. Placé l. 129, il ne sert qu'à ceux qui sont déjà convaincus.

Le lecteur type a **déjà** un makefile (c'est le prérequis annoncé) : lui faire lire `which make`
avant de lui montrer le résultat est un contresens sur son état d'avancement.

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1 | `## What you will get` — le `<Terminal source="./files/terminal-1.txt">` (écran d'aide final groupé) + une phrase « voici ce que `make` affichera à la fin de cet article » | l. 129 |
| 2 | `## The starting point` — le makefile d'exemple et l'AlertBox sur les tabulations | l. 46-62 (sans le `ls -alh` l. 61) |
| 3 | `## Step 1 - Adding the default action` | l. 63-85 |
| 4 | `## Step 2 - Adding the help target` | l. 86-102 |
| 5 | `## Step 3 - Add a description for each target` | l. 103-118 |
| 6 | `## Step 4 - Add a subtitle between each "main section"` (sans re-montrer `terminal-1.txt`, remplacé par un renvoi « c'est l'écran du début ») | l. 119-132 |
| 7 | `## Take a look on mine, for this blog` | l. 133-137 |

En complément : supprimer le `<StepsCard>` de prérequis (l. 29-37) — redondant avec la section
d'installation — et replier `## Install GNU Make if needed` (l. 38-45) dans un
`<Details label="make is not installed?">` placé juste avant le point 2.

Cible : time to value < 15 %. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.
