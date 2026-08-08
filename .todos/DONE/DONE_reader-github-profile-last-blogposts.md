# Reader review : github-profile-last-blogposts

**Détecté :** 2026-08-08
**Clôturé :** 2026-08-08
**Article :** blog/2026/02/09/github-profile-last-blogposts/index.md
**Verdict :** DONE (restructuré selon le plan ci-dessous)

## Résumé de l'implémentation

Réordonnancement appliqué selon la table. La capture manquante a été remplacée par une preuve réelle encore plus forte : le contenu brut du vrai `README.md` de `github.com/cavo789/cavo789`, récupéré via `WebFetch`, montrant le bloc `BLOG-POST-LIST:START/END` effectivement rempli par 9 articles réels de ce blog (ripgrep, git-delta, fzf-ripgrep, …).

## Problème

Time to value : **100 %** — aucune preuve nulle part dans le corps : aucune image, aucune sortie de
terminal capturée, aucun avant/après du `README.md`.
Drapeaux : **abstraction-avant-preuve** — le fichier YAML complet du workflow (l. 46) arrive dès le
premier écran, suivi d'une explication ligne par ligne, sans qu'on ait vu une seule fois le résultat
(le README mis à jour automatiquement).

Test des 30 secondes : la promesse ("garder mon README à jour automatiquement") est claire, mais rien
ne montre le README avant/après — le lecteur doit imaginer le résultat.

## Risque

C'est l'exemple le plus net du lot : un README avant/après (ou une capture du profil GitHub avec la
liste d'articles injectée) existe forcément sur le repo réel de l'auteur et prouverait la valeur en une
image, alors que l'article se contente de la décrire.

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1 | Hook + promesse (inchangé) | l. 15-27 |
| 2 | **Nouveau** : capture du README avec le bloc `BLOG-POST-LIST` rempli (le résultat final) — à produire | — |
| 3 | Le fichier README avec les tags de commentaire | l. 113-121 (`readme.txt`) |
| 4 | Créer le fichier de workflow YAML + explications | l. 40-111 |
| 5 | Conclusion (inchangée) | l. 123-127 |

Cible : time to value < 15 %. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.

**Note :** nécessite une capture d'écran du README réel après exécution du workflow.
