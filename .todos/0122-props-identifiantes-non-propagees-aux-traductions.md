# 0122 — Les props identifiantes ne se propagent jamais aux traductions

- **Priority**: High — produit des liens et des snippets cassés en français, sans aucun signal
- **Batch**: i18n-fr
- **Depends**: 0119
- **Files**: `scripts/lib/translate-hash.mjs`, `scripts/translate-post.mjs`, `scripts/check-translation-freshness.mjs`

## Problème

`translatableContent()` retire les valeurs de props identifiantes avant de calculer le hash :

```js
.replace(/\b(?:source|href|to|icon|image|id|variant|language)=["'][^"']*["']/g, "")
```

L'intention est bonne — renommer un fichier de snippet ne « traduit » rien, donc ça ne doit pas
marquer l'article obsolète. Mais le fichier français **porte sa propre copie de ces props** :

```text
EN : <Snippet filename="Dockerfile" source="./files/Dockerfile" />
FR : <Snippet filename="Dockerfile" source="./files/Dockerfile" />
```

Donc si l'article anglais change `source="./files/Dockerfile"` en
`source="./files/Containerfile"` :

1. le hash est **inchangé** → `translate` dit « already translated and up to date » ;
2. `translate:check` classe l'article **FRESH** ;
3. le fichier français continue de pointer vers `./files/Dockerfile`.

Résultat : le snippet français rend l'ancien contenu, ou casse le build si le fichier a été
supprimé — et **rien ne le signale**. Aucun des deux signaux de fraîcheur ne peut voir ce genre de
dérive, par construction.

## Portée réelle

Ce n'est pas limité à `source=`. La même liste couvre :

- `href=` / `to=` — un lien interne redirigé en anglais continue de pointer vers l'ancienne URL
  en français ; combiné à la règle de maillage interne, ça vise potentiellement une page morte ;
- `image=` — une bannière renommée laisse une image cassée en français ;
- `icon=`, `id=`, `variant=` — dégradation visuelle silencieuse.

Le cas `source=` est le plus grave parce que `remark-snippet-loader` **inline le fichier au
build** : le français affiche alors du code réellement différent de l'anglais, pas juste un lien
mort.

Vérifié le 2026-09-17 sur `blog/2026/09/17/docling/` : les deux fichiers portent bien la même
ligne `<Snippet filename="Dockerfile" source="./files/Dockerfile" />`, chacun sa copie.

## Piste de solution

Deux approches, la seconde ayant ma préférence.

**A — réintégrer ces props dans le hash.** Simple, mais tout renommage de chemin redevient un
motif de retraduction. C'était inacceptable quand la seule réponse possible était une traduction
complète ; ça l'est beaucoup moins depuis que le chemin incrémental existe — un diff d'une ligne
produit un patch de quelques centaines de tokens. Reste que payer un appel API pour recopier un
chemin est absurde.

**B — une passe de synchronisation déterministe, sans appel API.** Les props identifiantes ne sont
pas traduites : elles sont *copiées*. Un post-pass peut donc les réaligner mécaniquement depuis
l'anglais, dans l'esprit de `pinEnglishAnchors()` qui fait déjà exactement ça pour les ancres de
titres. Coût nul, résultat exact, et ça vaut aussi bien au moment de traduire qu'en balayage du
corpus existant.

La difficulté est l'appariement : il faut relier chaque balise française à son homologue anglaise.
L'ordre d'apparition est un candidat raisonnable (le validateur garantit déjà l'égalité des
structures), mais il faut décider quoi faire quand les comptes divergent — probablement refuser la
synchronisation et signaler, plutôt que réaligner à l'aveugle.

**Point d'entrée pour le balayage** : le même que celui utilisé pour auditer les traductions
existantes — charger chaque paire EN/FR et comparer les props extraites, sans rien envoyer à
l'API.

## Critère d'acceptation

Nommer un fichier et un nombre, pas « ça marche » :

1. Renommer `blog/2026/09/17/docling/files/Dockerfile` et sa référence dans l'article anglais.
2. Lancer la synchronisation.
3. `i18n/fr/docusaurus-plugin-content-blog/2026/09/17/docling/index.md` contient **le nouveau
   chemin**, et zéro occurrence de l'ancien.
4. Un balayage du corpus rapporte **0 divergence** sur les articles traduits.
5. Le build passe sur les deux locales — voir `.claude/rules/build-verification.md`.

## À ne pas oublier

`scripts/check-snippet-sources.mjs` (lancé par `yarn lint`) vérifie déjà l'existence des sources
de snippets — mais **uniquement sur `blog/**` et `.unpublished/**`**, vérifié le 2026-09-17 : sa
liste de globs ne contient pas `i18n/`. L'étendre au corpus traduit donnerait un filet de sécurité
**gratuit** et immédiat contre la forme la plus grave de ce bug (un `source=` pointant vers un
fichier disparu), indépendamment de la solution retenue ci-dessus. À faire en premier : c'est
quelques lignes et ça transforme un bug silencieux en échec de `yarn lint`.
