# Reader review : pentaho-discovery

**Détecté :** 2026-08-08
**Article :** blog/2025/06/20/pentaho-discovery/index.md
**Verdict :** RESTRUCTURE

## Problème

Time to value : **92 %** (preuve — la capture `Successfully executed` — en ligne 292 sur un
corps de 282 lignes après `<!-- truncate -->`).
Drapeaux : **install-avant-preuve** — `## Installation on Linux` avec un `<StepsCard>` de
téléchargement/installation Java (l.34-90) ouvre le corps de l'article, bien avant toute preuve
que Pentaho fait quelque chose d'utile.
Redondance : "transformation" cité 9 fois — 🔴, mais réparti sur des étapes réellement
différentes du flux (création, sauvegarde, exécution) plutôt qu'une redite du même fait.

Test des 30 secondes : "installation de Java, téléchargement d'une archive, ajout au PATH — et
je n'ai toujours pas vu ce que Pentaho fait" — sur 282 lignes de corps, la preuve (le chargement
réussi d'un Excel vers PostgreSQL) est à 92 % du texte.

## Risque

L'article est un tutoriel très complet et rien n'est à jeter : la capture finale
`Successfully executed` (l.292) et son pendant côté base de données (l.296-302) sont
convaincants, mais un lecteur qui veut juste savoir "à quoi ressemble un flux Pentaho qui
marche" doit d'abord lire l'installation de Java et du PATH.

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1 | Aperçu du résultat : capture `Successfully executed` + confirmation pgAdmin (preuve), avec une phrase resituant ce que fait le flux (Excel → transformation → PostgreSQL) | l.286-302 (captures déplacées) |
| 2 | `## Why it works` — 3-4 puces sans code : interface visuelle Spoon, connecteurs drag & drop, pas de code à écrire | nouveau, condensé depuis l.26-30 |
| 3 | `## Installation on Linux` (Java, GTK, PATH) | l.34-90 |
| 4 | `## Let's prepare our environment` — fichier Excel, PostgreSQL via Docker | l.92-174 |
| 5 | `## Build the transformation` — étapes détaillées Spoon (Load from Excel, connexion DB, Table output, sauvegarde, exécution) | l.176-308 |
| 6 | `## Conclusion` (déjà présente, à conserver telle quelle) | l.310-315 |

Cible : time to value < 15 %. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.
