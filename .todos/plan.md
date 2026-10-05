# Plan d'exécution des TODO

> Généré par `/todo-plan` le 2026-09-23 — **ne pas éditer à la main**, ce fichier est régénéré
> depuis `.todos/*.md` à chaque exécution. La priorité et le batch vivent dans les TODO eux-mêmes.
>
> TODO ouverts : 13 — Critical : 0 · High : 3 · Medium : 6 · Low : 4 · Verrouillés : 0
> Aucun batch n'a dû être déduit : les 13 TODO déclarent le leur.
> Un lot exige un **chemin partagé**, jamais un thème partagé — chaque lot nomme le répertoire que
> ses membres ouvrent en commun. Un TODO isolé est le cas normal : une session à lui, `/clear` entre.

## Recommended order

| # | Lot | Priorité | TODO | Prompt |
|---|-----|----------|------|--------|
| 1 | i18n-fr | High | 3 | `/todo 0122 0134 0135` |
| 2 | deploy-pipeline | Medium | 2 | `/todo 0091 0111` |
| 3 | eli5-tooling | Medium | 2 | `/todo 0131 0133` |

## Lots

### 1. i18n-fr — High

**Contexte partagé :** `scripts/lib/` — les trois ; `scripts/translate-drift.mjs` — 0134 et 0135
(le même script, 0135 n'en est qu'une sortie de plus).

**Pourquoi groupés :** les trois TODO ouvrent la chaîne de traduction au même endroit. 0122 corrige
le hash et la propagation des props identifiantes dans `translate-hash.mjs` ; 0134 ajoute le
contrôle de fidélité à côté de `translate-validate.mjs` ; 0135 branche un rapport terminologique
sur la passe que 0134 vient d'écrire et touche `translate-contract.mjs`. Les traiter séparément
ferait charger `scripts/lib/` trois fois.

**Prompt :** `/todo 0122 0134 0135`

| Ordre | ID | Priorité | Titre | Dépend |
|-------|----|----------|-------|--------|
| 1 | 0122 | High | Les props identifiantes ne se propagent jamais aux traductions | 0119 (fait) |
| 2 | 0134 | High | Rien ne vérifie que les 258 traductions disent la même chose que l'original | — |
| 3 | 0135 | Low | Le glossaire grandit par accident, l'incohérence entre articles est invisible | 0134 |

### 2. deploy-pipeline — Medium

**Contexte partagé :** `.github/workflows/deploy.yml` — les deux.

**Pourquoi groupés :** 0091 rend le déploiement atomique et réversible dans `deploy.yml` ; 0111
aligne `run_ci build` sur le sanity-check de ce même fichier. Le second lit ce que le premier
modifie.

**Prompt:** `/todo 0091 0111`

| Ordre | ID | Priorité | Titre | Dépend |
|-------|----|----------|-------|--------|
| 1 | 0091 | Medium | Déploiement non atomique : aucun retour arrière possible | — |
| 2 | 0111 | Low | `run_ci build` n'a pas le sanity-check du build de `deploy.yml` | — |

### 3. eli5-tooling — Medium

**Contexte partagé :** `.devcontainer/scripts/helpers/ollama.sh` — les deux ; `scripts/` — les deux.

**Pourquoi groupés :** 0131 ajoute le backend Ollama et l'écran d'aide `eli5` dans `ollama.sh` ;
0133 ajoute l'action `eli5 judge` dans ce même écran et s'appuie sur la plomberie Ollama que 0131
vient de poser. Les séparer revient à rouvrir `ollama.sh` deux fois pour deux lignes voisines.

**Prompt :** `/todo 0131 0133`

| Ordre | ID | Priorité | Titre | Dépend |
|-------|----|----------|-------|--------|
| 1 | 0131 | Medium | ELI5 : un backend Ollama gratuit, et surtout qu'on se souvienne qu'il existe | — |
| 2 | 0133 | Medium | 1611 sidecars ELI5 et aucun garde-fou sur leur contenu | 0131 |

## Isolés

