# 0087 — « Try it here » : exécuter l'outil de l'article dans la page — sous condition de pertinence

- **Priority**: Low — décision d'abord, code ensuite
- **Batch**: blog-playground
- **Depends**: —
- **Files**: TBD — dépend de l'arbitrage de la § « Go / No-go »

## Problème

Le blog est excellent pour _retrouver_ un article. Il ne permet jamais de _vérifier_ qu'un
outil fait ce qu'il promet : le lecteur doit copier la commande, ouvrir un terminal,
installer l'outil, et seulement là découvrir le résultat. `<TriedIt>` demande « tu as
essayé ? » sans jamais donner le moyen d'essayer.

L'idée initiale — un composant `<Playground>` avec un moteur WASM — a été confrontée au
corpus **avant** d'être budgétée. Le résultat de cet inventaire est le cœur de ce TODO, et
il tempère largement l'idée de départ.

## Inventaire de pertinence (fait le 2026-08-12, sur 248 publiés + 43 brouillons)

### Famille 1 — outils CLI de transformation de texte (moteur WASM à intégrer)

| Article                               | Moteur candidat                            | Verdict                                                                  |
| ------------------------------------- | ------------------------------------------ | ------------------------------------------------------------------------ |
| `blog/2023/12/13/linux-jq`            | `jq` WASM (~150 Ko, chargement instantané) | ✅ solide                                                                |
| `.unpublished/duckdb-json-csv`        | `duckdb-wasm` (~3 Mo, lazy)                | ✅ solide (brouillon)                                                    |
| `blog/2024/12/06/python-pandas-merge` | Pyodide + pandas (~10 Mo)                  | ⚠️ ratio poids/valeur douteux                                            |
| `blog/2024/12/18/python-pydot`        | `viz.js` (Graphviz WASM)                   | ⚠️ possible, à confirmer                                                 |
| `.unpublished/linux-yq`               | `yq` est en Go, pas de build WASM maintenu | ⚠️ à vérifier                                                            |
| `blog/2024/01/25/linux-sed-tips`      | pas de `sed` WASM propre                   | ❌ approximer avec une regex JS **mentirait** sur la sémantique de `sed` |
| `blog/2023/12/13/linux-xmlstarlet`    | aucun                                      | ❌                                                                       |

**Soit 2 articles solides sur 248.** L'intuition de l'auteur était juste : c'est très mince.
Et le reste du corpus (21 articles `docker`, tous les articles WSL, SSH, Windows Terminal,
VS Code, VBA) est structurellement hors de portée — **Docker ne tournera jamais dans un
navigateur**, et c'est le premier sujet du blog.

### Famille 2 — outils web que l'auteur héberge déjà (aucun moteur à écrire)

Découverte de l'inventaire, et de loin le meilleur rapport valeur/effort :

| Article                           | Outil, déjà en ligne          |
| --------------------------------- | ----------------------------- |
| `blog/2024/07/17/sql_formatter`   | `sql-formatter.avonture.be`   |
| `blog/2024/11/08/json-lint`       | `jsonlint.avonture.be`        |
| `blog/2024/12/08/markdown-csv2md` | `csv2md.avonture.be`          |
| `blog/2024/12/08/markdown-xls2md` | `xls2md.avonture.be`          |
| `blog/2025/05/25/excel-formatter` | `excel-formatter.avonture.be` |

Ces cinq articles **décrivent un outil, montrent une capture, et envoient le lecteur
ailleurs**. `sql_formatter` va jusqu'à écrire « Just copy/paste `SELECT LAT_N, …` in the
tool » — l'invitation à essayer est déjà dans le texte, mais l'essai se fait sur un autre
domaine, dans un autre onglet, et le lecteur ne revient pas.

Il n'y a ici **aucun moteur à porter en WASM** : le code tourne déjà. Le travail est
d'amener l'outil dans l'article.

Pour mémoire, deux articles de la même famille pointent vers des outils **tiers**
(`online-php-linter` → codebeautify.org, `json_faker` → mockaroo.com) : hors périmètre,
on n'embarque pas le service de quelqu'un d'autre.

## Go / No-go — à trancher avant d'écrire une ligne de code

Ce TODO ne doit **pas** être implémenté tel quel. Trois scénarios, à arbitrer :

1. **No-go complet.** 2 articles WASM sur 248, ça ne justifie pas un composant, un moteur et
   sa maintenance. Fermer en `WONT_DO` est une issue parfaitement défendable.
2. **Go réduit — famille 2 uniquement (recommandé).** Un composant `<TryIt>` qui embarque
   l'outil déjà hébergé dans l'article, avec l'exemple de l'article pré-rempli. Cinq articles
   concernés, zéro moteur à écrire, effet immédiat : le lecteur _voit_ son SQL se reformater
   sans quitter la page. Points à trancher : `<iframe>` (simple, mais CSP, thème clair/sombre
   non synchronisé, et cadre dans le cadre) **vs** appel `fetch` vers l'outil + rendu du
   résultat dans un `<Terminal>`/`<Snippet>` maison (plus intégré, demande une route qui
   réponde en JSON et du CORS côté outil).
3. **Go complet.** Famille 2, puis `jq` en pilote WASM — parce que 150 Ko se chargent sans
   qu'on les sente, que l'article `linux-jq` est un classique, et que le chantier lui-même
   fait un article (« comment j'ai mis `jq` dans mon blog »), ce qui rentabilise l'effort une
   seconde fois. DuckDB seulement si le brouillon `duckdb-json-csv` est publié.

Dans tous les cas : **ne pas construire un composant générique multi-moteurs.** Un moteur
par intégration, chacun autonome et chargé à la demande.

## Risque

- **Un playground cassé est pire que pas de playground.** Un moteur WASM qui ne se charge
  pas, un outil hébergé en panne, et l'article perd sa crédibilité au lieu d'en gagner.
  Toute intégration doit dégrader proprement vers ce qui existe aujourd'hui (la capture et le
  lien externe), jamais vers un cadre vide ou un spinner infini.
- **Poids de page.** Le blog est soigné côté perf (`@docusaurus/faster`, ideal-image, lazy
  loading). Un moteur chargé au montage de la page annulerait cet effort : chargement
  uniquement sur interaction explicite du lecteur.
- **Dépendance externe.** L'option 2 lie la page d'article à la disponibilité d'un autre
  domaine. Acceptable puisque ce sont les domaines de l'auteur, mais le mode dégradé n'est
  pas optionnel.
- **Maintenance silencieuse.** Un moteur WASM épinglé vieillit sans prévenir et personne ne
  s'en aperçoit tant qu'un lecteur ne le signale pas — ce que le trafic actuel rend
  improbable. Argument de plus pour le scénario 2.

## Acceptance

- [ ] Le scénario (1, 2 ou 3) est tranché et la décision écrite dans ce fichier
- [ ] Si **no-go** : le fichier part en `WONT_DO/` avec la raison — l'inventaire ci-dessus
      reste la trace, il ne sera pas à refaire
- [ ] Si **go** : `**Files**` est renseigné, le choix `iframe` vs `fetch` est justifié, et
      **un seul** article est intégré et validé visuellement avant les autres
- [ ] Le mode dégradé (moteur indisponible / outil hors ligne) est vérifié pour de vrai, en
      coupant le réseau — pas seulement supposé
- [ ] Aucun octet supplémentaire chargé tant que le lecteur n'a pas cliqué (vérifié dans
      l'onglet réseau)
- [ ] `yarn lint && yarn format:check && yarn build` passent
