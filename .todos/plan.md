# Plan d'exécution des TODO

> Généré par `/todo-plan` le 2026-08-18 — **ne pas éditer à la main**, ce fichier est régénéré
> depuis `.todos/*.md` à chaque exécution. La priorité et le batch vivent dans les fichiers TODO
> eux-mêmes.
>
> TODO ouverts : 6 — Critical : 0 · High : 0 · Medium : 4 · Low : 2 · Verrouillés : 0
> Les batches marqués `~` ont été inférés depuis `**Files**`, pas déclarés.
> Un lot exige un chemin partagé, jamais un thème partagé — chaque lot nomme le répertoire que
> ses membres ont en commun. Un TODO isolé est le cas normal : une session à lui seul, `/clear`
> entre chaque.

## Ordre recommandé

| # | Lot | Priorité | TODO | Prompt |
|---|-----|----------|------|--------|
| 1 | blog-pwa | Medium | 2 | `/todo 0090 0095` |

## Lots

### 1. blog-pwa — Medium

**Contexte partagé :** `docusaurus.config.js` — les deux.

**Pourquoi groupés :** 0090 ajoute le manifeste, les icônes et les `headTags` ; 0095 branche
`@docusaurus/plugin-pwa` par-dessus et doit réutiliser ce même manifeste au lieu d'en générer un
second jeu. Les deux éditent la config Docusaurus.

**Réserve :** 0095 est délibérément `low` et dépend explicitement de 0090. `/todo 0090` seul est
un usage légitime de ce lot — le gain de contexte n'existe que si l'on décide d'enchaîner.

**Prompt :** `/todo 0090 0095`

| Ordre | ID | Priorité | Titre | Depends |
|-------|----|----------|-------|---------|
| 1 | 0090 | Medium | PWA : rendre le blog installable | — |
| 2 | 0095 | Low | PWA : lecture hors ligne et service worker | 0090 |

## Isolés

Un `/todo NNNN` chacun, dans sa propre session — la plus haute priorité d'abord. Ceux-là ne
partagent aucun fichier avec un voisin de batch (ou n'en déclarent aucun) : il n'y a rien qu'un
lot puisse économiser.

| ID | Priorité | Titre | Batch | Pourquoi pas en lot |
|----|----------|-------|-------|---------------------|
| 0088 | Medium | Commandes paramétrées : le lecteur saisit ses valeurs une fois, l'article s'adapte | blog-commands | seul de son batch ; `src/components/` n'est touché par aucun autre TODO ouvert |
| 0091 | Medium | Déploiement non atomique : aucun retour arrière possible | deploy-pipeline | seul de son batch depuis la clôture de 0094 ; `.github/workflows/` n'est partagé avec personne |
| 0085 | Medium | BrowserWindow : seconde passe sur les captures restantes | unassigned | `**Files**: TBD` — aucun chemin à intersecter (voir Anomalies) |
| 0087 | Low | « Try it here » : exécuter l'outil de l'article dans la page | blog-playground | décision d'abord : les fichiers dépendent de l'arbitrage de la § « Go / No-go » |

## Partiellement fait — reste à faire

Clôturés en `PARTIAL`, avec du travail documenté sous leurs puces `### Not done`. **Non mis en
file** : `/todo NNNN` ne les atteint plus. Listés pour que le reliquat reste visible — en relancer
un, c'est déposer un nouveau TODO pour ce qu'il reste.

| ID | Titre | Fichier |
|----|-------|---------|
| 036 | Aucun outillage de lint/format malgré le mandat AGENTS.md | [PARTIAL_036-no-lint-tooling.md](PARTIAL/PARTIAL_036-no-lint-tooling.md) |
| 051 | `ProjectSetup` non rétrofité sur 3 articles multi-fichiers | [PARTIAL_051-projectsetup-underused-for-multi-file-creation.md](PARTIAL/PARTIAL_051-projectsetup-underused-for-multi-file-creation.md) |
| 059 | `StepsCard` sous-utilisé pour des listes d'étapes numérotées | [PARTIAL_059-stepscard-retrofit-gap.md](PARTIAL/PARTIAL_059-stepscard-retrofit-gap.md) |
| 067 | Bugs de contenu divers nécessitant une décision de l'auteur | [PARTIAL_067-misc-content-bugs-needing-author-input.md](PARTIAL/PARTIAL_067-misc-content-bugs-needing-author-input.md) |
| 068 | Fonctionnalités natives Docusaurus non activées | [PARTIAL_068-docusaurus-native-features-unused.md](PARTIAL/PARTIAL_068-docusaurus-native-features-unused.md) |
| 070 | Nouvelles séries à créer à partir des articles orphelins | [PARTIAL_070-nouvelles-series-articles-orphelins.md](PARTIAL/PARTIAL_070-nouvelles-series-articles-orphelins.md) |
| 0083 | « Ask my blog » : index de questions généré par Ollama au build | [PARTIAL_0083-ask-my-blog-question-index.md](PARTIAL/PARTIAL_0083-ask-my-blog-question-index.md) |
| 0089 | Rendre visibles les fonctionnalités du site : la home ignore Map, FAQ et `⌘K` | [PARTIAL_0089-make-the-features-discoverable.md](PARTIAL/PARTIAL_0089-make-the-features-discoverable.md) |
| — | Reader review : Outlook VBA PDF | [PARTIAL_reader-outlook-vba-pdf.md](PARTIAL/PARTIAL_reader-outlook-vba-pdf.md) |
| — | Reader review : Powerlevel10k sandbox | [PARTIAL_reader-powerlevel10k_sandbox.md](PARTIAL/PARTIAL_reader-powerlevel10k_sandbox.md) |
| — | Reader review : VS Code / JetBrains font | [PARTIAL_reader-vscode-jetbrains-font.md](PARTIAL/PARTIAL_reader-vscode-jetbrains-font.md) |

## Anomalies

Problèmes d'écriture repérés au parsing. À corriger dans les fichiers TODO, puis relancer
`/todo-plan`.

- `0085-browserwindow-seconde-passe.md` : `**Batch**: unassigned` et `**Files**: TBD` — impossible
  d'inférer un batch, le TODO ne peut jamais entrer dans un lot tant qu'il ne déclare pas ses
  fichiers.
