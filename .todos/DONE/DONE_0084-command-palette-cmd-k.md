# 0084 — Palette de commandes `Cmd+K` : de moteur de recherche à shell du site

- **Priority**: High
- **Batch**: blog-palette
- **Depends**: —
- **Files**: `src/components/CommandPalette/index.js`, `src/components/CommandPalette/styles.module.css`, `src/theme/Root.js`, `src/theme/NotFound/index.js`, `src/theme/SearchBar/index.js`, `docusaurus.config.js`

## Problème

`Ctrl+K` ne fait aujourd'hui qu'une chose : chercher du texte via Pagefind. Avec 248
articles, 25 séries et une quarantaine de tags, la navigation au clavier pourrait couvrir
tout le site — et surtout servir de point d'entrée unique aux autres fonctionnalités
(export Markdown, questions, map), qui sinon resteront des pages isolées que personne ne
trouvera.

## Solution

Un seul raccourci, plusieurs modes sélectionnés par un préfixe tapé dans le champ.

| Préfixe | Mode | Contenu |
| --- | --- | --- |
| *(rien)* | Fuzzy global | 248 titres + 25 séries + tags + pages, depuis un index statique (~150 Ko) — sans Pagefind |
| `/` | Plein texte | comportement actuel (Pagefind) |
| `?` | Ask my blog | index de questions ([[0083]]) |
| `#` | Tags | saut direct vers un tag |
| `:` | Titres | saut vers un `##` de la page courante |
| `>` | Actions | voir ci-dessous |

### Mode `>` — actions

C'est lui qui transforme la palette en shell du site :

- Copy this article as Markdown · View raw `.md` ([[0082]])
- Report a typo → `api/typo.php` existe déjà
- Edit on GitHub
- Show on the map ([[0081]])
- Copy permalink · Toggle theme

### Trois détails qui font la différence

- **Panneau de prévisualisation à droite** : TLDR, date, tags et série de l'article
  surligné, mis à jour à la navigation aux flèches. C'est le moment où le visiteur
  comprend qu'il n'est pas sur un Docusaurus standard.
- **État vide utile** : « Recently viewed » (localStorage) + « Continue this series ».
  Fonctionne avec zéro visiteur — ça sert d'abord à l'auteur.
- **Résultats groupés** par section (Articles / Séries / Actions), jamais une liste plate.

### Activation progressive

Le cœur (fuzzy, `/`, `#`, `:`, et les actions ne dépendant de rien) fonctionne seul. Les
modes `?` et les actions d'export **doivent se masquer proprement quand leur source de
données est absente**, pas afficher une entrée morte. Cela permet de livrer la palette
avant [[0082]] et [[0083]].

## Découvrabilité — le vrai enjeu

Une palette que personne n'ouvre ne sert à rien. Par ordre d'importance :

1. **L'état vide est le tutoriel.** Les préfixes `>`, `?`, `#`, `:` y sont listés avec leur
   libellé. La palette s'enseigne elle-même ; tout le reste ne sert qu'à provoquer la
   première ouverture.
2. **Une vraie zone de recherche dans la navbar, pas une icône** : un champ qui ressemble à
   un champ, `🔍 Search 248 articles…` avec un badge `⌘K` à droite. Convertit
   incomparablement mieux qu'une loupe.
3. **La touche `?` ouvre l'aide clavier** — convention universelle (GitHub, Gmail). Le
   composant `ShortcutList` existe déjà et peut l'afficher tel quel.
4. **La page 404** : `src/theme/NotFound/` est déjà swizzlée. Ouvrir la palette avec l'URL
   ratée pré-remplie. Le moment où le visiteur a le plus besoin de chercher est celui où on
   peut lui montrer l'outil.
5. **Un hint unique à la première visite** : après ~10 s sur un article, en bas à droite,
   `Press ⌘K to search`. Dismissible, mémorisé en localStorage, jamais réaffiché.
6. **Une ligne dans le footer** : `Press ⌘K to search · ? for shortcuts`.

Le public visé est composé de développeurs, chez qui `Cmd+K` est déjà de la mémoire
musculaire (VS Code, GitHub, Linear, Notion). L'enjeu n'est pas d'enseigner le geste, mais
de signaler qu'il fonctionne ici.

## Contraintes

- **Aucune dépendance nouvelle** : le fuzzy matching se fait à la main, l'index statique
  vient du build.
- Accessibilité : `role="dialog"`, focus piégé dans la palette, `Esc` ferme, `aria-activedescendant`
  sur l'option surlignée, annonce du nombre de résultats. Une palette non accessible est
  pire que pas de palette.
- `Ctrl+K` sur Linux/Windows, `Cmd+K` sur macOS, et ne pas capturer le raccourci quand le
  focus est dans un champ de saisie.
- Ne pas casser le `Ctrl+K` natif de Pagefind : le remplacer, pas le doubler.

## Notes

Réutiliser le chargeur de corpus de `scripts/lib/` extrait par [[0081]] pour générer
l'index statique de navigation.
