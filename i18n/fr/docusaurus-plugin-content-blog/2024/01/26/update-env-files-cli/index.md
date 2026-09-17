---
slug: update-env-files-cli
title: Édition en masse d'un fichier d'environnement
date: 2024-01-26
description: Arrêtez d'éditer vos fichiers .env à la main ! Découvrez une fonction Linux simple pour mettre à jour vos variables d'environnement en masse et déployer de façon cohérente sur tous vos serveurs.
authors: [christophe]
image: /img/v2/bash.webp
mainTag: linux
tags:
  - bash
  - docker
  - linux
language: fr
review_date: 2026-07-30
---
![Édition en masse d'un fichier d'environnement](/img/v2/bash.webp)

<TLDR>
Cet article propose une fonction Bash réutilisable, `updateEnv`, qui met à jour vos fichiers `.env` en masse et sans risque : elle prend un nom de variable, une valeur et un fichier, puis utilise `grep`/`sed` pour modifier la variable si elle existe ou l'ajouter sinon. Un drapeau optionnel permet de ne pas créer les variables absentes — pratique pour des déploiements cohérents sur plusieurs serveurs.
</TLDR>

Quand on déploie un projet sur des serveurs, il faut porter une attention particulière au fichier `.env`. Ce fichier est crucial : c'est lui qui détermine si l'application fonctionne correctement (ou plante).

La façon habituelle de procéder est de lancer un `git clone` pour récupérer la dernière version de l'application depuis un repository (la branch `test` pour un serveur de test, `dev` pour un serveur d'acceptance, `main` pour un serveur de production).

Une fois le clone fait, la commande suivante consiste à créer le fichier `.env`, généralement avec `cp .env.example .env`.

Et c'est là que commence l'obligation d'être méticuleux.

<!-- truncate -->

Selon le serveur (test, UAT ou PROD ?), les réglages ne seront pas les mêmes. On n'activera certainement pas le debug sur un serveur de production, alors qu'on le fera sur un serveur de test/UAT. Les identifiants de la base de données, par exemple, différeront d'un serveur à l'autre. Et ainsi de suite.

Donc, à chaque création du fichier `.env`, la façon normale de faire est de l'ouvrir dans un éditeur et de commencer à modifier. Et quand vous devez déployer plusieurs serveurs, impossible d'être sûr à 100 % de n'avoir rien oublié d'important.

## Ce que `updateEnv` fait pour vous {#what-updateenv-does-for-you}

Au lieu d'ouvrir un éditeur, vous décrivez l'état cible du fichier sous forme d'une liste d'appels :

```bash
dotEnv=".env"

updateEnv "APP_DEBUG" "false" "${dotEnv}"
updateEnv "APP_ENV" "production" "${dotEnv}"
updateEnv "APP_NAME" "My application is running on production" "${dotEnv}"
updateEnv "CAN_REGISTER" "false" "${dotEnv}"
updateEnv "FORCE_HTTPS" "true" "${dotEnv}"
```

Et voici ce que votre console répond :

<Terminal typewriter source="./files/terminal-1.txt" />

Quatre variables ont été mises à jour et une a été ajoutée (`CAN_REGISTER`). Cette colonne de statut, c'est tout l'intérêt : après un déploiement, vous ne vous demandez pas si un réglage a été appliqué, vous le lisez.

## Pourquoi ça marche {#why-it-works}

- **`grep` décide** : la variable est cherchée en début de ligne, donc `APP_ENV` ne matchera jamais `APP_ENV_LABEL`.
- **`sed` fait une chose ou l'autre** : il remplace la valeur sur place quand la clé existe, il ajoute la ligne en fin de fichier quand elle n'existe pas.
- **`printf` rapporte** : `UPDATED` ou `ADDED` pour chaque clé, suivi de la ligne telle qu'elle figure maintenant dans le fichier — relue depuis le fichier, pas depuis ce qu'on comptait écrire.

## La fonction {#the-function}

Avant de voir la fonction, comme toujours, créez simplement un fichier d'exemple :

<Terminal typewriter source="./files/terminal-2.txt" />

La fonction `updateEnv` reçoit trois arguments : un nom de variable comme `APP_DEBUG`, la valeur qu'on souhaite définir (par exemple `false`) et le nom du fichier `.env` à mettre à jour (sans doute `.env`). Elle repose sur l'idiome `grep`/`sed` décrit dans <Link to="/blog/linux-sed-tips">Search and replace (or add) using sed</Link> :

