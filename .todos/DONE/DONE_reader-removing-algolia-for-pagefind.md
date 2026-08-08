# Reader review : removing-algolia-for-pagefind

**Détecté :** 2026-08-08
**Clôturé :** 2026-08-08
**Article :** .unpublished/removing-algolia-for-pagefind/index.md
**Verdict :** DONE (restructuré selon le plan ci-dessous)

## Résumé de l'implémentation

Réordonnancement appliqué selon la table. La capture d'écran manquante a été produite réellement, dans ce dépôt même : `yarn build` (déjà exécuté), un serveur statique local, et un script Playwright (déjà présent dans `node_modules`) ouvrant la modale de recherche et tapant « caesiumclt » — capture réelle montrant l'article CaesiumCLT et plusieurs sections correspondantes, enregistrée dans `images/pagefind-search-caesiumclt.png`.

## Problème

Time to value : **100 %** — aucune preuve dans tout le corps de l'article (124 lignes après
`<!-- truncate -->`). Ni `<Terminal>` montrant une recherche fonctionnant, ni capture d'écran,
ni bloc plaintext/mermaid : le dossier `.unpublished/removing-algolia-for-pagefind/` ne contient
même pas de sous-dossier `images/`.
Drapeaux : aucun `<Prerequisite>`/`apt install` à proprement parler, mais la section
« Migration: What Changed » (l. 62-100) enchaîne quatre diffs de configuration sans qu'aucune
preuve visuelle ne les précède ou ne les suive.
Redondance : « Algolia ignore les blocs de code » énoncé 3 fois — sous le seuil.

Test des 30 secondes : « le problème (recherche de `caesiumclt` qui échoue) est raconté, mais
rien ne me montre que ça marche maintenant — je dois croire l'auteur sur parole » — l'anecdote
d'ouverture pose un avant très concret (zéro résultat) mais l'article ne referme jamais la
boucle avec un après visible.

## Risque

Le matériau du « avant » existe déjà et est excellent (l. 24 : recherche de `caesiumclt`, zéro
résultat). Il n'existe simplement aucun équivalent « après » — une capture d'écran de la modale
Pagefind trouvant `caesiumclt` réglerait le TTV en une image. Sans elle, même un lecteur convaincu
par la théorie n'a jamais la confirmation que la migration a résolu le problème qu'il vient de
lire.

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1 | Hook — anecdote `caesiumclt` (inchangé) | l. 16-26 |
| 2 | **Nouveau** : preuve — capture d'écran de la recherche Pagefind trouvant `caesiumclt` (à créer) | dérivé de l. 24 et 148-152 |
| 3 | Enter Pagefind (pourquoi ça marche, sans code) | l. 44-60 |
| 4 | Why Algolia DocSearch Fails (contexte) | l. 30-42 |
| 5 | Migration: What Changed (installation) | l. 62-100 |
| 6 | One Caveat / Another Caveat (marquer « optionnel/sous le capot ») | l. 102-146 |
| 7 | Conclusion | l. 148-152 |

Cible : time to value < 15 %. Une capture d'écran manquante est le vrai bloqueur ici — noter
explicitement ce besoin dans l'implémentation. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.
