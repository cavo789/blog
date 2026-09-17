---
slug: docusaurus-easter-eggs
title: "Espiègleries de suricate : semer des easter eggs partout sur mon blog"
authors: [christophe, claude]
image: /img/v2/easter_eggs.webp
series: Creating Docusaurus components
mainTag: docusaurus
tags: [docusaurus, react, component]
date: 2026-07-13
description: "Tour d'horizon de huit petits easter eggs à découvrir sur ce blog Docusaurus — un suricate en ASCII art caché dans le source de la page, un sprite lancé par le code Konami, un clin d'œil en console.log, un changement de favicon quand on quitte l'onglet, des messages 404 aléatoires, un commentaire caché dans le sitemap et plus encore — ainsi que les vrais bugs (répétition de touche, incompatibilité clavier AZERTY, mauvais emoji, race condition dans postBuild, favicon flou) débusqués en chemin."
ai_assisted: true
language: fr
blueskyRecordKey: 3mqj3hvs7cc2z
---

![Espiègleries de suricate : semer des easter eggs partout sur mon blog](/img/v2/easter_eggs.webp)

<!-- cspell:ignore Konami konami keydown postBuild urlset avonture nginx meerkats KONAMI AZERTY azerty -->

<TLDR>
Au-delà de la mascotte suricate déjà visible sur ce blog, celui-ci cache huit petits easter eggs volontairement trouvables : un suricate en ASCII art posé directement dans le source de la page, un clin d'œil en `console.log`, des messages 404 aléatoires, un sprite lancé par le code Konami, un changement de titre et de favicon quand on quitte l'onglet, un en-tête HTTP `X-Powered-By`, une feuille de style d'impression et un commentaire caché dans `sitemap.xml`. Cet article les passe tous en revue avec le code source réel et — plus utile encore — les vrais bugs que nous avons livrés puis corrigés en chemin : une race condition de répétition de touche dans le handler Konami, une incompatibilité clavier AZERTY trouvée par un vrai utilisateur (pas par nos tests), un mauvais codepoint d'emoji, un piège de concurrence dans le `postBuild` de Docusaurus, et un favicon illisible jusqu'à ce qu'on en redessine le cadrage.
</TLDR>

Vous savez déjà que ce site a une mascotte : un suricate qui apparaît sur la page 404, chevauche le bouton « remonter en haut » et se cache dans un [commentaire HTML en ASCII art](/blog/docusaurus-ascii-art) sur chaque page. C'est ce dernier qui m'a fait réfléchir : si un commentaire dans le source de la page est amusant, sur quoi d'autre un visiteur curieux pourrait-il tomber ?

Alors, ce week-end, je me suis posé — et j'ai posé à <Link to="/blog/claude-ia-spare-tokens">Claude Code</Link> — une question simple : jusqu'où peut-on aller sans que ça devienne pénible ? La réponse a donné huit petits easter eggs — le commentaire en ASCII art revu en détail, plus sept nouveautés — chacun suivant la même règle : **si vous ne le cherchez pas, vous ne le verrez jamais.** Pas de pop-up, pas de confettis au chargement, rien qui gêne la lecture. Juste de discrètes récompenses pour les curieux.

<!-- truncate -->

