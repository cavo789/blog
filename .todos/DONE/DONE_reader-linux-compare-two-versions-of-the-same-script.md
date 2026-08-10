# Reader review : linux-compare-two-versions-of-the-same-script

**Détecté :** 2026-08-09
**Article :** blog/2024/07/28/linux-compare-two-versions-of-the-same-script/index.md
**Verdict :** RESTRUCTURE

## Problème

Time to value : **25 %** (preuve ligne 52 sur un corps de 95 lignes, l. 28-123).
Drapeaux : **abstraction-avant-preuve** — deux `<Snippet>` (`console.sh` l. 36, `console_v2.sh`
l. 40) créent les fichiers de test avant toute preuve.
Redondance : aucune de préoccupante — le principe (trier puis diffuser en side-by-side) est
répété une fois par variante (fichier unique, puis dossier), ce qui est attendu.

Test des 30 secondes : le lecteur crée deux fichiers de démonstration avant de voir à quoi
ressemble le résultat de la comparaison — l'image et le terminal qui montrent réellement les
fonctions ajoutées/supprimées arrivent après ce double setup.

## Risque

Le comparatif visuel (`<Terminal source="./files/terminal-1.txt" />` l. 58 et l'image l. 62) est
la vraie preuve que l'outil détecte des fonctions ajoutées/supprimées entre deux versions — c'est
ce qui répond à la promesse du titre. Le lecteur devrait le voir avant de recréer deux fichiers.

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1 | Hook (inchangé) | l. 22-26 |
| 2 | Le résultat : `<Terminal source="./files/terminal-1.txt" />` + image "Compare the two versions" montrant les ajouts détectés | l. 56-62 |
| 3 | Mise en place : créer `console.sh` et `console_v2.sh`, extraire la liste des fonctions | l. 30-48 |
| 4 | Lire les indicateurs `<`/`>`/`\|` et cas mixte (ajout + suppression) | l. 64-97 |
| 5 | Comparer deux dossiers entiers (`compare.sh`) | l. 99-124 |

Cible : time to value < 15 %. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.
