# Reader review : dos-case-sensitive

**Détecté :** 2026-08-09
**Article :** blog/2025/03/02/dos-case-sensitive/index.md
**Verdict :** RESTRUCTURE

## Problème

Time to value : **78 %** (preuve ligne 45 sur un corps de 18 lignes, l.31-49).
Drapeaux : aucun (pas de `<Prerequisite>`, pas d'`apt install`, pas de `<Snippet>` d'implémentation).
Redondance : aucune.

Test des 30 secondes : le corps entier tient dans la fenêtre de lecture (18 lignes), donc le
lecteur voit finalement la preuve — mais elle arrive après une capture d'écran d'ouverture de
PowerShell et la commande elle-même, alors qu'elle pourrait ouvrir le mouvement.

## Risque

Rien n'est perdu ni caché ici (l'article est court et complet), mais l'ordre actuel suit la
mécanique ("ouvrir PowerShell", "lancer la commande") avant de montrer le résultat
(`case_sensitivity_enabled.webp`, l.45) qui est justement l'argument qui donne envie d'essayer.
Inverser l'ordre transforme un mode d'emploi en démonstration.

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1. Le résultat | Capture `case_sensitivity_enabled.webp` (3 fichiers de même nom, casse différente) + une phrase | l. 43-45 |
| 2. Comment faire | Ouvrir PowerShell en admin (l. 33-35), se placer dans le dossier cible, lancer `fsutil.exe file setCaseSensitiveInfo . enable` (l. 37-39) | l. 33-39 |
| 3. Pour revenir en arrière | La commande `disable` et sa contrainte (au moins deux fichiers à supprimer avant) | l. 47 |
| 4. Conclusion | Le paragraphe de transition existant (ligne endings, Git) | l. 49 |

Cible : time to value < 15 %. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.
