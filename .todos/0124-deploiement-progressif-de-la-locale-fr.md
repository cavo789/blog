# 0124 — Déploiement progressif de la locale `/fr/` (suite de 0119)

- **Priority**: Low — la locale est en ligne ; ce qui reste est de la mesure et de la traduction au fil de l'eau
- **Batch**: i18n-fr
- **Depends**: 0119
- **Files**: `scripts/translate-post.mjs`, `.devcontainer/scripts/interactive.sh`

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
- [ ] **Mesurer 60 jours** : les pages `/fr/` reçoivent-elles du trafic organique ? Critère à fixer
      avant de regarder les chiffres, pour ne pas le choisir après coup.
- [ ] **Traduire chaque nouvel article à sa publication** — c'est une habitude, pas une tâche :
      `translate blog/AAAA/MM/JJ/<slug>`, puis relancer le serveur de dev (un nouveau fichier de
      traduction n'est pas pris en compte à chaud).
- [ ] **Le reste du corpus, seulement si la mesure est positive** — 252 articles, ≈ 66 $ en
      traduction complète au tarif Opus 5 mesuré.
- [ ] **API Batches pour le volume** — 50 % de réduction, en asynchrone. Ne vaut la peine que pour
      l'étape précédente ; inutile pour un article à la fois.

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
