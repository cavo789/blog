# 067 — Bugs de contenu divers nécessitant une décision de l'auteur

**Priority:** Medium
**Category:** bug

## Problem

Plusieurs bugs techniques/de contenu, trouvés lors de l'audit `/review_blog` complet, où la
correction n'est pas évidente sans arbitrage de l'auteur (donc non corrigés automatiquement) :

1. **`blog/2023/12/19/bash-load-env/index.md:32`** — code d'exemple `source .env set` : le `set`
   final ressemble à un résidu de copier-coller (`source .env` est l'idiome standard utilisé
   partout ailleurs dans l'article/le blog).
2. **`blog/2023/12/22/docker-joomla/index.mdx` (ligne ~298 avant édition)** — `<Terminal
   typewriter>$ docker compose logs --follow the_output</Terminal>` : `the_output` ressemble à un
   token de substitution non remplacé (`docker compose logs --follow` ne prend pas cet argument).
3. **`blog/2023/12/27/docker-adminer-pgadmin-phpmyadmin/index.md` (section "Run pgadmin", ~lignes
   101-103)** — contrairement aux sections Adminer et phpMyAdmin qui donnent chacune une commande
   `docker run` complète, la section pgAdmin ne contient qu'une AlertBox disant "pgadmin is only
   for PostgreSQL databases" sans aucun exemple de commande — section visiblement incomplète.
4. **`blog/2024/11/11/drawdb-app/index.md:84-168`** — la section finale générée par l'export
   drawDB.app se termine par un titre "Database Diagram" sans image/contenu en dessous — export
   probablement tronqué à la copie.
5. **`blog/2025/05/19/php-api-tips/index.mdx`** — trois problèmes dans le même article : (a)
   ligne 257, le tableau des codes retour liste `200`/`Created` pour un POST, alors que le texte
   juste au-dessus et la note en ligne 263 disent tous deux que le bon code est `201` ; (b) lignes
   515-528 et 588-598, deux blocs JSON d'exemple ne sont pas du JSON valide (tableaux contenant des
   paires `"clé": "valeur"` nues, commentaires `//`) ; (c) déjà couvert par [[066]] pour le
   `docux.png`/`.webp`.
6. **`blog/2024/03/30/linux-fzf-introduction/index.md:15`** — frontmatter utilise `update:`
   (singulier, scalaire) au lieu de `updates:` (liste) utilisé partout ailleurs dans le projet —
   probablement silencieusement ignoré par le thème.
7. **`blog/2024/03/30/putty-no-supported-authentication-methods/index.md:26`** — la clé de
   registre citée `default/20session` ressemble à une corruption de `Default%20Session` (espace
   encodé en pourcentage), le nom standard de la clé PuTTY.

## Proposed solution

Traiter au cas par cas avec l'auteur — chaque point ci-dessus nécessite soit de retrouver
l'intention d'origine (points 1, 2, 6, 7), soit un arbitrage de contenu (points 3, 4, 5).

## Affected posts

`bash-load-env`, `docker-joomla`, `docker-adminer-pgadmin-phpmyadmin`, `drawdb-app`, `php-api-tips`,
`linux-fzf-introduction`, `putty-no-supported-authentication-methods`.

## Relationship to existing TODOs

Aucun TODO existant. Le point 5(c) est couvert par [[066]].

## Status — PARTIAL (2026-07-10)

### Done

* Point 1 (`bash-load-env`) : le `set` résiduel a été confirmé comme un copier-coller cassé
  (la ligne suivante contient déjà `set +o allexport`) ; corrigé en `source .env`.
* Point 2 (`docker-joomla`) : `the_output` était bien un token de substitution non remplacé,
  incohérent avec la phrase juste au-dessus (`docker compose logs --follow`) ; supprimé.
* Point 5(a) (`php-api-tips`) : le tableau des codes retour listait `200`/`Created`, contredisant
  le texte et la note juste en dessous qui affirment que le code correct est `201`. Corrigé en
  `201`.
* Point 5(b) (`php-api-tips`) : les deux blocs JSON invalides (lignes ~515-528 et ~588-598)
  utilisaient des `[ ]` là où des objets `{ }` étaient attendus (paires clé/valeur nues), et un
  commentaire `// ...` invalide en JSON. Corrigés pour être syntaxiquement valides tout en
  conservant l'intention (data = tableau d'objets ; errors = tableau d'objets d'erreur, `status`
  quotée en string conformément à la description juste au-dessus qui dit "expressed as a string
  value").
* Point 5(c) : redondant avec [[066]], aucune action nécessaire ici.
* Point 6 (`linux-fzf-introduction`) : confirmé via `git show` sur le commit du 2024-03-31
  (`d51f774`) que la mise à jour de cette date a ajouté la section "Keybindings". Frontmatter
  converti de `update: 2024-03-31` vers `updates: [{date: 2024-03-31, note: "Added a Keybindings
  section"}]`, conforme au schéma utilisé partout ailleurs.
* Point 7 (`putty-no-supported-authentication-methods`) : la clé de registre PuTTY standard pour
  les paramètres par défaut est `Default%20Settings` (pas `Default%20Session` comme supposé dans
  le TODO d'origine — c'est bien "Settings", pas "Session"). Corrigé en conséquence.

### Not done

* Point 3 (`docker-adminer-pgadmin-phpmyadmin`, section "Run pgadmin") : reste incomplète (juste
  une AlertBox, pas de commande `docker run`).
  **Reason:** l'exemple du reste de l'article repose sur un conteneur MySQL (Joomla) ; pgadmin ne
  gère que PostgreSQL et ne fonctionne pas de la même façon que Adminer/phpMyAdmin avec `--link`
  seul (il faut des variables d'env `PGADMIN_DEFAULT_EMAIL`/`PGADMIN_DEFAULT_PASSWORD` et un ajout
  manuel du serveur via son UI web). Fabriquer un exemple sans conteneur Postgres de référence ni
  capture d'écran (`pgadmin.webp` n'existe pas) risquerait d'introduire des informations
  incorrectes. Nécessite un arbitrage de contenu de l'auteur (fournir un exemple Postgres réel ou
  reformuler la section).
* Point 4 (`drawdb-app`) : le titre final "Database Diagram" reste sans image en dessous.
  **Reason:** ambigu entre deux corrections possibles — (a) ajouter l'image du diagramme
  manquante (non disponible dans `./images/`, seuls `model.webp` et `export.webp` existent), ou
  (b) supprimer purement la section tronquée. C'est un choix de contenu qui appartient à l'auteur.
