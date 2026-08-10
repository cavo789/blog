# Reader review : windows-terminal-background

**Détecté :** 2026-08-09
**Article :** blog/2025/04/24/windows-terminal-background/index.md
**Verdict :** RESTRUCTURE

## Problème

Time to value : **81 %** (preuve ligne 56 sur un corps de 27 lignes seulement,
`<!-- truncate -->` en ligne 34).
Drapeaux : aucun install/abstraction-avant-preuve à proprement parler, mais l'article est
tellement court que passer 22 des 27 lignes du corps avant la preuve est disproportionné.
Redondance : aucune.

Test des 30 secondes : le résultat (`console.webp`, l. 32) est déjà montré **avant** le
`<!-- truncate -->`, dans l'extrait — bien joué pour la page d'index. Mais un lecteur qui arrive
directement sur l'article (lien partagé, recherche) et qui commence sa lecture au corps ne revoit
ce résultat qu'à la toute fin (`full_image.webp`, l. 56), après une capture d'écran de navigation
dans les settings (l. 46) qui ne prouve rien par elle-même.

## Risque

Le corps de l'article n'est qu'une suite d'instructions de navigation (ouvrir les Settings,
scroller jusqu'à Appearance, cliquer sur Browse, cliquer sur Save) sans jamais reformuler
explicitement "voici le résultat" avant la toute dernière image. Vu la brièveté de l'article
(27 lignes de corps), il est facile de remonter la preuve tout en haut.

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1 | Hook + promesse (inchangé) | l. 26-30 |
| 2 | **Résultat d'abord** : réutiliser/dupliquer l'image `full_image.webp` (l. 56) juste après le `<!-- truncate -->`, avec une phrase "Voilà le résultat qu'on obtient." | l. 56 |
| 3 | Étapes pour y arriver : télécharger/générer une image, ouvrir Settings, Appearance, Browse, Save | l. 36-52 (inchangé, avec la capture `settings.webp` conservée comme illustration d'étape) | 
| 4 | Astuce des deux onglets pour prévisualiser en direct | l. 54 |
| 5 | Liens vers Powerlevel10k et les articles connexes (déjà une forme de landing) | l. 58-60 |

Cible : time to value < 15 %. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.
