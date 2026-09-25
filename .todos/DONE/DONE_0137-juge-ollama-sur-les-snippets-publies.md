# 0137 — Passe 2 : le juge Ollama sur les snippets publiés

- **Priority**: Medium — la passe 1 couvre la syntaxe, pas l'obsolescence, qui est le vrai risque
- **Batch**: snippet-lint
- **Depends**: 0132
- **Files**: `scripts/lint-snippets.mjs`, `scripts/lib/snippet-lint-judge.mjs`, `.snippet-lint.json`

## Problème

La passe 1 livrée par le 0132 répond à « ce fichier est-il syntaxiquement valide ? ». Elle ne voit
pas ce qui rend un snippet dangereux des années après sa publication :

- `docker-compose` v1 (`docker-compose up`) au lieu de `docker compose up` ;
- `apt-key add`, déprécié puis supprimé ;
- `MAINTAINER` dans un Dockerfile ;
- une image `:latest` là où l'article prétend épingler ;
- un flag retiré de l'outil depuis la publication.

Aucun linter déterministe ne signale ça : ce sont des fichiers parfaitement valides, simplement
périmés. C'est pourtant la classe que le lecteur copie-colle et qui échoue chez lui.

## Ce qui est déjà en place (0132)

Tout le squelette est réutilisable tel quel — il ne manque que l'adaptateur :

- `lib/snippet-lint-normalize.mjs` neutralise directives de highlight, placeholders `%%…%%` et
  marqueurs d'élision `[...]` ;
- `lib/snippet-lint-dispatch.mjs` donne le langage de chaque fichier ;
- `.snippet-lint.json` porte déjà le hash de chaque fichier — l'incrémental est acquis, la passe 2
  doit simplement stocker son verdict sous une clé distincte de celle de la passe 1, pour qu'un
  changement de prompt ne force pas à relancer les linters (et réciproquement).

## Piste de solution

Modèle `code-quality` via Ollama direct, comme `generate-questions.mjs` — pas AnythingLLM, il n'y a
pas de recherche vectorielle ici. Compter **~30-36 s/fichier** : sur les 447 fichiers lintables
c'est ~4 h, sur les 1098 référencés ~9 h. À lancer en arrière-plan, par lots, pas en synchrone.

Le system prompt porte tout le poids. Il doit donner le contexte manquant :

> Ce fichier est un extrait d'article de blog. Il peut être partiel, hors contexte, et dépendre de
> code montré ailleurs dans l'article. Ne signale QUE ce qui serait faux même dans un extrait :
> outil déprécié, commande supprimée, syntaxe d'une version morte. Ne signale jamais une variable
> non définie, un shebang absent, un import manquant.

Cette consigne élimine d'entrée la classe de faux positifs que la passe 1 a déjà dû neutraliser à
la main (`SC2154`, `F821`, `SC2148`) — la mesure du 0132 : 90 `F821` sur 16 fichiers, tous des
imports montrés dans un fragment précédent.

## Attention — la leçon du 0132

Le premier run de la passe 1 a produit **139 erreurs, dont 133 étaient des artefacts d'extrait**.
Le tri a pris plus de temps que l'écriture du linter. Prévoir le même ratio ici, et **ne pas
lancer les 4 h avant d'avoir calibré le prompt sur un échantillon de 20 fichiers** choisis pour
couvrir les cas connus (un compose v1, un `apt-key`, un Dockerfile propre, trois fragments).

Un verdict du juge n'est pas une erreur : c'est une **proposition**, à confirmer par relecture.
Le stocker comme tel dans l'état (`severity: "suggestion"`), jamais comme un échec de CI.

## Critère d'acceptation

1. Un run sur un échantillon de 20 fichiers produit un rapport lisible et calibré.
2. Le verdict de la passe 2 vit sous une clé distincte de celle de la passe 1 dans
   `.snippet-lint.json` ; relancer l'une ne réanalyse pas l'autre.
