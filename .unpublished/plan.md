# Plan de publication — Brouillons dans `.unpublished/`

Notes de travail sur un ordre de publication sensé pour les brouillons présents dans `.unpublished/`.
Ce n'est pas un article de blog — juste un fichier de planification, pour moi (Claude) et pour
Christophe. Jamais publié, donc écrit en français.

> **Maintenance :** ce fichier doit être mis à jour à chaque fois qu'un nouveau brouillon est créé
> dans `.unpublished/`, ou qu'un brouillon existant est publié (déplacé vers `blog/`) ou supprimé.

## Pourquoi l'ordre compte ici

La plupart des brouillons sont indépendants et peuvent sortir n'importe quand. La série "Ollama
daily-use functions" ne l'est pas : plusieurs articles font un lien vers un article précédent, ou
supposent dans leur texte qu'un article précédent est déjà publié.

**Contraintes dures (lien cassé ou chronologie incohérente sinon) :**

- `ollama-test-generator` (**ai-test**) doit être le premier de la série. Il définit la fondation
  partagée — `~/.zsh/fns/_ollama.zsh` (`_ollama_query`, le registre `AI_COMMANDS`, le dispatcher `ai`
  lui-même) — que tous les autres articles `ai-*` supposent déjà en place.
- `ollama-ai-commit` (**ai-commit**) fait un lien direct vers `/blog/ollama-test-generator`. Doit
  venir juste après ai-test.
- `docling` doit être publié avant `ollama-ai-docs` (**ai-translate** / **ai-summarize**) — ce dernier
  fait un lien direct vers `/blog/docling` et son helper `_ai-docs.zsh` appelle `docling-convert`.
- `ollama-ai-docs` doit être publié avant `ollama-ai-diff` (**ai-diff**) — le mode "deux fichiers"
  d'ai-diff réutilise directement `_ai_extract_text`, défini dans `_ai-docs.zsh` (l'article ai-docs).
  Transitivement, `docling` doit donc aussi précéder `ai-diff`.

**Contraintes souples (pas de lien cassé, mais le texte cite la fonction comme "déjà couverte") :**

- `ollama-ai-review` — cite `ai-commit` comme déjà existant.
- `ollama-ai-fix` — cite `ai-standup`, `ai-test` et `ai-commit` comme déjà existants.
- `ollama-ai-ci` — cite `ai-fix` et `ai-standup` comme déjà existants.

**Aucune contrainte :** `ollama-ai-ask` et `ollama-ai-data` ne citent aucun autre brouillon de la
série par nom — libres de se placer où le rythme éditorial le suggère.

## Ordre proposé — "Ollama daily-use functions" + docling

| # | Slug | Fonction(s) | Pourquoi ici |
| --- | --- | --- | --- |
| 1 | `ollama-test-generator` | `ai-test` | Premier obligatoire — définit `_ollama.zsh`, `AI_COMMANDS`, `ai` |
| 2 | `ollama-ai-commit` | `ai-commit` | Deuxième obligatoire — lien vers #1, première vraie démo du menu `ai` |
| 3 | `ollama-ai-review` | `ai-review` | Cite `ai-commit` comme antérieur ; même squelette, s'enchaîne juste après |
| 4 | `ollama-ai-standup` | `ai-standup` | Nécessaire avant #5 et #6 (qui le citent tous les deux) |
| 5 | `ollama-ai-fix` | `ai-fix` | Cite `ai-standup`, `ai-test`, `ai-commit` comme antérieurs |
| 6 | `ollama-ai-ci` | `ai-ci` | Cite `ai-fix`, `ai-standup` comme antérieurs ; plus lourd (token API externe) |
| 7 | `ollama-ai-ask` | `ai-ask` | Libre ; lecture courte et facile après le plus lourd ai-ci |
| 8 | `ollama-ai-data` | `ai-data` | Libre ; angle différent (JSON/CSV via jq/awk + fzf) après une série très "git/shell" |
| 9 | `docling` | — (hors série) | Doit précéder #10 et #11 ; change de registre — infra/Docker plutôt qu'une fonction zsh |
| 10 | `ollama-ai-docs` | `ai-translate`, `ai-summarize` | Dépend de #9 ; doit précéder #11 |
| 11 | `ollama-ai-diff` | `ai-diff` | Dernier obligatoire — dépend de #10 (`_ai_extract_text`) et transitivement de #9 ; bonne conclusion de série, referme la boucle avec `delta`/`git diff` |

