# 0110 — Détecter les captures d'écran hors `BrowserWindow`, classées web / autre

- **Priority**: Medium
- **Batch**: browserwindow-audit
- **Depends**: —
- **Files**: TBD

## Problème

La règle `AGENTS.md` (section _Blog Content Guidelines_, ligne 69) impose de wrapper toute
capture de navigateur dans `<BrowserWindow url="...">`. Une première passe (voir
[[0085]] `.todos/0085-browserwindow-seconde-passe.md`) a déjà traité 30 images avec un
détecteur heuristique (proximité texte/URL dans les 4 lignes précédentes), mais son taux de
faux positifs (~50 %) l'a bloquée à mi-chemin : ~58 candidates restent en jugement visuel
manuel, image par image.

Il n'existe aujourd'hui **aucun inventaire complet** des images du blog (`blog/**` et
`.unpublished/**`) qui ne sont pas dans un `BrowserWindow`, avec une classification fiable de
"est-ce une capture de page web ?". La proximité textuelle est un mauvais proxy : un article
peut montrer une page web sans jamais citer son URL juste au-dessus de l'image (dashboard,
capture recadrée, etc.), et inversement citer une URL au-dessus d'une capture qui n'a rien à
voir (terminal, VS Code, Docker Desktop).

## Solution

Approche en deux phases, la seconde s'appuyant sur la capacité de Claude à **lire directement
le contenu visuel d'une image** (outil `Read` sur un fichier image) plutôt que sur un proxy
textuel :

1. **Extraction mécanique (scriptable, sans IA)** — parcourir tous les `index.md`/`index.mdx`
   sous `blog/` et `.unpublished/`, extraire chaque référence d'image (`![alt](chemin)` et
   `<img src=...>`), et déterminer structurellement si elle se trouve entre une balise
   ouvrante `<BrowserWindow` et sa fermeture `</BrowserWindow>` correspondante dans le même
   fichier. Produit une liste candidate : `(article, chemin_image, ligne)` pour toute image
   **hors** `BrowserWindow`.
2. **Classification visuelle (Claude, `Read` sur chaque image)** — pour chaque image
   candidate, l'ouvrir et juger si elle montre une page rendue dans un navigateur web (UI web,
   panneau d'admin, dashboard, réponse JSON vue via navigateur) ou autre chose (terminal Linux/
   WSL/Windows Terminal, VS Code, Docker Desktop, Explorateur de fichiers, diagramme, capture
   de code). C'est un jugement visuel, pas un pattern texte — c'est justement ce qui manquait à
   la passe de 0085.
3. **Rapport final** groupé par catégorie, dédupliqué par article, avec lien direct :
   - **Pages web (à re-wrapper)** — un lien cliquable par article concerné :
     `http://localhost:3000/blog/<slug>` pour tout article sous `blog/` (`draft: true` inclus,
     visible en dev server même absent du build prod) ; pour `.unpublished/`, qui n'a pas
     d'URL servie (hors de l'arbre `blog/`, non repris par `require.context` dans
     `src/components/Blog/utils/posts.ts`), donner le chemin fichier
     `.unpublished/<slug>/index.md` à la place.
   - **Autres (à relire plus tard)** — même format, pour trier une fois que les cas prioritaires
     sont traités.
   - Chaque entrée liste aussi le(s) fichier(s) image(s) concerné(s) pour retrouver l'endroit
     exact dans l'article.

### Points à trancher pendant l'implémentation

- Le scan structurel (étape 1) peut réutiliser/adapter le script de la première passe
  (planches de contact `sharp`) uniquement pour lister les images et repérer les blocs
  `BrowserWindow` — pas pour la détection heuristique elle-même, qu'on abandonne au profit de
  la lecture visuelle.
- Volume attendu : probablement plusieurs centaines d'images à classer (247 posts + ~43
  drafts). Envisager un traitement par lots (par exemple par série ou par lettre) pour rester
  dans une session de travail raisonnable, avec une reprise possible façon
  `.todos/0000-reader-review-journal.md`.
- Ce TODO **supersede l'étape 1 de 0085** (les ~58 candidates à la proximité texte) puisque la
  classification visuelle est strictement plus fiable et couvre tout le corpus, pas seulement
  les candidates détectées par heuristique. L'étape 2 de 0085 (recadrage du chrome résiduel
  dans les `BrowserWindow` déjà en place) reste un sujet séparé, non couvert ici.

## Risque

