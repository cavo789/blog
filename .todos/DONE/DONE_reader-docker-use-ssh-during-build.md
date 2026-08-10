# Reader review : docker-use-ssh-during-build

**Détecté :** 2026-08-09
**Article :** blog/2024/09/03/docker-use-ssh-during-build/index.md
**Verdict :** RESTRUCTURE

## Problème

Time to value : **62 %** (preuve ligne 124 sur un corps de 150 lignes).
Drapeaux : abstraction-avant-preuve — les `<Snippet>` de `compose.yaml` (l. 79, 89) et du
`Dockerfile` (l. 104) précèdent tous la capture "You're authenticated" (l. 124), qui est la
première preuve réelle que la technique fonctionne.
Redondance : aucune.

Test des 30 secondes : "je risque d'abandonner" — avant de savoir si la méthode marche, le
lecteur doit lire une explication théorique ("pourquoi c'est important"), identifier sa propre
clé SSH, puis lire deux fichiers complets (`compose.yaml` et `Dockerfile`) commentés ligne par
ligne. La preuve n'arrive qu'à 62 % du corps.

## Risque

L'article a une preuve forte et déjà écrite (la capture "You're authenticated" ligne 124, qui
montre concrètement que le secret est partagé pendant le build sans être gravé dans l'image)
mais elle est enterrée après deux fichiers de configuration complets. Le lecteur qui décroche
avant la ligne 124 ne verra jamais la partie la plus convaincante de l'article.

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1 | Accroche + promesse (inchangé) | l. 1-30 |
| 2 | Aperçu : capture "You're authenticated" comme preuve que le secret est utilisé sans être stocké | l. 124 |
| 3 | Pourquoi ça marche (3-4 puces, sans code) : le montage `--mount=type=secret` n'existe que pendant ce layer, jamais gravé dans l'image | condensé de l. 37-48 |
| 4 | Prérequis : identifier quelle clé SSH utiliser | l. 50-69 |
| 5 | Construire les deux fichiers (`compose.yaml` + `Dockerfile`) | l. 71-114 |
| 6 | Vérifier : build, run, confirmer l'absence de la clé dans l'image | l. 116-142 |
| 7 | Aller plus loin : partager aussi la clé avec le conteneur en cours d'exécution | l. 144-181 |
| 8 | Conclusion (nouvelle section) : récap du principe secret-au-build vs clé-au-conteneur | nouveau |

Cible : time to value < 15 %. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.
