---
slug: direnv
title: "direnv — Arrêtez de taper `source .env`, laissez votre shell le faire"
description: "direnv charge et décharge automatiquement vos variables d'environnement quand vous entrez dans un projet. Un mot de passe de base de données par projet, plus aucune commande source manuelle, et rien qui ne fuite dans votre shell global."
authors: [christophe, claude]
image: /img/v2/direnv.webp
mainTag: linux
tags: [bash, docker, linux, zsh]
date: 2026-11-26
ai_assisted: true
---

![direnv — Arrêtez de taper source .env, laissez votre shell le faire](/img/v2/direnv.webp)

<TLDR>
`direnv` s'accroche à votre shell et lance automatiquement `source .env` (ou n'importe quelle commande d'un fichier `.envrc`) quand vous faites `cd` dans un projet — et annule tout quand vous en sortez. Chaque projet dispose de ses propres variables d'environnement : pas de pollution globale, pas de sourcing manuel, et aucun risque de trimballer les secrets d'un projet dans un autre.
</TLDR>

Chaque projet Docker a un fichier `.env`. Et chaque fois que vous ouvrez un nouveau terminal en oubliant de lancer `source .env`, quelque chose casse. Vous définissez `DB_PASSWORD` dans le shell, vous passez à un autre projet, et voilà que le Docker Compose du second projet récupère les mauvais identifiants de base de données.

`direnv` règle ça définitivement. Vous entrez dans le dossier : les variables sont chargées. Vous en sortez : elles disparaissent.

<!-- truncate -->

## direnv en action {#seeing-direnv-in-action}

Créez un répertoire de projet et ajoutez un fichier `.envrc` :

<Terminal>
mkdir my-api && cd my-api
echo "dotenv" > .envrc
</Terminal>

Le simple mot `dotenv` indique à direnv de charger le fichier `.env` du même répertoire. Créons maintenant le `.env` :

<Terminal>
cp .env.example .env   # template shown in "The Docker Compose use case" below
# edit .env with your local values {#edit-env-with-your-local-values}
</Terminal>

La première fois que vous entrez dans un répertoire avec un nouveau `.envrc`, direnv demande une autorisation explicite :

<Terminal>
direnv: error /home/christophe/my-api/.envrc is blocked. Run `direnv allow` to approve its content.
</Terminal>

Lancez-la une fois :

<Terminal>
direnv allow
</Terminal>

À partir de là, entrer dans le répertoire charge les variables automatiquement :

<Terminal>
cd my-api
direnv: loading ~/my-api/.envrc
direnv: export +APP_DEBUG +APP_PORT +DB_HOST +DB_NAME +DB_PASSWORD +DB_PORT +DB_USER
</Terminal>

Et en sortir les décharge :

<Terminal>
cd ..
direnv: unloading
</Terminal>

<AlertBox variant="info" title="L'étape d'autorisation est voulue">
direnv exige une approbation explicite (`direnv allow`) à chaque modification du `.envrc`. Ça empêche un repository cloné d'exécuter automatiquement du code arbitraire dans votre shell à votre insu.
</AlertBox>

Voilà tout l'effet — l'installation derrière tient en deux commandes, on y vient.

## En action avec Docker {#seeing-it-in-action-with-docker}

Avant d'accrocher direnv à votre propre `~/.bashrc`, testez le flux ci-dessus dans un container
jetable — le projet `my-api` (`.envrc`, `.env`, `compose.yaml`) est déjà construit, volontairement
laissé non autorisé pour que le message « blocked » soit la première chose que vous voyiez.

<AlertBox variant="tip" title="Pourquoi Docker d'abord ?">
Le Dockerfile ci-dessous installe direnv, l'accroche à bash et construit le projet `my-api` de la
section « Le cas d'usage Docker Compose » plus bas. Rien ne change sur votre propre machine.
</AlertBox>

<Snippet
  filename="Dockerfile"
  source="./files/Dockerfile"
  defaultOpen={false}
/>

Buildez et lancez :

<Terminal title="user@machine: ~/direnv-demo">
$ docker build -t direnv-demo .
[+] Building 11.4s (6/6) FINISHED
 ✔ exporting to image

$ docker run --rm -it direnv-demo
🐳 root ~ # cd my-api
direnv: error /root/my-api/.envrc is blocked. Run `direnv allow` to approve its content
</Terminal>

Exactement le message « blocked » vu plus haut. Autorisez-le, puis sortez et revenez :

<Terminal title="🐳 root ~/my-api #">
$ direnv allow
direnv: loading ~/my-api/.envrc
direnv: export +APP_DEBUG +APP_PORT +DB_HOST +DB_NAME +DB_PASSWORD +DB_PORT +DB_USER

$ cd ..
direnv: unloading

$ cd my-api
direnv: loading ~/my-api/.envrc
direnv: export +APP_DEBUG +APP_PORT +DB_HOST +DB_NAME +DB_PASSWORD +DB_PORT +DB_USER
</Terminal>

Chargé à l'entrée, déchargé à la sortie, rechargé dès que vous revenez — tout l'argument de cet
article, en direct, avant de toucher à la config de votre propre shell.

## Pourquoi ça marche {#why-it-works}

- direnv s'accroche à votre shell : chaque `cd` revérifie le répertoire courant et ses parents à la recherche d'un fichier `.envrc` et le réévalue — pas de polling, pas de daemon en arrière-plan.
- Le `.envrc` minimal tient en un mot, `dotenv` — il n'y a rien à écrire de zéro pour le cas courant.
- `PATH_add` est une fonction intégrée de direnv qui ajoute un path en tête de `$PATH` et le retire à la sortie. C'est plus sûr que `export PATH="./scripts:$PATH"`, parce que direnv sait exactement ce qu'il a ajouté et peut le défaire proprement.

