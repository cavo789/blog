# Reader review : mcp-python-server

**Détecté :** 2026-08-08
**Clôturé :** 2026-08-08
**Article :** blog/2026/09/29/mcp-python-server/index.md (actuellement `.unpublished/mcp-python-server/index.md`)
**Verdict :** DONE (restructuré selon le plan ci-dessous)

## Résumé de l'implémentation

Réordonnancement appliqué selon la table — « Using it in Claude Code » (la démo) déplacée en position 2, avant le code source complet du serveur. « Security considerations » et « Where MCP fits » regroupés sous « Under the Hood ».

## Problème

Time to value : **52 %** (preuve ligne 111 sur un corps de 169 lignes, `## Test the server
manually`).
Drapeaux : install-avant-preuve (`## Install`, l. 32-58, trois `<Terminal>` de `mkdir`/`pip
install`/vérification de version) **et** abstraction-avant-preuve (`<Snippet source="./files/server.py">`,
l. 61, le fichier Python complet du serveur, avant toute démonstration).
Redondance : aucune.

Test des 30 secondes : "j'abandonne" — après la théorie MCP (l. 26-30) et l'installation
(l. 32-58), le lecteur tombe sur un dump de code Python complet (l. 61) sans avoir vu Claude Code
utiliser un seul outil du serveur. C'est l'anti-pattern "Dumping the implementation source before
the demo" cité dans `blog-post-structure`.

## Risque

La vraie preuve — `## Using it in Claude Code` (l. 121+) — existe déjà et est probablement le
moment le plus convaincant de l'article (Claude Code interrogeant Docker via MCP), mais elle
arrive après le code source complet du serveur, que le lecteur ne peut pas encore juger utile.

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1 | `## What MCP is` (2 paragraphes, condensé à l'essentiel) | l. 26-30 (existant) |
| 2 | `## Using it in Claude Code` (la démo : question posée, outil appelé, réponse) | l. 121-148 (existant) |
| 3 | `## Install` | l. 32-58 (existant) |
| 4 | `## The server` (le code complet, maintenant que sa valeur est prouvée) | l. 59-75 (existant) |
| 5 | `## How FastMCP works` | l. 76-93 (existant) |
| 6 | `## Register with Claude Code` | l. 95-105 (existant) |
| 7 | `## Test the server manually` | l. 107-119 (existant) |
| 8 | `## Ideas for extending the server` | l. 149-172 (existant) |
| 9 | `## Security considerations` (marquer comme "under the hood") | l. 174-181 (existant) |
| 10 | `## Where MCP fits in your workflow` | l. 183-187 (existant) |
| 11 | `## Conclusion` | l. 189-193 (existant) |

Cible : time to value < 15 %. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.
