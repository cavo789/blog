# Reader review : vba-excel-sql-server-part-2

**Détecté :** 2026-08-09
**Article :** blog/2025/03/16/vba-excel-sql-server-part-2/index.md
**Verdict :** RESTRUCTURE

## Problème

Time to value : **61 %** (preuve ligne 149 sur un corps de 190 lignes, l.33-223).
Drapeaux : install-avant-preuve (`docker run` l.44, section "Download SQL Server..." dès l.35) et
abstraction-avant-preuve (`<Snippet filename="create_db.sql">` l.61, avant toute preuve).
Redondance : l'avertissement "connection string en clair si login/password fournis" énoncé **2
fois** à l'identique (`<AlertBox variant="danger">` l.193-196 et l.216-219).

Test des 30 secondes : "j'abandonne" — dès la sortie du `<!-- truncate -->`, on me demande
d'installer SQL Server, de lancer un conteneur Docker et de créer une base de données factice
avant d'avoir vu une seule ligne prouvant que Excel peut réellement afficher des données SQL
Server via VBA.

## Risque

Le lecteur qui vient chercher "puis-je connecter Excel à SQL Server en VBA" ne voit la capture
`worksheet.webp` ("You got the list of customers", l.147-149) — la preuve réelle du résultat
promis — qu'après avoir traversé toute l'installation SQL Server ET tout le paramétrage VBA
(classe, module, références). L'article se termine aussi brutalement sur un `<Snippet>` (l.223)
sans section de conclusion : pas de récapitulatif, pas de lien suivant.

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1. Le résultat | Capture `worksheet.webp` + phrase "You got the list of customers" | l. 143-149 |
| 2. Pourquoi ça marche | 3-4 puces sans code : la classe VBA `clsData` pilote ADO vers SQL Server ; `CopyToSheet` copie une seule fois, `AddQueryTable` garde la connexion pour un Refresh | nouveau, distillé des l. 153-183 |
| 3. Installation | Télécharger/lancer SQL Server + créer la base factice (l. 35-69) puis créer la classe VBA, le module, régler les références (l. 71-137) | l. 35-137 |
| 4. Autres démos | Le détail des trois sous-routines avec leur code (`CopyToSheet`, `AddQueryTable`, `RunSQLAndExportNewWorkbook`) | l. 151-223 |
| 5. Sous le capot (marquer le titre "optionnel") | Fusionner les deux `AlertBox danger` en un seul avertissement sur la connection string en clair | l. 193-196 + 216-219 |
| 6. Conclusion | Ajouter un vrai paragraphe de clôture (récap + lien retour vers l'article part 1 déjà cité l.27) — actuellement absent | à créer |

Cible : time to value < 15 %. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.
