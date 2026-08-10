# Reader review : docusaurus-bluesky-share

**Détecté :** 2026-08-08
**Article :** blog/2025/08/13/docusaurus-bluesky-share/index.mdx
**Verdict :** RESTRUCTURE

## Problème

Time to value : **≈33 %** pour la première preuve intermédiaire (l. 110, capture "Are you
ready?" montrant qu'une injection dans `BlogPostItem` fonctionne) mais **91 %** pour la vraie
preuve de valeur — le bouton "Share on Bluesky" réellement en place, l. 230, sur un corps de
207 lignes.
Drapeaux : abstraction-avant-preuve — le `<Snippet>` du fichier `BlogPostItem.js` extrait par
swizzle (l. 90) précède la première capture (l. 110).

Test des 30 secondes : le lecteur suit une démonstration technique valide (swizzle → message de
test → injection du vrai bouton) mais le bouton final, qui est *le* sujet de l'article, n'est
montré qu'à la toute fin (section "Result", l. 226-230) — après avoir traversé 5 étapes de
création de fichiers (`index.js`, `share.js`, `bluesky.svg`, CSS, injection).

## Risque

Rien n'est à jeter : la capture finale (l. 230) est déjà excellente et montre exactement le
résultat annoncé par le titre. Le seul problème est sa position — elle ferme l'article au lieu
de l'ouvrir.

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1 | Hook + promesse (inchangé) | l. 32-40 |
| 2 | **Déplacé devant** : "Result" — capture du bouton Bluesky en place (`share_button.webp`) | l. 226-230 |
| 3 | We need to override how the article is rendered by Docusaurus (inchangé) | l. 53-68 |
| 4 | Extract the original file + test avec le message "Are you ready?" (inchangé) | l. 70-117 |
| 5 | Time to create our Bluesky Docusaurus component, 1/5 à 5/5 (inchangé) | l. 119-217 |
| 6 | Injection finale + confirmation (inchangé, sans redite de la capture déjà montrée en 2) | l. 219-224 |
| 7 | Final remarks - Take care about the swizzle command (conclusion, inchangée) | l. 241-249 |

Cible : time to value < 15 %. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.
