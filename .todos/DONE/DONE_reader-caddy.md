# Reader review : caddy

**Détecté :** 2026-08-08
**Clôturé :** 2026-08-08
**Article :** .unpublished/caddy/index.md
**Verdict :** DONE (restructuré selon le plan ci-dessous)

## Résumé de l'implémentation

Réordonnancement appliqué selon la table. La preuve manquante (cadenas vert / `curl -I`, jusqu'ici seulement promise l.100) a été produite réellement : un conteneur Caddy avec `tls internal` a été construit et lancé, le CA local extrait, et `curl --cacert` (chaîne de confiance complète, pas `-k`) a confirmé `HTTP/2 200` avec les en-têtes `server: Caddy` — capturé dans `files/terminal_https_proof.txt`.

## Problème

Time to value : **100 %** — aucune preuve nulle part dans tout le corps (125 lignes après
`<!-- truncate -->`, l. 24) : chaque `<Terminal>` ne montre que la commande (`docker compose up
-d`, `docker compose exec caddy caddy trust`), jamais de sortie, et aucune image hormis la
bannière. La ligne 100 promet même « `https://localhost` affiche un cadenas vert » sans jamais
le montrer.
Drapeaux : abstraction-avant-preuve — deux `<Snippet>` (Caddyfile + compose.yaml, l. 40-42)
avant le premier `<Terminal>` (l. 48), lui-même sans sortie.
Redondance : « HTTPS automatique » énoncé **3 fois** (l. 30, l. 66-78, l. 92) — cohérent, chaque
occurrence couvre un cas différent (public, local, multi-domaines), pas redondant.

Test des 30 secondes : l'ouverture conceptuelle (3 points qui distinguent Caddy de nginx) est
solide et donne envie de continuer. Mais dès le premier exemple concret, aucun résultat n'est
jamais visible — pas de `curl -I` montrant les en-têtes HTTPS, pas de capture du cadenas promis
l. 100. Je referme l'onglet en me demandant si ça marche vraiment.

## Risque

L'article documente correctement la configuration (Caddyfile, compose.yaml) mais ne prouve
jamais le résultat qu'il annonce lui-même (« HTTPS automatique », « cadenas vert »). C'est du
contenu à créer, pas seulement à déplacer.

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1. Accroche | Inchangée | avant l. 24 |
| 2. Résultat | `curl -I https://myapp.localhost` ou capture d'écran du cadenas vert — **à créer**, promis l. 100 | nouveau, décrit l. 86-100 |
| 3. Pourquoi ça marche | « What makes Caddy different » (déjà sans code) | l. 26-34 |
| 4. Installation | Static file server (Caddyfile + compose.yaml + `up`) | l. 36-52 |
| 5. Plus de démos | Reverse proxy, HTTPS publique, HTTPS locale, domaines multiples | l. 54-111 |
| 6. Sous le capot (optionnel) | Logging, Caddy vs nginx | l. 112-140 |
| 7. Conclusion | Inchangée | l. 141-149 |

Cible : time to value < 15 %. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.
