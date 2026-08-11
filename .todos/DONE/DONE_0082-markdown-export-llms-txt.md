# 0082 — Export Markdown : `/llms.txt`, miroirs `.md` et bouton « Copy as Markdown »

- **Priority**: High
- **Batch**: blog-markdown-export
- **Depends**: —
- **Files**: `plugins/markdown-export-plugin/index.cjs`, `plugins/markdown-export-plugin/degrade.cjs`, `src/components/CopyAsMarkdown/index.js`, `src/theme/BlogPostItem/Header/index.js`, `plugins/remark-snippet-loader/index.cjs`, `api/.htaccess`

## Problème

Une part croissante du trafic ne vient plus de Google mais de gens qui interrogent une IA.
Aujourd'hui le contenu du blog n'est disponible qu'en HTML, entouré de navigation, de
widgets et de composants React — donc coûteux à consommer pour un assistant, et
impossible à coller proprement dans une conversation.

Pire : `defaultOpen={false}` est utilisé **107 fois** sur `<Snippet>`. Le contenu de ces
fichiers est replié dans des accordéons — invisible pour un crawler comme pour un lecteur
pressé. Le HTML publié est donc *moins complet* que la source.

## Solution

Trois livrables, tous générés au build, tous statiques.

### 1. `/llms.txt`

Index au format standard : titre du site, résumé, puis une section par `mainTag` listant
les 248 articles sous forme `- [Titre](url) : description`. Sert de point d'entrée aux
assistants qui découvrent le domaine.

Prévoir aussi `/llms-full.txt` **par série** plutôt qu'un fichier unique — un dump de 248
articles dépasse toute fenêtre de contexte utile.

### 2. Miroirs `/blog/<slug>.md`

Un fichier Markdown par article, écrit dans `postBuild`. `/blog/my-slug` étant un dossier
contenant `index.html`, le fichier frère `/blog/my-slug.md` ne crée aucun conflit de route.

**Attention MIME** : Apache chez PlanetHoster ne sert pas forcément `.md`. Ajouter
`AddType text/markdown .md` (ou `text/plain`) dans le `.htaccess`, sinon le navigateur
propose un téléchargement au lieu d'afficher.

### 3. Bouton « Copy as Markdown »

Dans l'en-tête de l'article (swizzle `BlogPostItem/Header`). Copie le contenu du miroir
`.md` dans le presse-papier. Prévoir aussi « View raw » (lien direct vers le `.md`).

## Le cœur : la table de dégradation

**On ne rend jamais de HTML.** On part du MDX source et on applique une table de
transformation par composant, via un plugin remark + `remark-stringify`, exécuté
*avant* les plugins remark du site.

| Composant | Usages | Dégradation |
| --- | ---: | --- |
| `Snippet` | 917 | bloc clôturé ; `source=` (841×) résolu et inliné en entier |
| `Link` | 779 | `[texte](href)` |
| `AlertBox` | 546 | `> **{title}:** …` (variant → mot-clé) |
| `Terminal` | 455 | bloc ```` ```bash ```` ; `source=` (146×) résolu |
| `TLDR` | 253 | `> **TL;DR** …` |
| `BrowserWindow` | 98 | children + légende `> Screenshot — {url}` |
| `StepsCard` | 55 | liste ordonnée |
| `ProjectSetup` | 28 | `### Project: {folderName}` + chaque `Snippet` en bloc titré ; `Guideline` en blockquote ; `EmptyFolder` en ligne de liste |
| `Details` | 18 | `<details>` conservé (valide en Markdown) |
| `Card*` | 15 | children remontés, `CardHeader` → `####` |
| `Prerequisite` | 10 | liste à puces |
| `Image` | 10 | `![alt](src)` |
| `Columns`/`Column` | 9 | sections séquentielles |
| `ShortcutList` | 2 | tableau |
| `Highlight` | 2 | `**…**` |
| `DownloadButton` | 1 | `[nom](href)` |
| `Trees`/`Folder`/`File` | 0 | **rien à faire** — `remark-tree-to-component` fait la transformation inverse ; ne pas l'appliquer suffit à récupérer l'arbre ASCII d'origine |
| `Reaction`, `ScrollToTopButton`, `KonamiEasterEgg`, `RelatedPosts`, `SeriesPosts`, `PostCard`, `Bluesky`, `AIIcon` | ~15 | **supprimés** — interface, pas contenu |

Réutiliser la résolution de `source=` déjà écrite dans
`plugins/remark-snippet-loader/index.cjs` plutôt que de la réimplémenter.

## Règle de repli — non négociable

**Composant inconnu → on garde les children, on jette le wrapper.** Jamais d'exception,
jamais d'erreur. C'est ce qui garantit qu'aucun article ne peut casser l'export.

Corollaire : le plugin **doit émettre un warning au build** listant les composants
rencontrés sans règle explicite. Sans ça, le composant ajouté dans six mois sera dégradé
silencieusement et personne ne le saura. Ce warning est ce qui maintient la couverture à
100 % dans le temps — pas la table, qui est figée par nature.

## Ce qui est garanti (vérifié sur le corpus)

- **Validité** : 100 % des articles produisent un Markdown valide (garanti par le repli).
- **Contenu** : 100 % du texte et du code est préservé — chez nous le contenu vit toujours
  soit dans les children, soit dans un fichier résolvable. Aucun composant ne fabrique du
  contenu ex nihilo.
- **Aucun piège de parsing** : les `<SOAP-ENV:Envelope>`, `<FilesMatch>`,
  `<BlogPostItemHeader>`, `<Spacer>`, `<DateTime>` repérés dans le corpus sont **tous à
  l'intérieur de blocs de code** — remark les parse en nœuds `code` et n'y cherche pas de
  JSX. Vérifié un par un. Zéro `export` réel en MDX (les 4 occurrences apparentes sont
  aussi dans des fences), zéro expression JSX de premier niveau.

Le résultat est *plus complet* que la page HTML, grâce aux 107 `defaultOpen={false}`
dépliés.

## Notes

- Réutiliser le chargeur de corpus extrait dans `scripts/lib/` par [[0081]] plutôt que de
  relire les articles une troisième fois.
- Une fois en place, « Copy as Markdown » et « View raw » deviennent deux actions du mode
  `>` de la palette ([[0084]]).
