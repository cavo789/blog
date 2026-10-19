---
slug: linux-yq
title: "yq — Le processeur YAML que vous savez déjà utiliser"
description: "yq est à YAML ce que jq est à JSON. Interrogez et modifiez vos fichiers Docker Compose, vos configs CI et n'importe quel document YAML depuis la ligne de commande — rien à installer au-delà de Docker."
authors: [christophe, claude]
image: /img/v2/linux-yq.webp
mainTag: linux
tags: [bash, docker, linux]
date: 2026-10-19
series: Modern CLI tools for your terminal
ai_assisted: true
---

![yq — Le processeur YAML que vous savez déjà utiliser](/img/v2/linux-yq.webp)

<TLDR>
`yq` est un processeur YAML en ligne de commande qui utilise la même syntaxe que `jq`. Si vous utilisez déjà `jq` pour du JSON, vous savez déjà utiliser `yq`. Lancez-le sans rien installer grâce à un alias Docker d'une ligne, puis interrogez et modifiez vos `compose.yaml`, vos pipelines CI et n'importe quel fichier YAML directement depuis le terminal.
</TLDR>

Vous avez un `compose.yaml` avec dix services. Vous voulez savoir quelle image utilise le service `db` sans ouvrir un éditeur. Vous voulez incrémenter un numéro de version dans un fichier CI sans un one-liner sed que vous ne retiendrez jamais. Vous voulez extraire tous les noms de services dans une liste.

Ce sont des problèmes de `jq`. Sauf que vos fichiers sont du YAML, pas du JSON.

Voici `yq`.

<!-- truncate -->

## Ce qu'est yq — et lequel choisir {#what-yq-is--and-which-one}

Il existe deux outils nommés `yq`. Cet article parle de [`yq` de Mike Farah](https://github.com/mikefarah/yq) (Go, image Docker `mikefarah/yq`), qui gère nativement le YAML avec une syntaxe compatible `jq`. L'autre (`kislyuk/yq`) encapsule `jq` après avoir converti le YAML en JSON — idée similaire, comportement différent pour les spécificités YAML comme les commentaires et les fichiers multi-documents. Sur Debian et Ubuntu, `apt install yq` installe cet autre outil (`kislyuk/yq` 3.x), pas celui utilisé ici.

Si vous avez la version Go installée en local (`yq --version` renvoie quelque chose comme `yq (https://github.com/mikefarah/yq/) version v4.x`), tout est bon. Sinon, l'approche Docker ci-dessous ne demande rien de plus.

## Le voir à l'œuvre avec Docker {#seeing-it-in-action-with-docker}

Avant d'installer quoi que ce soit (ou même de mettre en place l'alias plus bas), essayez `yq` dans un
container jetable — le `compose.yaml` exact de cet article s'y trouve déjà.

<AlertBox variant="tip" title="Pourquoi Docker d'abord ?">
Le Dockerfile ci-dessous installe directement le binaire `yq` et place le `compose.yaml` exact dans le
répertoire de travail. Rien à créer, coller ou télécharger.
</AlertBox>

<Snippet
  filename="Dockerfile"
  source="./files/Dockerfile"
  defaultOpen={false}
/>

Construisez et lancez :

<Terminal title="user@machine: ~/yq-demo">
$ docker build -t yq-demo .
[+] Building 8.7s (7/7) FINISHED
 ✔ exporting to image

$ docker run --rm -it yq-demo
🐳 root ~/demo # yq '.services.web.image' compose.yaml
nginx:1.25
</Terminal>

Même fichier, même query, même résultat — testez-y directement la suite des sections « Lire des valeurs » et
« Modifier sur place », il n'y a plus rien à préparer.

## Installer — ou juste créer un alias {#install--or-just-alias}

Un gestionnaire de packages installe la version Go sur chaque plateforme :

<Terminal>
$ brew install yq            # macOS and Linux (Homebrew)
$ winget install MikeFarah.yq  # Windows
</Terminal>

Ne rien installer du tout est aussi une option. Ajoutez cet alias à votre `~/.zshrc` ou `~/.bashrc` :

<Terminal>
{`cat >> ~/.zshrc <<'EOF'
alias yq='docker run --rm -i -u "$(id -u):$(id -g)" -v "\${PWD}":/workdir mikefarah/yq:4'
EOF
source ~/.zshrc`}
</Terminal>

Cet alias monte votre répertoire courant dans le container et exécute `yq` de façon transparente, avec votre propre ID utilisateur pour que les fichiers modifiés avec `-i` gardent leur propriétaire. Toutes les commandes `yq` ci-dessous fonctionnent avec lui, telles quelles.

