# 0119 — Traduction française automatique des articles (locale `/fr/`)

- **Priority**: Medium — chantier multi-sessions ; lots A→I, aucun n'a de sens seul
- **Batch**: i18n-fr
- **Depends**: —
- **Files**: `docusaurus.config.js`, `scripts/translate-post.mjs` (à créer), `scripts/lib/translate-contract.mjs` (à créer), `scripts/lib/translate-validate.mjs` (à créer), `scripts/lib/translate-hash.mjs` (à créer), `scripts/check-translation-freshness.mjs` (à créer), `scripts/lib/eli5-hash.mjs`, `.config/.pre-commit-config.yaml`, `.devcontainer/scripts/interactive.sh`, `i18n/fr/` (à créer), `blog/tags.yml`, `src/data/series.js`, `src/components/Blog/utils/slug.ts`, `plugins/lib/blog-taxonomy.cjs`, `src/components/Blog/TranslationNotice/` (à créer), `src/components/Blog/TranslationSwitch/` (à créer), `src/theme/BlogPostItem/index.js`, `src/theme/BlogListPage/index.js`, `src/components/Blog/utils/posts.ts`, `plugins/frontmatter-loader/index.cjs`, `plugins/markdown-export-plugin/index.cjs`, `plugins/questions-index-plugin/index.cjs`, `src/pages/`, `CLAUDE.md`

## État d'avancement — lire ceci en premier

**Ce TODO se traite par morceaux, sur plusieurs sessions.** Les cases à cocher sont dans
« Ordre d'exécution ». Une case cochée = *livré et vérifié*.

| Lot | État | Crédits API ? |
| --- | --- | --- |
| C.0 — débloquer le build bi-locale | ✅ **terminé** | non |
| A — garde-fou SEO | ✅ **terminé** | non |
| B — chrome français | ⚠️ **ROUVERT** — ~55 chaînes restantes sur ~40 composants | non |
| C — composants locale-aware | ✅ **terminé** (8/8) | non |
| F — bandeau, drapeau, index filtré | ⚠️ **ROUVERT** — la sidebar d'article n'est pas filtrée | non |
| G — SEO | ✅ **terminé** (7/7) | non |
| E — fraîcheur et hook | 3/4 — reste la retraduction par diff | oui, pour tester |
| H — pages statiques | ✅ **terminé** (8/8) | non |
| D — le traducteur | 6/11 — **prototype fonctionnel** | oui, pour le `--all` |
| I — déploiement progressif | à faire | oui |

**Prochaine action** : plus rien ne se fait sans crédits API. Restent la retraduction par diff
(lot E, écrite mais non testable), la traduction en masse (lot D) et le déploiement progressif
(lot I). Côté auteur : relire les 4 traductions et vérifier l'anomalie Singapour dans Matomo.

**Les six surfaces par lesquelles un lecteur francophone pouvait tomber sur de l'anglais sont
fermées** : listes et cartes, flux RSS, `llms.txt` et miroirs `.md`, graphe du blog, command
palette, recherche Pagefind. C'était l'exigence non négociable de l'auteur.

**⚠️ Correction du 2026-09-16, signalée par l'auteur sur capture d'écran.** J'avais déclaré les
lots B et F terminés sur la foi d'un **inventaire que j'avais moi-même dressé**. Il était
incomplet. Relevé systématique refait : **~55 chaînes non traduites sur ~40 composants**, plus la
sidebar d'article qui liste les 257 posts en locale `fr`.

C'est la troisième fois de la session que l'énumération échoue là où le balayage systématique
réussit. La méthode correcte, à appliquer avant toute nouvelle déclaration de « terminé » :

```bash
# composants portant du texte visible sans <Translate>
for f in $(find src/components src/theme -name "index.tsx" -o -name "index.js"); do
  grep -q "@docusaurus/Translate" "$f" || grep -cE '>[A-Z][a-z][^<>{}]{3,}<' "$f"
done
```

**Ne pas clore ce TODO ni le déplacer dans `DONE/` avant que ce relevé retourne zéro.**

**Acquis au 2026-09-16, build bi-locale strict vert** (`exit 0`, zéro lien ou ancre cassé,
`onBrokenLinks`/`onBrokenAnchors` sur `throw`, `yarn lint` et `prettier --check` verts) :
256 articles non traduits en `noindex` + `canonical`, absents du sitemap FR ; 4 traductions
indexables.

**Déjà acquis et réutilisable** :

- `scripts/translate-post.mjs` + `lib/translate-{contract,validate,hash,anchors}.mjs` — le
  traducteur, son glossaire, ses 10 familles de contrôles, son hash de fraîcheur et l'épinglage
  déterministe des ancres anglaises ;
- `plugins/remark-i18n-assets/` — les assets co-localisés d'un article traduit ;
- `plugins/translations-manifest-plugin/` — **la source de vérité** « cet article est-il
  traduit ? », exposée en `setGlobalData()`, à consommer par tout le lot F ;
- `plugins/i18n-seo-guard/` — le garde-fou `noindex` + `canonical` ;
- 4 articles traduits sous `i18n/fr/`.

**État sale** : aucun. Les deux garde-fous qui avaient été affaiblis pour une préview sont
revenus à `"throw"` et le build passe avec.

## Contexte — cette idée avait été rejetée le 2026-08-31

Une première évaluation (mémoire `feedback_i18n_translation_rejected`) avait écarté l'i18n
français : « les navigateurs traduisent déjà gratuitement, la double maintenance sur 247 articles
ne se justifie pas ». Ce TODO **rouvre** la décision sur trois éléments nouveaux, et en assume un
quatrième qui va dans l'autre sens :

- **Nouveau — données de trafic.** withcabin.com, 30 derniers jours : 452 visiteurs uniques en
  langue navigateur `fr` (2ᵉ langue), et 671 depuis la France + 247 depuis la Belgique en pays
  d'origine (3ᵉ et 10ᵉ). La langue du navigateur sous-estime le lectorat francophone (un
  francophone laisse souvent l'anglais en langue première) ; le pays est le meilleur proxy.
  Deux corrections avant de conclure : la Belgique n'est francophone qu'à ~40 %, et les **1 090
  uniques depuis Singapour** (2ᵉ pays, devant l'Allemagne, pour un blog perso) sont très
  probablement du trafic de datacenter — à confirmer dans Matomo et à exclure du dénominateur si
  c'est le cas. Après correction : **15 à 20 % du lectorat**. À vérifier avant d'engager le lot I.
- **Nouveau — le moteur de traduction est déjà dans le dépôt.** L'évaluation d'août supposait
  Ollama (qualité médiocre en EN→FR technique). Or `scripts/generate-eli5.mjs` et
  `scripts/generate-questions.mjs` appellent déjà l'API Claude via `@anthropic-ai/sdk` et
  `ANTHROPIC_API_KEY`.
- **Nouveau — le coût mesuré est dérisoire.** ≈ 20 $ pour tout le corpus, < 0,10 $ par nouvel
  article (voir « Coût »). L'argument financier ne tient pas.
- **Contre — le corpus a grossi.** 257 articles aujourd'hui (250 `.md` + 7 `.mdx`, 290 533 mots,
  2,09 Mo) contre 247 en août. La double maintenance est *un peu pire*, pas meilleure.

Décision assumée par l'auteur : la traduction sera imparfaite, un bandeau le dira, un drapeau EN
ramènera à la référence. Ce TODO ne rediscute pas ce point.

## Le piège n°1 — vérifié dans le code source, pas supposé

