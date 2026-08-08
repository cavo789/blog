# Reader review : traefik

**Détecté :** 2026-08-08
**Clôturé :** 2026-08-08
**Article :** .unpublished/traefik/index.md
**Verdict :** DONE (restructuré selon le plan ci-dessous)

## Résumé de l'implémentation

Réordonnancement appliqué selon la table. La capture d'écran demandée a été remplacée par une preuve réelle équivalente : un vrai conteneur Traefik (v2.11 — la v3.2 a un bug de négociation de version d'API Docker dans cet environnement) a routé un vrai conteneur `whoami` par son label `Host()`, sans redémarrage — `curl` avec l'en-tête Host confirmé routé (en-têtes `X-Forwarded-*`), et le router visible dans `/api/http/routers` — capturé dans `files/terminal_routing_proof.txt`.

## Problème

Time to value : **100 %** — aucune preuve dans les 136 lignes du corps. Aucun `<Terminal>` ne
capture une sortie réelle (les deux seuls `<Terminal>` montrent des commandes tapées — `htpasswd`,
`mkcert` — pas un résultat), et le dossier ne contient pas d'`images/`.
Drapeaux : **installation-avant-preuve** — « Setting Traefik Up » (l. 52-102, `mkdir`, `docker
network create`, `<Snippet>` compose.yaml) démarre l'installation sans qu'aucune preuve n'ait
encore été montrée, et aucune ne le sera plus loin non plus.
Redondance : « quatre concepts » répété 3 fois (TLDR, StepsCard, Key Takeaways) — sous le seuil.

Test des 30 secondes : « Le problème et les quatre concepts sont clairs et bien expliqués, je
reste — jusqu'à la section Setting Traefik Up, où je dois monter tout un stack Docker sans avoir
vu une seule fois que ça route vraiment quelque chose. »

## Risque

L'article décrit littéralement sa propre preuve sans jamais la montrer : la section « The
Dashboard, as the Debugging Tool » (l. 134-136) explique qu'ouvrir `https://traefik.home.arpa`
affiche chaque routeur découvert — c'est l'écran qui prouverait que tout fonctionne, et il n'est
jamais capturé. Une capture de la barre d'adresse `https://ollama.home.arpa` (sans port, sans
avertissement de sécurité) réglerait aussi le problème en une image.

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1 | Hook | l. 15-23 |
| 2 | **Nouveau** : preuve — capture d'écran du dashboard Traefik ou de la barre d'adresse `https://ollama.home.arpa` fonctionnant (à créer) | dérivé de l. 104-110, 134-136 |
| 3 | The Problem It Actually Solves | l. 27-31 |
| 4 | Four Concepts, Not a Config File | l. 33-50 |
| 5 | Setting Traefik Up (installation) | l. 52-102 |
| 6 | Routing a Real Service: Open WebUI / Portainer | l. 104-122 |
| 7 | Making the Hostnames Resolve | l. 124-132 |
| 8 | The Dashboard, as the Debugging Tool (marquer « sous le capot ») | l. 134-136 |
| 9 | Three Tools, One Socket | l. 138-142 |
| 10 | Key Takeaways / Conclusion | l. 144-161 |

Cible : time to value < 15 %. Une capture d'écran manquante est le vrai bloqueur — noter ce
besoin explicitement dans l'implémentation. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.
