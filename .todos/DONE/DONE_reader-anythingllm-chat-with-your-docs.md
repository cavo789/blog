# Reader review : anythingllm-chat-with-your-docs

**Détecté :** 2026-08-08
**Clôturé :** 2026-08-08
**Article :** .unpublished/anythingllm-chat-with-your-docs/index.md
**Verdict :** DONE (restructuré selon le plan ci-dessous)

## Résumé de l'implémentation

Réordonnancement appliqué selon la table. La preuve manquante (question posée + réponse sourcée, jusqu'ici seulement décrite l.116-118) a été produite réellement : AnythingLLM + Ollama (modèle `llama3` + `nomic-embed-text`) lancés dans des conteneurs Docker sur le réseau existant, un document `vpn-notes.md` réel envoyé via l'API `/api/v1/document/upload`, embedded, puis interrogé via `/api/v1/workspace/.../chat` — réponse correcte avec citation de la source, capturée dans `files/terminal_chat_proof.txt`.

## Problème

Time to value : **40 %** (preuve la plus proche — `<Terminal>` `docker compose up --detach`
montrant le conteneur démarré, l. 92 — sur un corps de 164 lignes après `<!-- truncate -->`,
l. 27). En réalité le vrai résultat promis — une question posée au chat et une réponse citant
sa source — n'est **jamais montré**, seulement décrit en prose (l. 116-118) ; aucune image dans
tout l'article hormis la bannière.
Drapeaux : install-avant-preuve (AlertBox « Prerequisites », l. 62) et abstraction-avant-preuve
(`<Snippet filename="compose.yaml">`, l. 70, avant le premier `<Terminal>`, l. 74).
Redondance : « réponse avec la source citée » énoncé **3 fois** (TLDR l. 20, l. 43, l. 118) —
acceptable.

Test des 30 secondes : l'accroche et le « Problem » sont solides (le grep qui échoue, le
graveyard de docs), je reste jusqu'à la Part 1. Mais la Part 1 est une installation Docker
complète (compose.yaml, secret JWT, `cap_add: SYS_ADMIN`, pull du modèle d'embedding) sans
jamais voir à quoi ressemble une vraie réponse citée — je décroche avant d'avoir vu la preuve
que l'outil promis fonctionne.

## Risque

Deux setups Docker complets (Part 1 et Part 2) sont écrits, mais le lecteur n'atteint jamais la
capture d'écran ou le transcript qui prouverait que « poser une question, obtenir une réponse
avec la source » marche réellement — cette preuve n'existe même pas encore dans le brouillon,
elle est seulement racontée l. 116-118.

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1. Accroche | Inchangée | l. 23-25 |
| 2. Résultat | Capture d'écran ou transcript d'une question posée dans le chat + réponse avec la source citée — **à créer**, décrit en l. 116-118 | nouveau, décrit l. 116-118 |
| 3. Pourquoi ça marche | « What AnythingLLM Actually Does » + « Is It Actually Useful » (sans code) | l. 35-56 |
| 4. Installation | Part 1 — compose.yaml, `.env`, `cap_add`, pull du modèle d'embedding, `up` | l. 58-97 |
| 5. Plus de démos | Premier lancement (onboarding), alimentation en documents réels | l. 99-124 |
| 6. Sous le capot (optionnel) | Part 2 — séparer documents (poste travail) et GPU (poste maison) | l. 126-174 |
| 7. Conclusion | Inchangée | l. 175-191 |

Cible : time to value < 15 %. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.
