# Reader review : docling

**Détecté :** 2026-08-08
**Clôturé :** 2026-08-08
**Article :** .unpublished/docling/index.md
**Verdict :** DONE (restructuré selon le plan ci-dessous)

## Résumé de l'implémentation

Réordonnancement appliqué exactement selon la table — la démonstration `terminal-1.txt` (conversion des 5 formats) déplacée en position 2, le reste réordonné sans suppression de contenu.

## Problème

Time to value : **73 %** (preuve — `<Terminal source="./files/terminal-1.txt">` sous
« Converting Five Formats », l. 91 — sur un corps de 90 lignes après `<!-- truncate -->`,
l. 25).
Drapeaux : install-avant-preuve — `## Prerequisite — GPU Passthrough` (l. 35) est le deuxième
titre après `truncate`, avant toute preuve. Le `<Terminal>` de vérification GPU (l. 43) ne
compte pas comme preuve : il vérifie un prérequis, il ne montre pas l'outil convertir un
document.
Redondance : « GPU optionnel, CPU fallback » énoncé **3 fois** (l. 37-38, `<StepsCard>` l. 105,
Conclusion implicite) — acceptable.

Test des 30 secondes : la comparaison Docling/Markitdown (l. 27-33) est un bon point d'entrée,
crédible et clair. Mais ensuite, quatre sections d'installation se suivent (GPU passthrough,
Dockerfile, orchestration, wrapper global) avant la moindre preuve qu'un document est
effectivement converti. Je décroche largement avant la démonstration réelle.

## Risque

Le résultat existe (`terminal-1.txt`, 5 formats convertis) mais arrive après tout
l'appareillage Docker — exactement le motif « installation avant la preuve » que
`blog-post-structure` identifie comme le piège le plus fréquent du blog.

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1. Accroche | Inchangée | l. 23 |
| 2. Résultat | Conversion des cinq formats (`terminal-1.txt`) | l. 89-93 |
| 3. Pourquoi ça marche | « Docling vs Markitdown » (déjà sans code) | l. 27-33 |
| 4. Installation | GPU passthrough (optionnel) + Dockerfile + compose + wrapper global | l. 35-87 |
| 5. Plus de démos | Comparaison de qualité sur un tableau (à développer avec un vrai avant/après si possible) | l. 95-97 |
| 6. Sous le capot | — (rien de spécifique à isoler ici, le GPU est déjà en mouvement 4) | — |
| 7. Conclusion | Key Takeaways + Conclusion, inchangés | l. 99-115 |

Cible : time to value < 15 %. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.
