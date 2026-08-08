# Reader review : ai-agent-in-devcontainer

**Détecté :** 2026-08-08
**Clôturé :** 2026-08-08
**Article :** .unpublished/ai-agent-in-devcontainer/index.md
**Verdict :** DONE (restructuré selon le plan ci-dessous)

## Résumé de l'implémentation

Réordonnancement appliqué selon la table. La preuve du sandbox réseau (l.143-145, jusqu'ici racontée en prose) a été remplacée par un vrai `<Terminal>` : un `iptables`/`ipset` minimal reproduisant l'allowlist a été construit et exécuté dans un conteneur Docker (`--cap-add=NET_ADMIN`), confirmant `example.com` bloqué et `api.github.com` accessible (`HTTP 200`) — capturé dans `files/terminal-firewall-check.txt` avec un AlertBox précisant qu'il s'agit d'une reproduction minimale, pas du script `init-firewall.sh` complet.

## Problème

Time to value : **100 %** (aucune preuve — pas de `<Terminal>` de sortie, pas d'image, pas de
bloc `plaintext`/`mermaid` — sur un corps de 144 lignes après `<!-- truncate -->`, l. 28).
Drapeaux : aucun drapeau mécanique (pas de `<Prerequisite>`, pas d'`apt install`, pas de
`<Snippet>`) — mais aussi aucune preuve, ce qui est pire : l'article est un essai/analyse avec
des blocs de config JSON à éditer, jamais un résultat montré.
Redondance : « un défaut n'est jamais neutre » énoncé **3 fois** (titre, l. 38-40, l. 168) —
acceptable, chaque occurrence apporte un angle différent (annonce, argument, conclusion).

Test des 30 secondes : je reste sur l'accroche (un projet a retiré Claude Code par défaut, angle
inhabituel), mais l'article ne montre jamais un agent tourner ni le firewall bloquer un domaine —
tout reste au niveau du texte et des blocs de config JSON à copier-coller.

## Risque

L'AlertBox l. 143-145 décrit un résultat concret et vérifiable — « le script confirme que
`example.com` est bloqué et `api.github.com` est joignable » — mais ce résultat n'est jamais
montré comme preuve, seulement raconté. C'est exactement le genre de preuve qui devrait ouvrir
l'article (mouvement 2) au lieu d'être enterrée en bas d'une section de configuration réseau.

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1. Accroche | Inchangée | l. 24-27 |
| 2. Résultat | Sortie du script d'auto-vérification du sandbox réseau (`example.com` bloqué, `api.github.com` accessible) — à capturer en `<Terminal>` réel, décrit actuellement en prose | l. 143-145 |
| 3. Pourquoi ça marche | « What Changed in Symfony Docker » + « A Default Is Never Neutral » (sans bloc de code) | l. 30-44 |
| 4. Installation | Installer OpenCode + le pointer vers un modèle Ollama local | l. 46-110 |
| 5. Plus de démos | Les 4 étapes du sandbox réseau (`NET_ADMIN`, script firewall, `postStartCommand`) | l. 112-141 |
| 6. Sous le capot (à marquer comme optionnel) | Sans VS Code, image partagée prod/devcontainer | l. 158-164 |
| 7. Conclusion | Inchangée | l. 166-172 |

Cible : time to value < 15 %. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.
