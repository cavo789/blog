# 0134 — Rien ne vérifie que les 258 traductions disent la même chose que l'original

- **Priority**: High — une traduction peut affirmer le contraire de l'original sans qu'aucun signal ne se déclenche
- **Batch**: i18n-fr
- **Depends**: —
- **Files**: `scripts/translate-drift.mjs`, `scripts/lib/translate-validate.mjs`, `.devcontainer/scripts/helpers/translation.sh`

## Problème

Les 10 contrôles de `translate-validate.mjs` sont tous **mécaniques** : front matter copié
octet pour octet, mots bannis, blocs de code intacts, ancres valides, `slug` non traduit,
`language: fr`. Ce sont des contrôles de **forme**, et ils sont excellents pour ça.

Aucun ne lit le **sens**. Le cas qui passe entre toutes les mailles :

```text
EN : This does NOT work under WSL 1.
FR : Cela fonctionne sous WSL 1.
```

Structure identique, aucun mot banni, code intact, ancres bonnes, front matter conforme. **Les 10
contrôles passent.** La traduction affirme le contraire de l'original, et rien dans la chaîne ne
peut le voir — ni `translate:check`, qui ne mesure que la dérive du *hash source*, ni `--repair`,
qui rejoue ce même validateur.

Les 258 traductions sont donc aujourd'hui **crues sur parole** quant à leur fidélité. ≈ 41 $ de
traduction dont personne n'a jamais vérifié le contenu.

## Ce qui rend l'idée réalisable

L'alignement est **gratuit et exact**, ce qui est habituellement la partie difficile :

- chaque `index.md.translation.json` stocke déjà le texte anglais **au moment de la traduction**
  (clé `source`) — on compare la traduction à ce qui a réellement été traduit, pas à une version
  ultérieure ;
- le contrat de traduction impose la préservation de la structure, et le validateur la vérifie
  déjà (check 3 : mêmes composants MDX, même ordre, même arité). L'appariement paragraphe à
  paragraphe est donc fiable par construction.

258 paires, un modèle local, coût nul.

## Piste de solution

Découper chaque paire en paragraphes, puis demander au modèle local, paragraphe contre
paragraphe, un verdict fermé : `équivalent` | `divergent` | `doute`. Sortie contrainte par schéma
JSON (`format:`), comme `generate-questions.mjs`.

Sortie : une liste d'articles suspects, avec le paragraphe incriminé des deux côtés. On ne paie
Claude (`translate --repair`) que sur cette liste.

### Cadrage du juge — c'est là que tout se joue

- **Ne pas juger le style.** Une traduction idiomatique n'est pas une divergence. Seul un fait
  affirmé d'un côté et absent, inversé ou modifié de l'autre compte.
- **Un modèle de prose, pas de code.** Les trois Modelfiles actuels portent des system prompts de
  *code review* (« senior software engineer », « strict code reviewer »), ce qui tire le modèle
  dans la mauvaise direction pour juger de la prose. Aucun nouveau modèle n'est nécessaire : les
  scripts envoient déjà leur propre `system` par requête (voir `generate-questions.mjs`), donc
  c'est le même modèle, le même runner, zéro GB de VRAM supplémentaire.
- **Attention aux homographes FR/EN**, le piège déjà consigné dans
  `feedback_validator_false_positives` : lire le contexte avant d'accuser le modèle de traduction.
- Les blocs de code sont copiés à l'identique par contrat : **les exclure du jugement**, ils ne
  peuvent que produire du bruit.

### Incrémental

Un article dont ni la source ni la traduction n'ont bougé depuis son dernier jugement ne doit pas
être resoumis. Le sidecar `.translation.json` est l'endroit naturel pour le verdict.

## Critère d'acceptation

1. Un run complet sur les 258 paires se termine sans appel API — vérifier qu'aucune clé
   Anthropic n'est requise pour le lancer.
2. Le rapport nomme l'article, le paragraphe anglais et le paragraphe français, jamais juste
   « article suspect ».
3. **Test de détection** : introduire volontairement une négation inversée dans une traduction,
   relancer, et vérifier qu'elle est signalée. Sans ce test, le run vert ne prouve rien —
   `feedback_verification_discipline` : vérifier l'artefact, pas le code de sortie.
4. Contrôle manuel de 20 divergences signalées : le taux de vrais positifs est écrit dans ce TODO.
5. Relancer immédiatement : 0 paire rejugée.

## À ne pas oublier

- Ce contrôle **ne remplace pas** `translate-validate.mjs`, il le complète sur l'axe que celui-ci
  ne couvre pas. Ne rien retirer des 10 contrôles existants.
- Ne jamais corriger automatiquement une traduction depuis le modèle local : la sortie de ce
  script est une **liste de suspects**, l'écriture reste le travail de `translate --repair`.
- Un `doute` n'est pas un `divergent`. Les compter séparément, sinon le taux de faux positifs est
  ininterprétable.
