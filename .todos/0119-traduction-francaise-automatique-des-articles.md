# 0119 — Traduction française automatique des articles (locale `/fr/`)

- **Priority**: Medium — chantier multi-sessions ; à découper en lots A→H, aucun lot n'a de sens seul
- **Batch**: i18n-fr
- **Depends**: —
- **Files**: `docusaurus.config.js`, `scripts/translate-post.mjs` (à créer), `scripts/lib/translate-contract.mjs` (à créer), `scripts/lib/translate-validate.mjs` (à créer), `scripts/check-translation-freshness.mjs` (à créer), `scripts/lib/eli5-hash.mjs`, `.config/.pre-commit-config.yaml`, `i18n/fr/` (à créer), `src/components/Blog/TranslationNotice/` (à créer), `src/components/Blog/TranslationSwitch/` (à créer), `src/theme/BlogPostItem/index.js`, `src/components/Blog/utils/posts.ts`, `plugins/frontmatter-loader/index.cjs`, `plugins/markdown-export-plugin/index.cjs`, `plugins/questions-index-plugin/index.cjs`, `CLAUDE.md`

## Contexte — cette idée avait été rejetée le 2026-08-31

Une première évaluation (mémoire `feedback_i18n_translation_rejected`) avait écarté l'i18n
français : « les navigateurs traduisent déjà gratuitement, la double maintenance sur 247 articles
ne se justifie pas ». Ce TODO **rouvre** la décision sur trois éléments nouveaux, et en assume un
quatrième qui va dans l'autre sens :

- **Nouveau — données de trafic.** withcabin.com, 30 derniers jours : 452 visiteurs uniques en
  langue navigateur `fr` (2ᵉ langue), et surtout 671 depuis la France + 247 depuis la Belgique en
  pays d'origine (3ᵉ et 10ᵉ). La langue du navigateur sous-estime le lectorat francophone (un
  francophone laisse souvent l'anglais en langue première) ; le pays est le meilleur proxy. Ordre
  de grandeur réel : **10 à 15 % du lectorat**.
- **Nouveau — le moteur de traduction est déjà dans le dépôt.** L'évaluation d'août supposait
  Ollama (qualité médiocre en EN→FR technique). Or `scripts/generate-eli5.mjs` et
  `scripts/generate-questions.mjs` appellent déjà l'API Claude via `@anthropic-ai/sdk` et
  `ANTHROPIC_API_KEY`. La qualité disponible n'est plus celle d'un modèle local 7B.
- **Nouveau — le coût mesuré est dérisoire.** Voir la section « Coût » : **≈ 20 $** pour traduire
  tout le corpus en une fois, **< 0,10 $** par nouvel article. L'argument « ça coûte trop cher »
  ne tient pas ; c'est le temps de build et la dérive qui coûtent.
- **Contre — le corpus a grossi.** 257 articles aujourd'hui (250 `.md` + 7 `.mdx`, 290 533 mots,
  2,09 Mo) contre 247 en août. La double maintenance est donc *un peu pire*, pas meilleure.

Décision assumée par l'auteur : la traduction automatique sera imparfaite, un bandeau le dira, et
un drapeau EN permettra de revenir à la référence à tout moment. Ce TODO ne rediscute pas ce
point — il traite de *comment* le faire sans casser le SEO ni le build.

## Le piège n°1 — à régler avant d'écrire une seule ligne de traducteur

Docusaurus, pour les plugins de contenu, **retombe sur le fichier source quand la traduction est
absente**. Activer la locale `fr` sans rien d'autre ne produit pas « 20 articles en français » :
ça produit **257 URLs `/fr/blog/<slug>/` dont 237 servent du texte anglais**, avec `<html lang="fr">`,
une entrée dans le sitemap, et un `hreflang` qui les déclare comme version française.

C'est exactement du contenu dupliqué, pointé vers le seul bénéfice recherché (l'indexation FR).
Sans garde-fou, ce chantier **dégrade** le SEO au lieu de l'améliorer.

Le garde-fou est le **lot A**, et il est bloquant pour tous les autres :

