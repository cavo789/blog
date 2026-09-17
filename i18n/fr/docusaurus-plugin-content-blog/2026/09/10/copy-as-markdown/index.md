---
slug: docusaurus-copy-as-markdown
title: Ajouter un bouton « Copy as Markdown » à votre blog Docusaurus
authors: [christophe]
image: /img/v2/copy-as-markdown.webp
series: Creating Docusaurus components
mainTag: component
tags: [docusaurus, markdown, react, component]
date: 2026-09-10
description: Créez un bouton « Copy as Markdown » et un lien « View raw » pour les articles de votre blog Docusaurus — un plugin exécuté au build qui écrit un miroir en Markdown pur à côté de chaque article, plus le petit composant React qui le récupère et le copie dans le presse-papiers. Code source complet inclus.
language: fr
ai_assisted: true
---
![Ajouter un bouton « Copy as Markdown » à votre blog Docusaurus](/img/v2/copy-as-markdown.webp)

<TLDR>
Ce guide ajoute un bouton « Copy as Markdown » et un lien « View raw » à chaque article d'un blog Docusaurus. Deux petites pièces suffisent : un plugin exécuté au build qui écrit un miroir en Markdown pur à côté de la page HTML de chaque article (`/blog/my-post` → `/blog/my-post.md`), et un composant React qui récupère ce miroir et le copie dans le presse-papiers. Pas de serveur, pas de base de données, environ 90 lignes de code au total — et les lecteurs, ou le LLM dans lequel ils collent l'URL, obtiennent le texte intégral de l'article sans React, sans JSX, et sans les accordéons repliés que la page HTML masque par défaut.
</TLDR>

Chaque fois que je veux coller un de mes propres articles dans un LLM pour lui poser une question, je passe par le même rituel agaçant : ouvrir la page, tout sélectionner, copier, coller, puis passer une minute à supprimer le menu de navigation, le widget « Was this helpful? » et une demi-douzaine de libellés d'interface venus avec le reste. Le vrai contenu de l'article — la partie que je voulais — est enfoui là-dedans quelque part.

La source d'un article de blog est *déjà* du Markdown. Il n'y a aucune raison qu'un lecteur doive se battre avec le HTML rendu pour la récupérer.

J'ai donc construit un petit bouton « Copy as Markdown » placé directement dans l'en-tête de l'article : un clic, et la source en texte brut arrive dans le presse-papiers, prête à être collée n'importe où. Cet article parcourt les deux pièces nécessaires pour le reproduire — un générateur de miroir au build et le bouton lui-même — avec le code source réel et actuel du bouton.

<!-- truncate -->

<QuickJump
  links={[
    { label: "Ce qui est copié", to: "#what-gets-copied" },
    { label: "Tous les fichiers en un coup d'œil", to: "#all-files-at-a-glance" },
  ]}
/>

## Ce qui est copié {#what-gets-copied}

Voici le fichier que le bouton récupère réellement, produit par une étape `postBuild` que vous écrirez dans un instant — c'est le texte littéral qui arrive dans le presse-papiers quand un lecteur clique sur le bouton :

<Terminal source="./files/terminal_demo.txt" typewriter />

Même la balise `<TLDR>` survit intacte — suffisant pour qu'un humain parcoure le texte ou qu'un LLM l'analyse. Remarquez aussi le commentaire HTML tout en haut : c'est ainsi que le miroir renvoie vers la vraie page entièrement rendue.

## Pourquoi il n'y a que deux pièces mobiles {#why-its-just-two-moving-parts}

