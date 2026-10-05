# 0133 — 1611 sidecars ELI5 et aucun garde-fou sur leur contenu

- **Priority**: Medium — dette silencieuse, lisible par les lecteurs, jamais vérifiée
- **Batch**: eli5-tooling
- **Depends**: 0131
- **Files**: `scripts/eli5-judge.mjs`, `scripts/check-eli5-freshness.mjs`, `.devcontainer/scripts/helpers/ollama.sh`

## Problème

La traduction est fiable parce que `translate-validate.mjs` fait **10 contrôles** — c'est écrit
noir sur blanc dans `CLAUDE.md` : *« The validator (10 checks) is what makes it trustworthy —
prompt discipline alone lands around 90% »*.

ELI5 n'a **rien** d'équivalent. `generate-eli5.mjs` vérifie que le JSON parse, que les clés sont
numériques et que les numéros de ligne sont dans les bornes du fichier. C'est tout. Personne n'a
jamais vérifié que l'explication de la ligne 12 parle bien de la ligne 12.

**806 sidecars EN + 805 FR = 1611**, produits sur deux ans, jamais relus. Si le taux d'erreur est
celui annoncé pour la traduction sans validateur — de l'ordre de 10 % — cela fait ~160 annotations
fausses en ligne aujourd'hui.

`check-eli5-freshness.mjs` répond à deux questions voisines mais différentes : la **fraîcheur**
(le hash de la source a-t-il bougé) et la **couverture** (existe-t-il un sidecar). Ni l'une ni
l'autre ne dit si le contenu est juste.

## Piste de solution

Une action de plus sous la fonction `eli5`, dans l'esprit du cycle de vie déjà lisible de
`questions` (*générer → juger → corriger*) : **`eli5 judge`**.

Pour chaque sidecar, on présente au modèle local la paire `(ligne de code, explication)` et on
demande un verdict fermé : `ok` | `contresens` | `trop vague`. Sortie contrainte par un schéma
JSON, comme `generate-questions.mjs` le fait déjà avec `format:`.

Le résultat n'est **pas** une correction automatique : c'est une liste de suspects. On régénère
ensuite via Haiku les seuls fichiers signalés — si le taux est de 5 %, c'est 80 fichiers, soit
**0.80 $** au lieu de 16 $ pour une régénération aveugle.

C'est le bon emploi de l'hybride, et il est symétrique de 0134 : **le local juge, Claude rédige.**

### Trois précautions de cadrage

- Juger **l'explication contre le code**, jamais contre son propre goût : le prompt doit
  interdire « j'aurais dit autrement ». Seul le contresens factuel compte.
- Le `summary` et les `explanations` sont deux objets différents : un résumé peut être bon avec
  des annotations fausses, et inversement. Deux verdicts séparés.
- **Juger EN et FR séparément.** Le sidecar français est généré depuis le code, pas traduit : sa
  qualité est indépendante de celle de l'anglais, et un modèle de code juge moins bien du français.

### Incrémental

Même exigence qu'en 0132 : un sidecar déjà jugé et non modifié depuis ne doit pas être resoumis.
Le verdict se stocke dans le sidecar lui-même — il y est déjà à sa place, aux côtés de `model` et
`generated` — ce qui évite d'inventer un second fichier d'état.

## Critère d'acceptation

1. `eli5 judge --limit 50` produit 50 verdicts et **ne modifie aucun sidecar** hors le champ de
   verdict.
2. Relancer immédiatement : **0 sidecar rejugé**.
3. Un run complet sur les 1611 sidecars rapporte un taux, et **ce taux est écrit dans ce TODO** —
   c'est la seule mesure qui dira si la dette est réelle ou imaginaire.
4. Contrôle manuel de 20 verdicts `contresens` tirés au hasard : au moins 15 sont de vrais
   problèmes, sinon le prompt du juge est à revoir avant d'aller plus loin.
5. `eli5` affiche la nouvelle action dans son écran d'aide (voir 0131).

## À ne pas oublier

- Ne pas se servir de ce juge pour **régénérer automatiquement** : un modèle local qui décide seul
  de remplacer une annotation payée chez Haiku est une régression déguisée en optimisation.
- Les sidecars marqués `{"excluded": true}` sont hors périmètre, ici comme partout ailleurs.
