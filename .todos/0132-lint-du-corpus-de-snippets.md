# 0132 — Les 1000 fichiers `files/` publiés ne sont vérifiés par rien

- **Priority**: High — ce sont les fichiers que les lecteurs copient-collent, et aucun contrôle n'existe
- **Batch**: snippet-lint
- **Depends**: —
- **Files**: `scripts/lint-snippets.mjs`, `scripts/lib/snippet-scan.mjs`, `.devcontainer/scripts/helpers/maintenance.sh`, `.github/workflows/quality.yml`

## Problème

Inventaire du 2026-09-23 sous `blog/**/files/`, sidecars exclus — **1000 fichiers réellement
publiés** :

| Type | Nombre |
| --- | --- |
| `.txt` | 240 |
| `.yaml` / `.yml` | 105 |
| `Dockerfile*` | 76 |
| `.sh` / `.zsh` | 77 |
| `.php` | 69 |
| `.py` | 54 |
| `.json` | 45 |
| `.htaccess` | 29 |
| `.bats` | 18 |

`quality.yml` ne lance qu'ESLint, Stylelint et Playwright — tous sur le code du site. **Aucun de
ces 1000 fichiers n'est vérifié par quoi que ce soit.** `check-snippet-sources.mjs` contrôle que
le fichier *existe*, jamais qu'il est correct.

C'est le risque le plus concret du blog : un `docker-compose` v1 ou un `apt-key add` publié reste
copié-collé pendant des années.

## Le piège : beaucoup de ces fichiers sont volontairement incomplets

C'est la raison pour laquelle ce lint n'a jamais été fait, et il faut le traiter en premier.
Mesuré :

- **26 des 77 fichiers shell n'ont pas de shebang** — fragments, ou fonctions zsh destinées à être
  sourcées ;
- **89 fichiers portent des placeholders** `%%nom=valeur%%` (composant `Vars`) ;
- **99 fichiers portent des directives** `# highlight-next-line` / `highlight-start` ;
- des fragments explicitement nommés `.part2`, `.part3`, `.part4`.

Exemple qui cumule les trois,
`blog/2025/04/04/docker-oracle-database-server/files/populate_db.part2.sh` :

```bash
# highlight-next-line
sqlplus -S sys/admin@localhost:%%port=1521%%/%%cdb=ORCLCDB%% AS SYSDBA <<EOF
```

Ce n'est pas du shell valide. Lancer shellcheck dessus tel quel ne produit que du bruit.

## Piste de solution

### Prétraitement volatil, jamais sur disque

Les deux sources de bruit sont **mécaniquement réductibles**, aucune devinette :

- les directives `# highlight-*` se strippent — syntaxe fixe, déjà reconnue par le loader ;
- les placeholders **portent leur propre valeur par défaut** : `%%port=1521%%` → `1521`. La
  substitution est déterministe.

Le fichier normalisé part dans un temporaire, le fichier du dépôt n'est **jamais** modifié.

### Passe 1 — déterministe, zéro IA

`shellcheck`, `hadolint`, `yamllint`, `php -l`, `ruff`. Sur le fichier prétraité.

### Passe 2 — le juge Ollama, pour ce que les linters ne voient pas

`docker-compose` v1, `apt-key add`, `MAINTAINER`, une image `:latest`, un flag retiré depuis. Le
system prompt doit **donner le contexte manquant** : *« ce fichier est un extrait d'article, il
peut être partiel et hors contexte ; ne signale que ce qui serait faux même dans un extrait »*.
Ça élimine d'entrée toute la classe « il manque un shebang », « la variable n'est pas définie ».

### Les fragments authentiques : réutiliser une convention existante

Pour les 26 sans shebang et les `.part*`, **ne pas inventer un marqueur**. Le dépôt en a déjà un :
le sidecar `{"excluded": true}` des ELI5, que `lib/i18n-eligibility.mjs` honore aussi. Même geste,
même sémantique.

### L'état de la question : on ne vise pas un bulletin vierge

On lance **une fois**, on trie, on fige la baseline. Les 26 fragments passent en `excluded` en une
session. Le faux positif est un coût d'amorçage, pas un coût récurrent.

### Incrémental — obligatoire dès la v1

Un second lancement ne doit rescanner que le neuf. Le motif est déjà résolu trois fois dans le
dépôt (`.eli5.json`, `.questions.json`, `.translation.json`) : hash de la source, saut si
inchangé. Réutiliser `hashSource()`.

**Une différence assumée ici : un fichier d'état unique**, `.snippet-lint.json` à la racine
(chemin → hash → verdict), et non 1000 sidecars. Ce n'est pas de la donnée lue par le site,
contrairement aux ELI5 : rien n'impose la co-localisation, et ça évite d'ajouter 1000 fichiers au
dépôt.

Bénéfice secondaire, et il n'est pas théorique : ça contourne le piège du 2026-09-18 documenté
dans `CLAUDE.md` — *« a sidecar that does not exist appears in no `git ls-files` listing »*, qui
avait laissé deux articles passer non annotés à travers tous les pre-commit. Avec un fichier
d'état unique, la couverture se calcule en comparant ses clés au scan du corpus : un fichier
jamais analysé ne peut pas se cacher.

## Critère d'acceptation

1. Un premier run complet produit un rapport trié par sévérité et écrit `.snippet-lint.json`.
2. Un second run immédiat rapporte **0 fichier analysé** et se termine en moins de 5 secondes.
3. Toucher un seul fichier et relancer : **exactement 1** fichier réanalysé.
4. `populate_db.part2.sh` et `Dockerfile.part2` ne produisent **aucun** diagnostic lié aux
   placeholders ou aux directives de highlight.
5. La baseline est figée : le run de référence rapporte 0 problème non trié, et le décompte des
   `excluded` est écrit dans ce TODO.
6. Aucun fichier de `blog/**/files/` n'est modifié par le lint — vérifier par `git status`.

## À ne pas oublier

- Passer par `lib/snippet-scan.mjs` pour trouver les fichiers, **jamais** par un grep maison : son
  `blankOutCodeSpans` est ce qui empêche de compter les articles qui *documentent* le composant
  entre backticks (15 fausses références sur un corpus qui en a zéro).
- Exclure `.unpublished/**` du gate CI mais pas du run manuel : un brouillon a le droit d'être
  cassé.
- Brancher sur CI seulement après que la baseline soit verte, sinon `quality.yml` échoue dès le
  premier push.
