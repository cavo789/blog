# 0131 — ELI5 : un backend Ollama gratuit, et surtout qu'on se souvienne qu'il existe

- **Priority**: Medium — ne fait économiser que quelques centimes par article, mais débloque l'itération sur le prompt
- **Batch**: eli5-tooling
- **Depends**: —
- **Files**: `scripts/generate-eli5.mjs`, `scripts/bulk-eli5.mjs`, `.devcontainer/scripts/helpers/ollama.sh`, `scripts/lib/cheatsheet-hint.mjs`

## Problème

La génération ELI5 passe par l'API Anthropic (`claude-haiku-4-5-20251001`), à **0.01 $ par
fichier**. Mesuré le 2026-09-23 : **806 sidecars EN + 805 FR = 1611**, soit ≈ 16 $ dépensés au
total depuis l'origine.

Ce n'est pas le coût courant qui pose problème — un nouvel article, c'est ~4 snippets × 2 locales
= **0.08 $**. Migrer ça vers Ollama ne ferait économiser rien du tout.

Le coût qui compte est celui de la **régénération de masse** : toucher au prompt ELI5, c'est 16 $
et plusieurs heures. Conséquence concrète : le prompt n'a jamais été retravaillé depuis sa
rédaction. Le prix ne bloque pas la production, il bloque l'amélioration.

## Pourquoi le local est techniquement bien placé ici

Contrairement à la prose d'article, un ELI5 est une tâche **structurée et bornée** : un JSON à
deux clés, des numéros de ligne à respecter, des phrases courtes. C'est le profil où un modèle
local tient la comparaison.

Et sur un point précis, il fait **mieux** que le chemin actuel : `generate-questions.mjs` passe
`format: RESPONSE_SCHEMA` à Ollama, qui **contraint la grammaire de sortie**. Côté Claude,
`generate-eli5.mjs` porte `repairLoneBackslashes()` — un correctif né d'une regex mal échappée
dans un snippet nginx, qui avait coûté deux runs complets avant que la cause soit comprise. Un
schéma imposé supprime cette classe d'erreur au lieu de la réparer après coup.

## Piste de solution

**Un flag `--backend ollama|claude`, Claude restant le défaut.** Le prompt
(`systemPromptFor(locale)`) et toute la validation en aval (clés numériques, bornes de lignes,
nettoyage) sont déjà factorisés et ne bougent pas : seul l'appel change. Écrire `model:` dans le
sidecar avec le nom réel du modèle utilisé — il y est déjà, il faut juste qu'il cesse d'être une
constante en dur.

Usage visé, à énoncer dans l'aide : **itérer localement, publier avec Haiku.** Le backend local
sert à tester une reformulation de prompt sur 30 snippets sans rien dépenser ; la passe finale
reste payante et de qualité connue.

## La partie qui compte vraiment : la découvrabilité

Une option qu'il faut se rappeler est une option morte. Le principe est déjà posé dans la mémoire
projet (`feedback_verification_discipline` : *mécanisme > discipline*). Trois endroits, à faire
tous les trois :

1. **Un écran d'aide `eli5`**, calqué sur celui de `questions` dans `helpers/ollama.sh`.
   Aujourd'hui l'asymétrie est un piège en soi : `questions` seul affiche son mode d'emploi,
   `eli5` seul **lance une génération sur tout le blog**.
2. **Le hint qui te trouve** — le seul qui compte réellement. À chaque run payant,
   `generate-eli5.mjs` imprime, *avant* de dépenser :
   `💡 12 fichiers × 0.01 $ = 0.12 $ · --backend ollama pour itérer gratuitement`.
   Il apparaît au moment exact où il est pertinent, donc il ne peut pas être oublié. Passer par
   `cmd()` de `cheatsheet-hint.mjs`, comme tout hint « fix it with… » du dépôt.
3. **La ligne `@desc`** de la fonction `eli5`, visible à chaque ouverture de shell.

## Critère d'acceptation

1. `eli5` seul affiche un écran d'aide et **ne génère rien**.
2. `eli5 <fichier> --backend ollama` écrit un sidecar valide, `model:` portant le nom du modèle
   Ollama, sans qu'`ANTHROPIC_API_KEY` soit nécessaire.
3. Un run Claude imprime la ligne de coût **et** la mention `--backend ollama` avant l'appel.
4. Sur 30 snippets choisis au hasard, comparer les deux backends côte à côte et **écrire le
   verdict dans ce TODO** — c'est le seul moyen de savoir si le local est utilisable pour autre
   chose que l'itération.
5. `welcome` liste toujours ses 21 commandes en 7 catégories.

## À ne pas oublier

- Le sidecar FR est généré **à partir du code**, pas traduit depuis l'anglais (voir l'en-tête de
  `generate-eli5.mjs`). Le backend local doit donc être évalué séparément sur `--locale fr` : un
  modèle peut être bon en explication anglaise et médiocre en français.
- Ne pas toucher à `hashSource()` : changer de backend ne doit pas invalider les 1611 sidecars
  existants.
