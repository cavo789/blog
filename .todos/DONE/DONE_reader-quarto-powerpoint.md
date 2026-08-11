# Reader review : quarto-powerpoint

**Détecté :** 2026-08-11
**Article :** blog/2023/12/25/quarto-powerpoint/index.md
**Verdict :** RESTRUCTURE

## Problème

Time to value : **79 %** (première capture `pptx_slide_1.webp` l. 76, corps de 63 lignes,
truncate l. 26).

Drapeaux : abstraction-avant-preuve — le `<Snippet filename="slides.md">` occupe les l. 39 à 72,
soit **33 des 63 lignes du corps**, dont l'essentiel est du *lorem ipsum* latin sans aucune valeur
informative. La seule information réelle de l'article, `quarto render slides.md --to pptx`, est une
ligne unique (l. 74), coincée entre le remplissage et les captures.

Redondance : 🟢 (mais le rapport signal/bruit du bloc de code est très bas).
Landing : absente — l'article s'achève sur une `<AlertBox>` « au fait, on peut aussi faire du
revealjs », sans Conclusion ni récapitulatif.

Test des 30 secondes : *« je décroche »* — j'ouvre un article qui promet un PowerPoint et je tombe
sur trois écrans de faux latin, sans avoir vu une seule diapositive.

## Risque

L'article possède quatre captures de diapositives PowerPoint réellement générées — la preuve
parfaite pour ce sujet — et les place toutes après le bloc de remplissage. Le lecteur d'une minute
ne saura jamais que Quarto transforme un titre `##` en diapositive et un `---` en séparateur : il
n'aura vu que du texte.

La règle *Say it once* est aussi en jeu : 33 lignes de contenu qui n'apprennent rien. Le même
exemple tient en 12 lignes (deux chapitres, une sous-section, deux phrases courtes) et enseigne
exactement la même chose.

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1 | `## From Markdown to PowerPoint in one command` — `quarto render slides.md --to pptx` + la capture `pptx_slide_1.webp` juste dessous | l. 74 (commande) + l. 76 (capture) |
| 2 | Une phrase nommant la règle : « chaque `##` devient une diapositive, chaque `---` en crée une nouvelle » | nouveau (2 lignes) |
| 3 | `## The source file` — le `<Snippet filename="slides.md">` **raccourci** : garder la structure (titre, `## Chapter 1`, `## Chapter 2`, `---`, `### Chapter 2.1`) et réduire chaque paragraphe de lorem ipsum à une seule phrase | l. 39-72, condensé |
| 4 | Les trois captures restantes | l. 78-82 |
| 5 | `<AlertBox variant="info" title="Docker image with Quarto">` déplacée ici, en note d'installation | l. 28-31 |
| 6 | `## Conclusion` — récap + la remarque revealjs transformée en retombée, avec liens vers `/blog/docker-quarto` et `/blog/quarto-revealjs-tips` | l. 84-89 étoffées |

Cible : time to value < 15 %. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.
