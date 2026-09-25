# 0134 — Rien ne vérifie que les 258 traductions disent la même chose que l'original

- **Priority**: High — une traduction peut affirmer le contraire de l'original sans qu'aucun signal ne se déclenche
- **Batch**: i18n-fr
- **Depends**: —
- **Files**: `scripts/translate-drift.mjs`, `scripts/lib/translate-validate.mjs`, `.devcontainer/scripts/helpers/translation.sh`

## Problème

Les 10 contrôles de `translate-validate.mjs` sont tous **mécaniques** : front matter copié
octet pour octet, mots bannis, blocs de code intacts, ancres valides, `slug` non traduit,
`language: fr`. Ce sont des contrôles de **forme**, et ils sont excellents pour ça.

Aucun ne lit le **sens**. Le cas qui passe entre toutes les mailles :

```text
EN : This does NOT work under WSL 1.
FR : Cela fonctionne sous WSL 1.
```

Structure identique, aucun mot banni, code intact, ancres bonnes, front matter conforme. **Les 10
contrôles passent.** La traduction affirme le contraire de l'original, et rien dans la chaîne ne
peut le voir — ni `translate:check`, qui ne mesure que la dérive du *hash source*, ni `--repair`,
qui rejoue ce même validateur.

Les 258 traductions sont donc aujourd'hui **crues sur parole** quant à leur fidélité. ≈ 41 $ de
traduction dont personne n'a jamais vérifié le contenu.

## Ce qui rend l'idée réalisable

L'alignement est **gratuit et exact**, ce qui est habituellement la partie difficile :

- chaque `index.md.translation.json` stocke déjà le texte anglais **au moment de la traduction**
  (clé `source`) — on compare la traduction à ce qui a réellement été traduit, pas à une version
  ultérieure ;
- le contrat de traduction impose la préservation de la structure, et le validateur la vérifie
  déjà (check 3 : mêmes composants MDX, même ordre, même arité). L'appariement paragraphe à
  paragraphe est donc fiable par construction.

258 paires, un modèle local, coût nul.

## Piste de solution

Découper chaque paire en paragraphes, puis demander au modèle local, paragraphe contre
paragraphe, un verdict fermé : `équivalent` | `divergent` | `doute`. Sortie contrainte par schéma
JSON (`format:`), comme `generate-questions.mjs`.

Sortie : une liste d'articles suspects, avec le paragraphe incriminé des deux côtés. On ne paie
Claude (`translate --repair`) que sur cette liste.

### Cadrage du juge — c'est là que tout se joue

- **Ne pas juger le style.** Une traduction idiomatique n'est pas une divergence. Seul un fait
  affirmé d'un côté et absent, inversé ou modifié de l'autre compte.
- **Un modèle de prose, pas de code.** Les trois Modelfiles actuels portent des system prompts de
  *code review* (« senior software engineer », « strict code reviewer »), ce qui tire le modèle
  dans la mauvaise direction pour juger de la prose. Aucun nouveau modèle n'est nécessaire : les
  scripts envoient déjà leur propre `system` par requête (voir `generate-questions.mjs`), donc
  c'est le même modèle, le même runner, zéro GB de VRAM supplémentaire.
- **Attention aux homographes FR/EN**, le piège déjà consigné dans
  `feedback_validator_false_positives` : lire le contexte avant d'accuser le modèle de traduction.
- Les blocs de code sont copiés à l'identique par contrat : **les exclure du jugement**, ils ne
  peuvent que produire du bruit.

### Incrémental

Un article dont ni la source ni la traduction n'ont bougé depuis son dernier jugement ne doit pas
être resoumis. Le sidecar `.translation.json` est l'endroit naturel pour le verdict.

## Critère d'acceptation

1. Un run complet sur les 258 paires se termine sans appel API — vérifier qu'aucune clé
   Anthropic n'est requise pour le lancer.
2. Le rapport nomme l'article, le paragraphe anglais et le paragraphe français, jamais juste
   « article suspect ».
3. **Test de détection** : introduire volontairement une négation inversée dans une traduction,
   relancer, et vérifier qu'elle est signalée. Sans ce test, le run vert ne prouve rien —
   `feedback_verification_discipline` : vérifier l'artefact, pas le code de sortie.
4. Contrôle manuel de 20 divergences signalées : le taux de vrais positifs est écrit dans ce TODO.
5. Relancer immédiatement : 0 paire rejugée.

## À ne pas oublier

- Ce contrôle **ne remplace pas** `translate-validate.mjs`, il le complète sur l'axe que celui-ci
  ne couvre pas. Ne rien retirer des 10 contrôles existants.
- Ne jamais corriger automatiquement une traduction depuis le modèle local : la sortie de ce
  script est une **liste de suspects**, l'écriture reste le travail de `translate --repair`.
- Un `doute` n'est pas un `divergent`. Les compter séparément, sinon le taux de faux positifs est
  ininterprétable.

## Status — WONT_DO (2026-09-25)

### Rien n'a été implémenté

