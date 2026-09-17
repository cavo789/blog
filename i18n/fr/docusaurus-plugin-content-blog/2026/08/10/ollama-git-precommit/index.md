---
slug: ollama-git-precommit
title: "ai-review, ai-secrets, ai-commit : trois vérifications zsh avant chaque git commit"
authors: [christophe, claude]
image: /img/v2/ai_review.webp
mainTag: ai
tags: [git, ollama, zsh, ai, security, code-quality]
date: 2026-08-10
description: "Trois fonctions zsh qui forment ensemble une barrière qualité locale et hors ligne avant le commit : ai-review repère les violations SOLID et les problèmes de nommage, ai-secrets sépare les vrais identifiants en dur des faux positifs, et ai-commit rédige le message Conventional Commits une fois que le diff est réellement propre."
language: fr
ai_assisted: true
series: "Ollama daily use"
blueskyRecordKey: 3ms5sdpk6kk2a
---

![ai-review, ai-secrets, ai-commit : trois vérifications zsh avant chaque git commit](/img/v2/ai_review.webp)

<!-- cspell:ignoreCase ai-test ai-commit ai-review ai-secrets qwen ollama zshrc SOLID getenv phpstan -->

<TLDR>
Cet article ajoute trois fonctions à la série « Ollama daily use » — `ai-review`, `ai-secrets` et `ai-commit` — qui couvrent ensemble le moment juste avant un `git commit`. Toutes les trois lisent le même `git diff --staged` : elles partagent donc un helper unique extrait (`_git_staged_diff`) au lieu de répéter trois fois les mêmes clauses de garde. Le workflow est volontaire : d'abord la revue, ensuite la détection de secrets, et enfin l'écriture du message de commit — une fois que le diff est vraiment ce que vous voulez.
</TLDR>

Le moment juste avant un `git commit` est probablement le plus précieux de tout le cycle de développement pour faire une pause et regarder ce que vous avez réellement écrit. Pas parce que quelque chose est forcément cassé — en général ça ne l'est pas — mais parce que c'est là que le diff est petit et délimité. Une minute de revue de plus, quand vous voyez encore clairement chaque ligne modifiée, vaut mieux qu'une heure d'archéologie plus tard.

J'ai déjà des [hooks pre-commit](/blog/git-precommit) qui lancent phpcbf, PHPStan et compagnie. Ceux-là attrapent des *règles*. Ce qu'ils n'attrapent pas, c'est le jugement : une méthode qui a discrètement pris trois responsabilités, un `0.21` en ligne 20 qui devrait avoir un nom (comme `discount_rate`), un `$d` qui était un nom de paramètre paresseux il y a trois mois et qui est illisible aujourd'hui — ou, plus grave, un vrai mot de passe de base de données qui s'est glissé dans un diff de configuration.

Ces trois fonctions comblent ce vide, en local, sans abonnement cloud.

<!-- truncate -->

## Ce que `ai-review` attrape avant même que vous écriviez un message de commit {#what-ai-review-catches-before-you-even-write-a-commit-message}

`ai-review` lit votre diff stagé et signale ce qu'un linter ne peut pas voir : une méthode qui fait discrètement trois choses à la fois, un nombre magique qui devrait avoir un nom, un paramètre qui avait du sens à une époque. Voici un diff stagé avec quelques problèmes plantés volontairement :

<Snippet filename="src/Invoice/InvoiceProcessor.php (staged diff)" source="./files/demo_review.diff" defaultOpen={false} />

<Terminal source="./files/terminal_review.txt" typewriter />

Quatre vrais problèmes remontés, sous quatre des cinq titres fixes autorisés par le prompt. « Long functions » est resté vide — le modèle a estimé que 26 lignes ne franchissaient pas la limite, et le prompt lui disait explicitement de ne pas inventer une section juste pour la remplir.

<AlertBox variant="note" title="En lecture seule, volontairement">
`ai-review` ne touche jamais au diff, ne bloque jamais un commit, n'écrit jamais rien. Il affiche une revue dans votre terminal. Ce que vous en faites, c'est votre décision.
</AlertBox>

## Pourquoi c'est construit comme ça {#why-its-built-this-way}

- Toutes les trois lisent le même `git diff --staged` — elles partagent un seul helper pour les clauses de garde (vérification du repo, diff vide, alerte de taille) au lieu de les répéter trois fois.
- `ai-secrets` lance d'abord une regex peu coûteuse ; le modèle n'est appelé que quand quelque chose a vraiment l'air suspect, donc un diff propre coûte zéro appel au modèle.
- `ai-commit` ne commite jamais tout seul — la réponse par défaut est « non », vous tapez explicitement `y` pour accepter ou `e` pour éditer.
- L'ordre n'est pas arbitraire : la revue pendant que vous pouvez encore corriger le diff, la recherche de secrets une fois que c'est bien le diff que vous voulez, puis le message pour ce que vous avez réellement nettoyé.

