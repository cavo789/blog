# 0111 — `run_ci build` n'a pas le sanity-check du build de deploy.yml

- **Priority**: Low
- **Batch**: deploy-pipeline
- **Depends**: —
- **Files**: `.devcontainer/scripts/interactive.sh`, `.github/workflows/deploy.yml`

## Problème

`deploy.yml` a un step "Sanity-check the build" **après** `yarn build` et **avant** le transfert
rsync : il vérifie que `build/index.html`, `build/sitemap.xml` et `build/blog/rss.xml` existent,
ne sont pas vides, et que les deux fichiers XML sont bien formés (`xmllint --noout`, ou un
fallback Python si `xmllint` est absent).

`run_ci build` (voir TODO d'origine sur `run_ci`, batch CI Parity) reproduit `yarn clear && yarn
build` mais s'arrête là — il ne reproduit pas ce sanity-check. Un build qui produit un
`sitemap.xml` tronqué ou un `rss.xml` mal formé passerait donc `run_ci build`/`run_ci all` en
vert localement, puis échouerait (ou pire, réussirait à moitié) une fois poussé.

## Solution

Ajouter dans `.devcontainer/scripts/interactive.sh` une fonction `_run_ci_build_sanity` (ou
inline dans le case `build` de `run_ci`), copiant la logique du step `deploy.yml` :

```bash
for file in build/index.html build/sitemap.xml build/blog/rss.xml; do
    [ -s "$file" ] || { echo "$file is missing or empty"; exit 1; }
done

if command -v xmllint >/dev/null 2>&1; then
    xmllint --noout build/sitemap.xml build/blog/rss.xml
else
    python3 -c 'import sys, xml.dom.minidom; [xml.dom.minidom.parse(p) for p in sys.argv[1:]]' \
        build/sitemap.xml build/blog/rss.xml
fi
```

Enchaîner ce check à la suite de `yarn clear && yarn build` dans le case `build` de `run_ci`,
pour que `run_ci build` et `run_ci all` couvrent la même chose que le gate de `deploy.yml`
(le smoke-test HTTP final de `deploy.yml` reste hors de portée : il tape le site en production,
donc pas reproductible localement).

`xmllint` n'est pas listé dans le Dockerfile devcontainer — vérifier s'il est déjà présent via
une dépendance transitive avant d'envisager de l'ajouter ; sinon le fallback Python suffit.

## Risque

Faible. Best-effort local, aucune conséquence si le check est absent — `deploy.yml` continue de
faire foi côté CI. Le seul risque est un faux sentiment de sécurité si `run_ci all` est vert
localement sans ce check et que l'utilisateur en déduit à tort que le build est du même niveau
que le gate de déploiement.

## Acceptance

- `run_ci build` échoue si `build/sitemap.xml` ou `build/blog/rss.xml` est absent, vide, ou mal
  formé (XML invalide), avec le même message d'erreur que `deploy.yml`.
- `run_ci build` passe au vert sur l'état actuel du site.
- `run_ci all` propage cet échec (ne s'arrête pas silencieusement avant).
