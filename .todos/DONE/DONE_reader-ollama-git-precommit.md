# Reader review : ollama-git-precommit

**Détecté :** 2026-08-08
**Clôturé :** 2026-08-08
**Article :** blog/2026/08/10/ollama-git-precommit/index.md
**Verdict :** DONE (restructuré selon le plan ci-dessous)

## Résumé de l'implémentation

Réordonnancement appliqué exactement selon la table « Solution » — rien de supprimé sauf la
carte « Key Takeaways » (bloc mort confirmé). Nouvelle TTV : **7 %** (preuve l.37 sur un corps
de 118 lignes), contre 37 % avant. `yarn lint`, `yarn format:check` et `yarn build` passent
(aucun avertissement/erreur imputable à ce fichier).

## Problème

Time to value : **37 %** (preuve l.78 sur un corps de 133 lignes, l.29-162).

Drapeaux : **abstraction-avant-preuve** — trois blocs d'implémentation (le bloc `zsh` complet de
`_git_staged_diff` l.37-60, le `<Snippet>` du fichier `_ollama.zsh` l.64, le `<Snippet>` de
`ai-review.zsh` l.70) apparaissent tous avant la première preuve concrète (`<Terminal>` l.78).

Redondance : l'ordre du workflow (review → secrets → commit) est énoncé **3 fois** (TLDR l.20,
« The Workflow in Practice » l.124, carte « Key Takeaways » l.152-154) — sous le seuil
numérique, mais la carte **Key Takeaways** (l.148-158) recopie une à une les 5 sections du
corps (`_git_staged_diff` partagé, `ai-review` d'abord, `ai-secrets` ensuite, `ai-commit`
enfin, enregistrement dans le menu `ai`) : c'est un bloc mort classique, rien de neuf n'y est dit.

Test des 30 secondes : **j'abandonne** — juste après le `<!-- truncate -->`, le lecteur tombe
sur deux paragraphes puis 24 lignes de code zsh (`_git_staged_diff`), avant d'avoir vu le
moindre des trois outils réellement tourner. Rien ne prouve encore que `ai-review`,
`ai-secrets` ou `ai-commit` font quoi que ce soit d'utile.

## Risque

La preuve existe déjà et elle est bonne — `ai-review` trouve 4 vrais problèmes dans un diff
en quelques secondes (diff de démo l.74-76, sortie `<Terminal>` l.78-80) — mais elle arrive
45 lignes trop bas. Le lecteur d'une minute ne la voit jamais et part sur le code de
`_git_staged_diff`, qui n'intéresse que quelqu'un déjà convaincu de vouloir installer les
fonctions. La carte « Key Takeaways » en fin d'article n'ajoute aucune information neuve :
elle est un miroir des 5 titres de section déjà lus.

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1. Hook | Inchangé — la douleur du commit non relu, la mention des hooks existants (phpcbf/PHPStan) qui ne couvrent pas le jugement | l.1-29 |
| 2. Le résultat | Démo `ai-review` : diff planté + sortie `<Terminal>` montrant les 4 problèmes trouvés — aucune installation, aucun code encore | l.74-80 (+ phrase de transition l.80) |
| 3. Pourquoi ça marche | 3-4 puces sans code : un seul helper partagé pour les trois fonctions, `ai-secrets` en deux phases (regex puis modèle), `ai-commit` ne committe jamais sans confirmation explicite | synthèse de l.20, 33, 92, 110 |
| 4. Installation | Le `<Snippet>` complet de `_ollama.zsh`, puis les trois `<Snippet>` de fonction (`ai-review.zsh`, `ai-secrets.zsh`, `ai-commit.zsh`) | l.64, 70, 90, 108 |
| 5. Autres démos | Démo `ai-secrets` (diff + `<Terminal>`) et démo `ai-commit` (diff + `<Terminal>`), chacune avec son `<AlertBox>` de garde-fou | l.86-102, l.104-120 |
| 6. Sous le capot *(à marquer « skip this if you just want to use it »)* | Le corps de `_git_staged_diff` (bloc `zsh` l.37-60) et le détail de la conception en deux phases de `ai-secrets` | l.31-35, l.37-60 |
| 7. Atterrissage | « The Workflow in Practice » + « Registered in the ai Menu » fusionnés, puis Conclusion inchangée. Supprimer la carte « Key Takeaways » (bloc mort, l.148-158) — la Conclusion fait déjà l'atterrissage | l.122-144, l.160-162 |

Cible : time to value < 15 %. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.
