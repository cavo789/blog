# Reader review : docker-joomla-restore-jpa

**Détecté :** 2026-08-09
**Article :** blog/2024/10/18/docker-joomla-restore-jpa/index.mdx
**Verdict :** RESTRUCTURE

## Problème

Time to value : **79 %** (preuve ligne 160 — sortie `docker compose` réelle — sur un corps de
148 lignes, entre les lignes 43 et 191).

Drapeaux : install-avant-preuve (toute la section « Creating required files », l. 45-126, fait
créer quatre fichiers — `compose.yaml`, `.env`, `makefile`, `Dockerfile` — avant la moindre
preuve) et abstraction-avant-preuve (les `<Snippet>` de ces quatre fichiers précèdent toute
sortie).

Redondance : la commande `make import` est annoncée trois fois (l. 41, 148, 187) — sous le seuil
🟠, pas un problème en soi.

Test des 30 secondes : « j'abandonne » — la TLDR promet un `make import` qui restaure tout, mais
le corps enchaîne immédiatement sur quatre fichiers à copier/coller (avec un raccourci `git
clone` proposé dès le départ, ce qui trahit que la voie « manuelle » est fastidieuse) avant de
montrer le moindre résultat.

## Risque

Les trois captures d'écran qui prouvent que ça marche (Kickstart, l. 164 ; restauration de la
base, l. 168 ; site restauré, l. 172) existent déjà mais arrivent après 120 lignes de setup — le
lecteur qui doute de l'intérêt de la méthode n'ira jamais jusque-là.

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1 | Résultat : Kickstart qui restaure la base + site restauré (captures) | l. 164-172 |
| 2 | Pourquoi ça marche (réutilise le compose de la Part 2, juste PHP + Apache) | l. 35-41, 68, reformulé sans code |
| 3 | Créer les fichiers requis (compose.yaml, .env, makefile, Dockerfile) — avec le raccourci `git clone` en premier | l. 45-126 |
| 4 | Récupérer sa sauvegarde + Akeeba Kickstart | l. 114-126 |
| 5 | Vérifier les fichiers avant de lancer (`ls -alh`) | l. 128-142 |
| 6 | Lancer l'import (`make import`) et sa sortie console | l. 144-162 |
| 7 | Conclusion | l. 179-191 |

Cible : time to value < 15 %. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.