## Installation {#install}

Sur Ubuntu / Debian / WSL :

<Terminal>
sudo apt install direnv
</Terminal>

Ensuite, accrochez-le à votre shell. C'est une configuration unique :

Pour ZSH (à ajouter dans `~/.zshrc`) :

<Terminal>
echo 'eval "$(direnv hook zsh)"' >> ~/.zshrc
source ~/.zshrc
</Terminal>

Pour Bash (à ajouter dans `~/.bashrc`) :

<Terminal>
echo 'eval "$(direnv hook bash)"' >> ~/.bashrc
source ~/.bashrc
</Terminal>

C'est toute l'installation. `direnv` surveille désormais chaque changement de répertoire.

## Ce qu'on met dans .envrc {#what-goes-in-envrc}

Le `.envrc` minimal, c'est juste `dotenv` :

<Snippet source="./files/.envrc" language="bash" />

Mais `.envrc` est un script shell. Vous pouvez faire plus, notamment avec `PATH_add` :

<Snippet source="./files/.envrc-full" language="bash" />

## Autres démos {#more-demos}

### Le cas d'usage Docker Compose {#the-docker-compose-use-case}

Une structure de projet typique :

```text
my-api/
  .env          ← actual secrets, git-ignored
  .env.example  ← template committed to git
  .envrc        ← just "dotenv", can be committed
  compose.yaml
```

<Snippet source="./files/.env.example" language="bash" />

Votre `compose.yaml` référence les variables avec `${DB_PASSWORD}` — Docker Compose lit l'environnement, que direnv a déjà chargé :

```yaml
services:
  db:
    image: postgres:16
    environment:
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${DB_NAME}
```

Quand vous entrez dans le projet, `docker compose up` fonctionne, point. Quand vous changez de projet, les anciennes variables disparaissent et celles du nouveau projet prennent leur place.

### Plusieurs environnements {#multiple-environments}

direnv s'entend parfaitement avec plusieurs fichiers `.env`. Un pattern courant :

```text
.env           ← local dev (git-ignored)
.env.staging   ← staging values (may be committed if non-sensitive)
.env.example   ← template (always committed)
```

Pour changer temporairement d'environnement sans toucher au `.envrc`, laissez Docker Compose lire l'autre fichier le temps d'une commande :

<Terminal>
docker compose --env-file .env.staging up
</Terminal>

Ou plus simple — ajustez directement `.envrc` et ré-autorisez :

```bash
# .envrc
dotenv .env.staging
```

## Sous le capot (passez votre chemin si vous voulez juste l'utiliser) {#under-the-hood-skip-this-if-you-just-want-to-use-it}

### Ce qu'on commite {#what-to-commit}

Le pattern sûr :

```text
.gitignore entries:
  .env
  .env.local
  .env.*.local

Committed:
  .envrc        ← safe, only contains "dotenv" or non-secret logic
  .env.example  ← documents all required variables, no real values
```

<AlertBox variant="warning" title="Ne commitez jamais un .env avec de vrais secrets">
`.envrc` peut être commité sans risque s'il ne contient que `dotenv` ou des appels `PATH_add`. Mais un `.env` avec de vrais mots de passe ou clés d'API doit rester dans `.gitignore`. Toujours.
</AlertBox>

### direnv et VSCode {#direnv-and-vscode}

Le terminal intégré de VSCode hérite de l'environnement du shell. Si vous ouvrez VSCode depuis un terminal où direnv a déjà chargé les variables d'un projet, elles sont automatiquement disponibles dans le terminal intégré.

Si vous lancez VSCode directement (depuis le Dock, Spotlight ou un raccourci du bureau), le terminal intégré démarre à neuf, sans vos hooks de shell. La solution : ouvrez toujours vos projets avec `code .` depuis un terminal où direnv est actif.

### Comparaison avec l'approche manuelle {#comparison-with-the-manual-approach}

Vous utilisez peut-être déjà un pattern comme celui décrit dans <Link to="/blog/bash-load-env">Bash — charger des variables d'environnement depuis un fichier</Link>. La différence :

| | `source .env` manuel | direnv |
| -- | --------------------- | -------- |
| Chargement au `cd` | Non | Oui |
| Déchargement à la sortie | Non | Oui |
| Évite les fuites d'environnement | Non | Oui |
| Fonctionne dans tous les terminaux | Il faut re-sourcer | Oui |
| Supporte `PATH_add` | Non | Oui |

L'approche manuelle convient pour un workflow à projet unique. Dès que vous jonglez entre plusieurs projets dans la même session de terminal, direnv devient indispensable.

## Conclusion {#conclusion}

`direnv` fait partie de ces outils qui paraissent évidents dès la première utilisation. Vous arrêtez de penser à la configuration de l'environnement et vous vous concentrez sur le vrai travail. Chaque projet porte son propre contexte, et passer de l'un à l'autre se fait sans friction.

Configurez-le une fois, ajoutez `dotenv` dans `.envrc`, et ne tapez plus jamais `source .env`.

:::tip Déjà sous ZSH ?
Si vous avez suivi <Link to="/blog/zsh-install">l'installation d'Oh-My-ZSH</Link> sur ce blog, direnv s'intègre directement dans votre `.zshrc` avec la seule ligne `eval "$(direnv hook zsh)"` montrée plus haut.
:::
