---
slug: ollama-test-generator
title: "ai-test : générer les tests unitaires manquants depuis votre terminal avec un LLM local"
authors: [christophe, claude]
image: /img/v2/ai_test.webp
mainTag: ai
tags: [ai, ollama, zsh, tests, bash, php, python]
date: 2026-08-03
description: "Transformez votre modèle Ollama local en générateur de tests unitaires à la demande. Une fonction zsh qui lit un fichier Bash, PHP ou Python, détecte si des tests existent déjà, affiche uniquement les cas Bats/Pest/Pytest manquants pour une couverture complète, propose de les enregistrer là où le framework les attend, et lance la suite dans un container Docker jetable."
language: fr
ai_assisted: true
series: "Ollama daily use"
blueskyRecordKey: 3ms5sdpk6kk2a
---

![ai-test : générer les tests unitaires manquants depuis votre terminal avec un LLM local](/img/v2/ai_test.webp)

<!-- cspell:ignoreCase ai-test ai-commit qwen ollama bats batcat pytest pyproject zshrc dotfiles -->

<TLDR>
`ai-test` transforme votre modèle Ollama local en générateur de tests unitaires à la demande. Pointez-le sur un fichier Bash, PHP ou Python, relisez les tests générés, enregistrez-les si vous voulez, puis lancez-les immédiatement dans Docker — sans jamais quitter votre terminal. Il gère Bats (Bash), Pest (PHP) et Pytest (Python).

Cet article ouvre la série **<Link to="/series/ollama-daily-use">Ollama daily use</Link>** : de petits outils qui font d'un LLM local un véritable compagnon de terminal, et non un onglet de navigateur de plus.
</TLDR>

Arrêtons de faire semblant : on sait tous que les tests unitaires sont nécessaires, et presque personne n'aime les écrire. Il y a toujours une excuse — un délai serré, un script Bash qui ne devait être que temporaire, l'ennui profond du mocking des dépendances. On se promet de les ajouter plus tard, et *plus tard*, c'est le moment où la dette technique explose en production.

`ai-test` fait le sale boulot à votre place. Pointez-le sur un fichier, récupérez une suite Bats, Pest ou Pytest, lisez-la, enregistrez-la, exécutez-la — tout depuis le terminal, tout sur votre machine.

<!-- truncate -->

<QuickJump
  links={[
    { label: "Ce que ai-test fait pour vous", to: "#what-ai-test-does-for-you" },
    { label: "Installation", to: "#installing-it" },
  ]}
/>

## Ce que `ai-test` fait pour vous {#what-ai-test-does-for-you}

Prenons `greet.sh`, un petit script qui demande un prénom et une langue. Une commande, et une suite Bats complète revient — réduite à trois tests ci-dessous, l'exécution réelle en a produit plus de quinze :

<Terminal source="./files/terminal_greet.txt" typewriter />

Voilà tout l'argument : une commande, une suite lisible en une minute, deux confirmations, et une exécution verte qui prouve qu'elle n'est pas décorative. Rien n'a été installé pour lancer ces tests, et rien n'a quitté la machine.

## Pourquoi ça marche {#why-it-works}

Quatre idées, et aucune ne vous demande encore de lire une ligne de zsh :

- **L'extension décide de tout** — le framework, la convention de nommage, et l'endroit où le fichier atterrit.
- **Le prompt transporte la structure de votre projet.** Le modèle ne voit jamais un chemin, seulement un bloc de texte ; `ai-test` calcule d'abord la destination, puis dicte comment la suite doit charger le code.
- **Il lit les tests que vous avez déjà** et ne demande que les manques, ajoutés au fichier existant.
- **Il valide dans un container jetable**, pour qu'une suite qui *a l'air* correcte doive prouver qu'elle *passe*.

## Installation {#installing-it}

Deux fichiers à déposer dans `~/.zsh/fns/`, un nouveau shell. D'abord la seule vraie dépendance — `jq`, utilisé pour construire la charge JSON envoyée à Ollama :