- Un bouton React qui récupère une URL dérivée du permalien de la page courante et copie le texte renvoyé — il n'a aucune idée de ce que « Markdown » veut dire.
- Une étape de build qui fait en sorte que cette URL réponde vraiment quelque chose qui vaille la peine d'être copié : un fichier en texte brut par article, posé tranquillement à côté de la page HTML qu'il reflète.
- Comme les deux ne communiquent qu'à travers une simple URL, l'un ou l'autre peut être remplacé indépendamment plus tard — un générateur de miroir plus intelligent, un bouton plus élaboré — sans toucher à l'autre fichier.
- Un miroir manquant (mauvais build, serveur de dev, faute de frappe dans l'URL) se dégrade en un message clair « Could not copy » plutôt qu'en un échec silencieux ou un crash.

## Étape 1 — Générer un miroir en Markdown pur au build {#step-1--generate-a-plain-markdown-mirror-at-build-time}

Le bouton n'est que la moitié de l'histoire : sans fichier `.md` à récupérer, il finit toujours dans l'état « Could not copy ». Ce fichier doit exister *avant* que le bouton soit utile, donc construisez-le d'abord.

Créez `plugins/markdown-mirror-plugin/index.cjs` :

<Snippet filename="plugins/markdown-mirror-plugin/index.cjs" source="./files/markdown-mirror-plugin.cjs" defaultOpen={false} />

Quatre points méritent d'être soulignés :

```javascript title="plugins/markdown-mirror-plugin/index.cjs"
function buildMetadataComment(url, buildDate) {
  return [
    "<!--",
    `  canonical-url: ${url}`,
    `  generated-at:  ${buildDate}`,
    "  This is a static plain-Markdown mirror generated at build time.",
    "  Visit the canonical URL above for the fully rendered page, with images and interactive components.",
    "-->",
    "",
  ].join("\n");
}
```

C'est la pièce qui répond à une question que tout miroir en texte brut finit par soulever : *d'où vient ce fichier ?* Un commentaire HTML est le bon contenant pour ça — invisible dès que le fichier est collé dans quelque chose qui rend vraiment le Markdown (Notion, Obsidian, une zone de commentaire GitHub), mais toujours en texte brut dans une vue brute ou dans ce qu'on donne à un LLM, si bien que l'URL survit exactement là où un lecteur ayant perdu la trace de la page d'origine en a besoin. `generated-at` utilise un seul horodatage partagé par tous les miroirs de l'exécution (calculé une fois dans `postBuild`, pas par fichier), ce qui reflète « ce build » et non « cette milliseconde ».

```javascript title="plugins/markdown-mirror-plugin/index.cjs"
async postBuild({ siteDir, outDir, siteConfig, routesPaths }) {
```

`postBuild` est un [lifecycle hook](https://docusaurus.io/docs/api/plugin-methods/lifecycle-apis#postBuild) Docusaurus — il se déclenche une seule fois, après que `yarn build` a fini d'écrire le HTML, et jamais pendant `yarn start`. C'est exactement le bon moment : le miroir n'a besoin d'exister qu'en production. `siteConfig.url` est ce qui transforme un permalien nu en URL absolue dont le commentaire ci-dessus a besoin.

```javascript title="plugins/markdown-mirror-plugin/index.cjs"
if (!knownRoutes.has(permalink)) continue;
```

`routesPaths` est la liste des URLs que Docusaurus lui-même a décidé de publier. La recouper — au lieu de réimplémenter à la main la logique « cet article est-il un brouillon ? » — est ce qui fait que les articles en `draft: true` disparaissent du miroir gratuitement.

```javascript title="plugins/markdown-mirror-plugin/index.cjs"
const content = body.replace("<!-- truncate -->\n", "").trim() + "\n";
const markdown = buildMetadataComment(url, buildDate) + content;
```

Le bloc de frontmatter est retiré par le package `front-matter` avant même que cette ligne s'exécute ; le `replace` ici ne supprime que le marqueur `<!-- truncate -->`, qui n'a aucun sens en dehors de la logique de découpage des résumés propre à Docusaurus. Le commentaire de métadonnées vu plus haut est ajouté en dernier, juste avant l'écriture du fichier.

Branchez-le dans votre configuration :

```javascript title="docusaurus.config.js"
const config = {
  // ...
  plugins: ["./plugins/markdown-mirror-plugin/index.cjs"],
};
```

<AlertBox variant="tip" title="front-matter est un petit package sans dépendances">
  `npm install front-matter` si votre projet ne l'a pas déjà — c'est un parseur de frontmatter YAML à usage unique, pas une chaîne d'outils Markdown complète.
</AlertBox>

<AlertBox variant="note" title="Cette version est volontairement simple">
  Elle recopie votre source Markdown telle quelle, donc tout composant MDX personnalisé (un `<TLDR>`, une `<Card>`, vos propres widgets) apparaît dans le miroir sous forme de texte JSX brut plutôt qu'en équivalent Markdown. Pour une poignée de composants, c'est parfaitement lisible, comme le montre le miroir ci-dessus. Si votre blog s'appuie sur des dizaines de composants personnalisés comme celui-ci, voyez « Sous le capot » plus bas pour ce qu'une version plus complète doit gérer.
</AlertBox>

## Étape 2 — Le composant CopyAsMarkdown {#step-2--the-copyasmarkdown-component}

Voici le code source réel et actuel qui tourne sur ce blog — pas un extrait simplifié :

<Snippet filename="src/components/CopyAsMarkdown/index.tsx" source="src/components/CopyAsMarkdown/index.tsx" defaultOpen={false} />

### 2.1 — L'état et l'URL dérivée {#21--state-and-the-derived-url}

```javascript title="src/components/CopyAsMarkdown/index.tsx"
const [status, setStatus] = useState("idle"); // idle | copying | copied | error
const mdUrl = `${metadata.permalink.replace(/\/$/, "")}.md`;
```

`status` est une petite machine à quatre états qui pilote tout ce que le bouton affiche. `mdUrl` retire le slash final éventuel du permalien de l'article et ajoute `.md` — ce qui correspond exactement à ce que le plugin de l'étape 1 écrit sur le disque.

### 2.2 — Le gestionnaire de copie {#22--the-copy-handler}

```javascript title="src/components/CopyAsMarkdown/index.tsx"
const handleCopy = useCallback(async () => {
  setStatus("copying");
  try {
    const res = await fetch(mdUrl);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();
    await navigator.clipboard.writeText(text);
    setStatus("copied");
  } catch (err) {
    console.error("CopyAsMarkdown: failed to copy", err);
    setStatus("error");
  }
}, [mdUrl]);
```

Un `fetch` pour le miroir, un `writeText` vers le presse-papiers, et un seul `catch` autour des deux. Ce bloc `catch` fait double emploi : il attrape un miroir manquant (404, `!res.ok`) *et* un rejet de l'API Clipboard (permission refusée, contexte non sécurisé) avec le même résultat « error » — le lecteur n'a pas besoin de savoir lequel s'est produit, seulement que la copie n'a pas fonctionné.

<AlertBox variant="note" title="L'API Clipboard exige un contexte sécurisé">
  `navigator.clipboard` n'est disponible qu'en HTTPS, ou sur `localhost`. Testez le bouton sur une simple adresse `http://` depuis n'importe quel autre host et `writeText` échouera à chaque fois — c'est le navigateur, pas un bug dans ce composant.
</AlertBox>

### 2.3 — Remise à zéro automatique {#23--auto-reset}

```javascript title="src/components/CopyAsMarkdown/index.tsx"
useEffect(() => {
  if (status !== "copied" && status !== "error") return;
  const timer = setTimeout(() => setStatus("idle"), 2000);
  return () => clearTimeout(timer);
}, [status]);
```

Dès que `status` passe à `copied` ou `error`, cet effet programme un retour à `idle` deux secondes plus tard, pour que le bouton ne reste pas bloqué sur « ✓ Copied » indéfiniment. La fonction de nettoyage annule un timer en attente si le lecteur reclique avant la fin de ces deux secondes.

### 2.4 — Le rendu {#24--rendering}

```javascript title="src/components/CopyAsMarkdown/index.tsx"
return (
  <div className={styles.wrapper}>
    <button
      type="button"
      className={styles.copyBtn}
      onClick={handleCopy}
      disabled={status === "copying"}
    >
      {status === "copied"
        ? "✓ Copied"
        : status === "error"
          ? "Could not copy"
          : "📋 Copy as Markdown"}
    </button>
    <a href={mdUrl} className={styles.rawLink} target="_blank" rel="noopener noreferrer">
      View raw
    </a>
  </div>
);
```

Le libellé du bouton est une simple chaîne de ternaires basée sur `status` ; il est désactivé pendant qu'un fetch est en cours pour qu'un lecteur ne puisse pas lancer une seconde requête en pleine copie. Le lien « View raw » n'a besoin d'aucun JavaScript — il pointe directement vers `mdUrl` et laisse le navigateur faire le travail, `target="_blank"` et `rel="noopener noreferrer"` empêchant le nouvel onglet de garder une référence vers celui-ci.

## Étape 3 — Le module CSS {#step-3--the-css-module}

<Snippet filename="src/components/CopyAsMarkdown/styles.module.css" source="src/components/CopyAsMarkdown/styles.module.css" defaultOpen={false} />

Chaque couleur ici est une propriété personnalisée Infima (`--ifm-color-emphasis-*`), donc le bouton s'adapte au mode clair, au mode sombre ou à un thème Docusaurus entièrement personnalisé, sans une seule valeur hexadécimale en dur ni surcharge `[data-theme="dark"]` à maintenir.

## Étape 4 — L'intégrer dans l'en-tête de l'article {#step-4--wire-it-into-the-blog-post-header}

Docusaurus rend le contenu de votre article via un composant de thème appelé `BlogPostItem`. Pour faire apparaître le bouton, il faut le swizzler :

```bash
yarn run swizzle @docusaurus/theme-classic BlogPostItem --eject
```

Confirmez l'eject quand on vous le demande — un `--wrap` ne vous donnerait pas d'endroit pour insérer le bouton entre l'en-tête et le contenu.

Ouvrez le `src/theme/BlogPostItem/index.js` obtenu et ajoutez trois choses : l'import, la garde `isBlogPostPage` (pour que le bouton n'apparaisse jamais sur une carte en vue liste), et le composant lui-même.

```javascript title="src/theme/BlogPostItem/index.js" {1,10}
import CopyAsMarkdown from "@site/src/components/CopyAsMarkdown";
import { useBlogPost } from "@docusaurus/plugin-content-blog/client";
import BlogPostItemContainer from "@theme/BlogPostItem/Container";
import BlogPostItemContent from "@theme/BlogPostItem/Content";
import BlogPostItemFooter from "@theme/BlogPostItem/Footer";
import BlogPostItemHeader from "@theme/BlogPostItem/Header";

export default function BlogPostItem({ children, className }) {
  const { metadata, isBlogPostPage } = useBlogPost();

  return (
    <BlogPostItemContainer className={className}>
      <BlogPostItemHeader />
      {isBlogPostPage && <CopyAsMarkdown metadata={metadata} />}
      <BlogPostItemContent>{children}</BlogPostItemContent>
      <BlogPostItemFooter />
    </BlogPostItemContainer>
  );
}
```

`isBlogPostPage` vaut `true` uniquement quand un lecteur consulte un article isolé, jamais sur la page d'accueil du blog ou la grille d'archives — la même garde utilisée pour placer correctement <Link to="/blog/docusaurus-reactions">le widget de réactions des lecteurs</Link> et <Link to="/blog/docusaurus-go-top">le bouton de retour en haut de page</Link> sur ce blog même.

<AlertBox variant="note" title="Sur mon propre site, il passe plutôt par l'en-tête">
  Mon `BlogPostItem/index.js` transmet `<CopyAsMarkdown>` à `BlogPostItem/Header` sous forme de prop au lieu de le rendre en ligne, parce que cet en-tête gère déjà un badge « assisté par IA » et la liste des auteurs. Vous n'avez besoin de cette indirection que si votre propre en-tête fait quelque chose de similaire — pour la plupart des blogs, le rendre directement comme montré ci-dessus est plus simple et tout aussi correct.
</AlertBox>

## Tous les fichiers en un coup d'œil {#all-files-at-a-glance}

<ProjectSetup folderName="Copy as Markdown">
  <Snippet filename="plugins/markdown-mirror-plugin/index.cjs" source="./files/markdown-mirror-plugin.cjs" defaultOpen={false} />
  <Snippet filename="src/components/CopyAsMarkdown/index.tsx" source="src/components/CopyAsMarkdown/index.tsx" defaultOpen={false} />
  <Snippet filename="src/components/CopyAsMarkdown/styles.module.css" source="src/components/CopyAsMarkdown/styles.module.css" defaultOpen={false} />
</ProjectSetup>

`src/theme/BlogPostItem/index.js` n'est pas inclus ci-dessus — comme indiqué à l'étape 4, ce fichier existe déjà sous une forme ou une autre sur votre site, et vous le modifiez, vous ne le créez pas de zéro. Affiché ici avec <Link to="/blog/docusaurus-snippets">le même composant de snippets de code</Link> utilisé tout au long de cet article.

## À vous d'essayer {#try-it-yourself}

1. Ajoutez le plugin à `docusaurus.config.js` et créez les trois fichiers ci-dessus.
2. Lancez `yarn build` — pas `yarn start`. Les hooks `postBuild` ne se déclenchent jamais sur le serveur de dev, donc le miroir n'existe réellement pas avant un vrai build.
3. Servez la sortie localement, par exemple `npx serve build`, et ouvrez n'importe quel article.
4. Cliquez sur **Copy as Markdown**, puis collez dans un éditeur de texte. Vous devriez voir la source Markdown brute, balises `<TLDR>` comprises.
5. Cliquez sur **View raw**. Le fichier `.md` devrait s'ouvrir en texte brut dans un nouvel onglet.

<AlertBox variant="warning" title="Auto-hébergé sur Apache ? Attention au type MIME">
  Si l'étape 5 déclenche une invite de téléchargement au lieu d'afficher le fichier, votre serveur ne sait pas que `.md` est du texte. Ajoutez `AddType text/markdown .md` à votre `.htaccess` (ou l'équivalent Nginx, un bloc `types`) pour qu'il soit servi en ligne.
</AlertBox>

## Sous le capot (passez si vous voulez juste l'utiliser) {#under-the-hood-skip-this-if-you-just-want-to-use-it}

**Pourquoi le miroir ne peut pas entrer en collision avec l'URL de l'article.** `/blog/my-post` est un *répertoire* contenant un `index.html` — c'est ainsi que Docusaurus sert des URLs propres. `/blog/my-post.md` est un *fichier* voisin dans ce même répertoire. Même dossier, fichiers différents, zéro conflit de routage.

**Pourquoi `postBuild`, et pas un loader webpack ou une route en dev.** Un loader devrait rejouer la même logique MDX-vers-texte à chaque hot reload sans aucun bénéfice — personne ne copie un article depuis un blog qu'il est en train d'éditer. Restreindre le miroir à la production garde le serveur de dev rapide et la logique en un seul endroit.

**Là où la version simple ne suffit plus.** Le plugin de l'étape 1 fait passer tout composant personnalisé tel quel, en texte JSX littéral. C'est acceptable pour un bloc `<TLDR>` isolé, mais ça cesse vite de ressembler à du Markdown dès qu'un article s'appuie sur des dizaines de composants — snippets de code, alertes, cartes étape par étape, etc. Le faire correctement implique de parser le MDX en véritable arbre syntaxique et de remplacer chaque nœud de composant par un équivalent en Markdown pur, composant par composant. C'est un projet nettement plus gros qu'un bouton et une boucle de copie — le genre de chose pour laquelle existe le pipeline de dégradation, beaucoup plus imposant, de ce blog — et un bon candidat pour un article de suivi à part entière.

**Une date de frontmatter n'est pas une chaîne.** Si vous étendez le commentaire de métadonnées pour afficher aussi le champ `date:` de l'article, ne le concaténez pas directement comme une chaîne. YAML type automatiquement un `date: 2024-02-23` non quoté en objet `Date` JS, et `` `${date}` `` appelle son `toString()` par défaut, très verbeux (`Mon Jul 27 2026 00:00:00 GMT+0000 (Coordinated Universal Time)`). Normalisez-le d'abord : `date instanceof Date ? date.toISOString().slice(0, 10) : String(date)`.

## Conclusion {#conclusion}

Une petite centaine de lignes de code, réparties entre un plugin de build et un composant React, suffisent pour arrêter de se battre avec le HTML rendu chaque fois que vous voulez le texte brut d'un article. Le bouton ne sait pas ce qu'est le Markdown, et le plugin ne sait pas ce qu'est un bouton — chacun fait un petit travail, et l'ensemble tient debout parce que ni l'un ni l'autre n'a besoin de connaître les entrailles de l'autre.

Si vous partez de là, l'étape suivante naturelle est celle signalée dans *Sous le capot* : apprendre au générateur de miroir à vraiment dégrader vos composants personnalisés au lieu de les recopier en JSX brut. En attendant, cette version résout déjà le problème qui a tout déclenché — plus de chirurgie manuelle de copier-coller, ni pour moi ni pour quiconque veut donner un de mes articles à un LLM.