`scripts/translate-drift.mjs` n'a jamais été écrit. Le travail s'est arrêté à l'instrumentation
de cadrage, qui a tourné hors ligne, sans le moindre appel API.

### Ce que l'analyse a établi — à garder, c'est du mesuré

Trois chiffres obtenus le 2026-09-25 sur le corpus réel, tous gratuits :

- **258 articles traduits, 258 sidecars portant une clé `source` exploitable.** Aucun trou.
- **0 divergence de structure sur les 258 paires.** Le découpage en blocs de prose (fences de code
  exclues, séparation sur ligne vide) donne exactement le même nombre de blocs des deux côtés,
  pour les 258 articles. **L'appariement paragraphe à paragraphe est donc exact et gratuit**, ce
  que le TODO pariait sans l'avoir vérifié. Ce pari était juste.
- **13 376 paires de blocs**, dont 2 569 strictement identiques (props et balises recopiées
  verbatim) et 1 291 de markup pur ou trop courtes pour porter une affirmation. Reste
  **9 516 paires à juger**, 349 caractères en moyenne.

### La raison principale : on fait confiance au traducteur

Avant tout argument de coût, c'est une décision de **confiance dans l'outil**. Les traductions
sont produites par Claude via l'API, pas par un modèle local approximatif, et l'auteur ne s'attend
pas à ce qu'un balayage de fidélité trouve quoi que ce soit — sauf accident franc de l'outil de
traduction, qui se verrait autrement. Construire un juge pour confirmer une non-trouvaille est le
mauvais emploi de l'effort.

Ce n'est donc **pas** un refus « en attendant mieux ». Un modèle plus rapide ne suffirait pas à
rouvrir le sujet : il faudrait d'abord une raison de douter des traductions, c'est-à-dire une
vraie erreur constatée à la lecture. Si ce jour arrive, la section technique ci-dessous dit par où
reprendre — mais c'est la seule porte d'entrée légitime.

### Le coût, qui confirme la décision

Le TODO annonce « 258 paires, un modèle local, coût nul ». **Les deux moitiés sont fausses.** Ce
ne sont pas 258 paires mais 9 516 — l'unité de jugement est le paragraphe, pas l'article. Et
« coût nul » ne vaut que pour la facture API : le coût réel est du temps GPU.

Mesure directe, `code-quality:latest`, lot de 8 paires, `temperature: 0`, sortie contrainte par
schéma JSON : **35 s par lot, soit 4,37 s par paire — 11,6 h pour le corpus.** Le modèle a bien
rendu 8 verdicts valides et parsables, donc le design fonctionne ; il est simplement trop lent.

Décision de l'auteur : au-delà de 8 h de GPU, le rapport valeur/coût ne tient plus pour un
contrôle dont on attend qu'il ne trouve probablement rien.

### La piste non testée — à ne lire qu'après avoir constaté une vraie erreur de traduction

Le chiffre de 11,6 h est celui d'**une seule configuration**, la plus lente disponible. Deux
leviers n'ont pas été mesurés et pourraient le diviser par plusieurs :

- **`think: false`.** `code-quality` est un modèle à raisonnement explicite, choisi au bench du
  2026-09-23 pour la génération de questions — une tâche ouverte et longue. Juger une équivalence
  factuelle est une **classification fermée à trois classes** sur 350 caractères : le profil
  exact où le raisonnement explicite coûte cher sans rien apporter. C'est le premier levier à
  essayer.
- **Des lots plus gros (16, 24).** À 35 s le lot de 8, une part fixe du temps est l'amorçage du
  raisonnement, pas le contenu. Amortir sur plus de paires devrait baisser le coût par paire,
  tant que le modèle ne décroche pas sur la longueur — piège connu (`task-tiny` s'effondrait sur
  les articles longs, voir `project_ollama_code_quality_speed`).

Si l'une des deux fait passer le corpus sous ~3 h, le TODO redevient *techniquement* praticable —
le reste de sa conception a été validé par la mesure. Mais praticable n'est pas justifié : voir la
section de confiance ci-dessus. Le déclencheur d'une réouverture est une erreur de traduction
réellement constatée, jamais un gain de performance.

### Ce que ce refus ne dit PAS

Il ne dit pas que le risque n'existe pas. Le scénario visé — une négation inversée par le modèle
au moment de traduire — est **figé dès la première passe** et **n'est éliminé par aucun workflow
d'édition** : ne plus jamais modifier l'article anglais après traduction le rend permanent, pas
impossible. C'est la distinction avec `WONT_DO_0122`, qui traitait d'une dérive *postérieure* à
la traduction et que le workflow élimine réellement.

On accepte donc sciemment de **croire le traducteur sur parole** sur les 258 traductions
(≈ 41 $ de génération dont la fidélité n'a jamais été contrôlée sur le fond). Les 10 contrôles
mécaniques de `translate-validate.mjs` restent en place et continuent de couvrir la forme ; c'est
l'axe du sens qui reste non couvert, et assumé comme tel.
