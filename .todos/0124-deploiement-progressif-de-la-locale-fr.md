# 0124 — Déploiement progressif de la locale `/fr/` (suite de 0119)

- **Priority**: Low — la locale est en ligne ; ce qui reste est de la mesure et de la traduction au fil de l'eau
- **Batch**: i18n-fr
- **Depends**: 0119
- **Files**: `scripts/translate-post.mjs`, `.devcontainer/scripts/interactive.sh`, `static/.htaccess`, `.github/workflows/deploy.yml`, `src/theme/NavbarItem/LocaleDropdownNavbarItem/` (à swizzler)

## Pourquoi ce TODO existe

0119 a construit la locale française : chrome, plomberie, SEO, traducteur, fraîcheur, pages
statiques, déploiement. Ce chantier-là est **terminé et vérifié** (voir la clôture plus bas).

Ce qui reste n'est pas du développement mais l'**exploitation** : mesurer si `/fr/` attire des
lecteurs, décider jusqu'où traduire, et le faire au bon coût. C'est un suivi sur plusieurs mois.
Le garder dans 0119 aurait bloqué indéfiniment la clôture d'un chantier livré ; le perdre en
rangeant 0119 dans `DONE/` aurait été pire. Il est donc repris ici, tel que 0119 le listait
(lot I et dernière case du lot D).

## À faire

- [ ] **Anomalie Singapour dans Matomo** — 1 090 visiteurs uniques, 2ᵉ pays. Datacenter (bots,
      CDN, crawlers) ou vrais lecteurs ? À trancher avant d'interpréter le moindre chiffre `/fr/`.
- [ ] **Relire les 5 traductions ligne à ligne** — `vscode-markdown-code-folding`,
      `docker-postgrest`, `docusaurus-snippets`, `atuin-bash-history`, `docling`. Le validateur
      garantit la structure, pas la justesse du français.
- [ ] **Traduire le top 20 par trafic Matomo réel** — `translate` accepte une liste de chemins et
      affiche le coût estimé avant d'appeler l'API (≈ 0,26 $/article en traduction complète).
- [x] ~~**Mesurer 60 jours** : les pages `/fr/` reçoivent-elles du trafic organique ?~~ — abandonné
      le 2026-09-17 : la mesure ne devait arbitrer que la traduction du reste du corpus, or l'auteur
      la fait quoi qu'il arrive. Plus rien ne dépend de ce chiffre.
