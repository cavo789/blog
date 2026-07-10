# 049 — `BrowserWindow` sous-utilisé pour les captures d'écran de webapp

**Priority:** Medium

## Problème

Le composant `<BrowserWindow url="...">` existe précisément pour habiller une capture d'écran de
navigateur (barre d'adresse stylée, cohérence visuelle), mais la majorité des articles qui font
tourner une webapp locale affichent le résultat en `![]()` brut juste après avoir dit "ouvrez votre
navigateur sur...", sans passer par le composant. Exemples relevés dans les articles de 2025 :

- `blog/2025/01/05/docker-init-php-apache/index.md` — capture de `localhost` en image brute
- `blog/2025/02/09/python-fastapi/index.md` — 6 captures distinctes (`/`, `/docs`, `/redoc`,
  `/jokes`, `/jokes/{id}`) toutes en image brute
- `blog/2025/02/01/heimdall-dashboard/index.md` — 7+ captures du dashboard, toutes en image brute
- `blog/2025/04/04/docker-oracle-database-server/index.md` — console web OEM Express
  (`https://localhost:5500/em/`)
- `blog/2025/04/11/docker-oracle-ords/index.md` — page d'accueil ORDS, login, dashboard REST
- `blog/2025/05/15/quarto-mustache/index.md` — site rendu via `http://localhost:8080/...`
- `blog/2025/05/25/excel-formatter/index.md` — démo de l'outil web
- `blog/2025/06/20/pentaho-discovery/index.md` — captures pgAdmin (login, création serveur, table)

À l'inverse, plusieurs articles récents (ex. `docker-prod-devcontainer`,
`running-docusaurus-using-docker`) utilisent déjà correctement `<BrowserWindow url="...">`, donc
le composant est connu et adopté — juste pas rétrofité sur les anciens articles.

## Risque

Incohérence visuelle entre articles anciens et récents : certains montrent le contexte "ceci est
dans un navigateur à cette URL" de façon claire, d'autres non. Ça affaiblit la lisibilité des
tutoriels les plus riches en captures (heimdall-dashboard, python-fastapi, pentaho-discovery), là
où le composant apporterait le plus de valeur.

## Solution proposée

Repasser sur les 8 articles listés ci-dessus et envelopper chaque capture de webapp/dashboard dans
`<BrowserWindow url="http://...">![...](...)</BrowserWindow>` (ou avec le contenu HTML inline si on
veut annoter/redimensionner, voir l'usage dans `docker-prod-devcontainer`). Ne pas toucher aux
captures qui ne représentent pas un navigateur (ex. VSCode, terminal, apps desktop).

## Lien avec l'existant

Aucun TODO existant. Trouvé lors d'un audit des articles `blog/2025` demandé par l'utilisateur
(analyse de réutilisation de composants). Voir aussi [[050]] (même audit, même lot d'articles).