3. La passe 2 ne sort jamais en code retour non nul : elle propose, elle ne bloque pas.
4. `ollama` absent ou `OLLAMA_DISABLE=1` → la passe 2 se saute silencieusement, la passe 1 continue.

## Résultat (2026-09-25)

### Les 4 critères

| # | Critère | État |
| --- | --- | --- |
| 1 | Échantillon de 20 fichiers → rapport lisible et calibré | ✅ voir calibration ci-dessous |
| 2 | Verdict passe 2 sous une clé distincte, les deux passes indépendantes | ✅ vérifié dans les deux sens |
| 3 | La passe 2 ne sort jamais en code retour non nul | ✅ `EXIT=0` avec 2 suggestions au rapport |
| 4 | Ollama absent / `OLLAMA_DISABLE=1` → saut propre, passe 1 continue | ✅ vérifié 3 fois (CI, flag, URL morte) |

### Calibration — le prompt tient

20 fichiers tirés avec ancres de cas connus (`seed=137`), **0 faux positif**, 0 erreur. C'est
l'inverse exact du premier run de la passe 1 (133 artefacts sur 139 diagnostics) : le prompt
consacre l'essentiel de ses mots à la liste des **refus**, ce qui était bien le pari du TODO.

Les 18 fichiers à 0 finding le méritent : vérifié à la main, aucun `compose.yaml` de
l'échantillon ne porte encore de clé `version:`, et les `:latest` sont explicitement hors
périmètre (épingler un tutoriel le périme plus vite qu'il ne le protège).

**Contrôle positif** — un `Dockerfile` fabriqué avec 3 obsolescences plantées : **3/3 attrapées**,
bons numéros de ligne, bons remplacements (`MAINTAINER` → `LABEL org.opencontainers.image.authors`,
`apt-key add` → `gpg --dearmor`, `docker-compose up` → `docker compose up`). Un `.sh` moderne à
côté : 0 finding. Sans ce contrôle, « 0 partout » aurait pu vouloir dire « juge muet ».

Sur le corpus réel, 2 vraies trouvailles sur les 13 fichiers de `behat-introduction` : `apt-key`
dans `Dockerfile` et `Dockerfile.part2`. Réelles, pas des artefacts.

### Deux écarts par rapport aux prémisses

- **Le temps : ~1,4 h, pas ~4 h.** Médiane mesurée **9 s/fichier** (4,4 s à 32 s), pas 30-36 s.
  L'estimation du TODO venait de `generate-questions.mjs`, qui envoie des **articles entiers** au
  même modèle ; un snippet est un ordre de grandeur plus court. Les 13 fichiers de
  `behat-introduction` ont pris 2,4 min.
- **Le modèle se répète et digresse.** Deux défauts corrigés *après* mesure, pas anticipés :
  il a listé deux fois le même finding sur le tout premier fichier (dédoublonnage ajouté), et il
  a répondu à « replacement » par un bloc ```dockerfile de 884 caractères avec un paragraphe de
  conseils — bon contenu, illisible dans une liste. Le prompt demande maintenant une ligne, **et**
  le code l'impose (`oneLine()`, 180 caractères) : seule la seconde moitié est une garantie.
  D'où `JUDGE_PROMPT_VERSION = 2`.

### Ce qui n'a pas été fait

- **La passe sur le corpus complet n'a pas été lancée** (447 fichiers, ~1,4 h de GPU). Ce n'est
  pas un critère d'acceptation — le TODO la décrit comme un batch d'arrière-plan et interdit de la
  lancer avant calibration, ce qui est fait. 13 fichiers sont jugés dans `.snippet-lint.json` ;
  la commande est `snippets judge`, `--judge-limit N` pour la découper en séances.
- **Les fichiers UNSUPPORTED ne sont pas jugés** (makefiles, `.htaccess`, transcriptions `.txt`).
  C'est pourtant là que le juge ajouterait le plus, faute de linter — mais 280 des 651 sont des
  transcriptions de terminal, dont le bruit attendu n'a pas été mesuré. À ouvrir en TODO séparé
  si l'envie vient ; le paramètre est une ligne dans `runJudge`.
