# Reader review : vscode-devcontainer

**Détecté :** 2026-08-11
**Article :** blog/2024/02/09/vscode-devcontainer/index.md
**Verdict :** RESTRUCTURE

## Problème

Time to value : **22 %** (preuve ligne 142, `./images/index_php_correctly_formatted.webp`, sur un corps
de 419 lignes après le `<!-- truncate -->` l. 49). C'est le plus long article du lot : 468 lignes.

Drapeaux :

- **install-avant-preuve** — `## 2. Install first the ms-azuretools.vscode-docker VSCode extension`
  l. 102, `devcontainer.json` l. 112, `Dockerfile` l. 118, `Reopen in Container` l. 120-136 : tout le
  tunnel d'installation précède la preuve l. 142 ;
- **abstraction-avant-preuve** — `<Snippet filename="index.php">` l. 73 et les deux Snippets de config
  l. 112 / 118 arrivent avant la capture qui montre le résultat.

Deep-dives non signalés : les 5 sections outils (`### The first tool …` l. 151, `### The second set …`
l. 227, `### The third tool …` l. 291, `### The fourth tool …` l. 319, `### The best for last …` l. 334)
occupent ~320 des 419 lignes du corps. Aucune ne porte de signal « optionnel / vous pouvez sauter ».

Landing : **absente**. L'article se termine l. 457-468 sur une liste à puces d'extensions VSCode avec
leurs descriptions marketplace. Pas de `## Conclusion`, pas de retour sur la frustration d'ouverture,
pas de « où aller ensuite ».

Redondance : la liste des extensions l. 457-468 redit intégralement le contenu du
`devcontainer.json` déjà montré cinq fois en versions successives (l. 112, 159, 246, 295, 351). 🟠

Test des 30 secondes : *je reste* — le hook (deux situations concrètes, le collègue qui ne respecte pas
l'indentation) est excellent. Mais l'article me fait immédiatement télécharger un projet
(`terminal-4.txt`, l. 55) puis écrire un `index.php` moche, sans m'avoir montré une seule fois à quoi
ressemble le résultat final.

## Risque

Le lecteur d'une minute rate la paire avant/après, qui est **le seul argument** de l'article :
`index_php_bad_formatting.webp` (l. 75) et `index_php_correctly_formatted.webp` (l. 142). Les deux
captures existent déjà, elles sont simplement séparées par 67 lignes d'installation.

Second manque : `license.gif` (l. 206) montre l'en-tête de licence ajouté automatiquement à la sauvegarde
— c'est la démo la plus spectaculaire de l'article, enterrée à 37 %.

Enfin, l'AlertBox l. 32 (« Don't want to read this long article → jump to php-devcontainer ») dit au
lecteur de partir avant même le `<!-- truncate -->`. C'est honnête, mais placé là, ça remplace la preuve
par une porte de sortie.

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1 | Hook — les deux situations, la promesse (inchangé). Déplacer l'AlertBox « article trop long » **après** le mouvement 2, reformulée en « vous voulez juste l'environnement tout fait ? » | l. 36-49 ; AlertBox l. 32-36 |
| 2 | **`## What a Devcontainer Does For You`** — la paire avant/après collée : `index_php_bad_formatting.webp` puis `index_php_correctly_formatted.webp`, une phrase entre les deux : « même fichier, un `CTRL+S`, rien d'installé sur ma machine » | l. 75 + l. 142 |
| 3 | `## Why It Works` — 3 puces sans code : l'image contient les outils, `devcontainer.json` liste extensions + réglages, VSCode se rattache au conteneur | condensé de l. 97-100, 144-149 |
| 4 | `<AlertBox>` raccourci vers `php-devcontainer` (le lecteur pressé sort **ici**, après la preuve) | l. 32-36 |
| 5 | `## Get the files` — les deux `Terminal` de téléchargement | l. 51-63 |
| 6 | `## 1. Create the project` → `## 6. Working in the container` — le tutoriel pas à pas complet, inchangé | l. 65-149 (moins les deux captures déplacées) |
| 7 | `## The Tools (pick the ones you need)` — chapeau d'une ligne signalant que les 5 sous-sections sont indépendantes et sautables, puis les 5 outils inchangés | nouveau chapeau + l. 151-443 |
| 8 | `### And we can add more tools` + `### Extensions` | l. 445-468 |
| 9 | `## Conclusion` — **à créer** : ce qu'on retient (un `devcontainer.json` versionné = même environnement pour toute l'équipe), retour sur le collègue du hook, renvoi vers `php-devcontainer` et `docker-prod-devcontainer` | liens déjà présents l. 46 |

Note : envisager de remonter `license.gif` (l. 206) dans le mouvement 2 comme seconde preuve — c'est la
démo la plus visuelle de l'article.

Cible : time to value < 15 %. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.
