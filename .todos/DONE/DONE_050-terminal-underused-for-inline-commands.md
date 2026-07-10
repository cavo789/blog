# 050 — `Terminal` sous-utilisé pour les commandes shell isolées (surtout le rituel `mkdir /tmp/...`)

**Priority:** Low

## Problème

La convention du blog dit "Always use `<Terminal>` for shell commands (never bare code blocks for
CLI interactions)", mais de nombreux articles de 2025 donnent des commandes isolées en inline code
au milieu d'une phrase plutôt qu'en bloc `<Terminal>` — alors que les mêmes articles utilisent
`<Terminal>` correctement quelques paragraphes plus loin pour d'autres commandes. Le cas le plus
répété est la phrase rituelle d'ouverture "créez un dossier temporaire" :

- `blog/2025/01/10/git-precommit/index.md` — `mkdir /tmp/hooks && cd $_` en inline
- `blog/2025/01/25/docker-git/index.md` — `mkdir /tmp/git && cd $_` en inline
- `blog/2025/02/01/heimdall-dashboard/index.md` — `mkdir ~/tools/dashboard && cd $_` en inline
- `blog/2025/02/09/python-fastapi/index.md` — `mkdir /tmp/fastapi && cd $_` en inline
- `blog/2025/03/30/cypress/index.md` — `mkdir -p /tmp/cypress && cd $_` en inline
- `blog/2025/05/15/quarto-mustache/index.md` — `mkdir /tmp/partials && cd $_` en inline
- `blog/2025/06/20/pentaho-discovery/index.md` — `mkdir -p /tmp/pentaho && cd $_` en inline
- `blog/2025/04/04/docker-oracle-database-server/index.md` — `mkdir -p /tmp/oracle && cd $_` en
  inline

Au-delà de cette ligne rituelle, d'autres commandes isolées (`docker volume create ...`,
`docker network create ...`, `pre-commit run --all-files`, ...) sont aussi données en inline dans
plusieurs de ces mêmes articles.

## Risque

Incohérence de present­ation dans un même article (certaines commandes en `<Terminal>` avec bouton
copier, d'autres en inline non copiables) et non-respect de la convention déjà documentée dans
`AGENTS.md` / la mémoire du projet.

## Solution proposée

Repasser sur les 8 articles listés et convertir la ligne `mkdir /tmp/xxx && cd $_` (et les autres
commandes isolées significatives) en `<Terminal>$ mkdir ...</Terminal>`. Pas besoin de nouveau
composant — juste une passe d'application stricte de la convention existante.

## Lien avec l'existant

Aucun TODO existant. Trouvé lors du même audit `blog/2025` que [[049]].
