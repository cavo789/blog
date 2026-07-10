# 041 — LatestPosts duplique le rendu de PostCard et imbrique un lien factice dans un vrai lien

**Priority:** Medium

## Problème

`Blog/LatestPosts/index.js` ne réutilise pas `PostCard` : il réassemble sa propre card à la main
(`Card` + `CardImage` + `CardBody`, titre, description, date, badge de tag), créant une **3ᵉ
variante de card** en plus des layouts `"big"`/`"small"` de `PostCard`. Conséquence déjà visible
dans l'historique : `DONE_028` (badge de tag) et `DONE_032` (temps de lecture) ont dû patcher
`PostCard` **et** `LatestPosts` séparément pour la même fonctionnalité visuelle.

Second problème, plus grave, dans ce même fichier : toute la card est enveloppée dans un
`<Link to={post.permalink}>` (donc un `<a>`), et **à l'intérieur**, le badge de tag est un
`<span role="link" tabIndex={0} onClick={...} onKeyDown={...}>` qui simule un second lien vers
`/tags/:tag` via `window.location.href`. Un élément interactif (span focusable en rôle "link")
imbriqué dans un `<a>` est invalide en HTML et pose un vrai problème d'accessibilité (deux cibles
de clic superposées, comportement clavier ambigu — Tab s'arrête sur le span mais Entrée ne
l'active pas, seul un souci mineur de plus s'ajoutant à Space qui ne déclenche pas onClick pour un
`role="link"`, contrairement à `role="button"`).

## Risque

Toute évolution du rendu des cards (nouveau champ, changement de style) doit être répercutée dans
2 à 3 endroits différents sans garantie de cohérence. Le badge de tag est inaccessible au clavier
(Enter ne déclenche pas l'action pour un `role="link"` avec `onKeyDown` qui ne teste que `"Enter"`
— ce qui est correct pour link, mais le vrai souci est le clic navigateur : clic molette /
Ctrl+clic pour ouvrir dans un nouvel onglet ne fonctionne pas puisque ce n'est pas un vrai `<a
href>`).

## Solution proposée

1. Faire évoluer `PostCard` pour supporter un badge de tag optionnel (déjà fait ailleurs via
   `mainTag`, cf. `DONE_028`) et remplacer l'implémentation de `LatestPosts` par
   `<PostCard post={post} layout="big" />`, en supprimant la duplication.
2. Restructurer pour ne plus imbriquer d'élément interactif dans le `<Link>` global : soit ne pas
   envelopper toute la card d'un lien global (mettre le lien uniquement sur le titre, comme le
   fait déjà `PostCard` "big" layout via `cardTitleLink`), soit sortir le badge de tag hors de la
   zone cliquable.

## Lien avec l'existant

Étend `DONE_028` et `DONE_032`, qui ont patché le symptôme sans traiter la cause (duplication).

## Follow-up (2026-07-09)

`src/theme/BlogListPage/index.js` (la page `/blog`, cible originale de `DONE_028`/`DONE_032`)
avait exactement le même bug : card entière dans un `<a href>`, badge de tag en
`<span role="link" onClick={...}>` imbriqué dedans, URL de tag cassée (`/tags/:tag` au lieu de
`/blog/tags/:slug`). C'était en fait une **4ᵉ variante de card**, pas seulement 3. Corrigé de la
même façon : `PostCard` supporte maintenant aussi `readingTime` (repris depuis `DONE_032`), et
`BlogListPage` réutilise `<PostCard post={post} layout="big" />` au lieu de son propre markup.
Vérifié en conditions réelles (Playwright headless) : `/blog` affiche toujours "date · X min read"
et le badge de tag pointe vers `/blog/tags/{slug}` en tant que vrai `<a>` focusable.
