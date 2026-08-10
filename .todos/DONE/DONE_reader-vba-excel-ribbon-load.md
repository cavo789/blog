# Reader review : vba-excel-ribbon-load

**Détecté :** 2026-08-09
**Article :** blog/2025/02/22/vba-excel-ribbon-load/index.md
**Verdict :** RESTRUCTURE

## Problème

Time to value : **96 %** (preuve ligne 104 sur un corps de 73 lignes, l.34-107).
Drapeaux : abstraction-avant-preuve (`<Snippet filename="customui.xml">` l.60 et
`<Snippet filename="module.bas">` l.91, tous deux avant la moindre preuve).
Redondance : aucune notable.

Test des 30 secondes : "j'abandonne" — la sortie du `<!-- truncate -->` enchaîne nommage de
plage, téléchargement d'un éditeur XML tiers, collage de code XML puis VBA, sans qu'on ait vu
une seule fois le menu déroulant réellement fonctionner dans le ruban.

## Risque

La capture `demo.webp` (l.102-104), qui montre le menu déroulant chargé et la valeur écrite
dans la cellule — le résultat exact promis par le titre — n'apparaît qu'à la toute fin, après
trois sections d'installation. L'article se termine aussi sur une seule phrase de lien
(l.106) sans réel récapitulatif.

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1. Le résultat | Capture `demo.webp` : le menu déroulant chargé, valeur écrite dans la cellule | l. 102-104 |
| 2. Pourquoi ça marche | 2-3 puces sans code : une plage nommée alimente un contrôle ruban via un callback VBA ; pas de valeurs codées en dur | nouveau, distillé des l. 24-32 |
| 3. Installation | Créer la plage nommée + la cellule cible (l. 36-48), ajouter le ruban via le Custom UI Editor et coller le XML (l. 50-66), créer le module VBA et coller le code (l. 68-100) | l. 36-100 |
| 4. Sous le capot (marquer le titre "optionnel") | Les deux `AlertBox` sur le codename de la feuille et l'extension `.xlsm` | l. 76-79, 97-100 |
| 5. Conclusion | Étoffer le lien final en un vrai récapitulatif | l. 106 |

Cible : time to value < 15 %. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.
