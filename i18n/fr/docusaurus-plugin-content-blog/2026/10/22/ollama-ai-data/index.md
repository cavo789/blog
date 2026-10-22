---
slug: ollama-ai-data
title: "ai-data : laissez un LLM local écrire vos one-liners jq et awk"
authors: [christophe, claude]
image: /img/v2/json.webp
mainTag: ai
tags: [ai, ollama, zsh, fzf]
date: 2026-10-22
description: "Une fonction zsh qui lit un fichier JSON ou CSV, comprend ses vrais champs et propose 5 commandes jq/awk pratiques adaptées à ce fichier précis — choisies via fzf, puis déposées sur votre ligne de commande (pas exécutées à votre place) pour que vous puissiez voir, modifier et comprendre la commande exacte avant d'appuyer sur Entrée."
language: fr
ai_assisted: true
series: "Ollama daily use"
---

![ai-data : laissez un LLM local écrire vos one-liners jq et awk](/img/v2/json.webp)

<!-- cspell:ignoreCase ai-test ai-commit ai-data qwen ollama zshrc mlr -->

<TLDR>
Cet article ajoute `ai-data` à la série « Ollama daily use » : pointez-la vers un fichier `.json` ou `.csv` et elle demande au modèle local 5 commandes `jq`/`awk` pratiques, adaptées aux noms de champs réels de ce fichier — pas des exemples génériques. Choisissez-en une avec `fzf` et, au lieu de l'exécuter pour vous, `ai-data` la dépose sur votre ligne de commande zsh avec `print -z`, prête à être lue, modifiée, puis seulement exécutée. L'objectif n'est pas juste d'avoir une réponse : c'est de repartir avec une commande que vous comprenez.
</TLDR>

Mon usage de <Link to="/blog/linux-jq">`jq`</Link> reste très basique ; je suis loin de savoir écrire une ligne avec `group_by` du premier coup. À chaque fois, c'est la même histoire : je dois bricoler (et perdre plusieurs minutes) juste pour obtenir ce que je veux — ou même… je ne sais même pas qu'une certaine fonctionnalité existe. Avec `awk`, c'est encore pire : je sais que ça existe et que c'est incroyablement puissant, mais la syntaxe est tout simplement impossible.

<!-- truncate -->

## Démo — JSON {#demo--json}

<Terminal source="./files/terminal_json.txt" typewriter />

Cinq suggestions, listées par ce à quoi elles répondent — chacune construite sur les vrais noms de champs (`active`, `birth_date`, `name`) que le modèle a vus dans l'échantillon, pas sur des placeholders d'un tutoriel `jq`. En choisissant la quatrième dans `fzf`, ce filtre `group_by` exact s'est retrouvé sur mon prompt ; je l'ai lu, il avait l'air correct, j'ai appuyé sur Entrée.

## Démo — CSV {#demo--csv}

<Terminal source="./files/terminal_csv.txt" typewriter />

Le modèle a remarqué tout seul que `region` est la colonne intéressante pour un regroupement, et a répondu avec le classique pipeline `awk | sort | uniq -c` — le genre de ligne que je reconnais quand je la vois mais que je n'écris jamais de mémoire. L'avoir lue une fois sur mon propre prompt, je la comprends mieux que si j'avais juste vu la sortie.

## L'idée — des suggestions, pas des réponses {#the-idea--suggestions-not-answers}

La plupart des fonctions de cette série posent une question au modèle et affichent la réponse — <Link to="/blog/ollama-ai-diagram">ai-diagram</Link> affiche un bloc Mermaid, prêt à coller. `ai-data` est différente volontairement : elle demande au modèle des **commandes candidates**, les présente via <Link to="/blog/linux-fzf-introduction">`fzf`</Link>, et quand vous en choisissez une, elle ne l'exécute pas — elle la dépose sur votre prompt, modifiable, grâce au `print -z` de zsh. Vous lisez le filtre `jq` ou le script `awk` exact avant qu'il ne touche vos données, et comme c'est vous qui appuyez sur Entrée, vous assimilez vraiment la syntaxe au lieu de simplement consommer la sortie.

<AlertBox variant="tip" title="print -z, en une phrase">
`print -z "some command"` pousse une chaîne dans le buffer d'édition de zsh — le prompt suivant l'affiche pré-tapée, exactement comme si vous l'aviez saisie vous-même, curseur prêt, rien d'exécuté.
</AlertBox>

## La fonction `ai-data` {#the-ai-data-function}