Un `/todo NNNN` chacun, dans sa propre session — priorité la plus haute d'abord. Ceux-ci ne
partagent aucun fichier avec un frère de batch (ou n'en déclarent pas encore) : il n'y a rien
qu'un lot puisse économiser.

| ID | Priorité | Titre | Batch | Pourquoi pas en lot |
|----|----------|-------|-------|---------------------|
| 0132 | High | Les 1000 fichiers `files/` publiés ne sont vérifiés par rien | snippet-lint | seul de son batch |
| 0117 | Medium | Bloc « Testé avec / le » : rendre visibles les versions utilisées | blog-article-header | aucun chemin commun avec 0136 (`TestedWith/` vs `PostCard/`) |
| 0128 | Medium | Composant `<Meerkat>` pour illustrer les articles | meerkat-mascot | seul de son batch |
| 0136 | Medium | Badge de niveau (débutant / intermédiaire / avancé) | blog-article-header | aucun chemin commun avec 0117 ; **à faire après le lot 1** (dépend de 0122) |
| 0087 | Low | « Try it here » : exécuter l'outil de l'article dans la page | blog-playground | décision seule, `**Files**` encore en `TBD` |
| 0108 | Low | Migrer `docusaurus.config.js` vers `docusaurus.config.ts` | unassigned | seul de son batch |

## Partiellement faits — reste à faire

Clos en `PARTIAL`, avec le reliquat documenté sous leurs puces `### Not done`. **Non mis en file :**
`/todo NNNN` ne les atteint plus. Listés pour que le reste reste visible — en relancer un signifie
déposer un nouveau TODO pour ce qui manque.

| ID | Titre | Fichier |
|----|-------|---------|
| 0083 | « Ask my blog » : index de questions généré par Ollama au build | [PARTIAL_0083](PARTIAL/PARTIAL_0083-ask-my-blog-question-index.md) |
| 0088 | Commandes paramétrées : le lecteur saisit ses valeurs une fois | [PARTIAL_0088](PARTIAL/PARTIAL_0088-parameterized-commands.md) |
| 0089 | Rendre visibles les fonctionnalités du site (Map, FAQ, `⌘K`) | [PARTIAL_0089](PARTIAL/PARTIAL_0089-make-the-features-discoverable.md) |
| 0090 | PWA : rendre le blog installable | [PARTIAL_0090](PARTIAL/PARTIAL_0090-pwa-installable.md) |
| 0095 | PWA : lecture hors ligne et service worker | [PARTIAL_0095](PARTIAL/PARTIAL_0095-pwa-lecture-hors-ligne.md) |
| 0100 | Le texte des bannières devient illisible sur mobile | [PARTIAL_0100](PARTIAL/PARTIAL_0100-banner-images-illegible-on-mobile.md) |
| 0107 | Câbler Playwright sur le build statique | [PARTIAL_0107](PARTIAL/PARTIAL_0107-cabler-playwright-build-statique.md) |
| 0124 | Déploiement progressif de la locale `/fr/` | [PARTIAL_0124](PARTIAL/PARTIAL_0124-deploiement-progressif-de-la-locale-fr.md) |
| 0125 | AnythingLLM : indexer le corpus français | [PARTIAL_0125](PARTIAL/PARTIAL_0125-anythingllm-french-workspace.md) |
| 036 | Aucun outillage de lint/format malgré le mandat AGENTS.md | [PARTIAL_036](PARTIAL/PARTIAL_036-no-lint-tooling.md) |
| 051 | `ProjectSetup` non rétrofité sur 3 articles | [PARTIAL_051](PARTIAL/PARTIAL_051-projectsetup-underused-for-multi-file-creation.md) |
| 059 | `StepsCard` sous-utilisé (2023-2024) | [PARTIAL_059](PARTIAL/PARTIAL_059-stepscard-retrofit-gap.md) |
| 067 | Bugs de contenu divers nécessitant une décision de l'auteur | [PARTIAL_067](PARTIAL/PARTIAL_067-misc-content-bugs-needing-author-input.md) |
| 068 | Fonctionnalités natives Docusaurus 3.10 non activées | [PARTIAL_068](PARTIAL/PARTIAL_068-docusaurus-native-features-unused.md) |
| 070 | Nouvelles séries à créer à partir des articles orphelins | [PARTIAL_070](PARTIAL/PARTIAL_070-nouvelles-series-articles-orphelins.md) |
| — | Reader review : outlook-vba-pdf | [PARTIAL_reader-outlook-vba-pdf](PARTIAL/PARTIAL_reader-outlook-vba-pdf.md) |
| — | Reader review : powerlevel10k_sandbox | [PARTIAL_reader-powerlevel10k_sandbox](PARTIAL/PARTIAL_reader-powerlevel10k_sandbox.md) |
| — | Reader review : vscode-jetbrains-font | [PARTIAL_reader-vscode-jetbrains-font](PARTIAL/PARTIAL_reader-vscode-jetbrains-font.md) |
