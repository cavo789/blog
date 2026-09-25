# 0135 — Le glossaire de traduction grandit par accident, et l'incohérence entre articles est invisible

- **Priority**: Low — qualité perçue, pas correction
- **Batch**: i18n-fr
- **Depends**: —
- **Files**: `scripts/lib/translate-contract.mjs`, un nouveau script de balayage lexical

> **Note du 2026-09-25 — la dépendance à 0134 est levée, pas héritée.**
> 0134 est parti en `WONT_DO` : son juge de fidélité coûtait 11,6 h de GPU (mesuré). 0135 se
> présentait comme son « sous-produit quasi gratuit », mais **il ne dépend en réalité d'aucun
> appel de modèle**. Ses deux trous sont lexicaux : chercher les deux membres d'une
> `CONSISTENCY_PAIRS` à travers les 258 traductions, et relever les termes candidats au
> `GLOSSARY` par fréquence. C'est un balayage de texte, pas un jugement de sens — quelques
> secondes, zéro GPU, zéro API. Ce qui a été mesuré en préparant 0134 lui reste d'ailleurs
> acquis : les 258 paires EN/FR s'apparient exactement, bloc à bloc, sans aucune divergence de
> structure. Seul le `scripts/translate-drift.mjs` d'origine disparaît du plan.

## Problème

Le contrat de traduction est déjà solide et il ne faut rien y refaire : `GLOSSARY` (46 entrées,
avec le genre — *« le container (m.) »*), `BANNED_FRENCH` (15 sur-traductions interdites, dont
`conteneur`, `jeton`, `étiquette`) et `CONSISTENCY_PAIRS`, le tout vérifié mécaniquement par
`translate-validate.mjs`. La règle « les termes techniques restent en anglais » est appliquée,
pas seulement souhaitée.

Deux trous subsistent, tous deux **étroits et précis** :

**1. `CONSISTENCY_PAIRS` est intra-article par conception.** Le commentaire du fichier le dit
lui-même : *« must never BOTH appear in **the same** translated article »*. Si l'article A écrit
« le hook » et l'article B « le crochet », aucun contrôle ne se déclenche. **L'incohérence d'un
article à l'autre est structurellement invisible.**

**2. `GLOSSARY` grandit par incident.** Les commentaires du fichier racontent exactement ça :

> *Added 2026-09-16 after the first real run produced "folding" and "pliage" ten lines apart in
> the same article. Terminology gaps show up as intra-article inconsistency, not as wrong words.*

Chaque entrée est née d'une anomalie constatée à l'œil, sur un article. Rien ne va chercher
**proactivement** les termes qui mériteraient d'y entrer.

## Piste de solution

C'est une **sortie supplémentaire de la passe de 0134**, pas un chantier séparé : même corpus
(258 paires alignées), même lecture, un rapport de plus. Ne pas écrire un second script qui
recharge tout.

Pour chaque terme technique anglais du corpus source, recenser **toutes** ses traductions
françaises constatées, tous articles confondus, avec leur fréquence :

```text
hook        → « le hook » (41×), « le crochet » (2×)   ← candidat BANNED_FRENCH
middleware  → « le middleware » (12×), « l'intergiciel » (1×)  ← déjà banni, 1 fuite à corriger
```

Deux usages de ce rapport :

- **proposer les prochaines entrées** de `GLOSSARY` / `BANNED_FRENCH`, au lieu de les découvrir un
  incident à la fois ;
- **localiser les fuites existantes** : un terme majoritairement correct avec deux occurrences
  divergentes désigne les deux articles à réparer via `translate --repair`.

Le recensement lui-même est en grande partie **lexical** — l'alignement paragraphe à paragraphe
est déjà fait par 0134. Le modèle local ne sert qu'à décider si deux formulations françaises
désignent bien le même terme anglais.

## Critère d'acceptation

1. Le rapport liste, par terme, ses variantes françaises et leur fréquence, triées par
   « suspicion » (une variante rare face à une variante dominante).
2. Les termes **déjà** couverts par `GLOSSARY` avec une seule variante n'apparaissent pas — sinon
   le rapport fait 46 lignes de bruit avant la première information utile.
3. Au moins **une** entrée concrète est proposée pour `GLOSSARY` ou `BANNED_FRENCH`, et la
   décision de l'ajouter ou non est consignée ici.
4. Toute fuite détectée d'un terme déjà banni est corrigée et `translate --repair` repasse au vert.

## À ne pas oublier

- **Ne rien ajouter au glossaire sans relire la leçon du 2026-09-17** inscrite dans
  `translate-contract.mjs` : deux paires y ont été *retirées* parce que leur côté français était
  un mot français ordinaire (`validation`, `compilation`), qui déclenchait sur de la prose
  correcte. Une paire n'est sûre que si son côté français est un mot que personne n'écrirait pour
  une autre raison — `pliage`, `greffon`, `antémémoire`.
- `translate-contract.mjs` est envoyé **octet pour octet identique** à chaque appel, c'est ce qui
  fait payer le `cache_control` de `translate-post.mjs`. Toute modification invalide le cache de
  tout le corpus : grouper les ajouts en une seule fois, pas un par semaine.
- `GLOSSARY` contient déjà `["snippet", …]` **en double**. À nettoyer au passage.

## Status — PARTIAL (2026-09-25)

### Done

- **`scripts/translate-terminology.mjs`** — audit terminologique inter-articles du corpus
  français. Purement lexical : ni Ollama, ni client Anthropic, ni réseau. Un run complet sur les
  257 paires prend quelques secondes. Câblé partout où la convention l'exige :
  `yarn translate:terms`, la fonction `terms` du cheat-sheet (catégorie *Translation*),
  `export -f terms` dans le launcher, l'équivalence dans `scripts/lib/cheatsheet-hint.mjs`, et la
  ligne de commande dans `CLAUDE.md`.
