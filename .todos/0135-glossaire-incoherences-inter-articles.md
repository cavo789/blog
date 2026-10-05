# 0135 — Le glossaire de traduction grandit par accident, et l'incohérence entre articles est invisible

- **Priority**: Low — qualité perçue, pas correction ; sous-produit quasi gratuit de 0134
- **Batch**: i18n-fr
- **Depends**: 0134
- **Files**: `scripts/translate-drift.mjs`, `scripts/lib/translate-contract.mjs`

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
