---
slug: ollama-ai-explain
title: "ai-explain : l'ELI5 des scripts et des erreurs, directement dans votre terminal"
authors: [christophe, claude]
image: /img/v2/playing_with_ollama.webp
mainTag: ai
tags: [ai, ollama, zsh, linux, bash, docker, git]
date: 2026-11-12
description: "Encore une fonction de la série Ollama au quotidien : envoyez n'importe quel script, message d'erreur ou stack trace à ai-explain et obtenez une explication en langage clair de ce qu'il fait ou de ce qui a planté — 100 % local, sans cloud."
language: fr
ai_assisted: true
series: "Ollama daily use"
---

![ai-explain : l'ELI5 des scripts et des erreurs, directement dans votre terminal](/img/v2/playing_with_ollama.webp)

<!-- cspell:ignoreCase ai-test ai-commit ai-explain qwen ollama zshrc ERESOLVE -->

<TLDR>
`ai-explain` est une nouvelle fonction de la série Ollama au quotidien. Envoyez-lui un script, une sortie de log ou une stack trace — ou donnez-lui un chemin de fichier, ou collez un message d'erreur en argument — et vous obtenez une explication en langage clair : ce que fait le script, ce que signifie l'erreur et quoi corriger. Une fonction, trois modes d'entrée, zéro cloud.
</TLDR>

Vous avez cloné un repository et vous y trouvez un script Bash exécuté par le pipeline CI. Trois cents lignes, aucun commentaire. Vous devez comprendre ce qu'il fait avant de le modifier. Vous pouvez le lire attentivement, chercher la signification des flags, suivre la logique. Ou vous pouvez l'envoyer à `ai-explain`.

Même histoire pour les stack traces. Une erreur React en production avec six frames de sortie minifiée. Un `Fatal error` PHP à la ligne 847 d'un fichier que vous n'avez jamais ouvert. Un build Docker qui échoue sur une étape RUN que vous n'avez pas écrite.

`ai-explain` est la version terminal du <Link to="/blog/docusaurus-eli5-snippet-tooltips">composant de tooltip ELI5</Link> de ce blog — la même idée « explique-moi comme si j'avais cinq ans », mais dans votre shell plutôt que dans le navigateur.

<!-- truncate -->

## Expliquer un script que vous n'avez pas écrit {#explain-a-script-you-didnt-write}

<Snippet filename="deploy.sh" source="./files/deploy.sh" defaultOpen={false} />

<Terminal source="./files/terminal_explain_script.txt" typewriter />

Voilà toute l'interaction : un chemin de fichier en entrée, une explication en langage clair en sortie — les prérequis, le tag d'image basé sur le hash du commit, le redémarrage avec `--no-deps`, le health check de 60 secondes et ce qui se passe en cas de timeout.

## Pourquoi ça fonctionne {#why-it-works}

`ai-explain` gère trois modes d'entrée, vérifiés dans cet ordre : l'entrée via pipe (donc `cat file | ai-explain` l'emporte toujours, même si un nom de fichier est aussi passé), un fichier existant, ou du texte inline pour une question rapide — une seule fonction couvre « explique-moi ce fichier » et « explique-moi cette erreur » sans commandes séparées à retenir. Le prompt demande quinze lignes de texte maximum, jamais une copie de l'entrée, et transmet `uname -s` pour que les commandes suggérées correspondent à la plateforme sur laquelle vous êtes réellement.

## Installation {#installing-it}

Tout tourne sur votre machine : zsh, `curl` et `jq` (qui construit la requête envoyée à Ollama), et un serveur Ollama accessible — voir <Link to="/blog/ollama-installation">installer Ollama</Link> si vous n'en avez pas encore.

**1. Créez les fichiers.** Chaque fonction de cette série vit dans son propre fichier dans `~/.zsh/fns/`. La commande ci-dessous crée ce dossier et les deux fichiers d'un coup — ou téléchargez le ZIP, ou créez chaque fichier à la main et collez-y son contenu. `_ollama.zsh` est la fondation partagée par toute la série, présentée dans <Link to="/blog/ollama-test-generator">`ai-test`</Link> : si un article précédent vous l'a déjà donné, la copie ici est le même fichier.

<ProjectSetup folderName="~/.zsh/fns">
  <Snippet filename="_ollama.zsh" source="./files/_ollama.zsh" defaultOpen={false} />
  <Snippet filename="ai-explain.zsh" source="./files/ai-explain.zsh" />
</ProjectSetup>

**2. Chargez le dossier depuis `~/.zshrc`.** Déjà fait si vous avez suivi un article précédent de cette série. Sinon, ajoutez ces lignes à la fin de `~/.zshrc` — elles sourcent chaque fichier `.zsh` du dossier, donc la prochaine fonction que vous ajouterez ne demandera aucune modification ici :

```zsh title="~/.zshrc"
for fn_file in ~/.zsh/fns/*.zsh; do
  source "$fn_file"
done
```

**3. Ouvrez un nouveau terminal** (ou lancez `exec zsh` dans celui en cours), et vérifiez que le shell connaît la nouvelle fonction :

```zsh
type ai-explain
```

`ai-explain is a shell function from …/ai-explain.zsh` signifie que vous êtes prêt. `ai-explain not found` signifie qu'il manque l'étape 2.

## Autres démos {#more-demos}

### Expliquer une stack trace {#explain-a-stack-trace}

<Snippet filename="example-error.txt" source="./files/example-error.txt" defaultOpen={false} />

<Terminal source="./files/terminal_explain_error.txt" typewriter />

### Envoyer la sortie de n'importe quelle commande {#pipe-any-command-output}

Le pattern le plus utile : lancez une commande qui échoue et envoyez sa sortie directement :

<Terminal>
docker build . 2>&1 | ai-explain
</Terminal>

<Terminal>
npm install 2>&1 | ai-explain
</Terminal>

<Terminal>
./run-tests.sh 2>&1 | tail -50 | ai-explain
</Terminal>

Le `2>&1` redirige stderr vers stdout pour que les deux streams arrivent dans le pipe. Sans lui, les messages d'erreur de la plupart des outils CLI n'atteignent jamais `ai-explain`.

Pour les commandes qui produisent beaucoup de sortie, passez d'abord par `tail` pour ne garder que la fin pertinente (là où les erreurs atterrissent généralement).

### Utilisation depuis le dispatcher `ai` {#use-from-the-ai-dispatcher}

Comme toutes les fonctions de cette série, `ai-explain` s'enregistre dans le registre `AI_COMMANDS`. Le dispatcher `ai` (issu de `_ollama.zsh`) liste chaque fonction enregistrée — ici avec les fonctions publiées de cette série installées :

<Terminal source="./files/terminal_explain_menu.txt" />

Sélectionnez `ai-explain` et le dispatcher ouvre d'abord son sélecteur de fichiers fzf : `AI_PARAMS[explain]="file"` lui indique de demander un fichier plutôt qu'une ligne de texte.

## Sous le capot (passez votre chemin si vous voulez juste l'utiliser) {#under-the-hood-skip-this-if-you-just-want-to-use-it}

### Quand ai-explain est le plus utile {#when-ai-explain-is-most-useful}

- **Scripts hérités** : comprendre ce que fait un script CI/CD avant de le modifier
- **Erreurs inconnues** : une stack trace d'un langage ou d'un framework que vous maîtrisez mal
- **Sorties de log cryptiques** : avertissements du daemon Docker, entrées du journal systemd, messages du kernel
- **Archéologie de one-liners** : cette commande `awk '{ split($0,a,":"); ... }'` trouvée dans un Makefile
- **Vérification rapide** : est-ce que ce script fait bien ce que son nom suggère ?

C'est aussi utile comme outil d'apprentissage : envoyez-lui un script que vous avez écrit vous-même et voyez si l'explication correspond à votre intention. Si ce n'est pas le cas, soit l'explication est fausse (ça arrive), soit le script contient un bug subtil.

## Conclusion {#conclusion}

`ai-explain` rejoint la série « Ollama daily use ».

La série a commencé avec <Link to="/blog/ollama-test-generator">`ai-test`</Link> (la fondation : `_ollama.zsh`, le dispatcher, le registre `AI_COMMANDS`) et s'est enrichie de fonctions une par une — chacune résolvant un problème précis de workflow dans le terminal avec un LLM local :

- **Workflow du développeur** : <Link to="/blog/ollama-git-precommit">`ai-review`, `ai-secrets`, `ai-commit`</Link>, `ai-standup`
- **Opérations** : `ai-ci`, `ai-fix`
- **Assistance shell** : `ai-ask`, <Link to="/blog/ollama-ai-data">`ai-data`</Link>, <Link to="/blog/ollama-ai-diagram">`ai-diagram`</Link>
- **Travail documentaire** : <Link to="/blog/ollama-ai-docs">`ai-translate`, `ai-summarize`</Link>, `ai-diff`
- **Votre propre documentation** : <Link to="/blog/anythingllm-chat-with-your-docs">`ai-blog-search`</Link>
- **Explication** : `ai-explain`

Toutes partagent la même fondation `_ollama_query`. Ensemble, elles couvrent les moments d'une journée de développement où vous iriez normalement chercher dans un navigateur ou une IA dans le cloud — mais où un modèle local est plus rapide d'accès et garde tout sur votre machine.

Les fonctions sans lien sont encore à venir. Lancez `ai` pour voir ce que votre terminal sait déjà faire.
