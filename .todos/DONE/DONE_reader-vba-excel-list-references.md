# Reader review : vba-excel-list-references

**Détecté :** 2026-08-08
**Article :** blog/2025/10/27/vba-excel-list-references/index.md
**Verdict :** RESTRUCTURE

## Problème

Time to value : **93 %** (preuve l. 46 sur un corps de 15 lignes, l. 32-47).
Drapeaux : abstraction-avant-preuve (`<Snippet filename="run.vbs">` l. 38, le script complet
affiché avant tout résultat).
Redondance : aucune, l'article est très court.

Test des 30 secondes : l'article tient en un seul écran, donc le lecteur voit tout — mais
l'ordre impose de lire/scroller un script VBS complet avant de savoir ce qu'il produit.

## Risque

Le corps de l'article est minuscule mais suit l'anti-pattern classique "expliquer un fichier
avant de montrer son effet" : le script `run.vbs` (implémentation) précède le `<Terminal>`
qui montre le résultat (liste des références). Inverser l'ordre coûte une phrase et rend
l'article auto-suffisant dès la première ligne après le `<!-- truncate -->`.

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1 | "Voici ce que tu obtiens" + le `<Terminal>` de sortie (déplacé tôt) | l. 44-47 |
| 2 | "Comment l'obtenir" : créer `run.vbs`, coller le script | l. 34-38 |
| 3 | Lancer `cscript run.vbs` (phrase de clôture, inchangée) | l. 40-43 |

Rien n'est supprimé : le script et les instructions restent identiques, seule la preuve
(sortie du script) passe avant l'implémentation.

Cible : time to value < 15 %. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.
