# 0077 — yarn add sharp contourne la garantie --immutable du lockfile

- **Priority**: Medium
- **Batch**: docker
- **Depends**: —
- **Files**: `Dockerfile`

## Problème

Le stage `dependencies` installe les dépendances avec `yarn install --immutable --frozen-lockfile`
(reproductible) puis exécute immédiatement :

```dockerfile
yarn add --platform=linux --arch=x64 sharp
```

`yarn add` modifie `yarn.lock` à l'intérieur du conteneur — mais cette modification ne remonte
jamais dans le lockfile du dépôt. Conséquence : chaque build Docker résout `sharp` en live (version
potentiellement différente d'un build à l'autre), et la version dans l'image peut diverger de ce
que `yarn install --immutable` donnerait si sharp était correctement déclaré.

## Risque

Non-reproductibilité du build ; version de `sharp` dans l'image potentiellement différente de ce
qu'on croit livrer.

## Solution

Deux options :

**Option A — Déclarer sharp comme dépendance plateforme-spécifique dans package.json**
Ajouter `sharp` aux `optionalDependencies` avec la bonne entrée `os`/`cpu` pour que
`yarn install --immutable` le résolve directement :

```json
"optionalDependencies": {
  "sharp": "^0.x.y"
}
```

Puis lancer `yarn install` localement pour mettre à jour `yarn.lock`, commiter le lockfile, et
supprimer le `yarn add` du Dockerfile.

**Option B — `--ignore-engines` + build dans le lockfile**
Forcer la résolution linux/x64 dans le `package.json` via `"os": ["linux"]` + `"cpu": ["x64"]`
dans la section `resolutions` de sharp. Vérifier la compatibilité avec Yarn Berry.

Dans les deux cas : supprimer `yarn add --platform=linux --arch=x64 sharp` du Dockerfile et vérifier
que `yarn build` passe avec l'approche retenue.