## Installer les trois fonctions {#installing-the-three-functions}

Toutes les trois s'appuient sur une base commune `_ollama.zsh` (présentée dans [ai-test](/blog/ollama-test-generator)) qui porte les clauses de garde une seule fois, au lieu que chaque fonction les répète :

<Snippet filename="~/.zsh/fns/_ollama.zsh" source="./files/_ollama.zsh" defaultOpen={false} />

Ajoutez les trois fonctions par-dessus :

<Snippet filename="~/.zsh/fns/ai-review.zsh" source="./files/ai-review.zsh" defaultOpen={false} />

<Snippet filename="~/.zsh/fns/ai-secrets.zsh" source="./files/ai-secrets.zsh" defaultOpen={false} />

<Snippet filename="~/.zsh/fns/ai-commit.zsh" source="./files/ai-commit.zsh" defaultOpen={false} />

## `ai-secrets` : détecter les vrais identifiants {#ai-secrets-catching-real-credentials}

Un simple scanner à base de regex ne peut pas distinguer `'password' => 'Sup3rSecret!'` (une vraie fuite) de `'password' => getenv('DB_PASSWORD')` (le bon pattern) — les deux lignes contiennent « password » à côté d'un `=`. C'est exactement l'écart que le modèle comble :

<Snippet filename="config/database.php (staged diff)" source="./files/demo_secrets.diff" defaultOpen={false} />

<Terminal source="./files/terminal_secrets.txt" typewriter />

Deux lignes ont matché la regex, toutes deux contenant « password ». Le modèle les a correctement séparées : l'une est une vraie fuite avec un correctif concret, l'autre est exactement le pattern `getenv()` que ce correctif devrait suivre — laissée tranquille, à juste titre.

<AlertBox variant="caution" title="Un filet de sécurité, pas une garantie">
Ça attrape ce qui apparaît dans un diff textuel. Ça n'attrapera pas un secret réparti sur plusieurs commits, embarqué dans un binaire, ou encodé d'une façon que la regex ne reconnaît pas. Voyez-le comme une deuxième paire d'yeux avant un commit, pas comme un remplacement pour un vrai outil de scan de secrets en CI.
</AlertBox>

## `ai-commit` : écrire le message du diff que vous venez de nettoyer {#ai-commit-writing-the-message-for-the-diff-youve-just-cleaned-up}

Une fois que le diff correspond à ce que vous voulez vraiment committer, passez-le à `ai-commit` plutôt que de taper « fix » pour la quatrième fois cette semaine — il contient déjà tout ce qu'il faut pour décrire ce qui a changé :

<Snippet filename="api/reactions.php (staged diff)" source="./files/demo_commit.diff" defaultOpen={false} />

<Terminal source="./files/terminal_commit.txt" typewriter />

Un message `fix(api):` correctement scopé avec un court corps explicatif, généré dans les deux ou trois secondes qu'il faut au modèle pour lire un diff de quatre lignes.

<AlertBox variant="important" title="Rien ne se commite tout seul">
`ai-commit` n'appelle `git commit` qu'après un `y` ou un `e` explicite. Appuyer sur Entrée, Échap ou n'importe quoi d'autre annule proprement.
</AlertBox>

## Sous le capot : `_git_staged_diff` (passez cette section si vous voulez juste l'utiliser) {#under-the-hood-_git_staged_diff-skip-this-if-you-just-want-to-use-it}

Les clauses de garde partagées par les trois fonctions — vérification du repo, vérification du diff vide, plafond de taille — vivent au même endroit :

```zsh title="~/.zsh/fns/_ollama.zsh (extract)"
_git_staged_diff() {
  local caller="${1:-ai}"
  local max="${AI_DIFF_MAX_CHARS:-12000}"

  if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    echo "${caller}: not inside a git repository" >&2
    return 1
  fi

  local diff
  diff=$(git diff --staged)

  if [[ -z "$diff" ]]; then
    echo "${caller}: nothing staged — run 'git add' first" >&2
    return 1
  fi

  if (( ${#diff} <= max )); then
    print -r -- "$diff"
    return 0
  fi

  echo "${caller}: staged diff is large (${#diff} chars) — sending a structural summary instead of the full diff." >&2

  local summary
  summary="$(git diff --staged --stat)

--- FILE AND HUNK HEADERS ONLY (full diff omitted, ${#diff} chars) ---
$(print -r -- "$diff" | grep -E '^(diff --git|new file|deleted file|rename (from|to)|@@)')"

  if (( ${#summary} > max )); then
    summary="${summary[1,$max]}
[…summary truncated…]"
  fi

  print -r -- "$summary"
}
```