<AlertBox variant="note" title="La règle unique derrière tout ça">
Chaque easter egg de cette liste vit dans la console, le source, les en-têtes de réponse, ou dans un état que le visiteur doit déclencher volontairement (quitter l'onglet, imprimer une page, taper un code secret). Aucun n'apparaît jamais dans le flux de lecture normal.
</AlertBox>

## 1. Celui par lequel tout a commencé : un suricate en ASCII art dans le source de la page {#1-the-one-that-started-it-all-an-ascii-art-meerkat-in-the-page-source}

C'est l'easter egg qui a inspiré tous les autres, il mérite donc la première place. Appuyez sur <kbd>CTRL</kbd>+<kbd>U</kbd> sur n'importe quelle page de ce blog — ou faites un clic droit et choisissez « Afficher le code source de la page » — et juste après la ligne d'ouverture `<!doctype html>`, avant qu'un seul pixel visible n'ait été décrit, vous trouverez un suricate dessiné entièrement en caractères ASCII, à l'intérieur d'un commentaire HTML :

<BrowserWindow url="view-source:https://www.avonture.be/blog/ripgrep/">
  ![CTRL-U - Afficher le source](/img/v2/suricate_ctrl_u.webp)
</BrowserWindow>

Il est invisible dans la page rendue — un commentaire HTML n'atteint jamais l'écran — et ne coûte pas un octet de mise en page ni une ligne de markup visible. C'est purement une récompense pour qui est assez curieux pour regarder la réponse brute.

Sous le capot, un petit plugin `postBuild` (`plugins/ascii-injector/index.mjs`) parcourt chaque fichier HTML généré après la fin de `yarn docusaurus build` et insère le contenu de `src/data/banner.txt` sous forme de commentaire juste après la balise `<!doctype html>`. *Le plugin lui-même est construit pas à pas dans <Link to="/blog/docusaurus-ascii-art">Inject ASCII Art in any HTML pages rendered by Docusaurus</Link>, et la bannière provient du même générateur que celui de <Link to="/blog/bash-ascii-art">Bash - ASCII art</Link> :*

<Terminal title="user@machine: ~/blog">
$ yarn docusaurus build
$ grep -A2 doctype build/index.html
&lt;!doctype html&gt;
&lt;!--
</Terminal>

<AlertBox variant="info" title="Déjà traité en détail">
Celui-ci a son propre article dédié — [Inject ASCII Art in any HTML pages rendered by Docusaurus](/blog/docusaurus-ascii-art) — avec le source complet du plugin, comment convertir votre propre logo en ASCII art, et une réserve propre au `postBuild` (il n'apparaîtra pas pendant un `yarn start` en mode dev, uniquement sur un vrai build). Nous n'allons pas tout répéter ici ; cette entrée existe surtout pour que l'easter egg ait sa juste place dans cette liste.
</AlertBox>

## 2. Un clin d'œil en console.log pour les visiteurs des DevTools {#2-a-consolelog-wink-for-devtools-visitors}

Le plus facile. Si vous ouvrez la console des DevTools de votre navigateur sur ce blog, vous verrez ceci :

<Snippet filename="src/theme/Root.js (excerpt)" source="./files/root-console-egg.js" />

Rien de sophistiqué : un appel `console.log` stylé (la directive `%c` permet d'appliquer du CSS à la sortie console) déclenché une fois par chargement complet de page. Il sert aussi d'indice, en orientant les lecteurs curieux vers le code Konami ci-dessous.

![Console.log()](./images/console_log.webp)

<AlertBox variant="tip" title="Pourquoi useEffect(..., [])">
Un tableau de dépendances vide signifie que cet effet s'exécute une fois, au montage du composant — pas à chaque changement de route côté client. Comme `Root` englobe toute l'application et survit à la navigation entre pages, c'est le bon endroit pour un easter egg « une fois par visite ».
</AlertBox>

## 3. Une page 404 avec le sens de l'humour {#3-a-404-page-with-a-sense-of-humor}

La page 404 affichait déjà une illustration de suricate et un message. Nous avons transformé le message en un petit pool de cinq, tiré au hasard à chaque chargement :

<Snippet filename="src/theme/NotFound/index.js" source="src/theme/NotFound/index.js" defaultOpen={false} />

`useState(() => …)` avec un initialiseur sous forme de fonction garantit que le tirage aléatoire se fait exactement une fois par montage, pas à chaque re-rendu — important ici puisque `NotFound` n'a pas besoin de retirer un message pendant que l'utilisateur le lit.

{/* Volontairement une balise <a> brute et non un lien Markdown : cette URL doit rester
    morte pour que la démo fonctionne, et le vérificateur de liens cassés de Docusaurus
    (`onBrokenLinks`) ne collecte que les éléments <Link> — ce en quoi un lien Markdown
    est compilé. Écrit sous la forme `[…](…)`, il ferait échouer chaque build. */}

Essayez : cliquez sur ce lien <a href="/blog/inexisting_page">inexisting_page</a> puis appuyez sur <kbd>F5</kbd> pour obtenir un message aléatoire.

## 4. La vedette du spectacle : un easter egg au code Konami {#4-the-star-of-the-show-a-konami-code-easter-egg}

Tapez `↑ ↑ ↓ ↓ ← → ← → B A` n'importe où sur ce site (hors champ de saisie) et un suricate traverse votre écran en courant. C'est celui qui mérite le plus de détails, parce que c'est aussi celui qui nous a le plus appris.

Voici notre suricate courant ; essayez !

![Suricate courant](./images/konami.webp)

Envie d'en savoir plus sur le code Konami ? Consultez [cette page](https://en.wikipedia.org/wiki/Konami_Code) sur Wikipédia.

### Le composant {#the-component}

<Snippet filename="src/components/KonamiEasterEgg/index.tsx" source="src/components/KonamiEasterEgg/index.tsx" />

La logique conserve un curseur `useRef` dans un tableau `KONAMI_CODE` de valeurs [`KeyboardEvent.code`](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/code) (pas `.key` — `.code` reflète la position physique de la touche, donc la séquence fonctionne pareil sur un clavier AZERTY et sur un QWERTY). Chaque keydown fait avancer le curseur, le remet à zéro, ou — en cas de correspondance complète — monte une `<img>` de coureur pendant 3 secondes :

<Snippet filename="src/components/KonamiEasterEgg/styles.module.css" source="src/components/KonamiEasterEgg/styles.module.css" defaultOpen={false} />

Il est monté une seule fois, globalement, depuis `src/theme/Root.js` :

```jsx title="src/theme/Root.js (excerpt)"
import KonamiEasterEgg from '@site/src/components/KonamiEasterEgg';

// ...

return (
  <>
    {children}
    <KonamiEasterEgg />
  </>
);
```

<AlertBox variant="tip" title="Essayez tout de suite">
Sérieusement — cliquez n'importe où sur cette page pour lui donner le focus, puis tapez `↑ ↑ ↓ ↓ ← → ← → B A`. Ce composant exact tourne sur la page que vous lisez.
</AlertBox>

### Le bug qui a failli tuer le plaisir {#the-bug-that-nearly-killed-the-fun}

Après la mise en ligne, les tests en conditions réelles ont révélé un vrai bug : tapée lentement et posément, la séquence ne se déclenchait parfois... pas du tout. La cause : la répétition automatique. Maintenez `ArrowUp` une fraction de seconde de trop — ce qui est très naturel quand on se remémore soigneusement une séquence — et le navigateur émet plusieurs événements `keydown` avec `repeat: true` avant que vous ne relâchiez la touche. Comme la séquence a besoin de `ArrowUp` **deux fois d'affilée**, un appui maintenu peut injecter un événement `ArrowUp` supplémentaire au moment précis où le handler attend `ArrowDown`, réinitialisant tout en silence.

Le correctif tient en une clause de garde :

```jsx title="src/components/KonamiEasterEgg/index.tsx (excerpt)"
const handleKeyDown = (event) => {
  // Ignore auto-repeated keydowns fired while a key is held down: a
  // slightly-too-long "ArrowUp" press would otherwise inject extra
  // events and break a sequence that has two of the same key in a row.
  if (event.repeat) return;

  // ...
};
```

Nous avons vérifié le correctif avec [Playwright](https://playwright.dev/) plutôt qu'à l'œil — en envoyant un `keydown` synthétique avec `repeat: true`, nous avons confirmé que le handler l'ignore désormais, et une exécution complète de la séquence en appuis brefs déclenche toujours l'animation. Si votre easter egg (ou n'importe quel raccourci clavier, en fait) implique deux touches identiques à la suite, ne sautez pas cette vérification.

### Le bug qu'un vrai utilisateur a trouvé et que les tests automatisés ont raté {#the-bug-a-real-user-found-that-automated-testing-missed}

Le correctif de répétition de touche était livré, les tests étaient au vert — et la fonctionnalité ne marchait toujours pas pour un vrai visiteur. Le signalement : « J'essaie la combinaison mais rien ne se passe. » La cause venait du clavier, pas du code : sur un clavier AZERTY belge, la touche physique marquée **A** se trouve exactement là où un clavier QWERTY a **Q** (et inversement). L'implémentation d'origine comparait [`event.code`](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/code), qui rapporte la *position physique* de la touche sur une disposition QWERTY de référence — donc appuyer sur la touche marquée « A » d'un clavier AZERTY produisait `code: 'KeyQ'`, pas `'KeyA'`. Le diagnostic de l'utilisateur lui-même a tapé dans le mille : taper ce qui ressemblait à « B, Q » sur son clavier fonctionnait, parce que cette position physique correspond à `KeyA`.

Le correctif consiste à comparer [`event.key`](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key) à la place — le caractère réellement produit, qui respecte la disposition configurée par le visiteur :

```jsx title="src/components/KonamiEasterEgg/index.tsx (excerpt)"
// event.code reflects the physical key position on a QWERTY reference
// layout, so on an AZERTY keyboard the key printed "A" reports 'KeyQ'.
// event.key reflects the actual character produced, which matches what
// players see printed on their own keycaps regardless of layout.
const normalizeKey = (key) => (key.length === 1 ? key.toLowerCase() : key);

// ...

const key = normalizeKey(event.key);
if (key === expectedKey) { /* ... */ }
```

Les touches fléchées n'ont jamais été affectées — `ArrowUp`, `ArrowDown`, `ArrowLeft`, `ArrowRight` sont des chaînes identiques pour `.code` et `.key` sur toutes les dispositions. Le bug ne touchait que les deux lettres à la fin de la séquence, et uniquement pour les [15–20 % de claviers dans le monde](https://en.wikipedia.org/wiki/Keyboard_layout) qui ne sont pas QWERTY.

<AlertBox variant="important" title="Leçon">
Notre test Playwright a attrapé la régression de répétition de touche parce qu'il envoyait de vrais événements séquentiels — mais il n'a jamais attrapé le bug de disposition, parce que le clavier virtuel de Playwright est en QWERTY par défaut. Les tests automatisés valident la logique que vous avez pensé à tester ; ils ne remplacent pas un humain avec un matériel différent. Si une fonctionnalité implique une saisie au clavier, `.key` est presque toujours le bon choix face à `.code` — réservez `.code` aux cas où vous voulez délibérément la position physique de la touche (les commandes de déplacement dans un jeu, par exemple, où ZQSD/WASD doit rester au même endroit physique quelle que soit la disposition).
</AlertBox>

## 5. Easter egg de changement d'onglet : titre et favicon {#5-tab-away-easter-egg-title-and-favicon-swap}

Quittez cet onglet puis revenez — le titre devient « Come back, the meerkat is on watch! 👀 » et le favicon se transforme en suricate assoupi. Les deux reviennent à la normale dès que l'onglet reprend le focus :

![Onglet inactif](./images/inactive_tab.webp)

<Snippet filename="src/theme/Root.js (excerpt)" source="./files/root-titlebar-egg.js" />

L'événement `visibilitychange` et `document.hidden` sont la manière standard de détecter ça — pas besoin de polling. `useBaseUrl` (un hook Docusaurus) résout correctement le chemin du favicon quelle que soit l'URL de base configurée du site, le même helper utilisé ailleurs sur ce site pour les sources d'images.

## 6. Un clin d'œil dans les en-têtes HTTP {#6-a-wink-in-the-http-headers}

Celui-ci est invisible sauf si vous regardez l'onglet Network ou lancez `curl -I`. Il vit dans `nginx.conf`, en plein dans le bloc serveur HTTPS :

<Snippet filename="nginx.conf" source="nginx.conf" defaultOpen={false} />

`add_header X-Powered-By "Meerkat-Sentry/1.0" always;` — un petit en-tête inoffensif pour qui inspecte les en-têtes de réponse par habitude.

## 7. Easter egg dans la feuille de style d'impression {#7-print-stylesheet-easter-egg}

Imprimez un article (`Ctrl+P`) et une petite note de bas de page apparaît sur la page imprimée :

<Snippet filename="src/css/custom.css (excerpt)" source="./files/print-easter-egg.css" defaultOpen={false} />

`@media print` n'applique ses règles que lorsque le navigateur génère un aperçu avant impression ou une impression réelle — c'est invisible en navigation normale, et c'est exactement le but.

## 8. Sitemap.xml reçoit aussi son commentaire {#8-sitemapxml-gets-a-comment-too}

Le moins susceptible d'être trouvé un jour, et celui qui a produit le bug le plus intéressant. L'idée : glisser un petit commentaire XML comme premier enfant de `<urlset>` dans le `sitemap.xml` généré. Un commentaire à cet endroit est du XML valide et ignoré par tous les parseurs de sitemap et crawlers, il ne peut donc pas casser l'indexation.

<Snippet filename="plugins/sitemap-easter-egg/index.mjs" source="plugins/sitemap-easter-egg/index.mjs" />

Enregistré de la même façon que l'[injecteur d'ASCII art](/blog/docusaurus-ascii-art) :

<Snippet filename="docusaurus.config.js (excerpt)" source="./files/docusaurus.config.js" defaultOpen={false} />

## Le résultat final {#what-we-ended-up-with}

<StepsCard
  variant="remember"
  title="Les huit easter eggs"
  steps={[
    "**Suricate en ASCII art** — caché dans le source de la page, juste après `<!doctype html>`",
    "**Clin d'œil console.log** — un message stylé pour qui a les DevTools ouverts",
    "**Messages 404 tournants** — cinq variantes aléatoires aux couleurs de la mascotte",
    "**Code Konami** — `↑ ↑ ↓ ↓ ← → ← → B A` lance un suricate à travers l'écran",
    "**Changement à la sortie d'onglet** — titre et favicon changent quand l'onglet est masqué, et reviennent au retour",
    "**En-tête X-Powered-By** — un clin d'œil dans les en-têtes de réponse HTTP",
    "**Feuille de style d'impression** — une petite note de bas de page sur les pages imprimées",
    "**Commentaire dans sitemap.xml** — un commentaire caché et valide XML comme premier enfant de `<urlset>`",
  ]}
/>

Aucun de ces éléments ne change la façon dont un lecteur lit un article. C'était tout l'objectif — le travail d'un blog reste d'être lu, pas de faire des tours de magie à la figure du lecteur. Mais pour les développeurs, les crawlers, les curieux des DevTools et les gens qui impriment vraiment des articles ou inspectent les en-têtes de réponse, il y a désormais un peu plus de personnalité cachée juste sous la surface. Sympa, non ?

Cette liste s'est depuis agrandie d'une unité : chaque easter egg ci-dessus suppose un clavier ou un panneau DevTools ouvert, ce qui ne sert à rien à quelqu'un qui lit sur son téléphone — alors <Link to="/blog/docusaurus-shake-easter-egg">secouer le téléphone</Link> fait maintenant sursauter la mascotte en plein écran pendant quelques secondes, sans le moindre clavier.

Si vous gérez votre propre blog Docusaurus et que vous avez une mascotte, un logo, ou même juste une couleur préférée : piochez-en un ou deux — ils sont tous petits, autonomes, et aucun ne demande de toucher à votre contenu. Commencez par celui qui correspond à l'endroit où vos lecteurs se trouvent déjà (la console DevTools si votre audience est composée de développeurs, les en-têtes HTTP si ce sont d'autres blogueurs qui aiment fouiller, le CSS d'impression si les gens impriment vos recettes ou tutoriels) et développez à partir de là.
