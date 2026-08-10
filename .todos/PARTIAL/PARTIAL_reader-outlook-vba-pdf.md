# Reader review : outlook-vba-pdf

**Détecté :** 2026-08-09
**Article :** blog/2024/07/10/outlook-vba-pdf/index.md
**Verdict :** RESTRUCTURE

## Problème

Time to value : **100 %** — aucune image ne montre le résultat final (un PDF produit) ; les
seules captures montrent des étapes d'installation (le nouveau bouton l. 58) ou d'usage
(dialogues l. 66, 72), jamais le livrable.
Drapeaux : **installation-avant-preuve** — `## Prerequisites` (l. 30) puis `## Installation
steps` avec un `<StepsCard>` de 11 étapes (l. 38-54) ouvrent le corps de l'article, avant toute
démonstration.

Test des 30 secondes : "11 étapes dans l'éditeur VBA avant de savoir si la macro fait vraiment ce
qu'elle promet" — le lecteur abandonne avant la macro elle-même.

## Risque

L'article a du contenu utile (le comportement exact de la macro : confirmation, choix du dossier,
suppression optionnelle, nommage manuel ou automatique) mais il n'existe nulle part une preuve
visuelle du résultat (un dossier contenant les PDF générés). Le contenu d'usage (l. 60-78) décrit
le comportement sans jamais le montrer produit.

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1 | Hook (inchangé) | l. 22-26 |
| 2 | Le résultat : description resserrée du flux d'usage (sélection → confirmation → dossier → PDF) — ajouter une capture du dossier de sortie rempli de PDF si disponible | l. 60-78 |
| 3 | Prérequis + installation (`## Prerequisites`, `<StepsCard>`) | l. 30-58 |

Cible : time to value < 15 %. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.

Note : contrairement aux autres TODO de ce lot, ce fichier signale aussi un manque de preuve
matérielle (aucune capture du résultat final) — à combler idéalement en même temps que le
réordonnancement.

## Status — PARTIAL (2026-08-09)

### Fait

- Réordonnancement complet : nouvelle section `## Result` juste après le hook, condensant le
  flux d'usage (sélection → confirmation → dossier → suppression/nommage) avec la capture
  `five_emails_selected.webp` existante.
- Prérequis + installation (`<StepsCard>`) repoussés après le résultat, ordre sinon inchangé.
- Ajout d'une `<AlertBox variant="note">` transparente signalant que la capture du dossier de
  sortie rempli de PDF n'existe pas encore, pour ne pas laisser croire qu'elle existe.

### Non fait

- Capture du dossier de sortie rempli de PDF générés — **bloqué**.
  **Raison :** nécessite d'exécuter la macro VBA dans un vrai Outlook desktop et de
  screenshotter le résultat ; hors de portée d'une session d'édition de texte. Une fois la
  capture ajoutée dans `./images/`, l'insérer dans la section `## Result` pour clore ce TODO.
