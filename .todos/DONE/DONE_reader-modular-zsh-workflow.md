# Reader review : modular-zsh-workflow

**Détecté :** 2026-08-08
**Clôturé :** 2026-08-08
**Article :** blog/2026/05/25/modular-zsh-workflow/index.md
**Verdict :** DONE (restructuré selon le plan ci-dessous)

## Résumé de l'implémentation

Réordonnancement appliqué selon la table. La démo manquante a été produite réellement : un conteneur Docker avec zsh + fzf + fd + le script `repo` exact de l'article, trois faux dépôts sous `~/repositories/`, et `repo blg` exécuté pour de vrai — un seul match, saut direct sans passer par l'interface fzf (`--select-1 --exit-0`), capturé dans `files/terminal_repo_demo.txt`.

## Problème

Time to value : **100 %** (aucune preuve dans les 105 lignes du corps — ni capture d'écran, ni
sortie terminal montrant `repo` en action).
Drapeaux : pas d'install-avant-preuve au sens strict, mais toute la structure est
explication-avant-preuve : « The Problem with the Monolith » (l. 28) → « The Secret Sauce » (l.
38) → description de `repo` (l. 44) → mise en place (l. 61), sans jamais montrer le résultat
promis.
Redondance : aucune détectée.

Test des 30 secondes : « je lis une explication du fonctionnement de `fpath`/`autoload`, mais je
ne vois jamais littéralement `repo` filtrer une liste de projets — j'abandonne avant de savoir si
ça vaut la mise en place. »

## Risque

La promesse d'ouverture — « teleport across your workspace in seconds » (l. 24) — n'est tenue nulle
part visuellement. Même l'exemple d'usage rapide (`repo blg`, l. 119-121) n'affiche aucune sortie.
C'est un cas particulier : contrairement aux autres articles du lot, il manque une preuve à
déplacer, pas seulement à réordonner.

## Solution

Avant tout réordonnancement, il faut une capture (screenshot ou sortie terminal) de `repo` filtrant
une liste fzf ou sautant directement dans un projet — c'est le seul vrai manque. Une fois cette
capture disponible, ordre proposé :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1 | Hook + promesse (inchangé) | l. 22-24 |
| 2 | **(à créer)** démo : capture de `repo` filtrant/sautant vers un projet via fzf | contenu à ajouter |
| 3 | Exemple d'usage rapide `repo blg` | l. 117-121 |
| 4 | Pourquoi un fichier autonome (Secret Sauce + Super Function) | l. 28-59 |
| 5 | Installation (dossier, `fpath`, fichier `repo`) | l. 61-98 |
| 6 | Recherche floue avancée | l. 110-125 |
| 7 | Conclusion | l. 127-131 |

Cible : time to value < 15 % une fois la démo ajoutée. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.
