# Plan d'exécution des TODOs

> Généré par `/todo-plan` le 2026-09-21 — **ne pas éditer à la main**, ce fichier est régénéré depuis
> `.todos/*.md` à chaque exécution. La priorité et le regroupement vivent dans les fichiers TODO eux-mêmes.
>
> TODOs ouverts : 7 — Critical : 0 · High : 1 · Medium : 3 · Low : 3 · Locked : 0
> Les batchs marqués `~` ont été inférés depuis `**Files**`, pas déclarés.
> Un lot exige un chemin partagé, jamais un thème — chaque lot nomme le répertoire que ses membres ont en commun.
> Un TODO standalone est le cas normal : le lancer dans sa propre session, `/clear` entre les deux.

## Ordre recommandé

| # | Lot | Priorité | TODOs | Prompt |
|---|-----|----------|-------|--------|
| 1 | i18n-fr | High | 1 | `/todo 0122` |
| 2 | blog-article-header | Medium | 1 | `/todo 0117` |
| 3 | meerkat-mascot | Medium | 1 | `/todo 0128` |
| 4 | deploy-pipeline | Medium | 2 | `/todo 0091 0111` |
| 5 | unassigned | Low | 1 | `/todo 0108` |
| 6 | blog-playground | Low | 1 | `/todo 0087` |

## Lots

### 1. deploy-pipeline — Medium

**Contexte partagé :** `.github/workflows/deploy.yml` — les deux TODOs y touchent.

**Pourquoi groupé :** 0111 veut aligner `run_ci build` sur les vérifications de `deploy.yml` ;
0091 renforce ce même workflow pour l'atomicité du déploiement. Un seul chargement de contexte.

**Prompt :** `/todo 0091 0111`

| Ordre | ID | Priorité | Titre | Dépends |
|-------|----|----------|-------|---------|
| 1 | 0091 | Medium | Déploiement non atomique : aucun retour arrière possible | — |
| 2 | 0111 | Low | `run_ci build` n'a pas le sanity-check du build de deploy.yml | — |

## Standalone

Un `/todo NNN` chacun, dans sa propre session — priorité décroissante.
Pas de fichier partagé avec un voisin (ou aucun fichier déclaré) : un lot n'économiserait rien.

| ID | Priorité | Titre | Batch | Pourquoi pas lotté |
| ---- | ---------- | ------- | ------- | ------------------- |
| 0122 | High | Les props identifiantes ne se propagent jamais aux traductions | i18n-fr | seul dans son batch |
| 0117 | Medium | Bloc « Testé avec / le » : rendre visibles les versions réellement utilisées | blog-article-header | seul dans son batch |
| 0128 | Medium | Composant `<Meerkat>` pour illustrer les articles avec les 68 emojis | meerkat-mascot | seul dans son batch |
| 0108 | Low | Migrer `docusaurus.config.js` vers `docusaurus.config.ts` | unassigned | seul dans son batch |
| 0087 | Low | « Try it here » : exécuter l'outil de l'article dans la page | blog-playground | decision-only, pas de `**Files**` |

## Partiellement traités — travail restant

Fermés en `PARTIAL`, avec le reste documenté sous leurs bullets `### Not done`.
**Non mis en queue** : `/todo NNN` ne les atteint plus. Listés pour que le reste reste visible —
les relancer signifie créer un nouveau TODO pour ce qui reste.

| ID | Titre | Fichier |
| ---- | ------- | --------- |
| 036 | No lint tooling | [PARTIAL_036-no-lint-tooling.md](PARTIAL/PARTIAL_036-no-lint-tooling.md) |
| 051 | ProjectSetup underused for multi-file creation | [PARTIAL_051-projectsetup-underused-for-multi-file-creation.md](PARTIAL/PARTIAL_051-projectsetup-underused-for-multi-file-creation.md) |
| 059 | StepsCard retrofit gap | [PARTIAL_059-stepscard-retrofit-gap.md](PARTIAL/PARTIAL_059-stepscard-retrofit-gap.md) |
| 067 | Misc content bugs needing author input | [PARTIAL_067-misc-content-bugs-needing-author-input.md](PARTIAL/PARTIAL_067-misc-content-bugs-needing-author-input.md) |
| 068 | Docusaurus native features unused | [PARTIAL_068-docusaurus-native-features-unused.md](PARTIAL/PARTIAL_068-docusaurus-native-features-unused.md) |
| 070 | Nouvelles séries, articles orphelins | [PARTIAL_070-nouvelles-series-articles-orphelins.md](PARTIAL/PARTIAL_070-nouvelles-series-articles-orphelins.md) |
| 083 | Ask my blog — question index | [PARTIAL_0083-ask-my-blog-question-index.md](PARTIAL/PARTIAL_0083-ask-my-blog-question-index.md) |
| 088 | Parameterized commands | [PARTIAL_0088-parameterized-commands.md](PARTIAL/PARTIAL_0088-parameterized-commands.md) |
| 089 | Make the features discoverable | [PARTIAL_0089-make-the-features-discoverable.md](PARTIAL/PARTIAL_0089-make-the-features-discoverable.md) |
| 090 | PWA installable | [PARTIAL_0090-pwa-installable.md](PARTIAL/PARTIAL_0090-pwa-installable.md) |
| 095 | PWA lecture hors ligne | [PARTIAL_0095-pwa-lecture-hors-ligne.md](PARTIAL/PARTIAL_0095-pwa-lecture-hors-ligne.md) |
| 100 | Banner images illegible on mobile | [PARTIAL_0100-banner-images-illegible-on-mobile.md](PARTIAL/PARTIAL_0100-banner-images-illegible-on-mobile.md) |
| 107 | Câbler Playwright — build statique | [PARTIAL_0107-cabler-playwright-build-statique.md](PARTIAL/PARTIAL_0107-cabler-playwright-build-statique.md) |
| 124 | Déploiement progressif locale fr | [PARTIAL_0124-deploiement-progressif-de-la-locale-fr.md](PARTIAL/PARTIAL_0124-deploiement-progressif-de-la-locale-fr.md) |
| 125 | AnythingLLM — workspace français | [PARTIAL_0125-anythingllm-french-workspace.md](PARTIAL/PARTIAL_0125-anythingllm-french-workspace.md) |

## Anomalies

- `0122-props-identifiantes-non-propagees-aux-traductions.md` : déclare `Depends: 0119` — 0119
  est en `DONE/` (clos 2026-09-17), dépendance satisfaite, pas de blocage réel.