Pas besoin de copier quoi que ce soit pour l'instant : les fichiers `.zsh` montrés dans cet article sont là pour être lus, et [L'installer](#installing-it) à la fin les crée tous dans `~/.zsh/fns/` pour vous.

<Snippet filename="~/.zsh/fns/ai-data.zsh" source="./files/ai-data.zsh" defaultOpen={true} />

Étape par étape :

1. Détecter JSON ou CSV à partir de l'extension.
2. Construire un petit échantillon réel — pour le JSON, les 3 premiers éléments s'il s'agit d'un tableau (`jq -c '.[0:3]'`) ; pour le CSV, l'en-tête plus 5 lignes. Jamais le fichier entier : un CSV de 50 000 lignes n'a pas besoin d'en laisser plus de quelques-unes dans le prompt.
3. Pour le CSV, vérifier si [`mlr`](https://miller.readthedocs.io/) (Miller) est installé — si oui, on indique au modèle qu'il peut proposer `mlr` pour les regroupements/agrégations, ce qui se lit nettement mieux que l'équivalent `awk`. Sinon, il s'en tient à `awk`/`sort`/`uniq`.
4. Demander exactement 5 commandes, une par ligne, au format `COMMAND ||| description` — délibérément pas une sortie JSON, car parser cinq lignes de « texte avant un triple pipe » est trivial et évite le risque que le modèle emballe sa réponse dans des blocs markdown ou ajoute des commentaires.
5. Envoyer les cinq lignes dans `fzf`, en n'affichant que la description (`--with-nth=2`) pour que vous choisissiez par *intention*, et non en plissant les yeux sur de la syntaxe `jq`.
6. À la sélection, `print -rz` du premier champ de la commande choisie.

<AlertBox variant="note" title="Pas de fzf ? Ça marche quand même">
Sans `fzf` installé, `ai-data` affiche simplement les cinq suggestions en texte brut — vous copiez celle que vous voulez manuellement. Même information, un confort en moins.
</AlertBox>

## Enregistrée dans le menu `ai` {#registered-in-the-ai-menu}

Une ligne — `AI_COMMANDS[data]=...` — accessible via `ai data <file>` ou directement avec `ai-data`, aux côtés de toutes les autres fonctions de la série.

`_ollama_query` et le registre `AI_COMMANDS` vivent dans la fondation partagée `_ollama.zsh` introduite dans <Link to="/blog/ollama-test-generator">ai-test</Link>. Si vous avez déjà suivi un article précédent de cette série, elle est déjà dans `~/.zsh/fns/` et sourcée par votre autoloader — rien de plus à faire. Vous commencez ici ? C'est un des fichiers créés dans [L'installer](#installing-it) plus bas.

<AlertBox variant="caution" title="L'échantillonnage veut dire que le modèle peut se tromper sur les cas limites">
Cinq lignes ne révéleront pas un champ `null` rare, un format de date incohérent trois lignes plus loin ou une colonne supplémentaire égarée. Les commandes proposées sont un bon point de départ, pas une garantie — exécutez-les, vérifiez que le nombre de lignes semble cohérent, et ajustez si les données réservent des surprises que l'échantillon ne montrait pas.
</AlertBox>

## Points clés {#key-takeaways}

<StepsCard
  variant="remember"
  title="ai-data en bref"
  steps={[
    { content: "**Un échantillon, pas le fichier entier** — 3 éléments JSON ou 5 lignes CSV, assez pour voir les vrais noms de champs" },
    { content: "**Des suggestions, pas une seule réponse** — 5 commandes candidates, choisies par intention via `fzf`" },
    { content: "**`print -z`, pas d'exécution automatique** — la commande choisie arrive sur votre prompt, modifiable, rien ne s'exécute avant que vous appuyiez sur Entrée" },
    { content: "**`mlr` quand il est disponible** — syntaxe de regroupement/agrégation plus agréable que `awk` si Miller est installé" },
    { content: "**S'enregistre dans `ai`** — accessible via `ai data <file>`" }
  ]}
/>

## L'installer {#installing-it}

Tout tourne sur votre machine : zsh, `curl` et `jq` (qui construit la requête envoyée à Ollama), et un serveur Ollama joignable — voyez <Link to="/blog/ollama-installation">installer Ollama</Link> si vous n'en avez pas encore.

**1. Créez les fichiers.** Chaque fonction de cette série vit dans son propre fichier dans `~/.zsh/fns/`. La commande ci-dessous crée ce dossier et les deux fichiers d'un coup — ou téléchargez le ZIP, ou créez chaque fichier à la main et collez-y son contenu. `_ollama.zsh` est la fondation partagée par toute la série : si un article précédent vous l'a déjà donnée, la copie ici est le même fichier.

<ProjectSetup folderName="~/.zsh/fns">
  <Snippet filename="_ollama.zsh" source="./files/_ollama.zsh" defaultOpen={false} />
  <Snippet filename="ai-data.zsh" source="./files/ai-data.zsh" defaultOpen={false} />
</ProjectSetup>

**2. Chargez le dossier depuis `~/.zshrc`.** Déjà fait si vous avez suivi un article précédent de cette série. Sinon, ajoutez ces lignes à la fin de `~/.zshrc` — elles sourcent chaque fichier `.zsh` du dossier, donc la prochaine fonction que vous ajouterez ne demandera aucun changement ici :

```zsh title="~/.zshrc"
for fn_file in ~/.zsh/fns/*.zsh; do
  source "$fn_file"
done
```

**3. Ouvrez un nouveau terminal** (ou lancez `exec zsh` dans celui en cours), et vérifiez que le shell connaît la nouvelle fonction :

```zsh
type ai-data
```

`ai-data is a shell function from …/ai-data.zsh` signifie que vous êtes prêt. `ai-data not found` signifie que l'étape 2 manque.

## Conclusion {#conclusion}

`ai-data` est la fonction de cette série dont j'attends le plus en termes d'apprentissage, justement parce qu'elle refuse de me donner une réponse toute faite — elle me donne la commande et me laisse être celui qui la lance. Quelques semaines à piocher des filtres `jq` dans une liste `fzf` et à les lire avant d'appuyer sur Entrée, et je soupçonne que j'en aurai moins besoin qu'aujourd'hui. Ce serait une forme étrange de succès pour un outil d'IA : l'objectif n'est pas de l'utiliser pour toujours, c'est de se rendre discrètement moins nécessaire, un `group_by` à la fois.