C'est l'ordre minimal qui respecte toutes les contraintes ci-dessus. Inverser #3/#4, avancer #7/#8,
ou les permuter entre eux est sans risque ; rien avant #1 ni après #11 (par rapport aux autres) ne
l'est, et #9→#10→#11 doit rester dans cet ordre relatif.

## Intercaler avec le reste de `.unpublished/`

Onze articles à saveur "Ollama" d'affilée, c'est beaucoup pour les lecteurs réguliers. Les autres
brouillons n'ont aucune dépendance envers cette série ni entre eux — je casserais donc la séquence :

| Emplacement | Suggestion |
| --- | --- |
| Avant #1 | `winscp-putty` ou `git-bisect` — court, sans rapport, vide le stock de brouillons plus anciens |
| Entre #2 et #3 | `docusaurus-ollama-tags` — même saveur "LLM local" mais un usage complètement différent (analyse de tags de blog), lu comme de la variété |
| Entre #4 et #5 | `typo-report-docusaurus` ou `tried_it` — deux articles de composants Docusaurus, coupure nette avec le contenu terminal |
| Entre #6 et #7 | `removing-algolia-for-pagefind` — court, orienté infra, bonne respiration |
| Entre #7 et #8 | `anythingllm-chat-with-your-docs` — même thème Ollama, mais un angle radicalement différent (application self-hosted complète pour "chatter" avec ses documents, pas une fonction zsh) ; assez développé pour tenir seul comme respiration dans la série |
| Après #11 | `python-ai-helper` — une fois ai-test/ai-review publiés, l'approche plus lourde (Docker, Python uniquement) de cet ancien brouillon se lit comme "l'alternative costaude" plutôt qu'une idée redondante ; mérite une petite relecture pour faire le lien avec la série à ce moment-là |

`ollama-refactor-code` n'apparaît pas dans ce plan — ce ne sont encore que des fichiers source dans
`files/`, aucun `index.md` n'a été écrit, ce n'est donc pas candidat à la publication pour l'instant.

## Avant de publier #1 (bloquant dans tous les cas)

- `src/data/series.js` contient déjà l'entrée "Ollama daily-use functions", mais `/img/series/ollama.webp`
  n'existe pas encore sur disque — la page `/series` affichera une image cassée tant qu'elle n'est pas
  créée (~1000-1500px, WebP, dans le style des autres bannières de série).
- Aucun des scripts zsh de cette série n'a été exécuté contre une vraie instance Ollama — la logique a
  été soigneusement raisonnée, mais `_ollama_query`, `docling-convert`, les appels à l'API GitLab dans
  `ai-ci`, et le mécanisme `print -z`/`fzf` dans `ai-data` méritent un vrai passage de test sur ta
  machine, pas seulement une relecture.
- Le Dockerfile de `docling` (image de base CUDA, passthrough GPU) est le seul élément de ce lot
  construit à partir de la documentation plutôt que d'un cycle build-and-test réel ici — à builder une
  fois contre ta carte 24GB avant de considérer l'article comme final.
- `ollama-ai-diff` et `ollama-ai-docs` partagent `_ai-docs.zsh` — vérifier que les deux copies restent
  identiques si l'une des deux est modifiée après coup (même logique que `_ollama.zsh`, dupliqué dans
  chaque dossier de brouillon pour que chaque article reste autoportant).