Faible — travail d'inventaire et de classification, aucune modification de contenu n'est faite
par ce TODO lui-même. Le seul risque est un rapport trop bruyant si la classification visuelle
hésite sur des cas limites (ex. VS Code affichant une page web dans son éditeur intégré) ; en
cas de doute, classer en "Autres" plutôt que de forcer un verdict.

## Acceptance

- [x] Toutes les images de `blog/**/index.md(x)` et `.unpublished/**/index.md(x)` sont
      recensées avec leur statut "dans un `BrowserWindow`" oui/non. *(scope réduit au batch 1,
      voir Status ci-dessous)*
- [x] Chaque image hors `BrowserWindow` est classée "page web" ou "autre" par lecture visuelle
      directe (pas par heuristique texte). *(idem, batch 1 seulement)*
- [x] Rapport final produit avec deux listes (pages web / autres), un lien par article
      (`http://localhost:3000/blog/<slug>` ou chemin `.unpublished/`), dédupliqué.
- [x] Le rapport référence explicitement `.todos/0085-browserwindow-seconde-passe.md` pour
      noter que son étape 1 est absorbée par ce scan.

## Status — PARTIAL (2026-08-29)

### Done

- Étape 1 (extraction mécanique) : script Node ad hoc parcourant tous les `index.md(x)` sous
  `blog/` et `.unpublished/`, extrayant `![alt](src)` et `<img src=...>`, et déterminant
  structurellement (ouverture/fermeture `<BrowserWindow>` par ligne) si chaque image est dans un
  `BrowserWindow`. Résultat : 1055 références d'image au total, 78 déjà dans un `BrowserWindow`,
  977 candidates hors `BrowserWindow`. 315 de ces candidates sont en fait la bannière d'article
  (`/img/v2/*.webp`, répétée en haut de l'article depuis le frontmatter `image:`) — jamais des
  captures de contenu, exclues du corpus réel. **Corpus réel : 662 images candidates sur 169
  articles distincts.**
- Étape 2 (classification visuelle) : batch 1 traité — les 30 premiers articles (ordre
  alphabétique de chemin), 80 images lues et jugées visuellement une par une (2 illisibles,
  >5 Mo, à vérifier manuellement). Détail complet dans
  `.todos/0000-browserwindow-audit-journal.md`.
- Rapport de batch 1 livré dans le chat (deux listes : pages web / autres, avec liens).

### Not done

- **139 articles restants / ~582 images** (sur les 169 / 662 du corpus réel) n'ont pas encore été
  lus visuellement. Le plus gros morceau à part est `blog/2024/01/03/quarto-revealjs-tips` (29
  images dans un seul article), volontairement exclu du batch 1 pour ne pas le déséquilibrer.
  **Reason:** volume total (662 images) impraticable en une seule session interactive (un appel
  `Read` par image) ; la TODO elle-même anticipait un traitement par lots resumable façon
  `0000-reader-review-journal.md`.
- 2 images illisibles par l'outil `Read` (>5 Mo une fois décodées en base64) :
  `blog/2023/11/03/vscode-markdown-code-folding/images/code_folding.gif` et
  `blog/2023/11/27/vscode-sticky-scroll/images/sticky_scroll.gif`. **Reason:** limite API 5 Mo,
  nécessite un redimensionnement manuel ou un outil externe pour les inspecter.
- Le script de scan mécanique n'a pas été committé dans `scripts/` (il a tourné depuis le
  scratchpad de session). **Reason:** hors scope du TODO (l'outillage n'était pas listé en
  acceptance) ; à recréer ou committer si les prochains batches en ont l'usage régulier.

**Pour reprendre :** relancer le même scan mécanique (logique décrite ci-dessus), exclure les
articles déjà listés dans `.todos/0000-browserwindow-audit-journal.md`, continuer dans le même
ordre de chemin, en commençant par `blog/2024/01/03/quarto-revealjs-tips`.

### Décision de clôture (2026-08-29)

L'auteur a relu et corrigé les articles du batch 1 listés dans
`.todos/0000-browserwindow-audit-journal.md` (colonne `Wrapped`), en écartant au passage
plusieurs faux positifs de la classification visuelle ; seuls les `.unpublished/` restent à
faire, plus tard, hors de ce TODO. Décision explicite : **ne pas poursuivre les 139 articles
restants** — le batch 1 est jugé suffisant, ce TODO est clos en `DONE` avec le scope réduit
plutôt que repris. Les points "Not done" ci-dessus (139 articles, 2 images illisibles, script
non committé) restent vrais mais ne sont plus des blocages : ce sont des extensions possibles,
pas un travail restant attendu.
