# 0136 — Badge de niveau (débutant / intermédiaire / avancé), classé automatiquement

- **Priority**: Medium — nouvelle facette lecteur, générable sans coût API
- **Batch**: blog-article-header
- **Depends**: 0122
- **Files**: `scripts/classify-level.mjs`, `blog/**/index.md`, `src/components/Blog/PostCard/`, `src/components/Blog/utils/posts.ts`, `i18n/fr/code.json`

## Problème

258 articles, du « installer Docker » au « multi-stage build avec cache mount ». Rien ne dit au
lecteur, avant qu'il n'ouvre la page, si l'article est pour lui. Les tags disent le **sujet**,
jamais l'**exigence**.

C'est une tâche de **classification fermée à trois classes**, sur des textes dont on possède déjà
le résumé (`description`, `<TLDR>` présent sur les 258 articles) : exactement le profil où un
petit modèle local est bon et où un gros modèle est du gaspillage. Coût : une passe GPU.

## Ce que ça ouvre

- Un badge dans l'en-tête d'article et sur `PostCard`.
- Une facette de filtrage sur les listings, orthogonale aux tags.
- Un meilleur signal pour `RelatedPosts` : « la suite logique » plutôt que « le plus proche ».

## La contrainte qui pilote la conception : ne pas repayer la traduction

**Vérifié, et c'est acquis par construction.** `scripts/lib/translate-hash.mjs` :

```js
const TRANSLATABLE_KEYS = new Set(["title", "description"]);
```

Le hash de fraîcheur ne porte que sur le contenu *traduisible* ; le front matter y est filtré à
ces deux clés. Ajouter `level: intermediate` aux 258 articles anglais **ne bouge pas le hash d'un
bit** : `translate:check` continue de rapporter *fresh*, et `translate` refuse de retraduire.
Zéro euro. Même logique que `tags`, `date`, `image`, `mainTag` et `review_date`.

## Et surtout : le même badge des deux côtés, jamais un autre

C'est le vrai point de vigilance, et le mécanisme existe déjà à moitié.

`scripts/lib/translate-validate.mjs` compare le front matter **octet pour octet**, en exemptant
seulement `title`, `description` et `language`. Toute autre clé doit être recopiée telle quelle,
sous peine de trois diagnostics déjà écrits : *key missing from translation*, *key was modified
(must be copied verbatim)*, *key invented by the translation*.

Donc :

- **Ne jamais ajouter `level` à `TRANSLATABLE_KEYS`**, ni dans `translate-hash.mjs`, ni dans
  `translate-validate.mjs`. C'est la seule ligne qui empêche le français de porter un autre
  niveau que l'anglais. À écrire en commentaire à côté de la constante.
- **Ne jamais reclasser depuis l'article français.** Le classifieur tourne sur `blog/**`
  uniquement, et le français *copie*. Un article ne peut pas être « intermédiaire » en anglais et
  « avancé » en français : c'est le même article.
- Seuls les trois **libellés affichés** sont traduits, via `i18n/fr/code.json`. La valeur du front
  matter reste un identifiant anglais.

**Le problème des 258 traductions existantes** : elles ne portent pas la clé. Ajouter `level:`
côté anglais les laisse sans badge, silencieusement — et comme le hash ne bouge pas, rien ne le
signalera. C'est précisément le bug décrit en **0122** (« les props identifiantes ne se propagent
jamais aux traductions ») et sa solution B, la passe de synchronisation déterministe sans appel
API, est ce qu'il faut ici. D'où la dépendance : **faire 0122 d'abord**, puis réutiliser sa passe
pour recopier `level` dans les 258 fichiers français.

## Piste de solution

1. Classifieur local sur `title` + `description` + `<TLDR>` + les titres de section, sortie
   contrainte par schéma à trois valeurs. Ne pas lui envoyer l'article entier : le résumé suffit
   et le run est dix fois plus rapide.
2. Écriture de `level:` dans le front matter anglais, **en mode proposition** : un rapport
   d'abord, l'écriture ensuite, après relecture. 258 valeurs dont une vingtaine seront discutables.
3. Propagation déterministe vers `i18n/fr/**` via la passe de 0122.
4. Affichage : badge dans l'en-tête, badge sur `PostCard`, facette de filtrage.

## Critère d'acceptation

1. `translate:check` rapporte **fresh** sur les 258 articles après l'ajout de `level` — c'est la
   preuve que rien ne sera refacturé.
2. Un balayage compare les 258 paires EN/FR : **0 divergence** sur la valeur de `level`, et 0
   article français sans la clé.
3. Falsifier volontairement un `level` dans un fichier français et vérifier que
   `translate-validate.mjs` le signale en *key was modified*.
