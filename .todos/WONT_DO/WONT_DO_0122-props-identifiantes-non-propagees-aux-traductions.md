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

## Status — WONT_DO (2026-09-25)

### Rien n'a été implémenté

`scripts/lib/translate-hash.mjs` est inchangé, aucune passe de synchronisation n'a été écrite,
`check-snippet-sources.mjs` n'a pas été étendu à `i18n/`.

### Pourquoi on ne le fait pas

Le bug décrit est **réel et correctement analysé** — ce n'est pas une erreur du TODO. Mais il a un
**déclencheur unique**, et ce déclencheur n'existe pas dans le workflow de l'auteur.

Toute la chaîne de défaillance part d'une modification de l'article **anglais après sa
traduction** : on renomme `source="./files/Dockerfile"` en `./files/Containerfile`, le hash ne
bouge pas parce que les props identifiantes en sont retirées, et le français garde l'ancien
chemin. Sans cette modification post-traduction, il n'y a pas de divergence à rattraper : le
fichier français a été produit à partir de l'anglais tel qu'il est encore aujourd'hui, et les deux
portent la même valeur par construction.

Or le workflow réel est : **écrire l'article, le faire traduire, ne plus y toucher.** Le cas
vérifié le 2026-09-17 sur `blog/2026/09/17/docling/` le montre d'ailleurs à l'endroit :
les deux fichiers portaient bien la *même* ligne `<Snippet source="./files/Dockerfile" />`. La
divergence était hypothétique, conditionnée à une réédition qui n'a pas lieu.

C'est une décision de **périmètre d'usage**, pas un désaccord technique : on accepte que le jour
où un article anglais serait réédité après traduction, cette classe de dérive redeviendrait
possible et silencieuse.

### Le filet gratuit, si l'idée revient

La section « À ne pas oublier » ci-dessus garde sa valeur **indépendamment** de tout ce qui
précède, et c'est le premier endroit où regarder en cas de réouverture :

`scripts/check-snippet-sources.mjs` (lancé par `yarn lint`) ne balaie que `blog/**` et
`.unpublished/**` — sa liste de globs ignore `i18n/`. L'étendre au corpus traduit coûte quelques
lignes, aucun appel API, et transforme la forme la plus grave du bug (un `source=` pointant vers
un fichier disparu) en échec de `yarn lint`. Ça ne dépend d'aucune passe de synchronisation et ça
resterait utile même dans le workflow actuel, comme garde-fou contre une réédition distraite.

### Distinction à ne pas perdre

Ne pas confondre ce TODO avec **0134**. 0122 traite d'une dérive **postérieure** à la traduction
(l'anglais bouge, le français reste) — c'est bien ce que le workflow élimine. 0134 traite d'une
infidélité **contemporaine** de la traduction (une négation inversée par le modèle au moment même
de traduire), qui est figée dès la première passe et qu'aucun workflow d'édition ne peut éviter.
Les deux se ressemblent de loin et n'ont pas du tout le même déclencheur. 0134 reste ouvert.
