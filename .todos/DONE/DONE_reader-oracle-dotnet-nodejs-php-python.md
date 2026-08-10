# Reader review : oracle-dotnet-nodejs-php-python

**Détecté :** 2026-08-09
**Article :** blog/2025/04/18/oracle-dotnet-nodejs-php-python/index.md
**Verdict :** RESTRUCTURE

## Problème

Time to value : **28 %** (preuve ligne 90 sur un corps de 200 lignes, `<!-- truncate -->` en
ligne 33).
Drapeaux : **installation-avant-preuve** — `## Some prerequisites` (l. 39, `<StepsCard>`) arrive
juste après le `<!-- truncate -->`, avant toute preuve. **Abstraction-avant-preuve** — un
`<Snippet filename="Dockerfile">` (l. 76) apparaît lui aussi avant la première preuve (l. 90).
Redondance : le motif mkdir → Dockerfile → Snippet → capture se répète 4 fois (une fois par
langage), mais c'est un contenu légitime, pas du remplissage.

Test des 30 secondes : le lecteur doit lire une liste de 6 prérequis puis suivre les
instructions .Net (mkdir, Dockerfile, 2 Snippets) avant de voir la première preuve que quoi que
ce soit fonctionne. "J'abandonne" — rien ne prouve encore que la connexion à Oracle marche.

## Risque

Le "TLDR" en frontmatter promet un "quickstart template... ready-to-use" mais le corps ouvre sur
une checklist de prérequis puis un mur de fichiers à créer avant la première capture d'écran
`using_dotnet.webp` (l. 90, "Job done, our .Net code has accessed the list."). Cette capture est
exactement la preuve qu'il faut montrer en premier — le reste (Dockerfile, .csproj, main.cs) est
la mécanique, pas la promesse.

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1 | Hook + promesse (inchangé) | l. 19-31 |
| 2 | **Résultat d'abord** : capture `using_dotnet.webp` (l. 90) — "voici le résultat, quel que soit le langage choisi ci-dessous" | l. 90 |
| 3 | `## Some prerequisites` (déplacé après la preuve) | l. 39-52 |
| 4 | `## The code samples were largely created using AI` (contexte, garder court) | l. 54-58 |
| 5 | `## Access our Oracle DB container using .Net` (et les 3 sections suivantes NodeJS/PHP/Python, inchangées) | l. 60 et suivantes |
| 6 | `## Conclusion` si absente — récap + lien vers l'alternative REST (`/blog/docker-oracle-ords`, déjà cité l. 31) | à vérifier/écrire |

Cible : time to value < 15 %. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.
