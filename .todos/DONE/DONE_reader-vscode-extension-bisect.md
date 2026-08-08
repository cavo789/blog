# Reader review : vscode-extension-bisect

**Détecté :** 2026-08-08
**Clôturé :** 2026-08-08
**Article :** .unpublished/vscode-extension-bisect/index.md
**Verdict :** DONE (restructuré selon le plan ci-dessous)

## Résumé de l'implémentation

Réordonnancement appliqué selon la table. La capture d'écran du prompt Good/Bad n'a pas pu être produite (nécessite une session VSCode graphique réelle, hors de portée de cet environnement) — un commentaire `TODO(author)` explicite a été laissé à l'emplacement exact pour l'auteur.

## Problème

Time to value : **100 %** — aucune preuve dans les 48 lignes du corps. Pas de `<Terminal>`, pas
de capture d'écran (pas de dossier `images/`), le `<StepsCard>` « The bisect loop » (l. 29-38)
décrit la boucle mais ne montre jamais le prompt réel de VSCode.
Drapeaux : aucun install-avant-preuve à proprement parler (rien à installer, la fonctionnalité
est native), mais aucune preuve n'existe non plus pour ancrer un TTV correct.
Redondance : « même principe que `git bisect` » énoncé 3 fois — sous le seuil.

Test des 30 secondes : « Le texte est court et convaincant, je reste probablement — mais rien ne
me montre à quoi ressemble réellement le prompt Good/Bad de VSCode. »

## Risque

Sur un article aussi court, la preuve la plus simple à produire est une seule capture d'écran du
prompt de notification « Good / Bad » qu'affiche VSCode pendant un bisect — actuellement décrit
uniquement en prose (l. 27, 34).

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1 | Hook | l. 15-21 |
| 2 | **Nouveau** : preuve — capture d'écran du prompt Good/Bad d'Extension Bisect (à créer) | dérivé de l. 25-38 |
| 3 | Starting a Bisect | l. 25-42 |
| 4 | When This Actually Earns Its Keep | l. 44-50 |
| 5 | Stopping Early | l. 52-54 |
| 6 | Key Takeaways / Conclusion | l. 56-71 |

Cible : time to value < 15 %. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.