Docusaurus **retombe sur le fichier source quand la traduction manque**. Ce n'est pas une
supposition : `@docusaurus/utils/lib/dataFileUtils.js:62` construit la liste
`[contentPathLocalized, contentPath]` et `blogUtils.js:137` la parcourt via
`getFolderContainingFile()` — le premier dossier qui contient le fichier gagne, donc `blog/` en
repli. Même mécanique pour `tags.yml` et `authors.yml`.

**Mesuré le 2026-09-16** : locale `fr` activée avec **2 articles traduits sur 257**, build
complet → `build/fr/blog/` contient **261 répertoires d'articles, exactement autant que
`build/blog/`**. 259 pages anglaises servies sous `/fr/`, avec `<html lang="fr">`, une entrée au
sitemap et un `hreflang` qui les déclare comme version française.

C'est du contenu dupliqué pointé droit sur le seul bénéfice recherché. **Sans garde-fou, ce
chantier dégrade le SEO au lieu de l'améliorer.** D'où le lot A, bloquant :

- page `/fr/…` sans traduction réelle → `<meta name="robots" content="noindex, follow">` ;
- `rel="canonical"` vers la version anglaise ;
- retirée du `sitemap.xml` — `ignorePatterns` ne suffit pas, il faut filtrer sur la présence
  réelle d'une traduction, donc un `postBuild` ;
- aucun `hreflang` émis pour elle.

La source de vérité « traduite ou pas » est le manifeste du lot D, pas une heuristique.

## Architecture retenue : i18n natif Docusaurus

Traductions dans `i18n/fr/docusaurus-plugin-content-blog/YYYY/MM/DD/<slug>/index.md`, en miroir de
`blog/`. URLs en **`/fr/blog/<slug>/`** — le préfixe de locale est à la racine du site, pas après
`/blog`.

**Pourquoi plutôt qu'un plugin maison** (`index.fr.md` co-localisé + `addRoute`) : l'i18n natif
donne le `<html lang="fr">`, les `hreflang` réciproques, le sitemap localisé, le sélecteur de
locale, et surtout le pipeline MDX complet — `<Terminal>`, `<Snippet>`, `<AlertBox>` continuent de
fonctionner dans le fichier traduit. Un plugin maison obligerait à tout ré-implémenter.

Alternative écartée : traduire sous `blog/` ou `.unpublished/` — casse le `require.context` et le
`frontmatter-loader` (chaque article compterait double dans toutes les listes et le graphe).

## Le piège n°2 — les assets co-localisés cassent le build (vérifié)

**Constaté le 2026-09-16 par un build réel**, pas déduit. Un article traduit déposé dans
`i18n/fr/docusaurus-plugin-content-blog/.../index.md` fait échouer le build :

```text
Cause: <Snippet source="./files/Dockerfile"> in i18n/fr/.../atuin-bash-history/index.md
could not read i18n/fr/.../atuin-bash-history/files/Dockerfile: ENOENT
```

`plugins/remark-snippet-loader/index.cjs:37-41` (`resolveSourcePath`) résout un `./`-préfixé
contre `path.dirname(blogPostPath)` — donc contre le répertoire du **fichier traduit**, où il n'y
a rien.

Ampleur : **201 articles ont un `files/`, 186 ont un `images/`, 84 Mo au total.** Dupliquer ça
dans `i18n/fr/` est exclu — ce sont du code et des captures, ils n'ont aucune raison d'exister en
double, et ça doublerait le poids du dépôt.

**Le problème a deux têtes, pas une** — deux résolveurs différents, donc deux correctifs :

| Ce qui casse | Résolu par | Correctif | Statut |
| --- | --- | --- | --- |
| `<Snippet source="./files/…">` | `plugins/remark-snippet-loader` (maison) | patch de `resolveSourcePath` | **validé par build** |
| `![](./images/x.webp)` | Docusaurus (`remark-images`, interne) | remark plugin maison *ou* réécriture par le traducteur | symlink validé, patch non testé |

**Pour `<Snippet>` — correction retenue, déjà validée.** Patcher `resolveSourcePath` (~10 lignes) :
si le chemin résolu n'existe pas et que le fichier courant est sous
`i18n/<locale>/docusaurus-plugin-content-blog/<rel>`, retomber sur `blog/<rel>`. Un seul endroit,
aucun fichier dupliqué. **Attention** : `resolveSourcePath` est exporté et réutilisé par
`plugins/markdown-export-plugin/degrade.cjs` — le patch bénéficie aux deux, mais l'export
`snippetLoader.resolveSourcePath = resolveSourcePath` (ligne 196) doit rester intact.

**RÉSOLU le 2026-09-16 — `plugins/remark-i18n-assets/` couvre les deux d'un coup.** Écrit,
enregistré **en premier** dans `beforeDefaultRemarkPlugins`, validé par un build complet : il
réécrit tout chemin `./`-relatif d'un article traduit (images Markdown, liens, props `source=` et
`src=`) vers le dossier de l'article anglais. `remarkSnippetLoader` et le pipeline d'images de
Docusaurus voient donc tous deux un chemin déjà corrigé — **aucun patch des plugins existants,
aucun octet dupliqué, aucun symlink**. Les articles anglais sortent immédiatement de la fonction.
Vérifié : `<Snippet source="./files/…">` rendu, et `![](./images/code_folding.gif)` servi en
`/assets/images/code_folding-4b29c50a….gif` (5 Mo réellement écrits par webpack).

Le patch de `resolveSourcePath` décrit ci-dessous **n'est donc plus nécessaire** — gardé comme
trace du raisonnement. Historique de l'analyse : Le message d'erreur est
`Markdown image with URL './images/x.webp' … couldn't be resolved to an existing local image
file` : c'est le pipeline interne de Docusaurus, pas un plugin maison, donc le patch ci-dessus ne
l'atteint pas. Trois voies, par ordre de préférence :

1. **Un remark plugin maison** qui réécrit `./images/` vers le chemin de l'article anglais,
   enregistré avant le traitement d'images de Docusaurus. Même logique que le patch `<Snippet>`,
   un seul endroit, zéro duplication. **À privilégier, à prototyper en premier.**
2. **Le traducteur réécrit les URLs d'images** en générant le fichier FR (il connaît le chemin
   miroir). Aucune plomberie, mais met un chemin relatif à rallonge dans le fichier traduit.