- une page `/fr/…` sans traduction réelle reçoit `<meta name="robots" content="noindex, follow">` ;
- son `rel="canonical"` pointe vers la version anglaise ;
- elle est retirée du `sitemap.xml` (`ignorePatterns` ne suffit pas — il faut filtrer sur la
  présence réelle d'une traduction, donc un `postBuild`) ;
- aucun `hreflang` n'est émis pour elle.

La source de vérité de « traduite ou pas » est le manifeste du lot B, pas une heuristique.

**À vérifier en premier (lot A, étape 0)** : ce comportement de fallback est documenté pour les
plugins de contenu, mais il n'a pas été testé *sur ce dépôt*. Activer `locales: ["en", "fr"]` avec
un seul article traduit, builder, et compter les fichiers sous `build/fr/blog/`. Si le fallback ne
se produit pas (ou se produit autrement), tout le lot A se simplifie — mais ne pas le supposer.

## Architecture retenue : i18n natif Docusaurus

Les traductions vivent dans `i18n/fr/docusaurus-plugin-content-blog/YYYY/MM/DD/<slug>/index.md`,
en miroir de `blog/`. URLs en `/fr/blog/<slug>/`.

**Pourquoi ce choix plutôt qu'un plugin maison** (`index.fr.md` co-localisé + `addRoute`) : l'i18n
natif donne gratuitement le `<html lang="fr">`, les balises `hreflang` réciproques, le sitemap
localisé, le sélecteur de locale, et surtout le pipeline MDX complet — les composants
`<Terminal>`, `<Snippet>`, `<AlertBox>` continuent de fonctionner dans le fichier traduit. Un
plugin maison obligerait à ré-implémenter tout ça. Le prix à payer est le lot G.

**Ce que ça coûte, et qu'il faut accepter les yeux ouverts :**

- `docusaurus build` **boucle sur les locales** : chaque locale est un build complet. Le build
  actuel (257 articles, 15 plugins maison, Pagefind, PWA, ideal-image) passe donc à peu près en
  ×2. Mesure du build mono-locale à reporter ici avant/après (voir « Critères d'acceptation »).
- Les 15 plugins maison tournent deux fois. `markdown-export-plugin` et `questions-index-plugin`
  écrivent aujourd'hui des chemins non préfixés par la locale — à auditer (lot G).
- **`require.context` de `src/components/Blog/utils/posts.ts` lit `blog/`, pas `i18n/`.** Tous les
  composants maison (`PostCard`, `LatestPosts`, `RelatedPosts`, `SeriesCards`, `CommandPalette`,
  `blog-graph-plugin`) afficheront donc des **titres et descriptions anglais** sur les pages FR.
  C'est le lot G, et c'est la plus grosse charge de travail du chantier — pas la traduction.

Alternative écartée : traduire dans `.unpublished/` ou en co-localisé sous `blog/` — casse le
`require.context` et le `frontmatter-loader` (chaque article compterait double dans toutes les
listes, les compteurs et le graphe).

## Le contrat de traduction

Ce qui est traduit :

- le corps de l'article (prose, titres de section, texte des listes, légendes) ;
- `title` et `description` du frontmatter, **uniquement** ;
- les valeurs de props lisibles par un humain : `title=`, `text=`, `caption=`, `label=`.

Ce qui ne doit **jamais** être touché, sous aucun prétexte :

- le contenu des blocs de code délimités (676 ouvertures de blocs dans le corpus) et du code
  inline ;
- `slug`, `date`, `authors`, `tags`, `mainTag`, `image`, `series`, `seriesOrder`, `ai_assisted`,
  `updates`, `review_date`, `draft` — copiés octet pour octet. **`slug` traduit = URL cassée et
  `hreflang` qui ne se rejoignent plus** ;
- les noms de composants MDX et les **noms** de props ;
- les valeurs de props qui sont des chemins ou des cibles : `source=`, `href=`, `to=`, `icon=`,
  `image=`, `id=` ;
- les fichiers de `files/` référencés par `<Snippet source="./files/x.txt">` — ce sont du code et
  des sorties de terminal réelles, ils restent anglais et **ne sont pas dupliqués** ;
- les URLs, chemins, noms de fichiers, noms de commandes, options de CLI ;
- le marqueur `<!-- truncate -->`, à la même position relative.

Terminologie : la liste des termes que la communauté dev francophone **laisse en anglais** doit
être fournie au modèle dans le prompt système, sinon il produira « conteneur », « demande de
tirage », « validation » (pour *commit*). Constituer un glossaire dans
`scripts/lib/translate-contract.mjs` : commit, build, container, pull request, merge, push, pull,
stream, cache, shell, script, hook, devcontainer, workspace, prompt, token, wrapper, output,
input, path, fork, tag, branch, release, issue, package, runtime, backend, frontend, etc. Le
plugin `remark-replace-terms` existant est le bon endroit où regarder pour la liste des termes
déjà normalisés côté anglais.

## Le validateur structurel — la pièce qui rend le système fiable

Faire confiance au prompt seul ne suffit pas : une seule traduction qui déplace un `<!-- truncate -->`
ou francise un `slug` casse le build ou l'URL. `scripts/lib/translate-validate.mjs` compare la
source et la traduction **avant écriture** et rejette (puis relance une fois, puis abandonne en
signalant l'article) si :

- la séquence des blocs de code délimités diffère — même nombre, même langue déclarée, même
  contenu **octet pour octet** ;
- la séquence des noms de balises de composants MDX diffère (même ordre, même arité) ;
- l'ensemble des URLs et des valeurs `source=`/`href=`/`to=` diffère ;
- une clé de frontmatter autre que `title`/`description` a changé ;
- `<!-- truncate -->` est absent alors qu'il est présent dans la source ;
- le nombre de titres (`#`, `##`, `###`) diffère.

Cette validation est plus utile que n'importe quel raffinement du prompt : elle transforme un
risque diffus en échec bruyant et localisé. Approche alternative, plus robuste mais nettement plus
lourde : extraire les nœuds de texte via le mdast (`plugins/markdown-export-plugin/degrade.cjs`
fait déjà tourner `@mdx-js/mdx` `createProcessor` sur ce corpus), ne traduire que ces nœuds, puis
les réinjecter. À garder en réserve si le validateur rejette trop souvent.

## Le problème des ancres et des liens internes

Traduire les titres de section change leur slug d'ancre. Conséquences à traiter (lot F) :

- la table des matières de la page FR est régénérée correctement — pas de problème ;
- en revanche tout lien `<Link to="/blog/x/#mon-titre">` venant d'un **autre** article pointe sur
  l'ancre anglaise. Deux options : conserver les ancres anglaises via `{#slug-anglais}` en fin de
  titre traduit (Docusaurus le supporte, et `yarn write-heading-ids` existe déjà dans
  `package.json`) — **c'est l'option recommandée**, elle rend le problème inexistant ;
- les liens internes *à l'intérieur* d'un article FR doivent pointer vers la version FR **si elle
  existe**, sinon vers l'anglais. Le manifeste du lot B est la source de vérité ; un remark plugin
  de réécriture à l'emport est plus sûr qu'une réécriture textuelle par le modèle.

Ce point interagit directement avec la règle `feedback_internal_linking` (2 à 4 `<Link>` inline
par article) : un article traduit hérite de ces liens, ils doivent tous résoudre.

## Découpage

- **Lot A — garde-fou SEO (bloquant).** Vérifier empiriquement le fallback. Écrire le `postBuild`
  qui pose `noindex` + `canonical` + retire du sitemap toute page `/fr/` sans traduction réelle.
  Ne rien merger avant que ce lot soit vert.
- **Lot B — le traducteur.** `scripts/translate-post.mjs` (un article), `--all` pour le corpus,
  `scripts/lib/translate-contract.mjs` (prompt système + glossaire),
  `scripts/lib/translate-validate.mjs` (validateur). Écrit un sidecar de fraîcheur
  `i18n/fr/…/index.md.translation.json` portant le `hashSource()` de la **source anglaise** —
  réutiliser `scripts/lib/eli5-hash.mjs`, dont le commentaire d'en-tête prévoit déjà ce partage.
  Le manifeste `src/data/translations.generated.js` (liste des slugs traduits + fraîcheur) suit le
  patron de `scripts/generate-post-colors.mjs`. Scripts `yarn translate`, `translate:bulk`,
  `translate:check` dans `package.json`.
- **Lot C — fraîcheur et hook pre-commit.** `scripts/check-translation-freshness.mjs`, **copie
  quasi conforme** de `scripts/check-eli5-freshness.mjs`. Hook `translation-freshness` dans
  `.config/.pre-commit-config.yaml`, aux côtés de `eli5-freshness` et `questions-freshness`, même
  forme : `language: system`, `pass_filenames: false`, `always_run: true`, `verbose: true`,
  **`--quiet` et report-only d'abord** (comme ses deux voisins) — on ne bloque pas un commit sur
  une traduction manquante tant que la couverture n'est pas stabilisée. Ignore `.unpublished/`.
- **Lot D — configuration i18n.** `locales: ["en", "fr"]` + `localeConfigs` dans
  `docusaurus.config.js`. `yarn write-translations --locale fr` puis traduction de
  `i18n/fr/code.json` et des `*.json` de plugins — sinon le *chrome* du site (navbar, pagination,
  « Read more », étiquettes de tags) reste anglais sur les pages FR, ce qui est plus visible
  qu'une phrase maladroite dans le corps du texte.
- **Lot E — bandeau et bascule.** `src/components/Blog/TranslationNotice/` : un `AlertBox`
  variante `warning`, **rendu par `src/theme/BlogPostItem/index.js` quand la locale est `fr`**, et
  jamais écrit dans le fichier traduit — sinon il dérive et le traducteur peut le mutiler.
  `src/components/Blog/TranslationSwitch/` : drapeau FR sur la page EN quand une traduction
  existe, drapeau EN sur la page FR (toujours). Emplacement à arbitrer avec
  `src/components/Blog/ArticleActions/`, qui occupe déjà cette zone.
- **Lot F — SEO.** `hreflang` réciproques `en`/`fr` + `x-default` vers l'anglais, `canonical`
  correct des deux côtés, `og:locale` / `og:locale:alternate`, sitemap localisé, ancres stables
  (`{#slug-anglais}`), réécriture des liens internes.
- **Lot G — composants maison conscients de la locale.** Le gros morceau. Auditer les **67
  occurrences de `/blog` en dur réparties sur 24 fichiers** de `src/` et `plugins/` : `<Link>` et
  `useBaseUrl` préfixent la locale tout seuls, mais les comparaisons de chaînes sur
  `location.pathname` (`src/theme/NotFound/index.js`,
  `src/components/CommandPalette/index.tsx`, `Hint.tsx`,
  `src/components/Blog/Series/SeriesArticlesPage.tsx`,
  `src/components/Blog/Tags/TagArticlesPage.tsx`) ne le font pas. Puis rendre le corpus de
  `src/components/Blog/utils/posts.ts` conscient de la locale, ou au minimum faire en sorte que
  les cartes affichent le titre traduit quand il existe. Vérifier aussi que Pagefind
  (`docusaurus-plugin-pagefind`, configuré `{}`) ne mélange pas les deux langues dans un index
  unique.
- **Lot H — déploiement progressif.** Voir ci-dessous.

## Ne pas traduire les 257 articles d'emblée

Malgré un coût financier négligeable, traduire tout le corpus au premier jet est le mauvais
mouvement : ça crée 257 miroirs à maintenir avant d'avoir la moindre preuve que quelqu'un les
lit, et ça noie les défauts de traduction dans un volume impossible à relire.

Séquence recommandée :

1. **5 articles** choisis à la main, relus ligne à ligne. C'est la seule façon de calibrer le
   prompt et le glossaire.
2. **Top 20 par trafic réel** (Matomo `matomo.avonture.be`, pas la langue du navigateur). Mesurer
   pendant 60 jours : est-ce que les pages `/fr/` reçoivent du trafic organique ?
3. **Tout nouvel article** traduit à la publication — c'est là que la fraîcheur est gratuite,
   puisque la source ne bougera plus juste après.
4. Le reste du corpus **seulement si** l'étape 2 montre du trafic.

Ce séquencement transforme un engagement permanent sur 257 fichiers en une expérience
réversible : si l'étape 2 est plate, on supprime `i18n/fr/` et on retire la locale.

## Coût — mesuré, pas estimé au doigt mouillé

Corpus : 257 articles, 290 533 mots, 2 087 125 octets (≈ 550 k tokens d'entrée, ≈ 640 k tokens de
sortie, plus ≈ 1 200 tokens de prompt système par appel).

| Modèle | Corpus complet | Par nouvel article |
| --- | --- | --- |
| `claude-opus-5` ($5 / $25 par Mtok) | ≈ 20 $ | ≈ 0,08 $ |
| `claude-sonnet-5` ($2 / $10 par Mtok) | ≈ 8 $ | ≈ 0,03 $ |
| via l'API Batches (−50 %, asynchrone) | ≈ 10 $ / ≈ 4 $ | — |

Recommandation : **`claude-opus-5` pour la traduction initiale** (c'est le poste où la qualité se
joue, et 20 $ une fois n'est pas un arbitrage), API Batches pour le traitement en masse du lot H
puisque rien n'est interactif. Le prompt système et le glossaire sont identiques à chaque appel :
les placer derrière un `cache_control: { type: "ephemeral" }` en tête de requête, ce qui divise
par dix le coût de leur relecture. Vérifier `usage.cache_read_input_tokens` non nul sur le
deuxième appel, sinon un invalidateur silencieux traîne dans le prompt.

## Qualité attendue — et ses modes de défaillance

Sur de la prose technique EN→FR avec un modèle de cette génération, le résultat sera **fidèle sur
le fond** et **reconnaissable comme une traduction sur la forme**. Les défauts ne seront pas
grammaticaux, ils seront de trois ordres :

- **Sur-traduction du jargon** — « conteneur », « demande de tirage », « validation » pour
  *commit*. C'est ce qui fait qu'un dev francophone referme la page. Mitigé par le glossaire.
- **Dérive de registre** — la voix du blog (« Let's dive in », « I hope you enjoyed », les
  apartés) se traduit littéralement et sonne guindé. Mitigé par des consignes de ton explicites
  dans le prompt système, pas par le glossaire.
- **Dommage structurel** — c'est le seul risque qui casse quelque chose, et c'est le validateur
  qui le traite, pas le prompt.

Le bandeau du lot E rend ce niveau de qualité acceptable : le lecteur sait qu'il lit une
traduction machine et a un drapeau EN sous la main.

## Risques

- **Dérive permanente.** Chaque édition d'un article anglais désynchronise son miroir. Le hook du
  lot C le *signale* ; il ne le répare pas. Avec 20 articles c'est tenable, avec 257 c'est un
  second corpus à entretenir. C'est l'argument de fond du rejet d'août, et il reste valable — le
  lot H est la seule réponse.
- **Temps de build ×2.** Impacte le CI et `run_ci`. À mesurer avant de merger le lot D.
- **Contenu dupliqué** si le lot A est bâclé — le seul risque qui puisse rendre la situation pire
  qu'aujourd'hui.
- **Lot G sous-estimé.** Un `/fr/` qui affiche des cartes d'articles en anglais partout donne une
  impression de site cassé, pire qu'une absence de traduction.

## Critères d'acceptation

- `yarn lint && yarn format:check && yarn build` vert, et **temps de build mono-locale et
  bi-locale reportés dans ce fichier**.
- Une page `/fr/blog/<slug>/` sans traduction réelle : absente du `sitemap.xml`, `noindex`,
  `canonical` vers l'anglais. Vérifié dans `build/`, pas supposé.
- Une page traduite : `<html lang="fr">`, `hreflang` réciproques, bandeau visible, drapeau EN
  fonctionnel, aucun bloc de code altéré, `slug` identique à l'anglais.
- `yarn translate:check` liste correctement les articles dont la source a bougé depuis la
  traduction.
- `CLAUDE.md` mis à jour : arborescence `i18n/`, nouvelles commandes `yarn translate*`, nouveau
  hook pre-commit.
- Mémoire `feedback_i18n_translation_rejected` **mise à jour ou supprimée** — elle dit aujourd'hui
  « ne pas reproposer », ce qui contredirait le dépôt.
