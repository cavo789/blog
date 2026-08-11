# Reader review : docker-healthy

**Détecté :** 2026-08-11
**Article :** blog/2023/12/12/docker-healthy/index.md
**Verdict :** RESTRUCTURE

## Problème

Time to value : **71 %** (preuve l. 40 — la capture `healthy.webp` — sur un corps de
21 lignes, truncate l. 25).

Drapeaux : **abstraction-avant-preuve** — le `<Snippet filename="health.sh">` est le premier
bloc du corps (l. 29). Le lecteur reçoit le script complet, plus une `<AlertBox>` technique
sur `docker container list --format`, plus un `chmod +x`, avant de voir à quoi ressemble la
sortie.

Redondance : 🟢.

Test des 30 secondes : **je reste de justesse** — l'article est court, mais on me demande de
créer un fichier et de le rendre exécutable avant de me montrer ce que j'y gagne. La capture
qui répond à « à quoi ça sert ? » est à la ligne 40 sur 46.

## Risque

Le lecteur d'une minute voit du Bash et un `chmod`, pas un tableau d'états `healthy` /
`null`. Or c'est exactement l'inverse de l'argument de l'article : la valeur, c'est le
**coup d'œil** sur l'état de tous les conteneurs, pas les 15 lignes de script qui le
produisent.

La capture existe déjà (`images/healthy.webp`) et le commentaire qui l'accompagne (l. 42 :
« beaucoup sont `healthy`, deux sont en `null` i.e. endormis, aucun arrêté sur erreur ») est
la meilleure phrase de l'article. Elle est en avant-dernière position.

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1 | Accroche + promesse, `<!-- truncate -->` | l. 21-25 (inchangé) |
| 2 | **Le résultat** : « Voici ce que j'obtiens sur ma machine » + la capture + la lecture des états `healthy` / `null` | l. 38-42 (capture l. 40 + commentaire l. 42) |
| 3 | Le script qui produit ça : `<Snippet health.sh>` + `chmod +x health.sh` | l. 27-29 + l. 36 |
| 4 | `<AlertBox>` sur `docker container list --all --format "{{.Names}}"` | l. 31-34 |
| 5 | Conclusion : « à adapter à tes besoins » + les deux liens sortants (uptime-kuma pour être *notifié*, docker-networking-troubleshooting pour diagnostiquer) | l. 44-46 |

Aucun contenu supprimé : c'est un échange de deux blocs (l. 29 ↔ l. 40) plus le déplacement
du `chmod` avec le script.

Cible : time to value < 15 %. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.
