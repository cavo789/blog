# 055 — Revue de pertinence technique des articles (obsolescence du contenu)

**Priority:** High

## Problème

Les articles vieillissent mal, et le blog n'a aucun mécanisme pour détecter **qu'une information
est devenue fausse**.

Le déclencheur concret : Continue.dev a été racheté par Cursor. L'article qui en parle continue
de le présenter comme un projet indépendant. Christophe l'a appris par hasard, via Claude, et pas
via le site. Ce type de fait — rachat, renommage, abandon, changement de licence — invalide un
article sans que rien dans le dépôt ne bouge.

État des lieux mesuré le 2026-07-27 :

- **170 articles sur 238 (71 %)** ont plus d'un an sans mise à jour et affichent déjà le bandeau
  `OldPostNotice` ;
- seuls **28 articles** utilisent le champ `updates:` du frontmatter ;
- le plus ancien remonte au 2023-11-02.

Le bandeau `OldPostNotice` dit « cet article est ancien ». Il ne dit pas « cet article est faux ».
C'est toute la différence, et c'est le trou à combler.

Deux natures d'obsolescence, qui ne se détectent pas du tout de la même façon :

1. **Mécanique / vérifiable sans jugement** — liens externes morts (669 liens sortants à ce jour),
   images Docker qui ne sont plus publiées, dépôts GitHub archivés, options de ligne de commande
   supprimées, numéros de version cités devenus très anciens. Automatisable.
2. **Sémantique** — l'outil existe toujours mais le contexte a changé : racheté, renommé, abandonné
   au profit d'un autre, passé en licence payante, remplacé par un standard. **Non automatisable**,
   nécessite une recherche web article par article. C'est le cas Continue.dev, et c'est le plus
   dangereux parce que rien ne casse visiblement.

Les tags ne vieillissent pas à la même vitesse. `ai`, `vscode`, `self-hosted` et les images Docker
tierces pourrissent en quelques mois ; `vba`, `excel`, `msaccess`, `sql` sont stables sur des
années. Une revue qui traiterait les 238 articles uniformément gaspillerait l'essentiel de l'effort.

## Risque

- **Volume** : 238 articles, dont 170 candidats. Une revue exhaustive en une session est
  impossible et produirait du travail bâclé.
- **Hallucination** : c'est le risque principal. Affirmer « X a été racheté par Y » sans source
  vérifiée introduirait une erreur *dans* un article qui était correct — exactement l'inverse du
  but. Toute affirmation d'obsolescence doit être sourcée par une recherche web, avec l'URL
  conservée dans le TODO ou la note d'update.
- **Faux positifs mécaniques** : un lien 404 peut être un site temporairement en panne, un blocage
  anti-bot, ou une redirection mal suivie. Ne jamais éditer sur la seule foi d'un code HTTP.
- **Voix de l'auteur** : la correction doit rester une correction. Ne pas réécrire le style, ne pas
  reformuler des paragraphes qui n'ont pas besoin de l'être.
- **Édition de masse** : ne jamais toucher des dizaines d'articles en une passe sans relecture —
  le diff deviendrait impossible à valider.

## Solution proposée

Une **skill dédiée**, lançable en début de session, qui traite un **lot** et pas la totalité —
par exemple `/freshness` ou une extension de la skill `review_blog` existante.

Déroulé proposé pour une exécution :

1. **Sélectionner un lot** de 5 à 10 articles, priorisés par
   `ancienneté × volatilité du mainTag`. Ordre de volatilité suggéré :
   `ai` > `self-hosted` > `vscode` > `docker` > `docusaurus` > `linux`/`bash` > `php`/`python` >
   `vba`/`excel`/`msaccess`.
2. **Passe mécanique** (automatisable, à écrire une fois) : vérifier les liens externes de l'article,
   l'existence des images Docker citées, l'état du dépôt GitHub (archivé ? dernier commit ?).
3. **Passe sémantique** : pour chaque outil principal cité, une recherche web ciblée
   « <outil> acquired / deprecated / discontinued / renamed / alternative 2026 ». **Conserver l'URL
   de la source.**
4. **Trancher**, en réutilisant la machinerie déjà en place plutôt que d'en inventer :
   - correction mineure et certaine → éditer l'article **et** ajouter une entrée dans le champ
     `updates:` du frontmatter (`- date: … / note: …`), ce qui remet aussi à zéro `OldPostNotice` ;
   - changement lourd ou décision éditoriale (réécrire ? dépublier ? ajouter un encart
     `<AlertBox variant="warning">` en tête ?) → créer un `.todos/` dédié, ne rien décider seul ;
   - rien à signaler → ne pas toucher au fichier, juste le noter dans le rapport de session pour ne
     pas le re-scanner au prochain passage.
5. **Tenir un journal** des articles déjà revus et de leur date de revue, pour que les sessions
   suivantes reprennent où la précédente s'est arrêtée. Un simple fichier
   `.todos/freshness-journal.md` suffit.

Premier lot évident, à traiter en priorité : les articles `mainTag: ai`
(`vscode-tabnine`, `ai-image-generation`, `claude-ia-spare-tokens`, plus les articles Ollama) et
l'article mentionnant Continue.dev, qui est le cas déjà identifié.

## Note

À croiser avec `.todos/internal-link-opportunities.md` : quand un article est ouvert pour une
correction de fraîcheur, c'est le bon moment pour lui ajouter ses liens internes manquants s'il
fait partie des 102 orphelins. Deux chantiers, une seule ouverture de fichier.
