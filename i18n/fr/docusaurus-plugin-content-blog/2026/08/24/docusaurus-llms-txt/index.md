---
slug: docusaurus-llms-txt
title: "Votre blog est illisible pour une IA. Voici la solution."
authors: [christophe, claude]
image: /img/v2/llms-txt.webp
series: Creating Docusaurus components
mainTag: docusaurus
tags: [docusaurus, ai, markdown]
date: 2026-08-24
description: Une part croissante de vos lecteurs arrive via un assistant IA — et ce qu'ils reçoivent, c'est votre HTML, emballé dans la navigation, des widgets React et des accordéons fermés. Cet article génère un miroir en Markdown pur de chaque article, un index /llms.txt et des bundles full-text par série, en dégradant la source MDX plutôt qu'en convertissant le HTML rendu. Avec la règle de repli qui rend l'export impossible à casser.
language: fr
ai_assisted: true
blueskyRecordKey: 3mtslipixls2v
---

<!-- cspell:ignore llms mdxjs unified remark stringify hast maintag preprocessContent -->

![Votre blog est illisible pour une IA. Voici la solution.](/img/v2/llms-txt.webp)

<TLDR>
`llms.txt` est une convention proposée pour rendre un site lisible par les assistants IA — et elle n'a rien de prouvé : aucun assistant majeur (ChatGPT, Claude, Perplexity) ne confirme publiquement le lire. Je l'ai explorée quand même, surtout parce que ce blog est déjà écrit avec Claude Code qui fait l'essentiel du travail sur les fichiers ; maintenir un miroir `llms.txt` ne coûte donc presque rien. Ce que j'ai découvert en le construisant : le HTML publié, emballé dans la navigation, des widgets React et 107 accordéons `<Snippet>` fermés, est réellement *moins complet* que la source que j'ai écrite. La solution est un plugin exécuté au build qui produit un miroir en Markdown pur de chaque article, un index `/llms.txt` et un bundle full-text par série. La décision clé : dégrader la **source MDX**, jamais le HTML rendu — et ne jamais laisser un composant inconnu faire échouer l'export.
</TLDR>

