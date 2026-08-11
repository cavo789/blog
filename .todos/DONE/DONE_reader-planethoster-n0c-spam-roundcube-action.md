# Reader review : planethoster-n0c-spam-roundcube-action

**Détecté :** 2026-08-11
**Article :** blog/2024/01/28/planethoster-n0c-spam-roundcube-action/index.md
**Verdict :** RESTRUCTURE

## Problème

Time to value : **45 %** (preuve ligne 183 — le bloc `none` montrant le `roundcube.sieve`
généré — sur un corps de 326 lignes, `<!-- truncate -->` en ligne 35).

Drapeaux :

- **install-avant-preuve** : `sudo apt-get update && sudo apt-get install jq` en ligne 179,
  soit 4 lignes avant la première preuve.
- **abstraction-avant-preuve** : le script `generate.sh` complet (l. 126-167, ~40 lignes de
  Bash) est donné avant que le lecteur ait vu ce que le script produit. Idem pour
  `patterns.json` (l. 76-102) et `spam.template` (l. 108-115).

Redondance : correcte (🟢). Le format de règle Sieve apparaît 3 fois (l. 41-47, l. 108-115,
l. 183-199) mais chaque occurrence est différente : l'exemple, le template, la sortie générée.
Rien à couper.

Points positifs à conserver : les deux chapitres GitHub sont déjà marqués optionnels
(`<AlertBox variant="info" title="Optional chapter">`, l. 220 et l. 248), et l'article a une
`## Conclusion` (l. 357).

Test des 30 secondes : **j'abandonne** — après le truncate je reçois un plan en 5 étapes puis
trois fichiers à créer et 40 lignes de Bash, sans avoir jamais vu à quoi ressemble le résultat
ni la capture RoundCube qui prouve que ça marche.

## Risque

Le lecteur d'une minute rate exactement les deux éléments qui vendent l'article, et **les deux
existent déjà** :

- le `roundcube.sieve` généré (l. 183-199) — la sortie concrète du générateur ;
- la capture `./images/filters.webp` (l. 211) — la liste de filtres RoundCube remplie
  automatiquement, la preuve visuelle que le pipeline fonctionne.

Il rate aussi la promesse en une phrase, enterrée en l. 244-246 : « tu modifies le fichier JSON
sur ton PC et RoundCube reçoit les nouvelles règles automatiquement, quelques secondes plus
tard ». C'est le pitch de l'article, il arrive à 64 % de la page.

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1. Hook | Frustration + articles précédents + promesse | l. 26-33 (inchangé) |
| 2. `## What You Get` | Le `roundcube.sieve` généré, puis la capture des filtres RoundCube, puis la phrase « tu pushes le JSON, RoundCube reçoit les règles » | l. 183-199 + l. 211 + l. 244-246 |
| 3. `## The Idea` | Une liste de valeurs + un template Sieve, zéro code | l. 37-52 |
| 4. `## Our Action Plan` | Le `StepsCard` en 5 étapes | l. 54-66 |
| 5. `## Building the Generator` | `mkdir`, `patterns.json`, `spam.template`, `generate.sh`, `chmod +x` | l. 68-177 |
| 6. `## Deploying the File by FTP` | Chemin FTP N0C + vérification dans RoundCube | l. 204-216 |
| 7. `## Automating It with GitHub Actions (optional)` | Repo GitHub + workflow + secrets — garder les deux `AlertBox` « Optional chapter » | l. 218-339 |
| 8. `## Everything Is Now in Place` | Push d'un pattern + captures Actions/FTP Deploy | l. 341-355 |
| 9. `## Conclusion` | Inchangée | l. 357-361 |

Détails à traiter pendant le déplacement :

- L'installation de `jq` (l. 179) descend en mouvement 5, dans un `<AlertBox variant="tip">`
  ou un `<Details>` — c'est un prérequis conditionnel, pas une étape du chemin heureux.
- Le « Congratulations: you've successfully created your anti-spam generator » (l. 201) reste
  en mouvement 5, à la fin de la construction — pas en mouvement 2 où il n'aurait plus de sens.
- Après déplacement, vérifier que le bloc `none` du mouvement 2 est bien introduit par une
  phrase du type « voici ce que le générateur écrit » : sorti de son contexte, il a besoin
  d'une amorce d'une ligne.

Cible : time to value < 15 % (preuve avant la ligne 84). Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.
