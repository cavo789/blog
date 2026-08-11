# Reader review : docker-phpdocumentor

**Détecté :** 2026-08-11
**Article :** blog/2023/12/27/docker-phpdocumentor/index.md
**Verdict :** RESTRUCTURE

## Problème

Time to value : **100 %** — la seule preuve de l'article, la capture
`./images/wordpress_phpdoc.webp`, est la **dernière ligne du fichier** (l. 61, truncate l. 28,
corps de 33 lignes).

Drapeaux :

- **install-avant-preuve** : `## Some preparation work` (l. 30) demande de créer un dossier, de
  télécharger une archive WordPress de plusieurs Mo via `curl`, de la dézipper — avant toute preuve ;
- **abstraction-avant-preuve** : `<Snippet filename="phpdoc.xml">` l. 46, avant la capture.

Redondance : 🟢 (article court).
Landing : absente — il n'y a rien après la capture, pas de Conclusion, pas de lien de sortie.

Test des 30 secondes : *« je décroche »* — le premier écran me demande de télécharger le code source
de WordPress alors que je ne sais pas encore à quoi ressemble la documentation générée.

## Risque

L'article promet « une seule commande pour documenter n'importe quelle base de code PHP », et cette
promesse est vraie : `docker run -it --rm -u $(id -u):$(id -g) -v .:/data phpdoc/phpdoc:3`. Mais un
lecteur d'une minute ne la voit jamais, parce que les 12 premières lignes du corps parlent de
`curl`, `unzip` et `cd`. Le seul argument visuel — un site de documentation complet, généré depuis
WordPress — est hors de son champ de vision.

Le téléchargement de WordPress n'est même pas nécessaire : le lecteur a déjà un projet PHP, c'est
pour ça qu'il lit l'article.

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1 | `## One command, a full documentation website` — la commande `docker run … phpdoc/phpdoc:3` + la capture juste dessous | l. 50 (commande) + l. 61 (capture) |
| 2 | Une phrase : « rien n'est installé sur votre machine, tout vit dans l'image » | nouveau (1-2 lignes) |
| 3 | `## The configuration file` — le `phpdoc.xml` et la phrase qui l'introduit | l. 42-48 |
| 4 | `<AlertBox variant="info" title="WSL2 - Windows">` | l. 54-59 |
| 5 | `## Want a sample codebase? (skip if you already have a PHP project)` — repliée dans un `<Details>` | l. 30-39 |
| 6 | `## Conclusion` — récap + lien vers `/blog/php-jakzal-phpqa` ou `/blog/docker-php-run-script-or-website` | nouveau |

Cible : time to value < 15 %. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.