4. Les trois libellés s'affichent en français sous `/fr/` et en anglais sous `/`.
5. `yarn lint && yarn format:check && yarn build` passent sur les **deux** locales — build une
   locale à la fois, voir `.claude/rules/build-verification.md`.

## À ne pas oublier

- `level` est une donnée de front matter : le chemin de rendu doit passer par `useBlogMetadata()`
  et non `getBlogMetadata()`, sous peine de perdre le filtrage et l'overlay de traduction.
- Trois classes, pas cinq. Une échelle plus fine n'est pas classifiable de façon stable et
  n'apporte rien au lecteur.
- Le classifieur tourne **une fois**. Un article réédité ne change pas de niveau : prévoir le
  `--force` mais pas de relance automatique.

## Status — WONT_DO (2026-09-25)

### Rien n'a été implémenté

`scripts/classify-level.mjs` n'a jamais été écrit, aucun `level:` n'a été ajouté au front matter,
aucun fichier de `i18n/fr/**` n'a été touché. Le TODO est refusé au stade de l'analyse, avant
toute écriture.

### Pourquoi on ne le fait pas

Décision de l'auteur, sur deux arguments qui portent chacun seuls.

**1. Le lectorat ne parcourt pas le catalogue.** Le bounce rate tourne autour de **90 %** : les
lecteurs arrivent par une recherche sur un sujet précis, lisent la page qui répond à leur
question, et repartent. Ils ne naviguent pas d'un article à l'autre. Or tout l'intérêt d'un badge
de niveau est de **trier avant d'ouvrir** — arbitrer entre plusieurs articles d'un même catalogue.
Sur un trafic qui n'ouvre qu'une page et ne compare rien, la facette de filtrage ne sert
quasiment personne, et le badge en en-tête arrive de toute façon trop tard : le lecteur est déjà
sur la page qu'il cherchait. Même raisonnement que le refus groupé du 2026-09-23 sur les
fonctionnalités d'engagement lecteur (voir [[feedback_todo_triage]]) : la valeur supposée
suppose un usage de navigation que le trafic réel ne montre pas.

**2. C'est une charge récurrente, pas un run unique.** Le TODO présente le coût comme « une passe
GPU » et précise que « le classifieur tourne **une fois** ». C'est vrai du corpus existant, et
faux du régime permanent : **chaque nouvel article devra porter son badge**. Soit l'auteur le
choisit à la main à chaque publication, soit il pense à relancer le classifieur et à en relire la
proposition — dans les deux cas c'est une étape de plus dans le rituel de publication, pour une
clé de front matter que rien d'autre ne consomme. Un surcoût permanent en échange d'un bénéfice
que le point 1 rend marginal.

### Ce n'est pas la première fois

`WONT_DO_009-difficulty-rating.md` refusait déjà l'étiquetage de difficulté, dans sa variante
« l'auteur annonce un niveau, le lecteur vote ». 0136 en était la version sans vote, classée par
un modèle local. Deux angles différents, même fonctionnalité de fond, deux refus. **Si l'idée
revient une troisième fois, c'est ce paragraphe qu'il faut lire en premier** : le blocage n'est
ni technique ni un problème de coût de génération, c'est que le trafic ne s'en sert pas.

### À garder si quelqu'un rouvre quand même

Deux constats vérifiés le 2026-09-24, qui resteraient vrais :

- **L'ajout d'une clé de front matter ne refacture aucune traduction.** `TRANSLATABLE_KEYS` vaut
  bien `{title, description}` dans `scripts/lib/translate-hash.mjs:15` ; une clé `level:` ne
  bouge pas le hash de fraîcheur. Et `scripts/lib/translate-validate.mjs:176` émet bien
  *key was modified (must be copied verbatim)* sur toute clé non exemptée, donc le français ne
  peut pas porter une autre valeur que l'anglais. Les deux garde-fous que le TODO décrivait
  existent réellement.
- **La dépendance `Depends: 0122` était surévaluée.** La difficulté de 0122 est l'appariement des
  balises MDX dans le *corps* du texte, par ordre d'apparition, avec un cas non tranché quand les
  comptes divergent. Une clé de front matter est une map plate adressée par nom : ni ordre, ni
  ambiguïté, ni divergence possible. La propagation de `level:` vers les 258 fichiers français
  n'aurait réutilisé aucune machinerie de 0122. 0136 n'était pas réellement bloqué par 0122.

Le vrai manque, lui, n'était pas côté données mais côté UI : les trois libellés (EN + FR) n'ont
jamais été arbitrés, et surtout **il n'existe aucune UI de facette générique** à étendre — les
listings sont des pages par tag et par série (`Tags/TagArticlesPage.tsx`,
`Series/SeriesArticlesPage.tsx`). La facette de filtrage était un composant à concevoir, pas un
branchement, ce que le TODO sous-estimait.
