# Reader review : docusaurus-bluesky-comments

**Détecté :** 2026-08-08
**Article :** blog/2025/08/18/docusaurus-bluesky-comments/index.mdx
**Verdict :** RESTRUCTURE

## Problème

Time to value : **100 %** (aucune image, aucune capture d'écran, aucun terminal dans tout le
corps de 95 lignes — uniquement des `<StepsCard>` explicatifs et cinq `<Snippet>`
d'implémentation).
Drapeaux : abstraction-avant-preuve (par construction, puisqu'aucune preuve n'existe nulle part
dans l'article).

Test des 30 secondes : le lecteur comprend le principe (lier un post Bluesky à un article via
`blueskyRecordKey`) mais ne voit jamais à quoi ressemble le résultat final — ni le bouton, ni
le compteur de likes/reposts, ni la liste de commentaires. Pour un article qui vend
explicitement une fonctionnalité visuelle ("Display the number of likes and reposts... Display
the list of comments"), c'est l'anti-pattern le plus net du guide de structure.

## Risque

Le composant Bluesky décrit ici est réellement utilisé sur ce blog (visible en bas de tout
article publié récent) : une capture de ce rendu existant suffirait à combler entièrement le
manque, sans travail de développement supplémentaire.

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1 | Hook + promesse (inchangé) | l. 33-35 |
| 2 | **Nouveau** : capture d'écran du bloc Bluesky complet en bas d'un article publié (bouton + compteurs de likes/reposts + liste de commentaires) — à produire | — |
| 3 | Le workflow en `<StepsCard>` (inchangé) | l. 39-61 |
| 4 | 1/5 à 5/5 : création des fichiers (inchangé) | l. 65-116 |
| 5 | Update the Docusaurus configuration file (inchangé, sert de conclusion) | l. 118-132 |

Cible : time to value < 15 %. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.

**Note :** ce RESTRUCTURE nécessite une capture qui n'existe pas encore — à produire avant
d'implémenter, sinon l'article reste à 100 % de TTV même réordonné.
