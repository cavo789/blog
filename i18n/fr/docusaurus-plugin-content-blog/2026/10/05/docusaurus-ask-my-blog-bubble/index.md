---
slug: docusaurus-ask-my-blog-bubble
title: "La troisième porte : une bulle de chat flottante, et la fonctionnalité que personne ne trouvait"
authors: [christophe, claude]
image: /img/v2/ask-my-blog-chatbox.webp
series: Creating Docusaurus components
mainTag: component
tags: [docusaurus, react, component]
date: 2026-10-05
description: Une fonctionnalité que vos visiteurs ne trouvent pas n'existe pas. Cet article ajoute une bulle flottante « Ask my blog » à un site Docusaurus — un troisième point d'entrée vers le même index de questions, et le premier qui ne demande aucune connaissance préalable. Avec l'astuce d'exclusion mutuelle qui empêche deux dialogues flottants indépendants de s'ouvrir en même temps.
language: fr
ai_assisted: true
---

<!-- cspell:ignore maintag overlays -->

![La troisième porte : une bulle de chat flottante, et la fonctionnalité que personne ne trouvait](/img/v2/ask-my-blog-chatbox.webp)

<TLDR>
J'avais construit une carte du corpus, un index de 2 050 questions et une palette de commandes à six modes — puis j'ai remarqué que chaque accès à l'index de questions supposait de savoir qu'il existait. Cet article est la moitié bon marché de cette histoire : une bulle de chat flottante qui ouvre la recherche de questions depuis n'importe quelle page, et un indice de première visite qui mentionne le raccourci clavier une seule fois. Plus la petite astuce pub-sub qui garantit que deux dialogues flottants indépendants ne sont jamais ouverts en même temps.
</TLDR>

Il existe un embarras particulier, réservé aux gens qui construisent seuls. J'avais passé des semaines sur des fonctionnalités dont j'étais sincèrement fier : une <Link to="/blog/docusaurus-blog-map">carte interactive de tout le blog</Link>, un <Link to="/blog/docusaurus-ask-my-blog">index de questions</Link> généré par un modèle local, une <Link to="/blog/?q=docker">palette de commandes</Link> à six modes.

Puis je me suis posé une question plus simple que d'habitude : comment un lecteur qui n'est jamais venu ici trouverait-il l'index de questions ? Il y avait exactement deux portes d'entrée. Appuyer sur <kbd>Ctrl</kbd>+<kbd>K</kbd>, puis `?` pour basculer la palette en mode question — ce qui suppose de connaître à la fois le raccourci et l'existence du mode. Ou aller sur `/faq`, ce qui suppose de savoir que la page existe.

Les deux portes étaient ouvertes. Les deux ne fonctionnaient que pour quelqu'un qui avait déjà lu l'article les annonçant, c'est-à-dire : moi.

<!-- truncate -->

<QuickJump
  links={[
    { label: "Ce qui a changé", to: "#what-changed" },
    { label: "Construire la bulle", to: "#building-the-bubble" },
  ]}
/>

## Ce qui a changé {#what-changed}

Deux choses, dont aucune n'est une nouvelle fonctionnalité :

```plaintext
1. A floating bubble              2. A first-visit pill
   ┌────────────────┐               ┌─────────────────┐
   │ 🦫 Ask my blog │               │ Press ⌘K to     │
   ├────────────────┤               │ search      ✕   │
   │ [Ask a questi…]│               └─────────────────┘
   │  › How do I …  │                 once per browser,
   │  › What is …   │                 then never again
   └────────────────┘
     bottom-right, every page
```

La bulle est la plus intéressante, parce qu'elle est la **troisième** voie vers exactement le même index de questions : `Ctrl+K` puis `?`, la page autonome `/faq`, et maintenant un bouton en forme de chat qui suit le lecteur partout. Même corpus, même classement, mêmes résultats — trois portes.

## Pourquoi trois portes, ce n'est pas de la redondance {#why-three-doors-is-not-redundancy}

J'ai résisté à la bulle un moment, au motif que la palette faisait déjà le travail. C'était une erreur, et voici le raisonnement qui m'a fait changer d'avis :

- **Chaque porte sert un lecteur différent.** La palette sert ceux qui savent déjà qu'elle existe. `/faq` sert les moteurs de recherche et les gens qui veulent parcourir un sujet. La bulle sert le lecteur bloqué au milieu d'un article, qui n'aurait jamais l'idée d'appuyer sur un raccourci clavier.
- **Un bouton flottant est la seule affordance que tout le monde comprend déjà.** Personne n'a besoin qu'on lui explique ce que fait une bulle de chat dans un coin. C'est précisément pour ça qu'elle mérite un coin — et pourquoi l'en-tête du panneau arbore la même <Link to="/blog/docusaurus-easter-eggs">mascotte suricate</Link> qu'on retrouve partout ailleurs sur ce site.
- **Ça ne coûte presque rien à ajouter.** La bulle ne réimplémente pas la recherche — elle monte le composant de recherche existant dans un panneau. Environ 150 lignes, dont l'essentiel est de la gestion du focus.
- **La partie chère était déjà payée.** Le corpus de questions, le classement, le chargement paresseux : tout existait. Ajouter un point d'entrée à une fonctionnalité déjà construite est le travail au meilleur rapport effort/résultat, et c'est celui qu'on saute.

