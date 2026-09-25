# 0139 — Corriger les 156 warnings fixables du lint de snippets, puis durcir le gate

- **Priority**: Medium — le gate bloque déjà sur `error` ; ceci resserre la vis, article par article
- **Batch**: snippet-lint
- **Depends**: 0138
- **Files**: `blog/2026/07/06/ripgrep/files/Dockerfile`, `blog/2026/03/30/ollama-installation/files/calculate_autocompleted.sh`, `blog/2025/11/03/quarto-devcontainer/files/Dockerfile`, `blog/2026/06/29/git-worktree/files/Dockerfile`, `blog/2025/08/30/pest-functional-testing/files/Dockerfile`, `blog/2024/10/24/docker-lubuntu/files/Dockerfile`, `blog/2026/06/08/fzf-ripgrep/files/Dockerfile`, `blog/2025/12/15/running-revealjs-with-docker/files/.devcontainer/Dockerfile` — et 54 autres, énumérés par la commande ci-dessous —, plus `scripts/lint-snippets.mjs` pour le seul critère 4 (durcissement du gate + mise à jour de l'en-tête)

## Problème

Le 0138 a rendu la baseline verte (0 erreur, `yarn snippets:lint --ci` sort en 0) et branché le
gate bloquant dans `quality.yml`. Il restait 276 warnings sur le périmètre publié. Le triage du
0138 les a séparés en trois populations, et **une seule est du ressort de « corriger l'article »** :

| Population | Nb | Sort |
| --- | --- | --- |
| fixables, et qui valent d'être corrigés | **156** | **ce TODO** |
| épinglage de versions | 78 | jamais corrigé — voir ci-dessous |
| faux positifs `DL3064` | 31 | rien à corriger |
| `DL3066` — `USER` non numérique | 11 | rien à corriger |
| **total** | **276** | |

Les trois dernières sont déjà documentées, classe par classe, dans l'en-tête de
`scripts/lint-snippets.mjs`. Elles ne sont pas rouvertes ici :

- **épinglage** (`DL3008` 48, `DL3007` 12, `DL3013` 9, `DL3018` 9) : bon conseil pour une image de
  production, activement faux dans un tutoriel publié. Un `apt-get install pkg=1.2.3` épinglé
  disparaît du miroir Debian en quelques mois et le build du lecteur casse alors sur
  `Version '1.2.3' for 'pkg' was not found` — strictement pire que la ligne non épinglée. Le
  Dockerfile d'un article est lu, pas déployé.
- **`DL3064`** : les 31 occurrences sont des `ARG OS_USERNAME=quarto` / `ARG USERNAME=johndoe`.
  L'heuristique de nom de hadolint prend `*USERNAME*` pour une donnée sensible. Il n'y a pas de
  secret, donc pas de correction.
- **`DL3066`** : les 11 occurrences sont des `USER node`, `USER www-data`, `USER root`. Remplacer
  par un UID numérique rendrait illisible précisément la ligne que l'article explique. Non
  actionnable au même titre que `DL3064`.

## Périmètre réel

**156 warnings, 62 fichiers, 51 articles publiés.** L'énumération à jour :

```bash
node scripts/lint-snippets.mjs --ci 2>&1 | grep '^warning' \
  | grep -vE '\[(DL3008|DL3007|DL3013|DL3018|DL3064)\]'
```

Les classes concernées : `DL3015` (`--no-install-recommends`, 26), `DL3059` (`RUN` consécutifs, 18),
`SC2028` (`echo` → `printf`, 16), `DL4006` (`pipefail`, 12), `SC2016` et `SC2004` (quoting,
arithmétique, 20), `SC2164` (`cd ||`, 7), `DL3003` (`cd` → `WORKDIR`, 6), `DL3009` (listes apt, 3),
puis 17 codes à une ou deux occurrences.

## Le piège à ne pas découvrir en route

**Les 62 fichiers portent tous un sidecar ELI5 à clés de ligne, dans les deux locales.** Deux
conséquences, vérifiées sur le 0138 :

1. Le `sourceHash` du sidecar couvre **tout le fichier**. Le moindre octet modifié périme les deux
   sidecars, même une correction sur une ligne existante comme `DL3015`.
2. **39 des 156 corrections déplacent des lignes** (`DL3059` fusionne des `RUN`, `DL4006` ajoute une
   directive `SHELL`, `DL3009` et `DL3003` restructurent). Sur ces fichiers, les ancres
   `explanations` ne sont plus valides : il faut `eli5 <file> --force` **en `en` et en `fr`**, pas
   une réécriture de hash.

Budget ≈ 0,01 $ par sidecar (`scripts/lib/i18n-eligibility.mjs`), soit ≈ 1,24 $ si les 62 fichiers
sont touchés dans les deux locales.

Troisième piège, non mécanisable : **la prose de l'article peut citer le code tel qu'il est
affiché**. Le 0138 en a rencontré un cas réel — un sidecar FR de `Dockerfile.part3` citait
`COPY package.json yarn.lock .` mot pour mot. Une fusion de `RUN` ou un ajout de `SHELL` change ce
que le texte autour décrit. Il faut relire l'article, pas seulement relancer le linter.

## Méthode suggérée

Par lots d'articles, pas en une passe : corriger le fichier → relancer
`node scripts/lint-snippets.mjs --only <path>` → régénérer les deux sidecars → relire l'article.
Commencer par `DL3015` et les classes shell sans déplacement de ligne (117 des 156), qui ne
touchent pas les ancres ; garder les 39 corrections structurantes pour un second temps.

## Critère d'acceptation

1. `node scripts/lint-snippets.mjs --ci` ne rapporte plus que les classes épinglage + `DL3064`.
2. Aucun sidecar ELI5 périmé : `yarn eli5:check` sort propre sur les fichiers touchés.
3. Les articles touchés ont été relus — la prose ne décrit plus un code qui a changé.
4. Une fois 1 vrai, le gate est durci : `lint-snippets.mjs` traite les classes corrigées comme
   bloquantes, et l'en-tête du script est mis à jour pour refléter le nouveau partage.

## Status — PARTIAL (2026-09-25)

### Le chiffre de départ de ce TODO était faux

Ce TODO annonçait « 156 warnings fixables, et qui valent d'être corrigés ». Ce 156 avait été
obtenu **par élimination** — en retirant les classes déjà reconnues mauvaises (épinglage,
`DL3064`, `DL3066`) — et non en vérifiant le reste. La vérification classe par classe l'a
renversé : **54 des 156 méritaient vraiment d'être corrigés et le sont ; 102 ne le méritent pas**,
pour des raisons vérifiées une par une. Le détail complet vit désormais dans l'en-tête de
`scripts/lint-snippets.mjs`, qui est la source de vérité.

### Done

- **54 warnings corrigés, 41 fichiers, 6 codes ramenés à zéro** : `DL3015` ×24
  (`--no-install-recommends`), `SC2004` ×10 (`$` inutile dans `$(( ))`), `SC2164` ×4 (`pushd` non
  gardé), `SC2102` ×4 (`fastapi[standard]` non quoté est un glob shell), `DL3019` ×4
  (`apk add --no-cache`), `DL3009` ×3 (listes apt laissées dans l'image), `SC2086` ×2, `SC2028` ×1,
  `SC2269` ×1 (auto-affectation morte), `DL3027` ×1 (`apt` → `apt-get`).
  Corpus publié : **276 → 223 warnings, 0 erreur**.
- **Un vrai bug de fragilité corrigé** : `docker-lubuntu` écrivait son `lightdm.conf` avec
  `echo "...\n..."`. Cela ne marchait que parce que le `/bin/sh` par défaut de Docker est dash,
  dont le `echo` interprète `\n` ; sous bash le fichier serait sorti sur une seule ligne avec des
  `\n` littéraux, illisible pour LightDM. Remplacé par `printf '%s\n'`, à nombre de lignes
  constant, dans le style déjà utilisé ailleurs dans le corpus.
- **Le gate est durci (critère 4)** — mais par un **cliquet**, pas par un passage en bloquant de
  tout : `RATCHETED_CODES` dans `lint-snippets.mjs` promeut en `error` les 6 codes ramenés à zéro.
  Réintroduire un `apk update && apk add` fait désormais sortir `--ci` en **1**. Vérifié en
  négatif : régression injectée → `ERROR … [DL3019]`, exit 1 ; restauration → exit 0.
  `DL3015` n'est **pas** dans le cliquet : deux occurrences doivent survivre (voir ci-dessous).
- **Un fichier exclu plutôt que corrigé** (9 warnings) :
  `blog/2026/03/30/ollama-installation/files/calculate_autocompleted.sh`. L'article écrit noir sur
  blanc que ce script a été produit *entièrement* en acceptant les suggestions d'Ollama, « sans
  écrire une seule ligne de code ». Ses warnings **sont** la démonstration ; les corriger
  falsifierait l'article. Même cas que `vscode-tabnine/customer.php`, déjà exclu.
- **Critère 2 — aucun sidecar ELI5 périmé** : 78 sidecars régénérés (39 `en` + 39 `fr`, ≈ 0,78 $).
  `eli5:check` : **1694 fresh, 2 stale**, et ces 2 (`.claude/commands/links.md`,
  `src/components/Bluesky/comments.tsx`) préexistent et n'ont rien à voir avec ce TODO.
  Une régénération a échoué au premier essai sur le piège d'échappement JSON déjà documenté dans
  l'en-tête de `generate-eli5.mjs` (`\033[...m` cité dans une explication) ; réussie au second.
- **Critère 3 — prose relue** : recherche systématique des anciennes chaînes dans les `index.md`.
  Les seules occurrences de `apt install` / `apt update` dans la prose des articles touchés
  concernent l'installation de l'outil **sur la machine du lecteur** (`sudo apt install ripgrep`),
  jamais la ligne du Dockerfile. Aucune prose ne décrit les changements structurels
  (`docker-lubuntu`, `docker-healthy`, `compare.sh`, `assets-minifcation`).
- **Build vérifié** : build isolé bi-locale `SUCCESS`, et les corrections sont **présentes dans les
  deux locales**. Attention pour la prochaine vérification : le contenu des `<Snippet>` ne vit pas
  dans le HTML mais dans les chunks `assets/js/*.js` — un grep sur `index.html` seul conclut à tort
  que la correction est absente.

### Not done

- **102 warnings restants — délibérément non corrigés, avec une raison vérifiée par classe.**
  **Reason:** les corriger dégraderait l'article. Résumé (détail dans l'en-tête du script) :
  - **`SC2028` ×15 et `SC2016` ×10 sont des faux positifs symétriques.** Les lignes
    `RUN echo "PS1='\n\e[0;33m…\w # '" >> .bashrc` écrivent ces séquences **littéralement** dans
    `.bashrc`, où c'est **l'expansion de prompt de bash** qui les interprète — et `\$(whoami)` doit
    rester non expansé pour être réévalué à chaque prompt. `printf` les expanserait au build et
    casserait le prompt. `SC2016` est l'erreur inverse : chaque occurrence est un bloc
    `printf '%s\n'` qui écrit une **fonction shell** dans un fichier de config, où `$1` et
    `${var}` doivent survivre comme texte.
  - **`DL3059` ×18, `DL3003` ×6, `SC2015` ×5 dégradent l'article.** Chaque `RUN` de ces fichiers
    est une étape pédagogique sous son propre commentaire, et le nombre de couches n'a aucune
    importance pour une image que personne ne déploie ; fusionner renumérote en plus toutes les
    ancres ELI5. `WORKDIR` persiste pour toutes les instructions suivantes — ce n'est pas un
    nettoyage mais un changement de sémantique. `SC2015` vise l'idiome compact d'affectation par
    défaut dans un article dont le sujet *est* cet idiome.
  - **`DL4006` ×12 renumérote sans bénéfice lecteur** (une directive `SHELL` à insérer au-dessus
    du `RUN`, donc toutes les ancres ELI5 en dessous décalées, pour garder un pipe dans un build
    de démo).
  - **Longue traîne ×36** (`DL3046`, `DL3060`, `DL3016`, `SC2174`, `DL4001`, `DL3045` et 15
    singletons) : marginal sur un extrait d'article, laissé visible plutôt que masqué.
- **2 `DL3015` résiduels, volontaires.** `docker-lubuntu` installe le métapaquet
  `lubuntu-desktop`, qui tire tout le bureau via les Recommends, et `docker-run-linux-gui` installe
  un `.deb` Chrome local dont les dépendances d'exécution sont aussi des Recommends. Ajouter le
  flag casserait les deux démos. C'est la raison pour laquelle `DL3015` n'entre pas dans le cliquet.
- **Un `DL3008` de plus qu'avant sur `docker-lubuntu`.** En passant `apt` → `apt-get` (`DL3027`),
  hadolint s'est mis à analyser correctement cette ligne et y voit maintenant un épinglage
  manquant. C'est un warning de la classe refusée « épinglage » ; aucune action.
- **Critère 1 tel qu'il était écrit est inatteignable.** Il demandait que `--ci` ne rapporte plus
  que l'épinglage et `DL3064` — ce qui supposait les 156 corrigeables. Le critère correct, et
  désormais tenu, est : *toute classe qui reste est documentée avec sa raison, et toute classe
  vidée est verrouillée par le cliquet*.
