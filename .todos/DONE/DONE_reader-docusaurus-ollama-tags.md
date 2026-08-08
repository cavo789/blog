# Reader review : docusaurus-ollama-tags

**Détecté :** 2026-08-08
**Clôturé :** 2026-08-08
**Article :** .unpublished/docusaurus-ollama-tags/index.md
**Verdict :** DONE (restructuré selon le plan ci-dessous)

## Résumé de l'implémentation

Nettoyage de contenu préalable effectué : commentaire d'assistant IA resté dans le texte (l.108) supprimé, `<!-- truncate -->` ajouté, `<TLDR>` et un hook réel écrits, l'`<AlertBox>` non fermée corrigée, une vraie Conclusion écrite (tout absent avant). Réordonnancement appliqué selon la table ensuite — frontmatter complété (`description`, `authors: [christophe, claude]`, `ai_assisted: true`).

## Problème

Time to value : **~49 %** (preuve la plus proche du sujet réel — capture « Running the tag
generation script », l. 82 — sur un corps d'environ 140 lignes ; calcul approximatif car
**l'article n'a pas de marqueur `<!-- truncate -->`** : rien ne délimite l'extrait affiché sur
la page d'index du blog, donc tout le contenu — y compris le `<ProjectSetup>` de 11 fichiers —
serait actuellement montré tel quel sur la liste des articles.
Drapeaux : install-avant-preuve — le tout premier contenu après le titre est un
`<ProjectSetup>` créant 11 fichiers (devcontainer, scripts, données, compose), avant toute
preuve. Ni `<TLDR>` ni `description` frontmatter ne sont présents.
**Défaut de contenu bloquant :** la ligne 108 contient un commentaire d'assistant IA resté dans
le texte publié par erreur (« This is a great addition to your post. To make it more
reader-friendly, I have restructured your content... ») — à supprimer avant tout travail de
structure, ce n'est pas du contenu éditorial.

Test des 30 secondes : impossible à évaluer proprement — sans `<!-- truncate -->` ni `<TLDR>`,
il n'y a pas de mouvement 1 (accroche) : le lecteur passe directement du titre à une commande à
copier-coller pour reconstruire toute l'arborescence du projet.

## Risque

Cet article est plus qu'un problème d'ordre : il lui manque l'ancre `truncate`, le `<TLDR>`, une
vraie conclusion, et il contient un fragment de conversation avec l'assistant resté par erreur
dans le corps publié. La restructuration seule ne suffit pas — un nettoyage de contenu est un
préalable.

## Solution

Ordre proposé, section par section (après nettoyage du contenu) :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1. Accroche | À écrire (absente), suivie de `<!-- truncate -->` | nouveau |
| 2. Résultat | Captures « generated tags » + « suggested_interlinks.json » | l. 82-107 |
| 3. Pourquoi ça marche | Ce que fait le script d'analyse (sans code) | résumé de l. 88-96 |
| 4. Installation | `<ProjectSetup>` (arborescence + devcontainer) + téléchargement du modèle + test du service Ollama | l. 14-76 |
| 5. Plus de démos | Lancer le script de génération de tags | l. 78-86 |
| 6. Sous le capot (optionnel) | Choix du modèle (8B/Mistral/70B) — après suppression du commentaire d'IA en l. 108 | l. 110-155 |
| 7. Conclusion | À écrire (absente) | nouveau |

Cible : time to value < 15 %. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.