Ce raisonnement a une limite, et il vaut mieux l'énoncer avant d'aller ajouter une quatrième porte. Le test n'est pas « combien de points d'entrée puis-je caser ? » mais « celui-ci atteint-il un lecteur que les autres ratent ? ». J'avais aussi prévu une tuile en page d'accueil pointant vers la palette, et je l'ai abandonnée : la barre de navigation affiche déjà un champ de recherche visible en permanence, avec le raccourci imprimé dedans, sur chaque page. Trois portes pour trois lecteurs différents, oui. Trois rappels de la même porte, non.

## Construire la bulle {#building-the-bubble}

Le composant est volontairement mince. Quand le panneau est fermé, rien de lié à la recherche n'est monté — le corpus de questions de 468 Ko n'est donc téléchargé que par un lecteur qui l'ouvre vraiment :

<ProjectSetup folderName="src/components/AskMyBlogWidget">
  <Snippet filename="src/components/AskMyBlogWidget/index.tsx" source="src/components/AskMyBlogWidget/index.tsx" defaultOpen={false} />
  <Snippet filename="src/components/AskMyBlogWidget/styles.module.css" source="src/components/AskMyBlogWidget/styles.module.css" defaultOpen={false} />
</ProjectSetup>

Il est monté une fois par page, dans le même swizzle `Layout` qui monte la palette :

```javascript title="src/theme/Layout/index.js"
export default function LayoutWrapper(props) {
  return (
    <Layout {...props}>
      {props.children}
      <CommandPalette />
      <CommandPaletteHint />
      <AskMyBlogWidget />
    </Layout>
  );
}
```

Une décision de mise en page à copier : la bulle réserve un **emplacement fixe empilé au-dessus** du coin occupé par le <Link to="/blog/docusaurus-go-top">bouton de retour en haut</Link>, plutôt que de détecter la présence de ce bouton à l'exécution. Le retour en haut n'est pas monté sur toutes les pages, et un peu d'espace vide au-dessus quand il est absent est totalement inoffensif — bien plus inoffensif que deux boutons flottants se disputant les mêmes 60 pixels.

## Le problème des deux overlays {#the-two-overlays-problem}

La palette et le panneau de la bulle sont des dialogues flottants indépendants, chacun ouvrable depuis plusieurs endroits, et aucun ne sait que l'autre existe. Ouvrez l'un pendant que l'autre est ouvert et vous obtenez deux modales empilées, deux pièges de focus qui se battent, et deux gestionnaires <kbd>Esc</kbd>.

La correction tient en huit lignes, et elle vit dans le module de bus de la palette — comme ça, aucun composant n'a besoin d'importer l'autre :

```typescript title="src/components/CommandPalette/paletteBus.ts"
let activeCloser = null;

export function setActiveOverlay(closeFn) {
  if (activeCloser && activeCloser !== closeFn) activeCloser();
  activeCloser = closeFn;
  return () => {
    if (activeCloser === closeFn) activeCloser = null;
  };
}
```

Chaque dialogue appelle `setActiveOverlay(close)` à son ouverture, et appelle la fonction de nettoyage qu'il récupère à sa fermeture. Celui qui s'ouvre en second ferme celui qui était ouvert en premier. Ajouter un troisième overlay plus tard ne demande de changer absolument rien.

## Un indice autorisé à apparaître une seule fois (passez si vous ne voulez que la bulle) {#a-hint-that-is-allowed-to-appear-exactly-once-skip-this-if-you-just-want-the-bubble}

La pastille de la palette et l'anneau pulsant de la bulle sont des indices de première visite, et tous deux suivent les trois mêmes règles :

- Le flag `localStorage` est écrit **quand l'indice est affiché**, pas quand il est fermé. Un visiteur qui l'ignore ne le revoit pas à la page suivante.
- Les délais sont décalés — la pastille de la palette à 4 ou 10 secondes, le pulse de la bulle à 15 — pour que les deux ne s'animent jamais ensemble et ne passent pas pour un pop-up.
- L'anneau pulsant est entièrement supprimé sous `prefers-reduced-motion`, pas seulement ralenti.

Le délai de la palette est volontairement différent selon le type de page, et la raison mérite d'être dite : 10 secondes sur un article, pour que la pastille n'interrompe jamais quelqu'un qui vient de commencer à lire. La page d'accueil n'a aucune lecture à interrompre et c'est là que les visiteurs rebondissent le plus vite, donc elle a 4 secondes — assez long pour ne pas ressembler à un pop-up au chargement.

```typescript title="src/components/CommandPalette/Hint.tsx"
function delayFor(pathname) {
  if (HOME_PATH.test(pathname)) return HOME_DELAY_MS;
  if (ARTICLE_PATH.test(pathname)) return ARTICLE_DELAY_MS;
  return null;
}
```

Renvoyer `null` — plutôt qu'un grand nombre — fait de « ce chemin n'affiche rien » un état distinct et lisible, au lieu d'un délai qu'il faut déchiffrer en plissant les yeux.

## Conclusion {#conclusion}

Les fonctionnalités de cette série ont pris des semaines. Les rendre trouvables a pris un après-midi, et il est tout à fait possible que cet après-midi ait compté davantage.

Il y a un mode d'échec propre à la construction de ses propres outils : vous êtes le seul utilisateur incapable d'évaluer la découvrabilité, parce que vous ne pouvez pas désapprendre où se trouvent les choses. De l'intérieur, chaque porte paraît évidente. Le seul remède que j'ai trouvé est mécanique : listez les points d'entrée d'une fonctionnalité, et pour chacun, notez ce que le lecteur doit déjà savoir pour l'utiliser. Tout ce dont la réponse est « que cette fonctionnalité existe » n'est pas un point d'entrée du tout.

Et en cas de doute, mettez un bouton dans le coin. Tout le monde sait ce qu'il fait.