La [page des releases](https://github.com/mikefarah/yq/releases) fournit aussi des binaires statiques pour Linux, macOS et Windows — sans dépendance au runtime.

## Lire des valeurs {#reading-values}

Travaillons avec un `compose.yaml` typique :

<Snippet source="./files/compose.yaml" language="yaml" />

Lire une valeur simple :

<Terminal>
yq '.services.web.image' compose.yaml
</Terminal>

```bash
nginx:1.25
```

Lire une valeur imbriquée :

<Terminal>
yq '.services.db.environment.POSTGRES_DB' compose.yaml
</Terminal>

```bash
myapp_db
```

Lister tous les noms de services :

<Terminal>
yq '.services | keys' compose.yaml
</Terminal>

```bash
- web
- db
```

Récupérer toutes les images de tous les services :

<Terminal>
yq '.services.*.image' compose.yaml
</Terminal>

```bash
nginx:1.25
postgres:16
```

## Filtrer et sélectionner {#filtering-and-selecting}

Récupérer uniquement les services qui ont une clé `ports` définie :

<Terminal>
yq '.services | with_entries(select(.value | has("ports")))' compose.yaml
</Terminal>

```yaml
web:
  image: nginx:1.25
  ports:
    - "8080:80"
  ...
```

Lister tous les noms de variables d'environnement du service `web` :

<Terminal>
yq '.services.web.environment | keys' compose.yaml
</Terminal>

```bash
- APP_ENV
- LOG_LEVEL
```

## Modifier sur place {#editing-in-place}

Mettre à jour la version de l'image `web`. Le flag `-i` modifie le fichier sur place, exactement comme <Link to="/blog/update-env-files-cli">`sed -i`</Link> :

<Terminal>
yq -i '.services.web.image = "nginx:1.27"' compose.yaml
</Terminal>

Ajouter une nouvelle variable d'environnement :

<Terminal>
yq -i '.services.web.environment.DEBUG = "false"' compose.yaml
</Terminal>

Supprimer une clé :

<Terminal>
yq -i 'del(.services.db.environment.POSTGRES_PASSWORD)' compose.yaml
</Terminal>

<AlertBox variant="warning" title="yq -i reformate le fichier">
`yq -i` conserve les commentaires et les guillemets, mais supprime les lignes vides — la ligne vide entre `web` et `db` disparaît dès la première modification. Vérifiez le diff avant de committer un fichier formaté à la main.
</AlertBox>

## Lire depuis stdin et chaîner les commandes {#reading-from-stdin-and-piping}

`yq` lit depuis stdin quand aucun fichier n'est fourni, ce qui facilite le chaînage avec d'autres commandes :

<Terminal>
cat compose.yaml | yq '.services | keys'
</Terminal>

Combinez-le avec `curl` pour parser des API ou des configs YAML téléchargées à la volée :

<Terminal>
curl -s https://example.com/config.yaml | yq '.database.host'
</Terminal>

## Cas d'usage pratiques {#practical-use-cases}

### Extraire tous les mappings de ports {#extract-all-port-mappings}

<Terminal>
yq '.services.*.ports[]' compose.yaml
</Terminal>

```bash
8080:80
```

### Vérifier qu'une clé existe avant de l'utiliser {#check-if-a-key-exists-before-using-it}

<Terminal>
yq '.services | has("redis")' compose.yaml
</Terminal>

```bash
false
```

### Mettre à jour une version dans un fichier CI {#update-a-version-across-a-ci-file}

Pour un `.gitlab-ci.yml` qui référence une version d'image à plusieurs endroits, `..` parcourt chaque nœud du fichier, quelle que soit sa profondeur :

<Terminal>
yq -i '(.. | select(. == "node:20")) = "node:22"' .gitlab-ci.yml
</Terminal>

### Fusionner deux fichiers YAML {#merge-two-yaml-files}

<Terminal>
yq '. *= load("overrides.yaml")' base.yaml
</Terminal>

Ceci fusionne en profondeur `overrides.yaml` dans `base.yaml` et affiche le résultat — les fichiers sources restent inchangés, sauf si vous ajoutez `-i`.

### Convertir du YAML en JSON {#convert-yaml-to-json}

Quand vous devez passer des données YAML à un outil qui n'accepte que du JSON :

<Terminal>
yq -o json '.services.web' compose.yaml
</Terminal>

```json
{
  "image": "nginx:1.25",
  "ports": [
    "8080:80"
  ],
  "environment": {
    "APP_ENV": "production",
    "LOG_LEVEL": "info"
  },
  "volumes": [
    "./html:/usr/share/nginx/html:ro"
  ],
  "depends_on": [
    "db"
  ]
}
```

Vous pouvez ensuite envoyer cette sortie directement à `jq` pour un traitement plus poussé.

## Le pont avec jq {#the-jq-crossover}

Si vous utilisez déjà <Link to="/blog/linux-jq">`jq`</Link> pour du JSON, la syntaxe de `yq` vous semblera immédiatement familière. Les expressions `jq` du quotidien fonctionnent telles quelles :

| Tâche | jq (JSON) | yq (YAML) |
| ------ | ----------- | ----------- |
| Lire une clé | `jq '.key'` | `yq '.key'` |
| Filtrer un tableau | `jq '.[] \| select(.active)'` | `yq '.[] \| select(.active)'` |
| Récupérer les clés | `jq 'keys'` | `yq 'keys'` |
| Modifier sur place | — | `yq -i '.key = "value"'` |
| Convertir le format | — | `yq -o json '.'` |

Les principales différences : `yq` ajoute `-i` pour les modifications sur place et `-o` pour le format de sortie, et gère les spécificités YAML comme les ancres et les fichiers multi-documents (séparateurs `---`).

## Conclusion {#conclusion}

`yq` comble le manque que tout utilisateur de `jq` finit par ressentir : le même outil, mais pour le YAML. Avec un alias Docker, il n'y a rien à installer, et la syntaxe se transfère directement depuis tout ce que vous connaissez déjà. Si votre workflow tourne autour de `compose.yaml`, GitLab CI, GitHub Actions ou de manifestes Kubernetes, `yq` a sa place dans votre boîte à outils, aux côtés de `jq` et de son équivalent XML, <Link to="/blog/linux-xmlstarlet">`xmlstarlet`</Link>.

La prochaine fois que vous ouvrirez un éditeur de texte pour vérifier une version d'image ou modifier une clé de configuration, utilisez `yq` à la place.
