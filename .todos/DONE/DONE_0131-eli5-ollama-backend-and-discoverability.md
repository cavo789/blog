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

## Verdict du bench (2026-09-25) — critère d'acceptation 4

**Protocole.** 30 snippets tirés au hasard (`seed=131`, reproductible) parmi les 714 qui ont
*déjà* un sidecar Claude dans les deux locales — le côté Claude de la comparaison est donc
gratuit, il est lu sur le disque. 60 générations Ollama (`code-quality:latest`, `think: false`,
schéma imposé), **0 échec**.

### Ce qui est mesuré

| | EN Claude | EN Ollama | FR Claude | FR Ollama |
|---|---|---|---|---|
| annotations / fichier | 5.7 | 5.5 | 5.8 | 5.6 |
| couverture des lignes | 24.2 % | 24.4 % | 24.7 % | 24.8 % |
| mots / annotation | 24.6 | 25.5 | 22.4 | 23.9 |
| résumé (mots) | 44.7 | 49.7 | 45.8 | 49.9 |
| clés hors bornes | 0 | 0 | 0 | 0 |

Vitesse : médiane **5.1 s** (EN) / **6.2 s** (FR) par fichier, max 22.8 s → les 30 snippets en
≈ 3 min, contre ≈ 0.30 $ côté Claude. Le schéma imposé tient sa promesse : **zéro** JSON
malformé, **zéro** numéro de ligne inventé sur 60 générations — `repairLoneBackslashes()` n'a
jamais eu à servir.

### Le français tient

Aucune fuite d'anglais, registre technique correct, identifiants laissés en anglais et mis entre
backticks. Contrairement à l'embedder de `anythingllm.mjs` (EN-only, ~2.5× plus bruité en FR),
**il n'y a pas ici de pénalité française** : les deux locales se comportent pareil.

### Ce qui disqualifie quand même le local pour la publication

Ce n'est **pas** l'exactitude. 8 annotations Ollama tirées au hasard parmi les 50 que Claude
n'avait pas écrites ont été vérifiées ligne à ligne : les 8 sont justes. Une qui semblait fausse
(`blogPostContainerID` « sert au flux RSS ») s'est révélée exacte après lecture de
`plugin-content-blog/lib/feed.js:98` — c'est Claude qui ne l'avait pas expliquée.

Le vrai écart est celui de la **sélection des lignes**, et il est systématique :

- **Il ignore la liste « skip » du prompt.** Sur `index.part2.js` (26 lignes) : 4 annotations
  côté Claude, 11 côté Ollama — dont les trois lignes d'`import` et le `<MDXContent>{children}</MDXContent>`
  final, que le prompt demande explicitement de sauter.
- **Il sous-explique les fichiers longs**, là où la valeur est la plus grande :
  `seed-history.sh` (148 lignes) 18 → 10, `get_folder_size.vbs` (63 lignes) 14 → 7.
- **Il n'écrit pas pour la même personne.** Claude : « We're declaring these as Optional because
  they start as None ». Ollama : « This sets the authentication mode to SYSDBA, which grants
  administrative privileges ». Techniquement plus précis, mais c'est de la doc de référence, pas
  un ELI5 — il explique la ligne *intéressante*, pas la ligne *déroutante*.

**Conclusion : l'usage visé du TODO est le bon, et c'est le seul.** Itérer localement (le coût
d'un aller-retour de prompt passe de 16 $ à 0 $ et de plusieurs heures à ~3 min pour 30 snippets),
publier avec Haiku. Aucune régénération de masse en local à envisager.

Piste ouverte si le local devait un jour servir à publier : le prompt actuel décrit la liste des
exclusions en prose. Un modèle local la suivrait sans doute mieux si elle était contrainte
autrement qu'en langue naturelle — mais c'est précisément le genre d'essai que ce backend rend
maintenant gratuit.

## Addendum (2026-09-25, même jour) — provenance plutôt qu'interdiction

Livré tel quel, `--backend ollama` écrasait le sidecar publié sans laisser de trace exploitable.
Première utilisation réelle, le jour même : `eli5 …/Byte2Bin.pas --backend ollama --force` a
remplacé 5 annotations Haiku par 2 annotations locales. Fichier restauré.

Le vrai défaut n'est pas l'écriture — c'est qu'elle était **invisible** : `sourceHash` ne répond
qu'à « la source a-t-elle changé ? », donc `eli5:check` classait le fichier dégradé comme frais.

### Deux corrections écartées, et pourquoi

1. **Un second flag `--i-know` en plus de `--force`.** Écarté par l'auteur : `--force` *est* déjà
   le geste « oui, j'écrase », et le seul chemin vers l'accident passe par lui. Un second flag ne
   sépare pas deux intentions, il se colle au premier et cesse de vouloir dire quoi que ce soit.
2. **Rediriger la sortie locale vers `.eli5-local/`.** Implémenté, puis **retiré** — également sur
   objection de l'auteur, et elle était juste sur deux plans. D'abord ce répertoire ne sert à
   rien : rien ne le lit, rien ne le publie. Ensuite la justification avancée (« tu peux differ
   contre le sidecar publié ») ne tient pas, puisque Claude n'est pas déterministe non plus — une
   régénération payante produirait elle aussi un diff. Et surtout, cela cassait le critère
   d'acceptation 2 de ce TODO même : « écrit un sidecar valide », pas « écrit un brouillon
   ailleurs ». Sur-correction à partir d'un incident unique.

### Ce qui a été retenu

**Le backend local écrit le vrai sidecar, comme Claude.** C'est ce que le TODO demande. La
protection est la **provenance, pas le refus** : `check-eli5-freshness.mjs` gagne une 3ᵉ passe qui
liste tout sidecar publié dont `model` n'est pas un `claude-*`, imprime la commande de
régénération payante, et fait échouer `--strict`. Rendre visible plutôt qu'interdire — le bon
niveau quand c'est l'auteur seul qui décide ce qui se publie.

**Au passage, une correction au verdict du bench ci-dessus.** Il concluait « il explique la ligne
intéressante, pas la ligne déroutante ». Vrai mais incomplet : 5 générations du *même* fichier de
22 lignes donnent 2, 2, 3, 5 puis 6 annotations. La couverture n'est pas un jugement stable du
modèle, c'est de la **variance run à run** — ce qui interdit de juger le backend sur une seule
sortie. Le seul biais réellement systématique observé : `Byte2Bin := St;` (retour Pascal par
affectation au nom de la fonction, l'unique idiome du fichier) n'a été annotée dans **aucun** run,
ni mentionnée dans un seul résumé.