- **Le trou n° 1 est comblé, et la réponse est « propre ».** Le balayage inter-articles cherche
  chaque forme française découragée — `BANNED_FRENCH` **et** le côté français de
  `CONSISTENCY_PAIRS` — dans les 257 traductions : **0 fuite**. C'est la question que
  `translate-validate.mjs` ne peut structurellement pas poser, elle est maintenant posée, et le
  corpus y répond bien. Aucun `translate --repair` n'a donc été nécessaire : **0 $ dépensé**
  (critère 4, satisfait à vide).
- **Un vrai défaut de conception corrigé au passage.** Ma première version du détecteur
  ré-implémentait le matching des mots bannis et signalait « Jetons un œil au fichier » (le verbe
  *jeter*) comme un `jetons` banni. `translate-validate.mjs` possédait déjà un `BANNED_OVERRIDES`
  écrit exactement pour ça. Le matcher est désormais **exporté** (`hasBannedWord`) et partagé par
  les deux appelants, donc l'audit et le validateur ne peuvent plus diverger. 8 cas de test de
  détection passent (verbe ≠ nom, singulier/pluriel, préfixe).
- **Deux changements de contrat, groupés en une seule édition** comme la section « À ne pas
  oublier » l'exige pour le cache :
  - `["snippet", …]` **dédoublonné** — `GLOSSARY` passe de 47 à 46 entrées, 0 doublon.
  - `runtime` **cadré** : `le runtime (m.) — le composant ; « à l'exécution » reste correct pour
    *at runtime*`. Motivé par la mesure (7/11 conservés, et les 4 exceptions rendent toutes la
    locution *at runtime* par « à l'exécution », ce qui est du bon français). Même forme que
    `path`, `layer` et `image`, qui portaient déjà leur portée. **C'est la décision consignée
    qu'appelle le critère 3 : on annote, on n'interdit pas.**
- **Non-régression vérifiée sur pièces** : `validateTranslation` passé sur les 258 traductions
  avant et après le refactor — sortie identique, 1 seul article en défaut dans les deux cas.

### Trouvaille annexe, non traitée

`blog/2025/09/24/docusaurus-snippets/index.md` est le **seul** article dont la traduction est en
défaut, et il l'était déjà avant toute modification de cette session (vérifié en rejouant le
validateur de `HEAD`) :

```text
front matter: key "updates" was modified (must be copied verbatim)
MDX components: sequence differs (59 vs 57)
```

Rien à voir avec la terminologie — c'est de la dérive de structure. Hors périmètre de ce TODO,
mais ça mérite son propre TODO ou un `translate --repair` ciblé.

Également relevé : `blog/2023/12/22/docker-joomla/index.mdx` est le seul article que l'audit ne
peut pas aligner (217 blocs EN contre 218 FR). Le script **refuse** d'aligner à l'aveugle et le
signale, plutôt que de comparer des paragraphes sans rapport.

### Not done

- **Le trou n° 2 — « aller chercher proactivement les termes candidats au glossaire » — n'est pas
  résolu.**
  **Reason:** la méthode par fréquence ne discrimine pas. Le script mesure la *rétention* du terme
  anglais (dans combien de blocs survit-il tel quel côté français), ce qui est une bonne mesure
  pour un terme technique déjà identifié, mais qui ne sait pas distinguer un terme technique d'un
  mot courant. En tête des candidats on trouve `files` (58 %), `name` (52 %), `local`, `title`,
  `link`, `steps`, `test` : du vocabulaire anglais ordinaire qui se traduit normalement en
  français. Le signal utile est noyé. Aucune entrée de glossaire ne peut être proposée
  honnêtement à partir de cette liste.
- **Le rapport ne nomme pas les variantes françaises constatées** (« hook → le hook (41×), le
  crochet (2×) »), comme le demandait le critère 1.
  **Reason:** savoir *par quoi* un terme a été remplacé suppose de comparer deux formulations et
  de décider si elles désignent la même chose — c'est le jugement sémantique de 0134, refusé pour
  son coût (11,6 h de GPU mesurées). Le script contourne en mesurant la survie du terme anglais,
  ce qui est gratuit et suffit à répondre « y a-t-il divergence ? », mais pas « vers quoi ? ».
- **Conséquence pour qui reprend :** les deux manques ci-dessus sont le **même** manque. Une
  découverte proactive utile demande un signal sémantique, pas lexical. La piste la moins chère
  n'est pas un LLM mais l'embedder déjà en place (`lib/anythingllm.mjs`) — à condition de se
  souvenir qu'il est anglophone et environ 2,5× plus bruyant en français. À évaluer avant de
  rouvrir 0134 pour cette raison.

### À savoir sur la mesure

- L'alignement bloc à bloc tient sur **257 des 258** paires. Les mesures de préparation de 0134
  annonçaient 258/258 : l'écart vient du découpage, qui neutralise désormais aussi le **code
  inline** via `blankOutCodeSpans` (`lib/snippet-scan.mjs`, réutilisé et non recopié) — sans quoi
  les termes cités entre backticks gonflent artificiellement la rétention.
- La rétention tolère l'accord en nombre (`container`/`containers`). Sans ça, les pluriels
  comptaient comme des pertes et représentaient l'essentiel de la fausse dérive de `script`,
  `image` et `log`.
- Elle ne tolère **pas** la flexion verbale française d'une racine anglaise : « qui commite tous
  vos changements » compte comme une perte de `commit` alors que le terme est bien conservé.
  C'est la principale cause résiduelle de faux positifs dans la section « GLOSSARY terms that
  still slip » — lire les cas avant de conclure, comme toujours.
