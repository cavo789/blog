# Reader review : bash-console-log-together

**Détecté :** 2026-08-09
**Article :** blog/2024/05/03/bash-console-log-together/index.md
**Verdict :** RESTRUCTURE

## Problème

Time to value : **100 %** (aucune preuve dans tout le corps, T=28, E=47, BODY=19 lignes).
Drapeaux : abstraction-avant-preuve (le `<Snippet>` `script.sh` en l. 36 arrive sans qu'aucun
`<Terminal>` ni capture ne montre jamais la double sortie console+logfile promise par le
TLDR).
Redondance : aucune, pas de répétition notable.

Test des 30 secondes : *"je doute que ça marche"* — l'article promet un affichage
simultané console + fichier de log, mais ne montre jamais ce résultat : seulement deux
scripts (le bon, le mauvais) sans transcript de leur exécution.

## Risque

Contrairement à un article "recette" où le script est lui-même la livraison (voir
`ftp-erase-files`, `winscp-synchronize-both`), celui-ci porte sur un **comportement**
(sortie simultanée console + fichier) qui a besoin d'être prouvé par un exemple d'exécution.
Sans capture d'écran ni `<Terminal>`, le lecteur doit croire l'auteur sur parole.

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1 | Accroche + TLDR (inchangé) | l. 22-26 |
| 2 | **Nouveau** : `<Terminal>` montrant `script.sh` en cours d'exécution — la sortie apparaît à l'écran ET dans `application.log` en simultané | à créer, capture le comportement promis |
| 3 | `<Snippet>` `script.sh` (le bon script) | l. 36 |
| 4 | Explication de `eval` | l. 38-40 |
| 5 | Contre-exemple : `script.part2.sh` (sortie bufferisée, "Don't do things like that!") | l. 42-46 |

Cible : time to value < 15 %. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.

Note : ce TODO nécessite un nouvel enregistrement de terminal (fichier `./files/` à
générer), pas seulement un réordonnancement — à signaler lors de l'implémentation.