<Prerequisite
  name="jq"
  install="sudo apt update && sudo apt install jq -y"
  installOutput={`\nReading package lists... Done\nBuilding dependency tree... Done\n0 upgraded, 1 newly installed, 0 to remove and 0 not upgraded.`}
  check="jq --version"
  checkOutput={`\njq-1.7`}
  typewriter
/>

Il vous faut aussi un Ollama qui tourne quelque part d'accessible — j'ai déjà parlé de <Link to="/blog/ollama-installation">son installation</Link> et de <Link to="/blog/accessing-ollama-across-your-local-network">son exposition sur mon réseau</Link> ; le mien reste inactif la majeure partie de la journée, alors pourquoi ne pas le braquer sur la seule tâche que je n'arrête pas de reporter ?

<Details label="Deux outils optionnels : bat et docker (cliquez si vous voulez les détails)">

**`bat`** — si [il](https://github.com/sharkdp/bat) est installé, le code généré est coloré syntaxiquement avant d'arriver dans votre terminal. Sinon, `ai-test` retombe sur une sortie brute. Attention à une bizarrerie Debian/Ubuntu : le nom `bat` était déjà pris par `bacula-console-qt`, donc `apt install bat` installe le binaire sous le nom **`batcat`**. C'est pour ça que le helper `_ai_bat` teste les deux orthographes au lieu de coder `bat` en dur.

<Prerequisite
  name="bat"
  install="sudo apt install bat"
  check="batcat --version"
  checkOutput="bat 0.24.0"
  typewriter
/>

**`docker`** — nécessaire uniquement pour l'étape finale « lancer la suite maintenant ». `ai-test` saute cette étape avec un message quand `docker` n'est pas dans votre `PATH`.

<Prerequisite
  name="docker"
  install="sudo apt install docker"
  check="docker --version"
  checkOutput="Docker version 29.6.2, build dfc4efb"
  typewriter
/>

</Details>

Maintenant les deux fichiers. `_ollama.zsh` contient tout ce que la série partage — le helper de requête, le registre de commandes et le point d'entrée `ai` — tandis que `ai-test.zsh` est la fonction elle-même :

<ProjectSetup folderName="~/.zsh/fns">
  <Snippet filename="_ollama.zsh" source="./files/_ollama.zsh" />
  <Snippet filename="ai-test.zsh" source="./files/ai-test.zsh" />
</ProjectSetup>

Si vous avez déjà mis en place l'autoloader `~/.zsh/fns/` de <Link to="/blog/ripgrep">mon article sur ripgrep</Link>, c'est terminé : ouvrez un nouveau shell. Sinon, voici ce qu'il faut ajouter à votre `~/.zshrc` existant :

```bash title="~/.zshrc"
export OLLAMA_MODEL="qwen3-coder:30b"       # optional, this is already the default
export AI_TEST_PHP_IMAGE="php:8.4-cli"      # optional, override to match your project's PHP
export AI_TEST_PY_IMAGE="python:3.14-slim"  # optional, same idea for Python

for fn_file in ~/.zsh/fns/*.zsh; do
  source "$fn_file"
done
```

Les exports sont placés *au-dessus* de la boucle volontairement : les valeurs par défaut `AI_TEST_*` sont appliquées au moment du sourcing, donc tout ce que vous définiriez ensuite arriverait trop tard.

### Un seul point d'entrée : `ai` {#one-entry-point-ai}

Ouvrez un nouveau shell et tapez `ai`, sans argument. Plutôt que de devoir vous rappeler comment vous avez nommé vos fonctions il y a six mois, vous obtenez un sélecteur `fzf` listant chaque commande qui s'est enregistrée — aujourd'hui juste `test`, demain tout ce que la série ajoutera :

![ai-test](./images/ai-test.gif)

Choisissez-en une et elle s'exécute. Si vous savez déjà ce que vous voulez, `ai test greet.sh` envoie directement vers `ai-test` et saute complètement le menu — les deux formes sont équivalentes, l'une est explorable, l'autre est rapide.

<AlertBox variant="caution" title="À lire avant de faire confiance">
Les tests générés sont un brouillon, pas une garantie — lisez-les comme une pull request venant d'un contributeur junior. Lancer la suite prouve qu'elle *s'exécute* ; seule la lecture prouve qu'elle *vérifie* quelque chose.
</AlertBox>

## Plus de démos {#more-demos}

### Un vrai script, et les manques qu'il comble {#a-real-script-and-the-gaps-it-fills}

`greet.sh` était un échauffement. `backup.sh` est d'un autre calibre — une commande externe, un timestamp, et de vrais effets de bord sur le système de fichiers :

<Snippet filename="backup.sh" source="./files/backup.sh" defaultOpen={false} />

`ai-test backup.sh` a renvoyé dix tests, tous verts. Voici les trois premiers :

<Terminal source="./files/terminal_backup_run1.txt" />

Maintenant, relancez exactement la même commande une seconde fois :

<Terminal source="./files/terminal_backup_run2.txt" />

`ai-test` a trouvé le `tests/backup.bats` qu'il avait écrit une minute plus tôt, l'a envoyé au modèle avec la source, et n'a demandé que les cas manquants. Au lieu de relire dix tests auxquels je fais déjà confiance, je relis un seul ajout, ciblé — et il est **ajouté** au fichier existant, pas écrit dans un second qui dupliquerait le `setup()`.

C'est le mode que vous utiliserez le plus : chaque fois que vous ajoutez une branch à une fonction, une seconde exécution demande au modèle ce qui a changé, et rien d'autre.

### La même commande, en PHP et en Python {#the-same-command-in-php-and-in-python}

Deux démos Bash pourraient donner l'impression qu'il s'agit d'un jouet pour scripting shell, alors soyons explicites : la seule chose qui change entre les langages, c'est l'extension que vous tapez. Voici une classe PHP suffisamment petite pour tenir en tête, qui fait la chose que tout projet finit par réécrire :

<Snippet filename="src/Slug.php" source="./files/Slug.php" defaultOpen={false} />

Et son équivalent Python dans l'esprit — deux fonctions pures, quelques clauses de garde, aucune I/O :

<Snippet filename="src/prices.py" source="./files/prices.py" defaultOpen={false} />

Lancez `ai-test src/Slug.php` et `ai-test src/prices.py`, et tout se comporte de la même manière : même prompt, mêmes deux confirmations, même container jetable. Seule la destination change — `tests/Unit/SlugTest.php` et `tests/test_prices.py`, tous deux résolus depuis la racine du projet (`composer.json` pour PHP, `pyproject.toml` ou `setup.py` pour Python) et non depuis `src/`.

## Sous le capot (passez si vous voulez juste l'utiliser) {#under-the-hood-skip-this-if-you-just-want-to-use-it}

### La logique, étape par étape {#the-logic-step-by-step}

1. S'enregistrer avec `AI_COMMANDS[test]=...` — la seule ligne qui place `ai-test` dans le menu `ai`.
2. Remonter jusqu'à la racine du projet (`.git`, `composer.json`, `pyproject.toml`…), en déduire où la suite *devrait* se trouver, et chercher un fichier de tests existant selon la convention de nommage de chaque écosystème : `<name>.bats`, `<Name>Test.php`, `test_<name>.py` / `<name>_test.py`.
3. Construire l'un des deux prompts — « écris une suite complète », ou « voici la source *et* les tests actuels, donne-moi uniquement ce qui manque » — et, dans le premier cas, y ajouter le **paragraphe de bootstrap**.
4. L'envoyer via `_ollama_query`, retirer les fences Markdown que le modèle ajoute malgré la consigne inverse, et afficher joliment le résultat avec `bat` s'il est disponible.

Trois points méritent d'être soulignés dans `_ollama.zsh` lui-même :

- L'underscore initial est volontaire : le loader (`for fn_file in ~/.zsh/fns/*.zsh`) source les fichiers par ordre alphabétique et `_` se classe avant toute lettre, donc `AI_COMMANDS` et `ai()` existent toujours avant qu'un fichier `ai-*.zsh` n'essaie de s'y enregistrer.
- `_ollama_query` ping d'abord `${host}/api/tags`, avec un timeout de deux secondes, et échoue bruyamment si Ollama n'est pas joignable — mieux vaut une erreur immédiate qu'un `curl` suspendu trente secondes contre un container arrêté. Il construit aussi sa charge JSON avec `jq`, donc les guillemets, backslashes et retours à la ligne du code source que je vais coller dans le prompt sont échappés pour moi. Notez que le prompt est *envoyé par pipe* à `jq` plutôt que passé comme valeur `--arg` : Linux limite un argument de ligne de commande à 128 Ko, et un gros fichier ou un long diff exploserait sinon avec `argument list too long`.
- `AI_COMMANDS` est un simple tableau associatif, et c'est pourquoi une seule ligne d'enregistrement suffit pour faire apparaître une nouvelle fonction dans le menu `ai` — aucune liste centrale à maintenir, aucun fichier à éditer quand la série grandit.

### La seule instruction qui fait la différence {#the-one-instruction-that-makes-the-difference}

Ce paragraphe de bootstrap de l'étape 3 est ce qui décide si une suite générée fonctionne ou est complètement inerte.

La règle est simple : **un test ne peut appeler que du code qu'il a chargé, et le modèle ne voit jamais où ce code se trouve.** Il reçoit un bloc de texte, jamais un chemin. Demandez une suite sans rien préciser d'autre, et vous obtenez des tests bien nommés avec des assertions sensées qui échouent tous de la même façon — `command not found`, code de sortie 127 — parce que rien n'a jamais chargé le fichier testé.

`ai-test` a calculé le chemin d'enregistrement une étape plus tôt, donc il n'espère pas : `_ai_test_bootstrap` dicte la ligne de chargement, dans la forme que chaque écosystème attend.

- **<Link to="/blog/bats-unit-tests">Bats</Link>** — chaque test tourne dans un shell frais qui n'a chargé que le fichier `.bats`, donc la suite doit commencer par un `setup()` qui source le script. `_ai_relative_to` calcule le chemin depuis le dossier du test vers la source, si bien que `src/lib/tool.sh` enregistré comme `tests/tool.bats` donne `source "$BATS_TEST_DIRNAME/../src/lib/tool.sh"`.
- **Pytest** — `tests/test_tool.py` ne peut pas faire `import tool` si la racine du projet n'est pas dans le path. Plutôt que de laisser le modèle écrire des incantations `sys.path`, l'exécution Docker définit `PYTHONPATH=/code` et le prompt dit *« importe le module directement, ne touche pas à sys.path »*.
- **Pest** — la classe est autoloadée par Composer, donc ce qu'il faut au modèle, c'est le **namespace** : `_ai_test_bootstrap` extrait la ligne `namespace` de la source avec grep et fournit un `use` prêt à l'emploi. Aucun namespace déclaré ? Il retombe sur un `require_once` avec le chemin relatif calculé.

<AlertBox variant="tip" title="Donnez au modèle la structure, pas seulement le code">
Ça se généralise bien au-delà des tests. Quand un LLM écrit du code qui va vivre à un *endroit précis* d'un *projet précis*, la plupart de ses erreurs viennent du contexte que vous ne lui avez pas donné — chemins de fichiers, racines d'import, namespaces, conventions. Ce sont des choses que votre script connaît déjà, et chaque fait que vous transmettez est un fait que le modèle n'a plus à deviner de travers.
</AlertBox>

### Où le fichier est enregistré {#where-the-file-gets-saved}

La suite est d'abord affichée dans votre console : vous la lisez là, et rien n'a encore touché votre disque. Ensuite `ai-test` demande si vous voulez la garder — et comme il connaît le framework, il propose le chemin que ce framework attend, donc vous n'avez jamais à vous souvenir si Pest veut `tests/Unit/` ou `tests/Feature/` :

| Source | Framework | Chemin proposé |
| --- | --- | --- |
| `backup.sh` | Bats | `tests/backup.bats` |
| `src/Backup.php` | Pest | `tests/Unit/BackupTest.php` |
| `src/backup.py` | Pytest | `tests/test_backup.py` |

Notez que `tests/` part de la **racine du projet**, pas du dossier du fichier source : `src/Backup.php` propose `tests/Unit/BackupTest.php` à la racine du repository, pas l'absurde `src/tests/Unit/BackupTest.php`.

<AlertBox variant="caution" title="Il demande toujours d'abord">
Rien n'est écrit sans un `y` explicite, et si le fichier cible existe déjà la question devient un *« … existe déjà. L'écraser ? »* sans ambiguïté. Toute autre réponse — y compris simplement appuyer sur Entrée — affiche `→ Not saved.` et s'arrête là. Du code généré ne devrait pas atterrir dans votre repository par accident.
</AlertBox>

### Lancer la suite sans installer de test runner {#running-the-suite-without-installing-a-test-runner}

Installer un test runner pour du code que je risque de supprimer trente secondes plus tard représente une quantité absurde de mise en place, donc `ai-test` lance plutôt la suite dans un container. Bats [publie une image officielle](https://hub.docker.com/r/bats/bats) dont l'entrypoint est `bats` lui-même, ce qui en fait un one-liner :

<Terminal source="./files/terminal_docker_run.txt" typewriter />

Les trois images sont remplaçables via `AI_TEST_BATS_IMAGE`, `AI_TEST_PHP_IMAGE` et `AI_TEST_PY_IMAGE` — voir le bloc `~/.zshrc` plus haut.

<AlertBox variant="note" title="Votre code est monté en lecture-écriture">
Le container reçoit le dossier du projet, pas une copie, parce que les tests doivent créer des fichiers temporaires à côté du code. C'est un container jetable (`--rm`), mais il exécute *bel et bien* du code généré contre votre working tree — une raison de plus de lire la sortie avant de répondre `y`.
</AlertBox>

### Écrivez pour le test que vous n'avez pas encore écrit {#write-for-the-test-you-havent-written-yet}

Voici le `greet.sh` du début de cet article :

<Snippet filename="greet.sh" source="./files/greet.sh" defaultOpen={false} />

Il est minuscule, mais il a déjà tout ce qui intéresse une suite de tests : deux fonctions, une valeur par défaut, et trois façons d'échouer. Exécuté seul, ce n'est qu'un prompt interactif :

<Terminal typewriter>
$ ./greet.sh

What is your first name? christophe
Which language (en/fr/nl)? fr
Bonjour Christophe !
</Terminal>

Les trois dernières lignes sont ce qui rend tout l'exercice possible :

```bash
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
  main "$@"
fi
```

`main` ne s'exécute que quand le script est *exécuté*, jamais quand il est *sourcé*. Sans cette garde, le `setup()` de la suite générée ferait `source greet.sh`, tomberait sur `read -rp "What is your first name? "`, et resterait bloqué à jamais sur une entrée qui n'arrive pas.

D'où les deux habitudes qui rendent n'importe quel script testable : mettez la logique dans des fonctions qui prennent des arguments et affichent des résultats, et enveloppez la partie interactive dans une garde `BASH_SOURCE`. Sautez-les, et le meilleur modèle du monde ne pourra générer que des tests qui se bloquent.

### Choisir son modèle {#choosing-your-model}

Ce n'est pas une situation où un seul modèle convient à tous. Sur une carte de 24 Go, `qwen3-coder:30b` raisonne nettement mieux sur la couverture de tests que les variantes plus petites `1.5b`/`7b` que j'ai comparées dans mon <Link to="/blog/accessing-ollama-across-your-local-network">article sur l'accès réseau</Link> — il est plus lent, mais pour une tâche que vous lancez quelques fois par jour, pas des milliers, ces dix secondes en plus n'ont aucune importance. Si votre VRAM est limitée, descendez à `qwen2.5-coder:7b` et attendez-vous à une bonne suite pour le cas nominal avec une couverture des cas limites plus faible ; vous réfléchirez davantage vous-même.

## Conclusion {#conclusion}

Deux fichiers à copier dans `~/.zsh/fns/`, un nouveau shell, et le script que vous n'alliez jamais tester devient `ai-test greet.sh` : une suite complète, verte, le temps de faire un café — rien d'installé, rien qui quitte votre machine.

Récupérez le `greet.sh` ci-dessus et essayez-le sur vos propres scripts. Puis regardez celui que vous évitez depuis des mois, le `backup.sh` de votre repository, et lancez-le là aussi : au pire vous jetez la sortie, au mieux vous avez enfin une suite.