```bash
(
  updateEnv() {
    variable="$1"
    newValue="$2"
    file="${3:-.env}"

    # search the variable in the file. If found, update. If not, add the entry
    grepStatus="$(grep -E -q "^${variable}\s?=" "${file}" \
      && (sed -i -r "s~${variable}(\s?)=(\s?).*~${variable}\1=\2${newValue}~" "${file}" && echo "UPDATED") \
      || (sed -i -e "\$a${variable}=${newValue}" "${file}" && echo "ADDED"))"

    # Output on the console to help the guy in front of the screen to understand
    printf "\e[33;1m%s \e[32;1m%-7s\e[0;1m %s\n" \
        ${file} "${grepStatus}" "$(grep -i -E "^${variable}\s?=" "${file}")"

    return 0
  }

  clear

  dotEnv=".env"

  updateEnv "APP_DEBUG" "false" "${dotEnv}"
  updateEnv "APP_ENV" "production" "${dotEnv}"
  updateEnv "APP_NAME" "My application is running on production" "${dotEnv}"
  updateEnv "CAN_REGISTER" "false" "${dotEnv}"
  updateEnv "FORCE_HTTPS" "true" "${dotEnv}"
)
```

Remarquez les `( … )` qui entourent le tout : tout s'exécute dans un sous-shell, donc la fonction et la variable `dotEnv` disparaissent dès que le bloc est terminé. Copiez/collez-le dans votre console et ça tourne directement.

## Ajouter un booléen pour ignorer une variable {#adding-a-skip-boolean}

Cette version introduit un drapeau *Faut-il ajouter la variable ?*, autrement dit : doit-on absolument définir une variable dans le fichier d'environnement si elle n'y est pas encore ?

Dans l'exemple ci-dessus, nous avons vu `updateEnv "APP_DEBUG" "false" "${dotEnv}"`. Si `APP_DEBUG` n'est pas encore présente, la fonction `updateEnv` ajoutera la variable.

Et maintenant, si on appelle `updateEnv "FORCE_HTTPS" "false" "${dotEnv}"`, même chose : on ajoutera `FORCE_HTTPS` dans le fichier. Mais que faire si on veut simplement l'ignorer ?

```bash
(
 updateEnv() {
    variable="$1"
    newValue="$2"
    file="$3"
    add=${4:-true}

    # search the variable in the file. If found, update. If not, add the entry
    grepStatus="$(grep -E -q "^${variable}\s?=" "${file}" \
      && (sed -i -r "s~${variable}(\s?)=(\s?).*~${variable}\1=\2${newValue}~" "${file}" && echo "UPDATED") \
      || (if [ "$add" = "true" ]; then \
            sed -i -e "\$a${variable}=${newValue}" "${file}"
            echo "ADDED"
          else
            echo "SKIP"
           fi)
    )"


    # Output on the console to help the guy in front of the screen to understand
    printf "\e[33;1m%s \e[32;1m%-7s\e[0;1m %s\n" \
        ${file} "${grepStatus}" "$(grep -i -E "^${variable}\s?=" "${file}" || echo ${variable})"
  }

  clear

  dotEnv=".env"

  updateEnv "DEFAULT_CACHE" "redis" "${dotEnv}" false
  updateEnv "REDIS_HOST" "127.0.0.1" "${dotEnv}" false
)
```

Nous avons donc introduit un quatrième argument, positionné à `true` par défaut.

La sortie de la commande précédente sera celle ci-dessous. Si elles sont absentes, les variables ne sont pas ajoutées, et c'est exactement ce qu'on veut.

<Terminal typewriter>
.env SKIP    DEFAULT_CACHE
.env SKIP    REDIS_HOST
</Terminal>

## Conclusion {#conclusion}

Déployer sur un nouveau serveur cesse d'être un exercice de relecture minutieuse : vous gardez une liste d'appels `updateEnv` par environnement, vous la lancez juste après `cp .env.example .env`, et la console vous dit, clé par clé, ce qui a été mis à jour, ajouté ou volontairement ignoré.

Le complément naturel est <Link to="/blog/compare-env-files-cli">Compare environment files in the Linux console</Link> : il vous dit quelles clés manquent, celui-ci les définit. Et pour exploiter le résultat depuis vos scripts, voyez <Link to="/blog/bash-load-env">Bash - Loading environment variables from a file</Link>.