3. **Liens symboliques** — *testé, fonctionne*, mais 387 liens à maintenir, à **7 niveaux** de
   `..` depuis `i18n/fr/docusaurus-plugin-content-blog/YYYY/MM/DD/<slug>/` (pas 6 — erreur faite
   au premier essai, et un lien mal calibré ne se voit qu'au build). À éviter.

Ce piège est bloquant pour le **lot C**, avant le premier article traduit.

## Ce que `/fr/blog/` affichera — et ce qu'on veut qu'il affiche

Par défaut, **la liste `/fr/blog/` contient les 257 articles**, dont 237 avec un titre anglais.
Ce n'est pas ce qu'on veut.

L'index souhaité — « les articles disponibles en français » — n'est **pas** livré par l'i18n, et
ce n'est pas un swizzle isolé : **toute surface qui liste des articles doit appliquer le même
filtre** en locale `fr`, sinon un lecteur francophone tombe sur un titre anglais par une porte
dérobée. Exigence non négociable (confirmée par l'auteur le 2026-09-16).

Le filtre est une fonction unique — `isTranslated(slug, locale)` lisant le manifeste du lot D —
appliquée partout. Surfaces recensées :

- `src/theme/BlogListPage/index.js` — la liste principale et sa pagination ;
- `src/theme/BlogArchivePage/index.js` — l'archive par année ;
- `src/theme/BlogTagsListPage/index.js` et `src/components/Blog/Tags/TagArticlesPage.tsx` — les
  51 pages de tags ; un tag dont aucun article n'est traduit ne doit pas exister en FR ;
- `src/components/Blog/Series/SeriesArticlesPage.tsx`, `SeriesPosts`, `SeriesCards`,
  `SeriesStats` — les 26 séries ; une série partiellement traduite doit afficher un compte juste,
  pas « 8 articles » quand 2 sont lisibles ;
- `src/components/Blog/LatestPosts`, `RelatedPosts`, `PostCard`, `HeroSection`, `PostCount` ;
- `plugins/blog-feed-plugin/` (`index.js` + `topic-feeds.cjs`) — le `/blog/rss.xml` maison **et**
  les flux par thème, plus les `atom`/`json` du preset (`docusaurus.config.js:132`) ;
- `plugins/command-palette-plugin/`, `plugins/questions-index-plugin/`,
  `plugins/blog-graph-plugin/` ;
- `plugins/markdown-export-plugin/` — `llms.txt` et les bundles `llms/<série>.txt` ne doivent pas
  annoncer en FR des articles qui n'existent qu'en anglais.

Les URLs d'articles `/fr/blog/<slug>/` continueront d'exister pour les 257 — c'est le lot A qui
les rend invisibles aux moteurs, pas ce filtre-ci. Les deux sont nécessaires : le filtre protège
le lecteur, le garde-fou protège l'indexation.

## Le chrome doit précéder la première traduction publiée

Un article français dans une navbar anglaise, avec des tags anglais, des cartes d'articles
connexes anglaises et une pagination anglaise, ce n'est pas « à moitié traduit » : c'est cassé, et
c'est pire que pas de traduction du tout. **Les lots B et C se livrent donc avant le lot D**, pas
après. C'est ce qui fixe l'ordre d'exécution ci-dessous.

### Ce qui est déjà prêt, et ce qui ne l'est pas

- **82 composants** (`index.*` sous `src/components` et `src/theme`), dont **24 importent déjà
  `@docusaurus/Translate`** — `AlertBox`, `PostCard`, `LatestPosts`, `SeriesCards`, `SeriesPosts`,
  `HeroSection`, `OldPostNotice`, `Updated`, `MainTags`, `NotFound`, `BlogArchivePage`… Le
  terrain est à moitié préparé. **58 restants**, mais beaucoup sont de pure mise en page
  (`Columns`, `Card`, `Trees`) et n'ont aucun texte propre — chiffre réel à établir par une passe.
- **67 occurrences de `/blog` en dur sur 24 fichiers.** `<Link>` et `useBaseUrl` préfixent la
  locale tout seuls ; les comparaisons et manipulations de chaînes non —
  `src/theme/NotFound/index.js`, `src/components/CommandPalette/index.tsx` et `Hint.tsx`,
  `src/components/Blog/Series/SeriesArticlesPage.tsx`,
  `src/components/Blog/Tags/TagArticlesPage.tsx`.
- **Un cas constaté, pas prédit** : le build FR échoue sur des liens cassés vers
  `/fr/blog/tags/<slug>/` alors que les 51 routes existent, identiques dans les deux locales. La
  cause est `src/theme/BlogTagsListPage/index.js:17` :
  `return permalink.replace("/blog/tags/tags/", "/blog/tags/");` — une chirurgie de chaîne sur un
  permalink. En locale `fr` le permalink arrive déjà préfixé, la substitution produit un chemin
  absolu que le vérificateur de liens ne rattache à aucune route. **C'est le motif à chercher
  partout** : toute manipulation textuelle d'un permalink ou d'un pathname est suspecte, alors
  qu'un `<Link to="/blog/…">` ne l'est pas.
- **Le vrai morceau architectural** : le `require.context` de
  `src/components/Blog/utils/posts.ts:99-103` lit `blog/`, pas `i18n/`. Sans intervention, tous
  les composants maison affichent des **titres et descriptions anglais** sur les pages FR.

## Tags et séries — deux mécaniques opposées

**Tags (49 dans `blog/tags.yml`)** — supporté nativement. Déposer un
`i18n/fr/docusaurus-plugin-content-blog/tags.yml` : mêmes clés, **`permalink` identique**, seuls
`label` et `description` traduits. Traduire un `permalink` casserait la résolution des
`tags: [docker]` du frontmatter.

**Séries (26 dans `src/data/series.js`)** — le piège. Ce fichier n'est **pas** un plugin de
contenu Docusaurus, c'est de la donnée applicative : l'i18n ne le voit pas. Et surtout,
`src/components/Blog/utils/slug.ts:15-25` dérive le slug de série **du nom anglais**
(`createSlug(series)`), nom que le frontmatter des articles référence aussi. Le `name` est donc
une **clé fonctionnelle, pas un libellé** : le traduire casse `/series/<slug>` *et* le lien
frontmatter.

Solution : ajouter un champ `labels: { fr: "…" }` aux 26 entrées, garder `name` comme clé
anglaise, afficher `labels[locale] ?? name`. Le slug reste dérivé de `name`. Attention :
`plugins/lib/blog-taxonomy.cjs:45` **duplique** `createSlug` avec un commentaire « keep both in
sync » — toute modification touche deux fichiers. Même raisonnement pour `mainTag`.

## Le glossaire — deux couches, la seconde étant celle qui garantit

Le prompt seul donne ~90 % de réussite. Il faut les deux :

1. **Glossaire dans le prompt système** (`scripts/lib/translate-contract.mjs`) : ~60 termes que la
   communauté dev francophone laisse en anglais. Les noms propres (Docker, Git, Ollama) ne posent
   pas de problème — ce sont les **noms communs** qui dérivent : commit, container, build,
   repository, branch, merge, pull request, issue, tag, release, stream, cache, shell, script,
   hook, wrapper, path, package, runtime, backend, frontend, framework, plugin, template, token,
   prompt, workspace, thread, timeout, log, devcontainer, workflow, pipeline.
   **Préciser le genre et l'article** dans le glossaire (`container → le container (m.)`,
   `pull request → la pull request (f.)`) : sans ça le modèle alterne « le container » et « la
   container » d'un paragraphe à l'autre.
2. **Vérificateur déterministe après traduction** : liste noire des équivalents français
   interdits (« conteneur », « dépôt » pour *repository*, « validation » pour *commit*,
   « étiquette » pour *tag*, « demande de tirage »…). S'ils apparaissent dans un nœud de texte,
   la traduction est rejetée. `plugins/remark-replace-terms/index.cjs` a déjà exactement le bon
   patron : il saute les parents `link`, `image`, `inlineCode` et `code` — à reprendre tel quel,
   sinon on refuse une traduction à cause d'un mot présent dans un bloc de code.

## Le contrat de traduction

Traduit : le corps de l'article (prose, titres, listes, légendes) ; `title` et `description` du
frontmatter, **uniquement** ; les valeurs de props lisibles par un humain (`title=`, `text=`,
`caption=`, `label=`).

Jamais touché, sous aucun prétexte :

- le contenu des blocs de code délimités (676 ouvertures dans le corpus) et du code inline ;
- `slug`, `date`, `authors`, `tags`, `mainTag`, `image`, `series`, `seriesOrder`, `ai_assisted`,
  `updates`, `review_date`, `draft` — copiés octet pour octet. **`slug` traduit = URL cassée et
  `hreflang` qui ne se rejoignent plus ; `series` traduit = série orpheline** ;
- les noms de composants MDX et les **noms** de props ;
- les valeurs de props qui sont des cibles : `source=`, `href=`, `to=`, `icon=`, `image=`, `id=` ;
- les fichiers de `files/` référencés par `<Snippet source="./files/x.txt">` — code et sorties de
  terminal réels, ils restent anglais (voir « Le piège n°2 » pour la plomberie) ;
- URLs, chemins, noms de fichiers, noms de commandes, options de CLI ;
- le marqueur `<!-- truncate -->`, à la même position relative.

## Le validateur structurel

`scripts/lib/translate-validate.mjs` compare source et traduction **avant écriture** et rejette
(puis relance une fois, puis signale l'article) si :

- la séquence des blocs de code délimités diffère — même nombre, même langue déclarée, même
  contenu **octet pour octet** ;
- la séquence des noms de balises de composants MDX diffère (même ordre, même arité) ;
- l'ensemble des URLs et des valeurs `source=`/`href=`/`to=` diffère ;
- une clé de frontmatter autre que `title`/`description` a changé ;
- `<!-- truncate -->` est absent alors qu'il est dans la source ;
- le nombre de titres (`#`, `##`, `###`) diffère ;
- un terme de la liste noire du glossaire apparaît dans un nœud de texte.

Plus utile que n'importe quel raffinement du prompt : ça transforme un risque diffus en échec
bruyant et localisé. Approche de secours si le validateur rejette trop : extraire les nœuds de
texte via le mdast (`plugins/markdown-export-plugin/degrade.cjs` fait déjà tourner
`@mdx-js/mdx` `createProcessor` sur ce corpus), ne traduire que ces nœuds, les réinjecter.

## Fraîcheur : hash, pas date — et trois niveaux, pas un booléen

**Jamais de mtime.** Un `git checkout`, un passage de Prettier ou un `chmod` change la date sans
toucher au contenu. Le dépôt a déjà la bonne mécanique : `scripts/lib/eli5-hash.mjs` (dont le
commentaire d'en-tête prévoit explicitement ce partage) et les deux
`check-{eli5,questions}-freshness.mjs`.

Mais un hash du fichier entier **sur-déclenche** : corriger `review_date`, ajouter un tag ou
changer une ligne dans un Dockerfile affiché marquerait la traduction périmée alors que rien de
traduisible n'a bougé. D'où `scripts/lib/translate-hash.mjs` : **hacher le contenu traduisible
seulement** — frontmatter réduit à `title` + `description`, blocs de code retirés, valeurs de
props non traduites retirées, espaces normalisés. Ça élimine l'essentiel des faux positifs.

Puis trois niveaux au lieu d'un booléen :

- **identique** — rien ;
- **mineur** (< 15 % des blocs traduisibles modifiés) — listé, *pas* proposé à la retraduction ;
- **périmé** (≥ 15 %) — proposé.

`yarn translate:check` affiche « 3 blocs modifiés sur 48 » et laisse décider. Le seuil est un
réglage, à ajuster après les 20 premiers articles.

## Retraduction : le diff, pas le tout

Quand un article traduit change, envoyer au modèle (a) la source EN actuelle, (b) la traduction FR
actuelle, (c) le diff unifié EN(ancien) → EN(nouveau), et lui demander de renvoyer **uniquement
les blocs français modifiés**, référencés par une ancre. Puis les réinsérer et faire tourner le
validateur normalement.

Trois raisons, dont la principale n'est pas le coût :

- **ça préserve les relectures.** Si une phrase maladroite a été corrigée à la main dans la
  version française, une retraduction complète l'écrase. Une mise à jour par diff la garde. C'est
  le vrai argument ;
- la cohérence terminologique de l'article est préservée ;
- c'est moins cher (marginal à ce niveau de prix).

Pour calculer le diff il faut l'ancienne source EN. Ne pas dépendre de git (une modification non
commitée n'y est pas) : le sidecar `index.md.translation.json` **stocke le texte source anglais**
au moment de la traduction. 2 Mo pour tout le corpus — négligeable et autonome.

Repli : si le diff dépasse ~40 % des blocs, retraduction complète, c'est plus propre.

## Prévisualiser une traduction en local

Contrainte à connaître : **le serveur de dev Docusaurus ne sert qu'une seule locale à la fois.**
`yarn start --locale fr` sert le site en français sur `/fr/…`, et le drapeau EN pointera alors
vers une route que le serveur de dev n'a pas construite — **le drapeau n'est pas cliquable en
`yarn start`**, c'est normal.

`CLAUDE.md` interdit de lancer `yarn start` à la main (le serveur est démarré par
`docker-entrypoint.sh` avec `HTTPS`/`SSL_CRT_FILE`/`SSL_KEY_FILE`/`--host 0.0.0.0`). Il faut donc
ajouter à `.devcontainer/scripts/interactive.sh` une fonction **`start_fr`**, calquée sur `start`,
qui restaure exactement la même invocation en ajoutant `--locale fr`. `start` redevient l'anglais.

Boucle de travail :

1. `yarn translate blog/2026/09/14/atuin-bash-history/index.md` → écrit `i18n/fr/…/index.md` et
   son sidecar ;
2. `bash -c 'source .devcontainer/scripts/interactive.sh; start_fr'` ;
3. relire sur `https://localhost:3000/fr/blog/atuin-bash-history/` ;
4. `start` pour revenir à l'anglais.

**Meilleure boucle pour une vraie relecture** : `yarn build && yarn serve`. Le build de production
contient les deux locales, donc le drapeau fonctionne et le rendu est fidèle. 140 s contre un
redémarrage — pour valider une traduction, ça vaut le coup.

## Les autres pages

11 pages sous `src/pages/`, dont 3 réservées à l'auteur et déjà en `noindex` (`admin.js`,
`typo-dashboard.js`, `reactions-dashboard.js`) — **à ne pas traduire**. Restent 8 pages,
≈ 3 000 mots au total, en deux mécaniques différentes :

- **6 `.mdx`** — `about.mdx` (830 mots), `project_setup.mdx` (752), `index.mdx` (143),
  `series.mdx` (87), `map.mdx` (70), `repositories.mdx` (44). Elles se copient dans
  `i18n/fr/docusaurus-plugin-content-pages/`, même mécanique que le blog.
- **2 `.js`/`.tsx`** — `faq.js` (336 mots), `follow.tsx` (749). Leurs textes sont dans du JSX :
  `<Translate>` + `i18n/fr/code.json`, pas une copie de fichier.

Coût de traduction : quelques centimes. C'est un lot séparé (H), pas une difficulté.

## Résultats du premier essai réel (2026-09-16)

4 articles traduits avec `claude-opus-5`, choisis pour stresser chacun un mode de défaillance
annoncé plutôt que pour leur audience (la sélection par trafic, c'est le lot I) :
`vscode-markdown-code-folding` (182 mots, registre), `atuin-bash-history` (jargon shell),
`docusaurus-snippets` (8 blocs de code, 69 balises MDX), `docker-postgrest` (73 composants).

**Structure : 4/4 intacts.** Vérifié indépendamment du script — blocs de code identiques à
l'octet près, séquences de composants identiques, URLs et props cibles identiques, `slug` et
`series` préservés, même nombre de titres. **Le seul mode de défaillance capable de casser un
build ou de changer une URL en silence est maîtrisé.** Première passe : 4/4 validés sans relance.

**Qualité : meilleure que la prédiction de ce TODO.** La section « Qualité attendue » annonçait
« reconnaissable comme une traduction sur la forme ». Sur `docusaurus-snippets`, la sortie est
proche du natif et la voix de l'auteur passe (« Ça fonctionne mais ... on peut faire mieux. »,
« Peut-on faire quelque chose, pas forcément mieux, mais plus esthétique ? »). Le pronostic était
trop pessimiste — mais il reste un pronostic sur 4 articles, pas sur 257.

**Trois défauts trouvés, tous imputables au contrat, pas au modèle — tous corrigés :**

1. **Trou de glossaire → incohérence intra-article.** « folding » et « pliage » à dix lignes
   d'écart dans le même article. Aucun des deux mots n'est faux isolément ; employer les deux
   l'est. Une liste noire ne peut structurellement pas attraper ça, d'où `CONSISTENCY_PAIRS`
   (9 paires) et 8 termes ajoutés au glossaire.
2. **`language: en` conservé** dans un fichier français — le modèle obéissait correctement à la
   règle « tout sauf `title`/`description` est copié à l'octet près ». La règle était fausse :
   `language` est désormais le seul champ **réécrit**, avec son contrôle dédié.
3. **Titre traduit sur un lien vers un article non traduit** — le lecteur cliquait et tombait sur
   une page anglaise portant un autre titre. Règle ajoutée : le texte d'un `<Link to="/blog/…">`
   qui nomme un autre article reste en anglais.

Après correction, les 4 repassaient verts — **mais ce « vert » était trompeur**. L'auteur a
repéré à l'écran, en lisant `/blog/atuin-bash-history/`, que ses 18 titres étaient restés en
anglais. Le validateur ne pouvait pas le voir : il comptait les titres sans vérifier qu'ils
avaient été traduits. Voir « Une relance peut dégrader la traduction sans que le validateur le
voie » ci-dessous.

**Ce que ça dit de la méthode** : sur 4 articles, le contrôle automatique a laissé passer un
défaut que la lecture humaine a trouvé en trente secondes. Les deux sont nécessaires — le
validateur pour ce qui casse le build, l'œil pour ce qui casse la lecture. Un déploiement qui
s'appuierait sur le seul validateur publierait des articles en anglais sous une URL française.

**Deux trous d'outillage découverts par le premier fichier produit :**

- `.prettierignore` — `i18n/` manquait à côté de `blog/` et `.unpublished/`. Sans lui,
  `yarn format:check` (la quality gate avant commit) casse dès la première traduction, et
  `yarn format` irait réécrire la prose française. **Corrigé.**
- `.gitignore` — `.translation-rejected/` ajouté : les traductions rejetées y sont déposées pour
  inspection et ne doivent pas être versionnées. **Corrigé.**

**Ce qui reste non testé** : le rendu en navigateur. Ces 4 fichiers sont inertes tant que la
locale n'est pas activée dans `docusaurus.config.js`, et les activer demande le lot C (assets) et
le lot A (garde-fou). Ce qui a été prouvé ici, c'est la **qualité de traduction**, pas la chaîne
de publication.

## Pièges découverts en activant la locale (2026-09-16, seconde session de tests)

Tous constatés par build réel, aucun déduit.

### Le cache webpack masque les traductions

`rm -rf .docusaurus build` **ne suffit pas** : le cache persistant de `node_modules/.cache`
resservait les compilations MDX anglaises, et la page rendue affichait l'anglais alors que la
traduction était bien en place. Symptôme trompeur — on croit que l'i18n ne fonctionne pas.
**Toujours `yarn clear`** (qui purge les trois) avant de conclure quoi que ce soit sur un build
i18n.

### `questions-index-plugin` casse en build bi-locale

`plugins/questions-index-plugin/index.cjs:214` écrit dans
`path.join(generatedFilesDir, GENERATED_DIR_NAME, "static")` — un chemin généré **fixe**. Les deux
passes de locale s'y marchent dessus et la seconde lit un JSON vide. L'erreur remonte très loin
de sa cause :

```text
Cannot parse JSON: Unexpected end of JSON input while parsing empty string
```

**Trois autres plugins maison écrivent probablement de la même façon** et n'ont pas encore été mis
à l'épreuve : `markdown-export-plugin` (`llms.txt`, bundles de séries), `blog-graph-plugin`,
`command-palette-plugin`. **Les auditer tous**, pas seulement celui qui a crié. Lot C.

Contournement pour une préview : `yarn docusaurus build --locale fr` (mono-locale, pas de
collision). Ce n'est pas un correctif.

### Les garde-fous qualité ont dû être affaiblis — À REMETTRE

| Réglage | Valeur d'origine | Valeur actuelle | Raison |
| --- | --- | --- | --- |
| `onBrokenLinks` | `throw` | `warn` | ~2 500 liens de tags signalés cassés en locale `fr` |
| `onBrokenAnchors` | `throw` | `warn` | titres traduits → ancres changées |

Les deux portent un commentaire en majuscules dans `docusaurus.config.js`. **Ils ne doivent pas
survivre au lot C.** Un build qui passe avec ces deux réglages sur `warn` ne prouve rien.

Sur les ~2 500 liens de tags : cause **non élucidée**. Le vérificateur compare des hrefs portant
le préfixe `/fr/` à un espace de routes qui ne l'a pas. Ce n'est **pas** le `.replace()` de
`BlogTagsListPage/index.js` ni de `TagsListInline/index.js` — les deux ont été rendus agnostiques
de la locale (ancrage sur `/tags/tags/` au lieu de `/blog/tags/tags/`), sans effet sur le nombre
de liens cassés. Les pages sont correctement écrites sur le disque ; seul le contrôle échoue.

### Une relance peut dégrader la traduction sans que le validateur le voie

Le défaut le plus instructif de la session. `atuin-bash-history` a été rejeté en tentative 1, puis
validé en tentative 2 — mais **ses 18 titres sont revenus en anglais**. Deux causes cumulées :

1. la note de relance de `translate-post.mjs` disait « Everything listed must be copied byte for
   byte from the source » — beaucoup trop large. La seconde tentative devient ultra-conservatrice
   et cesse de traduire ;
2. la règle 9 du contrat (« Keep the exact same number of headings… ») se lisait comme « garder
   les titres » plutôt que « traduire leur texte ».

**Les trois correctifs sont appliqués** : note de relance recadrée sur les seuls problèmes
signalés et avertissant explicitement contre la sur-prudence ; règle 9 réécrite (« TRANSLATE the
TEXT of every heading »), avec l'exception des noms de produits et identifiants de code ; et un
**contrôle n°9 dans le validateur** qui rejette quand plus de 60 % des titres sont identiques à
la source. Seuil calibré sur le corpus réel : il attrape `atuin` (14/14) et laisse passer
`docker-postgrest` (8/22, tous légitimes — « Conclusion », « OpenAPI » et six noms de tables).

Leçon générale : **un contrôle de forme (le nombre de titres) ne dit rien du fond (ont-ils été
traduits).** Chercher les autres endroits où le validateur compte sans vérifier.

### Titres anglais dans les composants maison — confirmé en vrai

Le `require.context` de `posts.ts` lisant `blog/`, les cartes d'articles connexes, `LatestPosts`
et la command palette affichent des titres anglais sur une page française. Prédit par ce TODO,
désormais visible à l'écran. Lot C.

### Le composant Bluesky pointe vers la page anglaise

`src/components/Bluesky/` construit son lien vers l'URL anglaise de l'article, donc le fil de
commentaires d'une page française renvoie au thread anglais. Conséquence réelle faible (peu de
commentaires), mais ça mélange les deux langues. À trancher : un seul thread partagé (choix
actuel, défendable — la conversation reste unique) ou un thread par locale. Signalé par l'auteur
le 2026-09-16, priorité basse.

## Les quatre pannes silencieuses — et ce qu'elles changent aux critères d'acceptation

Toutes survenues le 2026-09-16, **toutes avec `exit=0`**, aucune n'ayant produit le moindre
message d'erreur :

| Panne | Cause | Ce qui l'a révélée |
| --- | --- | --- |
| Pages françaises rendant l'anglais | cache webpack périmé | ouverture du HTML produit |
| Flux RSS français **vide** | `path.join(outDir, permalink)` doublait `/fr/` | comptage des `<item>` |
| **Zéro** miroir `.md` français | comparaison à `routesPaths` sans `baseUrl` | comptage des fichiers |
| Filtrage total silencieux | champ `slug` inexistant sur ces objets | instrumentation |

Plus deux défauts de contenu, également invisibles au build : les miroirs et `llms.txt` servaient
du **texte anglais sous URL française**, et le sitemap FR annonçait **140 pages de tags** que son
équivalent anglais excluait.

**Conséquence sur ce TODO** : un critère d'acceptation ne doit plus dire « le build passe ». Il
doit **nommer un fichier et un nombre**. Aucune des six n'aurait été attrapée autrement.

Valeurs de référence au 2026-09-16, avec 4 articles traduits sur 257 :

| Artefact | FR | EN |
| --- | --- | --- |
| `sitemap.xml` (total `<loc>`) | 102 | 355 |
| dont pages de tags | **0** | 0 |
| dont articles | 6 (4 traduits + archive + authors) | — |
| `blog/rss.xml` (`<item>`) | 4 | 20 |
| miroirs `*.md` | 4 | 257 |
| répertoires d'articles | 261 | 261 |

Les 261 pages FR sont normales : le fallback i18n crée une route pour chaque article, et c'est le
lot A qui les rend invisibles aux moteurs. **Ne pas confondre « la route existe » et « la page est
indexable ».**

Erreurs de méthode à ne pas refaire, encodées dans `.claude/rules/build-verification.md` :
`rm -rf .docusaurus build` **ne suffit pas** (il reste `node_modules/.cache`, trois faux
diagnostics à cause de ça) ; **jamais deux builds concurrents** (un `yarn clear` efface le cache
que l'autre écrit) ; **instrumenter avant de formuler une hypothèse** (quatre hypothèses fausses
sur un bug que trois valeurs imprimées ont donné immédiatement).

## Ordre d'exécution

**Ce TODO se fait par morceaux, sur plusieurs sessions.** Cocher au fur et à mesure. Une case
cochée veut dire *livré et vérifié*, pas *commencé*. Si un lot est partiellement fait, cocher ses
sous-tâches une par une et laisser le lot décoché.

Ordre réel recommandé, qui diffère de l'ordre alphabétique des lots : **C.0 → A → B → C → F → G →
E → H → D(bulk) → I**. La raison est que tant qu'un build bi-locale échoue, on ne peut même pas
*vérifier* le garde-fou du lot A.

### Lot C.0 — débloquer le build bi-locale (préalable à tout)

- [x] Confirmer si l'échec de `questions-index-plugin` en bi-locale est une vraie collision ou un
      artefact du cache webpack — **c'était le cache**. Build bi-locale propre : exit 0, 261 pages
      de chaque côté. Aucun correctif nécessaire de ce côté
- [x] ~~Scoper les chemins générés par la locale~~ — **sans objet**, la collision n'existait pas.
      Noté pour mémoire : `process.env.DOCUSAURUS_CURRENT_LOCALE` est disponible dans
      `docusaurus.config.js` (posé avant `loadSite()`) si le besoin réapparaît
- [ ] Auditer les 3 autres plugins qui écrivent dans des chemins générés :
      `markdown-export-plugin`, `blog-graph-plugin`, `command-palette-plugin`
- [x] Élucider les ~2 500 liens de tags signalés cassés en locale `fr` — **cause trouvée** :
      `docusaurus-plugin-tag-route`, `docusaurus-plugin-series-route` et `questions-index-plugin`
      enregistraient leurs routes avec un chemin absolu en dur (`/blog/tags/${slug}`), invisible
      depuis une locale préfixée. Corrigés via `normalizeUrl([context.baseUrl, …])`. C'est un vrai
      bug du dépôt, pas seulement un obstacle i18n : ces routes casseraient aussi à tout
      changement de `baseUrl`
- [x] Ancres : `scripts/lib/translate-anchors.mjs` épingle l'ancre **anglaise** sur chaque titre
      traduit (`{#english-slug}`), de façon déterministe via `github-slugger`. Le corpus anglais
      n'est pas touché — `write-heading-ids` sur 257 articles n'est pas nécessaire
- [x] **Remettre `onBrokenLinks: "throw"`** dans `docusaurus.config.js`
- [x] **Remettre `onBrokenAnchors: "throw"`** dans `docusaurus.config.js`

### Lot A — garde-fou SEO (bloquant pour toute publication)

- [x] `postBuild` : `<meta name="robots" content="noindex, follow">` sur toute page `/fr/` sans
      traduction réelle
- [x] `rel="canonical"` de ces pages vers la version anglaise
- [x] Les retirer du `sitemap.xml` — via le hook `createSitemapItems` du plugin sitemap, **pas**
      par un élagage en `postBuild` : le `postBuild` du plugin sitemap s'exécute après celui des
      autres plugins et écrase toute réécriture
- [x] Ne pas émettre de `hreflang` pour elles
- [x] Vérifier dans `build/`, pas supposer

### Lot B — chrome français

- [x] `locales: ["en", "fr"]` dans `docusaurus.config.js`
- [x] `localeConfigs` (htmlLang, label, direction)
- [x] `yarn write-translations --locale fr`
- [x] Traduire `i18n/fr/code.json` **(pas de crédit API nécessaire — rédigeable directement)**
- [ ] Traduire les `*.json` des plugins
- [ ] `i18n/fr/docusaurus-plugin-content-blog/tags.yml` — 49 tags, `label` et `description`
      traduits, **`permalink` intact**

### Lot C — plomberie, composants et données locale-aware

- [x] **Assets co-localisés** — `plugins/remark-i18n-assets/` écrit, enregistré en premier dans
      `beforeDefaultRemarkPlugins`, validé par build (`<Snippet>` et `![](./images/)` rendus)
- [x] `BlogTagsListPage/index.js` et `TagsListInline/index.js` — `.replace()` rendu agnostique de
      la locale (n'a pas résolu les liens cassés, mais reste plus correct)
- [x] Audit terminé — **19 défauts trouvés sur 11 fichiers**, tous du même motif. Le critère qui
      les attrape : *toute chaîne comparée à un chemin fourni par Docusaurus* (pas « un `/blog`
      en dur » — plusieurs vivaient dans des patterns et des comparaisons). Corrigés :
      `tag-route`, `series-route`, `questions-index` (routes sans `baseUrl`), `blog-feed`
      (préfixe doublé → flux vide), `markdown-export` (préfixe manquant → zéro miroir, + corpus
      anglais, + 4 URLs absolues), `blog-graph` (surface de listing non recensée),
      `sitemap.ignorePatterns` (140 pages de tags FR indexées), `matchPath` × 2, `<Link>` × 2,
      le pied de page et la navbar (HTML brut de la config, écrasé par `footer.json`/`navbar.json`),
      la config `pages` absente (donc sans `remark-i18n-assets`), et
      `StructuredData/index.tsx` — le fil d'Ariane JSON-LD d'une page FR déclarait des URLs
      **anglaises**, en contradiction avec le `canonical` et les `hreflang` de la même page.
      Deux derniers trouvés par **relecture seule**, pas par build : `CommandPalette/Hint.tsx`
      (`HOME_PATH = /^\/$/` → la pastille ⌘K n'apparaissait jamais sur `/fr/`) et
      `CommandPalette/index.tsx` (`normalizePath` comparait `/fr/blog/x/` à `/blog/x` → la liste
      « récemment consultés » restait vide en français). Ces deux-là ne produisent pas une
      erreur mais une **absence** — aucun build, aucun comptage d'artefact ne peut les voir.
      Encodé en règle : `.claude/rules/i18n-locale-safety.md`
- [ ] Les 58 composants sans `<Translate>` (24/82 en sont déjà pourvus ; beaucoup des 58 n'ont
      aucun texte propre — établir le chiffre réel par une passe)
- [ ] `labels: { fr: … }` sur les 26 entrées de `src/data/series.js`, `name` restant la clé
      anglaise dont dérive le slug
- [ ] **Le point dur** : rendre le corpus de `src/components/Blog/utils/posts.ts` conscient de la
      locale (son `require.context` lit `blog/`, pas `i18n/`)
- [ ] Vérifier que Pagefind ne mélange pas les deux langues dans un index unique

### Lot F — bandeau, drapeau, index filtré

- [x] `src/components/Blog/TranslationNotice/` — **trois** états, pas deux (ajout demandé par
      l'auteur le 2026-09-16) : sur un article **anglais** dont la traduction existe, une ligne
      légère « 🇫🇷 Cet article existe aussi en français — lire la version française ».
      Écrite **en français sur la page anglaise** délibérément : elle s'adresse au lecteur qui
      peut s'en servir, et une phrase se lit là où un drapeau doit être décodé. Volontairement
      **pas** passée par `<Translate>` — ce n'est pas une chaîne d'interface dans la langue de la
      page. Rien ne s'affiche si la traduction n'existe pas. Vérifié sur artefact — `AlertBox variant="warning"` rendu par
      `BlogPostItem` quand la locale est `fr`, **jamais écrit dans le fichier traduit**
- [x] ~~`TranslationSwitch/` (badge drapeau)~~ — **écrit puis supprimé le 2026-09-16 sur retour
      de l'auteur.** La phrase de `TranslationNotice` dit la même chose en mots ; un badge qui la
      double est du bruit là où le lecteur essaie de commencer l'article. Le changement de langue
      pour l'ensemble du site passe par le `localeDropdown` de la navbar.
- [x] **Le filtre `isTranslated()` sur les ~12 surfaces de listing** — exigence non négociable,
      le plus gros poste du lot (liste, pagination, archive, 51 pages de tags, 26 séries et leurs
      compteurs, `LatestPosts`, `RelatedPosts`, flux RSS/atom/json et par thème, command palette,
      `llms.txt`)
- [x] `start_fr` dans `.devcontainer/scripts/interactive.sh`

### Lot G — SEO

- [x] `hreflang` réciproques — **émis nativement par Docusaurus**, rien à écrire. En revanche
      `i18n-seo-guard` retire désormais l'alternate `hreflang=fr` des pages **anglaises** dont
      l'article n'est pas traduit : il pointait vers une page `noindex`, signal contradictoire.
      256 retirés, mesuré
- [x] `canonical` — natif et correct (auto-référent de chaque côté), vérifié sur artefact
- [x] `og:locale` / `og:locale:alternate` — natifs et corrects, vérifiés sur artefact
- [x] Sitemap localisé — via `createSitemapItems` **et** `ignorePatterns` locale-préfixées
      (140 pages de tags FR étaient indexées alors que zéro l'était côté anglais)
- [x] **Ancres — résolu autrement** : `scripts/lib/translate-anchors.mjs` épingle l'ancre
      anglaise (`{#english-slug}`) sur chaque titre traduit, via `github-slugger`. Tous les liens
      entrants fonctionnent, **et le corpus anglais n'est pas touché** — `write-heading-ids` sur
      257 articles devient inutile
- [x] Liens internes — **aucun travail nécessaire**, vérifié sur artefact : `<Link to="/blog/x">`
      dans un article FR devient `/fr/blog/x/` tout seul, et le lecteur y trouve le bandeau
      « pas encore traduit » si besoin. Ce TODO surspécifiait le travail
- [x] **Composant Bluesky — tranché, aucun changement de code.** Deux mécanismes distincts :
      le **lien de partage** (`share.tsx`) construit `siteConfig.url + metadata.permalink`, et
      `permalink` porte déjà le préfixe de locale — partager depuis `/fr/` partage bien l'URL
      française, c'est correct. Le **fil de commentaires** (`comments.tsx`) lit le
      `blueskyRecordKey` du frontmatter, recopié à l'identique par le contrat de traduction :
      les deux langues partagent donc **un seul fil**.
      C'est le bon choix et il est assumé : une conversation par *article*, pas par *langue*.
      Un fil par locale fragmenterait des discussions déjà rares et ferait que deux lecteurs
      d'un même texte ne se verraient pas. L'auteur a lui-même qualifié le point de mineur.

### Lot E — fraîcheur et hook pre-commit

- [x] `scripts/check-translation-freshness.mjs` — calqué sur `check-eli5-freshness.mjs`
- [x] Hook `translation-freshness` — report-only, `--quiet`, vérifié : silencieux et `Passed`.
      Scripts `yarn translate` et `yarn translate:check` ajoutés
- [x] Les trois niveaux — **vérifiés en conditions réelles** : `review_date` modifié → aucune
      dérive ; une phrase ajoutée → *minor 2 %* ; la moitié réécrite → **STALE 45 %**
- [ ] Retraduction par diff (envoie source EN + traduction FR + diff EN(ancien→nouveau))

### Lot H — pages statiques

- [x] 5 `.mdx` sur 6 traduits dans `i18n/fr/docusaurus-plugin-content-pages/` — `about`,
      `index`, `series`, `map`, `repositories`, **et `project_setup.mdx`** — 6/6.
      Blocs de code vérifiés identiques à l'octet près, images résolues (même hash que
      l'anglais, donc aucune duplication). Les libellés de boutons (« Generate install
      script », « Copy ») restent en anglais : ce sont ceux affichés par le composant, les
      traduire enverrait le lecteur chercher un bouton inexistant.
      **Piège rencontré** : `import styles from "./about.module.css"` ne résout plus depuis
      `i18n/` — il faut `@site/src/pages/about.module.css`. Troisième variante du piège des
      chemins relatifs, après `files/` et `images/`.
      **Choix éditorial** : la citation de Boileau retrouve son vers français original au lieu
      d'une retraduction de l'anglais.
- [x] `faq.js` — balisé et traduit. **Trois chaînes invisibles à la relecture du rendu** ont
      failli passer : le `<title>`, l'`og:title` et un `aria-label` sur `<nav>`. Trouvées en
      **comptant les occurrences dans le HTML produit**, pas en relisant le diff. Vérifié :
      zéro anglais côté FR, zéro français côté EN
- [x] `follow.tsx` — 14 clés. Les paragraphes à liens en ligne passent par
      `<Translate values={{ feedly: <a …/> }}>` : le texte reste **une seule chaîne
      traduisible** et les ancres sont injectées. Découper en fragments aurait rendu la phrase
      intraduisible, l'ordre des mots changeant d'une langue à l'autre
- [ ] **Ne pas traduire** `admin.js`, `typo-dashboard.js`, `reactions-dashboard.js` (réservées à
      l'auteur, déjà en `noindex`)

### Lot D — le traducteur

- [x] `scripts/lib/translate-contract.mjs` — 47 termes de glossaire avec genre, 14
      sur-traductions bannies, 9 paires de cohérence
- [x] `scripts/lib/translate-validate.mjs` — 10 familles de contrôles
- [x] `scripts/lib/translate-hash.mjs` — hash du traduisible + `driftRatio()`
- [x] `scripts/translate-post.mjs` — Opus 5, prompt en cache, relance unique, sidecar
- [x] `.prettierignore` (`i18n/`) et `.gitignore` (`.translation-rejected/`)
- [x] 4 articles traduits et vérifiés (`vscode-markdown-code-folding`, `atuin-bash-history`,
      `docusaurus-snippets`, `docker-postgrest`)
- [ ] **Retraduire `atuin-bash-history`** — ses 18 titres sont restés en anglais (bug corrigé
      depuis, mais le fichier produit est à refaire) — *demande des crédits API*
- [ ] Mode `--all`
- [ ] Manifeste `src/data/translations.generated.js` (patron `scripts/generate-post-colors.mjs`)
- [ ] Scripts `yarn translate` / `translate:bulk` / `translate:check` dans `package.json`
- [ ] Passage à l'API Batches pour le volume

### Lot I — déploiement progressif

- [ ] Vérifier l'anomalie Singapour dans Matomo (1 090 uniques, 2ᵉ pays — datacenter ou lecteurs ?)
- [ ] 5 articles relus ligne à ligne — *crédits API*
- [ ] Top 20 par trafic Matomo réel — *crédits API*
- [ ] Mesurer 60 jours : les pages `/fr/` reçoivent-elles du trafic organique ?
- [ ] Tout nouvel article traduit à la publication — *crédits API*
- [ ] Le reste du corpus **seulement si** la mesure est positive — *crédits API*

### Ce qui consomme des crédits API, et ce qui n'en consomme pas

**Aucun crédit** : lots C.0, A, B, C, F, G, E, H, et toute la plomberie du lot D. C'est du code.
Les chaînes d'interface, les 49 libellés de tags et les 8 pages statiques se rédigent directement,
sans appel au modèle.

**Crédits nécessaires** : uniquement la traduction d'articles — la retraduction d'`atuin`, le
`--all` du lot D, et tout le lot I.


## Ne pas traduire les 257 articles d'emblée

Malgré un coût financier négligeable, tout traduire au premier jet crée 257 miroirs à maintenir
avant d'avoir la moindre preuve que quelqu'un les lit, et noie les défauts dans un volume
impossible à relire.

1. **5 articles** choisis à la main, relus ligne à ligne — seule façon de calibrer prompt et
   glossaire.
2. **Top 20 par trafic réel** (Matomo `matomo.avonture.be`, pas la langue du navigateur). Mesurer
   60 jours : les pages `/fr/` reçoivent-elles du trafic organique ?
3. **Tout nouvel article** traduit à la publication — la fraîcheur y est gratuite, la source ne
   bougera plus juste après.
4. Le reste **seulement si** l'étape 2 montre du trafic.

Ce séquencement rend l'expérience réversible : si l'étape 2 est plate, on supprime `i18n/fr/` et
on retire la locale.

## Coût

Corpus : 257 articles, 290 533 mots, 2 087 125 octets (≈ 550 k tokens d'entrée, ≈ 640 k de sortie,
plus ≈ 1 200 tokens de prompt système par appel).

**Mesuré le 2026-09-16 sur 4 articles réels** (`claude-opus-5`, thinking adaptatif, prompt système
en cache) : **0,64 $ pour 4 articles, soit 0,16 $ par article, soit ≈ 41 $ extrapolés au corpus**.

L'estimation initiale de ce TODO disait ≈ 20 $ / 0,08 $ — **fausse d'un facteur deux**. Cause : les
tokens de raisonnement sont facturés comme des tokens de sortie, et le modèle de coût ne comptait
que le texte traduit. À retenir pour toute estimation future impliquant le thinking.

| Modèle | Corpus complet | Par nouvel article |
| --- | --- | --- |
| `claude-opus-5` ($5 / $25 par Mtok) | **≈ 41 $ (mesuré)** | **≈ 0,16 $ (mesuré)** |
| `claude-sonnet-5` ($2 / $10 par Mtok) | ≈ 16 $ (extrapolé) | ≈ 0,06 $ |
| via l'API Batches (−50 %, asynchrone) | ≈ 20 $ / ≈ 8 $ | — |

Recommandation : **`claude-opus-5`** pour la traduction initiale (c'est là que la qualité se joue,
20 $ une fois n'est pas un arbitrage), API Batches pour le lot I puisque rien n'est interactif. Le
prompt système et le glossaire sont identiques à chaque appel : les placer derrière un
`cache_control: { type: "ephemeral" }` en tête de requête. Vérifier
`usage.cache_read_input_tokens` non nul au deuxième appel, sinon un invalidateur silencieux traîne
dans le prompt.

## Qualité attendue

Sur de la prose technique EN→FR avec un modèle de cette génération : **fidèle sur le fond**,
**reconnaissable comme une traduction sur la forme**. Les défauts ne seront pas grammaticaux :

- **sur-traduction du jargon** — c'est ce qui fait refermer la page à un dev francophone. Traité
  par les deux couches de glossaire ;
- **dérive de registre** — la voix du blog (« Let's dive in », les apartés) se traduit
  littéralement et sonne guindé. Traité par des consignes de ton explicites, pas par le glossaire ;
- **dommage structurel** — le seul qui casse quelque chose, traité par le validateur.

Le bandeau du lot F rend ce niveau acceptable : le lecteur sait qu'il lit une traduction machine
et a un drapeau EN sous la main.

## Risques

- **Dérive permanente.** Chaque édition d'un article anglais désynchronise son miroir. Le hook du
  lot E le *signale*, il ne le répare pas. Avec 20 articles c'est tenable, avec 257 c'est un
  second corpus à entretenir. C'est l'argument de fond du rejet d'août, et il reste valable — le
  lot I est la seule réponse.
- **Contenu dupliqué** si le lot A est bâclé — le seul risque qui rende la situation *pire*
  qu'aujourd'hui.
- **Lot C sous-estimé.** Un `/fr/` avec navbar, tags et cartes d'articles anglais donne une
  impression de site cassé.
- ~~Temps de build ×2~~ — **écarté après mesure** : 69 s à froid, 21 s à chaud sur ce dépôt
  (2026-09-16), donc ≈ 140 s à deux locales grâce à `@docusaurus/faster`. Sans effet réel sur le
  CI ni sur `run_ci`.

## Critères d'acceptation

- `yarn lint && yarn format:check && yarn build` vert, temps bi-locale reporté ici (référence
  mono-locale 2026-09-16 : 69 s à froid, 21 s à chaud).
- Une page `/fr/blog/<slug>/` sans traduction : absente du `sitemap.xml`, `noindex`, `canonical`
  vers l'anglais. Vérifié dans `build/`, pas supposé (référence : sans garde-fou, mesure du
  2026-09-16 = 261 répertoires FR pour 261 EN avec 2 traductions seulement).
- Un article traduit contenant **à la fois** un `<Snippet source="./files/…">` et un
  `![](./images/…)` compile sans erreur, et le build ne signale **aucun lien cassé** en locale
  `fr` — les deux échecs constatés le 2026-09-16.
- **Aucune surface de listing en locale `fr` n'expose un article non traduit** : liste
  principale, pagination, archive, 51 pages de tags, 26 séries (compteurs inclus), `LatestPosts`,
  `RelatedPosts`, flux RSS/atom/json et par thème, command palette, `llms.txt`. À vérifier une
  par une, pas seulement sur `/fr/blog/`.
- Une page traduite : `<html lang="fr">`, `hreflang` réciproques, bandeau visible, drapeau EN
  fonctionnel, navbar/tags/cartes en français, aucun bloc de code altéré, `slug` et `series`
  identiques à l'anglais.
- `/series/<slug>` et `/tags/<slug>` inchangés dans les deux locales.
- `yarn translate:check` distingue correctement identique / mineur / périmé.
- `CLAUDE.md` mis à jour : arborescence `i18n/`, commandes `yarn translate*`, fonction `start_fr`,
  nouveau hook pre-commit.
- Mémoire `feedback_i18n_translation_rejected` mise à jour — fait le 2026-09-16.