Je voulais explorer la piste `llms.txt`, surtout par curiosité, pas parce que j'avais la preuve que des lecteurs arrivaient via un assistant. L'idée — proposée par [Jeremy Howard d'Answer.AI](https://www.answer.ai/posts/2024-09-03-llmstxt.html) en septembre 2024 — est de publier un index d'un site en Markdown pur sur `/llms.txt`, pour qu'un assistant n'ait pas à se battre contre une application React pour trouver le contenu réel. On est loin d'une pratique établie : ni ChatGPT, ni Claude, ni Perplexity ne confirment publiquement que leur pipeline de récupération lit le fichier, et cela ne prendra peut-être jamais comme `robots.txt` ou `sitemap.xml`. Ce qui a fait basculer la balance pour moi : ce blog est déjà écrit avec Claude Code qui fait l'essentiel du travail sur les fichiers, donc garder un miroir `llms.txt` à jour ne serait pas une corvée manuelle — juste une étape de build en plus. Quand essayer coûte aussi peu, on essaie.

<!-- truncate -->

## Ce qui est généré {#what-gets-generated}

Un `yarn build`, trois artefacts, tous statiques :

<Terminal source="./files/build_output.txt" />

Le premier est `/llms.txt` (voyez le mien [en ligne](https://www.avonture.be/llms.txt)) — l'index du site, au format proposé par [llmstxt.org](https://llmstxt.org) : un titre, un résumé d'une ligne, puis chaque article sous forme de lien accompagné de sa description, groupé par sujet :

<Terminal title="curl https://www.avonture.be/llms.txt" source="./files/llms_txt.txt" />

Le deuxième est un miroir en Markdown pur de chaque article, à sa propre URL suffixée de `.md`. Prenez <Link to="/blog/docusaurus-go-top">l'article sur le bouton de retour en haut de page</Link>, récupérez [`/blog/docusaurus-go-top.md`](https://www.avonture.be/blog/docusaurus-go-top.md), et vous obtenez ceci — pas de JSX, pas d'accordéons, chaque fichier de code intégré en entier :

<Snippet filename="/blog/docusaurus-go-top.md" source="./files/mirror_sample.txt" defaultOpen={true} />

Le troisième est celui auquel je n'aurais pas pensé tout seul : **un bundle full-text par <Link to="/blog/docusaurus-series">série</Link>**, sur `/llms/<series-slug>.txt`, qui concatène tous les articles de la série dans l'ordre de lecture. Le bundle [Docusaurus components](https://www.avonture.be/llms/creating-docusaurus-components.txt) fait 710 Ko de Markdown pur — 23 articles qu'un assistant peut récupérer en une seule requête au lieu de 23.

## Pourquoi la source, et jamais le HTML {#why-the-source-and-never-the-html}

Tous les outils du domaine reconvertissent le HTML rendu en Markdown. C'est la mauvaise direction, et la raison n'est pas esthétique :

- **Le HTML a déjà perdu de l'information.** Ce blog replie 107 snippets de code dans des accordéons `<Snippet>` fermés, certains composants n'affichent rien avant l'hydratation, et les images sont derrière du lazy loading — un passage HTML → Markdown ne peut récupérer que ce que le HTML contient, et le HTML contient moins que la source.
- **La source est déjà du Markdown.** Un fichier MDX, c'est du Markdown avec un peu de JSX saupoudré dessus. Aller de la source vers le Markdown, c'est gérer quelques dizaines de noms de composants ; aller du HTML vers le Markdown, c'est faire de l'ingénierie inverse sur tout un pipeline de rendu.
- **Le fichier généré est réellement meilleur que la page.** `<Snippet source="./files/compose.yaml">` devient un bloc de code délimité contenant le fichier entier. Le lecteur du miroir obtient le code que le lecteur de la page doit cliquer pour révéler.
- **Rien n'est inventé.** Chaque composant de ce blog emballe soit du contenu écrit par l'auteur, soit pointe vers un fichier sur le disque. Aucun composant ne fabrique du contenu à l'exécution — une dégradation au niveau de la source peut donc être complète par construction.

Le résultat n'est pas un export dégradé de mon site. C'est une version *plus complète*.

## La mise en place {#building-it}

### La table de dégradation {#the-degradation-table}

Mes articles ne sont pas du Markdown pur : c'est du MDX, du Markdown mélangé à quelques dizaines de composants React maison — `<Snippet>` pour un bloc de code repliable, `<AlertBox>` pour un encart, `<Link>` pour une référence croisée, et ainsi de suite. Chacun existe pour ajouter un peu d'interactivité à la page, et chacun est exactement ce qu'un miroir Markdown ne peut pas rendre tel quel. Le plugin doit donc savoir, composant par composant, en quel Markdown pur le transformer. Le tout est un pipeline remark : parser la source MDX en AST, la parcourir, remplacer chaque nœud JSX par des nœuds Markdown purs, puis sérialiser. Chaque composant a sa règle :

| Composant | Utilisations | Dégradation |
| --- | ---: | --- |
| `Snippet` | 917 | bloc délimité ; `source=` (841×) résolu et intégré en entier |
| `Link` | 779 | `[text](href)` |
| `AlertBox` | 546 | `> **{title}:** …` (le variant devient le mot-clé) |
| `Terminal` | 455 | bloc ```` ```bash ```` ; `source=` (146×) résolu |
| `TLDR` | 253 | `> **TL;DR** …` |
| `BrowserWindow` | 98 | les enfants, plus une légende `> Screenshot — {url}` |
| `StepsCard` | 55 | liste ordonnée |
| `ProjectSetup` | 28 | `### Project: {folderName}` puis chaque `Snippet` en bloc titré |
| `Details` | 18 | laissé en `<details>` — déjà du Markdown valide |
| `Prerequisite` | 10 | liste à puces |
| `Columns` / `Column` | 9 | sections successives |
| `Reaction`, `ScrollToTopButton`, `Bluesky`, `RelatedPosts`, … | ~15 | **supprimés** — de l'interface, pas du contenu |
| `Trees` / `Folder` / `File` | 0 | **rien à faire** (voir ci-dessous) |

Cette dernière ligne est ma préférée dans tout le plugin. Ces composants existent parce qu'un plugin remark transforme une arborescence ASCII de la source en composants React. Ne pas appliquer ce plugin restitue l'arborescence ASCII d'origine, gratuitement. La bonne règle était de n'écrire aucune règle.

<Snippet filename="plugins/markdown-export-plugin/degrade.cjs" source="plugins/markdown-export-plugin/degrade.cjs" defaultOpen={false} />

### L'orchestrateur {#the-orchestrator}

Le plugin s'exécute dans `postBuild`, dégrade chaque article publié, écrit les miroirs, puis construit les deux index à partir de ce qui a réussi :

<Snippet filename="plugins/markdown-export-plugin/index.cjs" source="plugins/markdown-export-plugin/index.cjs" defaultOpen={false} />

Enregistrez-le comme n'importe quel autre plugin :

```javascript title="docusaurus.config.js"
plugins: [
  "./plugins/markdown-export-plugin/index.cjs",
  // ...
],
```

<AlertBox variant="warning" title="Auto-hébergé ? Attention au type MIME">
`/blog/my-slug` (comme `/blog/docusaurus-llms-txt` pour cet article) est un *répertoire* contenant `index.html`, donc son voisin `/blog/my-slug.md` ne crée aucun conflit de route — celui-là est gratuit. Mais Apache n'a aucun mapping MIME natif pour `.md`, donc sans `AddType text/markdown .md` dans `.htaccess`, le navigateur propose un téléchargement au lieu d'afficher le fichier.
</AlertBox>

## La seule règle qui rend tout ça sûr {#the-one-rule-that-makes-this-safe}

**Un composant inconnu ne fait jamais échouer l'export. Son wrapper est supprimé et ses enfants prennent sa place.** Aucune exception, aucune erreur, jamais.

C'est cette unique règle qui permet à une table de dégradation de 900 lignes de vivre dans un pipeline de build sans devenir un risque. Ajoutez un composant dans six mois, oubliez d'écrire sa règle, et le pire cas est que son wrapper disparaisse alors que son contenu survit.

Mais un repli silencieux est une fuite lente : le plugin enregistre donc chaque composant qu'il n'a pas reconnu et avertit une fois par build. **C'est cet avertissement, pas la table, qui maintient la couverture à 100 % dans le temps** — la table est figée le jour où vous l'écrivez ; l'avertissement remarque le jour où vous la cassez.

## Rendre le tout découvrable {#making-it-discoverable}

Générer un fichier n'est pas le publier : sans lien qui pointe vers lui, personne — crawler ou humain — ne trouve `/llms.txt` ou un bundle de série tout seul. Quatre points d'accroche comblent ce manque, chacun visant un consommateur différent :

**1. `llms.txt` référence ses propres bundles.** L'index s'ouvre sur une section « Series (full-text bundles) ». C'est le seul endroit où ils sont référencés.

**2. Un `<link rel="alternate">` à l'échelle du site,** dans `headTags`, pour qu'il soit rendu côté serveur sur chaque page — exactement la façon dont on a toujours découvert le RSS :

```javascript title="docusaurus.config.js"
{
  tagName: "link",
  attributes: {
    rel: "alternate",
    type: "text/markdown",
    href: "https://www.avonture.be/llms.txt",
    title: "llms.txt — full site index in Markdown, for LLMs and readers",
  },
},
```

**3. Un équivalent par article,** pointant vers le miroir de cet article, injecté par un composant minuscule branché sur la page d'article :

<Snippet filename="src/components/MarkdownAlternate/index.tsx" source="src/components/MarkdownAlternate/index.tsx" defaultOpen={true} />

**4. Un fil d'Ariane dans `robots.txt`.** Il n'existe aucune directive standard pour ça — c'est un commentaire, lu par tout ce qui parse déjà ce fichier et en cherche un. Ça a coûté deux lignes.

<AlertBox variant="note" title="Une limitation, honnêtement">
Le lien destiné aux humains « View this series as plain Markdown » sur `/series/<slug>` est invisible pour un crawler qui n'exécute pas JavaScript : cette page est une route React Router côté client, donc son lien n'apparaît jamais dans le HTML rendu côté serveur. Les deux balises `<link rel="alternate">` ci-dessus n'ont pas ce problème — et c'est précisément pour ça que les points de découverte qui comptent vivent dans `headTags` et dans un composant, pas dans le corps d'une page.
</AlertBox>

Et puis il y a la partie qu'aucun code ne fera pour vous : **soumettre aux annuaires**. Les bons sont ceux vers lesquels la page officielle de la spec renvoie. J'ai réussi à m'enregistrer sur `llmstxt.site` et `directory.llmstxt.cloud` ; `llmstxthub.com` avait un formulaire de soumission cassé le jour où j'ai essayé. Dix minutes bien investies.

## Conclusion {#conclusion}

Ce que j'aime dans le résultat a moins à voir avec l'adoption par les IA que je ne l'imaginais au départ :

- **N'importe qui peut faire un `curl` sur un article et l'obtenir en entier.** Pas seulement un bot — un script, un collègue, moi sur une connexion lente — obtient le texte complet, sans HTML, sans JavaScript, sans navigation à nettoyer à la main d'abord.
- **Le blog est bot-friendly, que `llms.txt` prenne ou non.** Une version en Markdown pur de chaque article existe maintenant comme effet de bord, indépendamment du sort de cette convention.
- **Un fichier Markdown tombe directement dans un éditeur de texte ou dans la fenêtre de contexte d'un LLM.** Plus besoin de tout sélectionner et de supprimer la barre de navigation avant qu'un article soit réellement utilisable ailleurs.
- **`/llms.txt` fait aussi office d'inventaire du blog** — chaque article, une ligne chacun, groupé par sujet. Une table des matières que je n'avais pas avant, générée gratuitement.
- **Les bundles par série transforment 23 requêtes en une.** Pratique pour un assistant qui récupère du contexte, tout aussi pratique pour un lecteur qui veut une série entière dans un seul fichier, à lire ou à archiver.
- **Rien de tout ça n'a besoin d'être retenu.** C'est une étape de build, pas une habitude — et c'est exactement pour ça qu'une convention non prouvée méritait une heure d'essai.

Si les 107 accordéons <Link to="/blog/docusaurus-snippets">`<Snippet>`</Link> fermés qui ont déclenché toute cette histoire sont nouveaux pour vous, ce composant mérite sa propre lecture.
