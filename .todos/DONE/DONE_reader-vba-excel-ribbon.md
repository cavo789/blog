# Reader review : vba-excel-ribbon

**Détecté :** 2026-08-11
**Article :** blog/2023/12/10/vba-excel-ribbon/index.md
**Verdict :** RESTRUCTURE

## Problème

Time to value : **22 %** (première vraie preuve — le ruban personnalisé visible dans Excel,
capture `UI_Editor_Sample.webp` l. 93 — sur un corps de 285 lignes, truncate l. 31).

Drapeaux : **install-avant-preuve** — la toute première section du corps est
`## Download the editor for free` (l. 33), qui envoie télécharger `CustomOfficeUIEditor` sur
un site tiers et extraire l'archive dans `C:\tmp\ribbon`. La deuxième section
(`## Create an empty file`, l. 43) demande encore de créer un classeur ; sa capture (l. 47)
montre un fichier Excel **vide** — ce n'est pas une preuve, c'est un prérequis illustré.

Deep-dive non signalé : `### Manifest analysis` (l. 100-233) est un bloc de **133 lignes**,
soit 47 % de l'article, en `###` imbriqué sous `## Add a ribbon in MS Office`. Rien dans son
titre n'indique qu'on peut le sauter, et sa position (juste après la première réussite) le
fait lire comme la suite obligatoire du tutoriel.

Redondance : 🟢 — les 12 fragments `customUI14.part*.xml` sont incrémentaux, chacun ajoute
une balise.

Test des 30 secondes : **j'abandonne** — on me demande de télécharger un outil « très
vieux » (dixit l'auteur) sur un site tiers avant de m'avoir montré une seule capture de
ruban. Je ne sais toujours pas à quoi ressemblera le résultat.

## Risque

Le lecteur d'une minute ne voit jamais le ruban fini. Les captures les plus convaincantes de
l'article — le bouton smiley posé dans un onglet maison (`Smiley.webp`, l. 205), le smiley
accompagné d'une zone de saisie (`Smiley_and_edit.webp`, l. 231), le clic qui déclenche la
macro (`Button_clicked.webp`, l. 225) — sont entre 65 % et 73 % de la page.

Rien n'est à jeter : l'article est complet, bien illustré (24 captures), incrémental. Il
commence simplement par la corvée au lieu de commencer par le trophée.

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1 | Accroche + promesse, `<!-- truncate -->` | l. 25-31 (inchangé) |
| 2 | **Le résultat** : « Voilà ce qu'on aura à la fin » — la capture du ruban maison avec son bouton et sa zone de saisie, plus une phrase disant que ça tient dans ~15 lignes de XML | l. 231 (`Smiley_and_edit.webp`), en renfort l. 225 (`Button_clicked.webp`) |
| 3 | Pourquoi ça marche, sans code : un `.xlsm` est une archive ; on y injecte un manifeste `customUI14.xml` ; MS Office lit ce manifeste au chargement et appelle des callbacks VBA | l. 39 + l. 56-58 (reformulé, sans XML) |
| 4 | Installation : `## Download the editor for free` + `## Create an empty file` | l. 33-52 |
| 5 | `## Add a ribbon in MS Office` — le premier ruban qui marche, jusqu'à la capture `UI_Editor_Sample.webp` et l'`<AlertBox>` « félicitations » | l. 54-98 |
| 6 | `## Under the Hood — the manifest, tag by tag (skip this if you just want a ribbon)` : promouvoir `### Manifest analysis` en `##` et signaler qu'elle est facultative | l. 100-233 (titre l. 100 à réécrire) |
| 7 | `## List of objects`, `## Find images`, `## Assign callbacks` | l. 235-312 |
| 8 | `## Going further` + Conclusion renvoyant à `vba-excel-ribbon-load` et `vba-excel-sql-server-part-2` | l. 314-316 + l. 29 |

Deux points de vigilance pendant le déplacement :

- La capture retenue au mouvement 2 est réutilisée telle quelle plus bas (l. 231) : soit on
  l'y laisse aussi (elle y conclut une démonstration incrémentale), soit on remplace celle du
  bas par un renvoi. Ne pas la dupliquer sans le décider.
- L'`<AlertBox variant="caution">` « ferme le fichier dans Excel avant de l'ouvrir dans
  l'éditeur » (l. 66-69) doit rester **au-dessus** de la première ouverture de l'éditeur,
  donc suivre le mouvement 5.

Cible : time to value < 15 %. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.