- [ ] **Traduire chaque nouvel article à sa publication** — c'est une habitude, pas une tâche :
      `translate blog/AAAA/MM/JJ/<slug>`, puis relancer le serveur de dev (un nouveau fichier de
      traduction n'est pas pris en compte à chaud).
- [ ] **Traduire le reste du corpus** — 252 articles, ≈ 66 $ en traduction complète au tarif
      Opus 5 mesuré. Décidé sans condition le 2026-09-17 (plus adossé à la mesure des 60 jours).
      C'est le prérequis de la redirection `/fr/` ci-dessous.
- [ ] **API Batches pour le volume** — 50 % de réduction, en asynchrone. Ne vaut la peine que pour
      l'étape précédente ; inutile pour un article à la fois.
- [ ] **Rediriger les navigateurs francophones vers `/fr/`** — décidé le 2026-09-17, à poser
      **une fois le corpus entièrement traduit**, jamais avant. Conditions, garde-fous et pièges
      dans la section dédiée ci-dessous.
- [ ] **Retirer l'échafaudage des pages de listing en surplus** — à faire **une fois le corpus
      entièrement traduit**, pas avant. Posé le 2026-09-17 pour corriger `/fr/blog`, qui affichait
      les 104 traductions sur une seule page sans pagination (les routes `/page/N/` sont
      paginées sur le corpus anglais, donc la tranche servie à la page N n'avait aucun rapport).
      `src/theme/BlogListPage/index.js` repagine désormais le corpus traduit sur ces mêmes routes ;
      les pages au-delà (10 à 22 aujourd'hui) affichent un état vide, sont marquées `noindex` par
      `plugins/i18n-seo-guard` et retirées du sitemap par `createSitemapItems`. Quand EN et FR
      auront le même nombre d'articles il n'y aura plus de surplus : les trois morceaux
      deviendront inertes et pourront disparaître, avec la constante `POSTS_PER_PAGE` qu'ils
      partagent dans `docusaurus.config.js`.

## Redirection automatique des navigateurs francophones vers `/fr/`

Décision du 2026-09-17 : **oui, on la pose — mais après la traduction complète du corpus.**

La question était : un visiteur dont le navigateur annonce `fr` (ou `fr-FR`, `fr-BE`…) devrait-il
recevoir directement `/fr/` ? Trois objections ont été soulevées puis écartées par l'auteur, qui
traduira l'intégralité du corpus quoi qu'il arrive : la couverture partielle (161/257 non traduits),
les listings `/fr/` qui masquent les articles non traduits, et la corruption de la mesure Matomo des
60 jours. Les deux premières disparaissent avec la couverture complète ; la troisième ne protégeait
qu'un arbitrage déjà tranché.

Une quatrième objection — « Google déconseille la redirection sur langue perçue » — a été retirée
comme trop faible : la crainte réelle est qu'un crawler ne voie plus toutes les versions, or
Googlebot crawle sans `Accept-Language` ou en `en`, et une règle qui ne se déclenche que sur `fr`
et ne touche jamais `/fr/` le laisse intact.

### Pourquoi l'ordre compte

La règle fait cinq lignes et se pose en une minute ; la fenêtre de nuisance, c'est exactement
l'écart entre sa mise en ligne et la fin des traductions. Pendant cet écart, chaque lecteur
francophone arrivant sur un article non traduit est poussé hors de l'URL canonique vers une page
que `plugins/i18n-seo-guard` a délibérément marquée `noindex` — pour lui servir la même prose
anglaise. D'où : traduire, **puis** poser la règle. C'est le seul point non négociable de cette
section.

### Les cinq garde-fous

1. **La règle sera recopiée dans `build/fr/.htaccess` — boucle infinie.** Le piège maison.
   `plugins/i18n-htaccess/index.cjs` le documente lui-même : Docusaurus copie `static/` dans chaque
   locale, donc `build/fr/.htaccess` est une copie octet pour octet, et Apache applique le
   `.htaccess` le plus proche. Sans garde, `/fr/blog/x` est redirigé vers `/fr/fr/blog/x`.
   Il faut un `RewriteCond %{REQUEST_URI} !^/fr/` — qui rend du même coup la copie française inerte
   — et une assertion dans le « Sanity-check the build » de `.github/workflows/deploy.yml`, à côté
   de celle qui vérifie déjà `ErrorDocument 404 /fr/404.html`.
2. **Ne rediriger que du HTML.** Une règle large attrape `llms.txt`, `llms/`, `robots.txt`,
   `sitemap.xml`, `questions-index.json`, `manifest.webmanifest`, `sw.js`, `/api/`, `/assets/`,
   `/pagefind/`, `/img/`, `/files/`, `/admin-data/`, les flux `/blog/rss.xml`, `/blog/atom.xml`,
   `/blog/feed.json`, et les miroirs `.md` de chaque article (`plugins/markdown-export-plugin`).
   Rediriger un flux casse les lecteurs abonnés ; rediriger `llms.txt` casse la découvrabilité
   agent construite en 0082. C'est la partie de la règle qui demande le plus de soin.
3. **302, jamais 301.** Un 301 est mis en cache par le navigateur quasi définitivement et ne se
   rétracte pas : impossible d'ajuster ou d'annuler six mois plus tard.
4. **Un cookie d'override, sinon le sélecteur de langue est cassé.** Sans lui, un lecteur qui passe
   en anglais via le `localeDropdown` est renvoyé sur `/fr/` à la navigation suivante, et le bouton
   retour le renvoie en avant. Le dropdown pose le cookie (swizzle de
   `NavbarItem/LocaleDropdownNavbarItem`, pas encore présent dans `src/theme/`), la `RewriteCond`
   s'efface en sa présence. **Piège** : ne pas poser ce cookie depuis `src/theme/Root.js` en
   enregistrant la locale rendue — la première visite sur `/` écrirait `en` et la redirection ne se
   déclencherait plus jamais. Le cookie doit enregistrer un **choix explicite**, pas un état.
5. **`Vary: Accept-Language`** sur la réponse de redirection, pour qu'aucun cache intermédiaire ne
   serve le 302 à tout le monde. Le HTML est déjà en `no-store`, mais la redirection est une
   réponse distincte.

### L'objection résiduelle, assumée

La langue du navigateur n'est pas une préférence de lecture pour du contenu technique : une partie
des développeurs francophones lisent Docker, WSL et Bash en anglais par choix (terminologie,
messages d'erreur, parité avec Stack Overflow). Et `/fr/` est une traduction automatique — ce que
`TranslationNotice` dit lui-même au lecteur. La redirection fait donc passer par défaut d'un
original écrit à la main à une traduction machine, sans demander.

Assumé, pour deux raisons : `TranslationNotice` affiche déjà l'avertissement et le lien vers
l'original en haut de chaque article `/fr/`, et le cookie du garde-fou 4 fait que le retour à
l'anglais ne coûte qu'un clic, **une seule fois**.

### Écarté

Une bannière discrète côté client (`navigator.languages`, dismissible, proposant `/fr/` sans y
forcer) avait été proposée comme alternative sans risque. Elle tombe avec la couverture complète :
son intérêt principal était de mesurer la demande francophone par le taux de clic, mesure dont
l'auteur n'a pas besoin puisque la traduction se fera de toute façon.

## Clôture de 0119 — ce qui a été vérifié le 2026-09-17

0119 a été rangé dans `DONE/` sans modification, conformément à la convention de `/todo`. Plusieurs
de ses cases y sont restées décochées alors qu'elles sont faites ; les preuves sont ici.

| Case ouverte dans 0119 | État vérifié |
| --- | --- |
| Lot B « rouvert — ~55 chaînes » | 89 chaînes traduites dans 25 fichiers ; balayage par parseur TSX + la commande de 0119 (commentaires exclus) : **zéro** |
| Lot B — JSON des plugins | `options.json`, `navbar.json`, `footer.json` traduits |
| Lot B — `tags.yml` | 49/49 tags traduits, `permalink` intacts |
| Lot C — composants sans `<Translate>` | voir lot B |
| Lot C — libellés des séries | 26/26, via `src/data/series.fr.js` (fichier jumeau plutôt que `labels: { fr }`) |
| Lot C — corpus `posts.ts` locale-aware | `require.context` sur `i18n/fr/` + surcouche des titres |
| Lot C — Pagefind sans mélange | build propre : index EN = 0 page `/fr/` ; index FR = 5 articles seulement ; recherche testée sur le build servi en local, résultat → `/fr/blog/docling/`, `lang=fr-BE` |
| Lot C.0 — audit de 3 plugins | miroirs `.md` FR = 5/5 en français ; carte FR = 5 articles ; `fr/llms.txt` = 5 articles |
| Lot F « rouvert — sidebar » | sidebar d'article FR = 5 liens, tous traduits |
| Lot E — retraduction par diff | chemin incrémental livré : 0,055 $ au lieu de 0,263 $ (−79 %), mesuré |
| Lot H — ne pas traduire les tableaux de bord | laissés en anglais volontairement |
| Lot D — titres d'Atuin | réparés par `--repair` (14/14, ancres intactes) |
| Lot D — mode `--all` | couvert par `translate blog` (confirmation du coût avant appel) |
| Lot D — manifeste `translations.generated.js` | abandonné au profit de `translations-manifest-plugin` (`setGlobalData`), choix documenté dans son en-tête |
| Lot D — scripts `package.json` | `translate` et `translate:check` ; `translate:bulk` couvert par `translate <dossier>` |

Livré en plus pendant la clôture : contrôle 11 du validateur (libellés de liens restés en anglais),
`remark-i18n-link-titles` (titres de liens relabellisés au build quand la cible est traduite),
`--repair`, navigation précédent/suivant limitée aux articles traduits, temps de lecture sur les
listes FR, année du pied de page résolue au build, `.htaccess` propre à la locale, et `deploy.yml`
étendu à chaque locale (contrôles, nettoyage des assets, test en ligne de la 404 française).

## Déjà tracé ailleurs

- `0120` — questions françaises pour « Interrogez mon blog »
- `0121` — ELI5 en français pour les snippets
- `0122` — props identifiantes (`source=`, `href=`…) jamais propagées aux traductions