Chacune des fonctions ci-dessus appelle `_git_staged_diff` et récupère le diff — ou sort proprement avec un message clair. Dans les versions d'origine de ces fonctions, ces clauses de garde étaient copiées-collées dans chacune — une violation classique du SRP cachée en pleine vue. Une responsabilité, un endroit, maintenant.

Le plafond de taille mérite un mot, parce que je l'ai appris à mes dépens : stager quelques centaines de fichiers et lancer `ai-commit` sur un diff de 490 Ko vous donne un *moins bon* message de commit, pas un plus long — la fenêtre de contexte du modèle débord et ce qui revient est vague ou vide. Donc au-delà de `AI_DIFF_MAX_CHARS` (12 000 par défaut, à surcharger dans votre shell si votre modèle a de la marge), le helper arrête d'envoyer le contenu et envoie la *forme* à la place : le `--stat` par fichier, plus chaque en-tête de fichier et de hunk. Ces lignes `@@` portent le nom de la fonction englobante que git place juste après, donc le modèle sait encore quels fichiers ont changé, dans quelle proportion et où — assez pour une ligne `feat(scope):` correcte, sans se noyer.

<AlertBox variant="tip" title="Pourquoi le prompt est passé à jq via un pipe, et non en argument">
Dans `_ollama_query`, vous verrez `print -r -- "$prompt" | jq -Rs …` plutôt que le plus évident `jq -n --arg prompt "$prompt"`. C'est volontaire : Linux limite un **seul** argument de ligne de commande à 128 Ko (`MAX_ARG_STRLEN`), indépendamment du `ARG_MAX` total bien plus grand. Passez un gros diff ou un long fichier source en `--arg` et `jq` meurt avant de démarrer, avec `argument list too long`. Un pipe n'a pas cette limite, et `jq -R -s` avale stdin comme une seule chaîne brute — en échappant les guillemets, les backslashes et les retours à la ligne exactement comme `--arg` le ferait.
</AlertBox>

## Les utiliser ensemble {#running-them-together}

Ces trois fonctions ne forment pas un pipeline — vous n'êtes pas obligé de les lancer toutes les trois, ni de les lancer dans l'ordre. Mais l'ordre a du sens quand vous le faites :

```zsh
# 1. Look at the diff for design issues
ai-review

# 2. Fix anything worth fixing, then re-stage
git add -p

# 3. Make sure you haven't accidentally left a real credential
ai-secrets

# 4. Write the commit message for the diff you've now cleaned up
ai-commit
```

Chaque fonction est aussi joignable directement (`ai-review`, `ai-secrets`, `ai-commit`) ou via le dispatcher `ai` — tapez `ai` tout court, choisissez une fonction dans le menu fzf, et si la fonction a besoin d'un paramètre, le menu le récupère de façon interactive avant de lancer. Toutes les trois s'enregistrent avec une seule ligne chacune — `AI_COMMANDS[review]=...`, `AI_COMMANDS[secrets]=...`, `AI_COMMANDS[commit]=...` — et déclarent `AI_PARAMS[...]=none`, puisqu'elles lisent elles-mêmes le diff stagé et n'ont besoin d'aucun argument.

C'est ce registre qui rend la famille extensible. <Link to="/blog/anythingllm-chat-with-your-docs">`ai-blog-search`</Link> l'a rejointe plus tard avec les deux mêmes lignes — sauf qu'elle déclare `AI_PARAMS[blog-search]="text"`, donc le menu demande d'abord une question, et elle interroge un workspace AnythingLLM plutôt qu'Ollama directement.

## Conclusion {#conclusion}

Aucune de ces trois fonctions ne fait quoi que ce soit que vous ne pourriez pas faire à la main. `ai-review` est une version plus lente de la lecture de votre propre diff. `ai-secrets` est une version plus rapide de `grep -i password`. `ai-commit` est un brouillon du message que vous alliez écrire de toute façon. La valeur n'est pas dans les capacités individuelles — elle est dans le fait que les trois tournent en local, prennent moins de dix secondes chacune, et s'insèrent dans le moment où vous êtes déjà : tout est stagé, prêt à committer, juste avant de le faire. C'est le seul moment où le coût de « je corrige maintenant » est encore inférieur au coût de « je corrigerai plus tard ».
