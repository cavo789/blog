---
slug: linux-yq
title: "yq — Le processeur YAML que vous savez déjà utiliser"
description: "yq est à YAML ce que jq est à JSON. Interrogez et modifiez vos fichiers Docker Compose, vos configs CI et n'importe quel document YAML depuis la ligne de commande — aucune installation nécessaire, à part Docker."
authors: [christophe, claude]
image: /img/v2/linux-yq.webp
mainTag: linux
tags: [bash, docker, linux]
date: 2026-10-19
series: Modern CLI tools for your terminal
ai_assisted: true
updates:
  - date: 2026-11-08
    note: "The Docker alias is now a yq shell function for zsh and bash, in its own file (~/.zsh/fns or ~/.bash/fns)."
---

![yq — Le processeur YAML que vous savez déjà utiliser](/img/v2/linux-yq.webp)

<TLDR>
`yq` est un processeur YAML en ligne de commande avec la même syntaxe que `jq`. Si vous utilisez déjà `jq` pour JSON, vous savez déjà utiliser `yq`. Lancez-le sans rien installer grâce à un alias Docker d'une ligne, puis interrogez et modifiez vos `compose.yaml`, vos pipelines CI et n'importe quel fichier YAML directement depuis le terminal.
</TLDR>

Vous avez un `compose.yaml` avec dix services. Vous voulez savoir quelle image utilise le service `db` sans ouvrir d'éditeur. Vous voulez incrémenter un numéro de version dans un fichier CI sans une one-liner sed que vous ne retiendrez jamais. Vous voulez extraire tous les noms de services dans une liste.

Ce sont des problèmes pour `jq`. Mais vos fichiers sont en YAML, pas en JSON.

Voici `yq`.

<!-- truncate -->

## Ce qu'est yq — et lequel {#what-yq-is--and-which-one}

Il existe deux outils nommés `yq`. Cet article traite de [`yq` de Mike Farah](https://github.com/mikefarah/yq) (Go, image Docker `mikefarah/yq`), qui gère nativement YAML et offre une syntaxe compatible `jq`. L'autre (`kislyuk/yq`) encapsule `jq` après avoir converti le YAML en JSON — idée similaire, comportement différent pour les fonctionnalités propres à YAML comme les commentaires et les fichiers multi-documents. Sur Debian et Ubuntu, `apt install yq` installe cet autre outil (`kislyuk/yq` 3.x), pas celui utilisé ici.

Si vous avez la version Go installée localement (`yq --version` renvoie quelque chose comme `yq (https://github.com/mikefarah/yq/) version v4.x`), tout est prêt. Sinon, l'approche Docker ci-dessous ne demande rien de plus.

## Le voir à l'œuvre avec Docker {#seeing-it-in-action-with-docker}

Avant d'installer quoi que ce soit (ou même de mettre en place l'alias ci-dessous), essayez `yq` dans un
container jetable — le `compose.yaml` exact de cet article s'y trouve déjà.

<AlertBox variant="tip" title="Pourquoi Docker d'abord ?">
Le Dockerfile ci-dessous installe directement le binaire `yq` et dépose le `compose.yaml` exact dans le
répertoire de travail. Rien à créer, à coller ou à télécharger.
</AlertBox>

<Snippet
  filename="Dockerfile"
  source="./files/Dockerfile"
  defaultOpen={false}
/>

Buildez et lancez :

<Terminal title="user@machine: ~/yq-demo">
$ docker build -t yq-demo .
[+] Building 8.7s (7/7) FINISHED
 ✔ exporting to image

$ docker run --rm -it yq-demo
🐳 root ~/demo # yq '.services.web.image' compose.yaml
nginx:1.25
</Terminal>

Même fichier, même query, même résultat — testez directement dessus le reste des sections « Lire des valeurs »
et « Modifier sur place » ci-dessous, il n'y a plus rien à préparer.

## Installer — ou juste créer un alias {#install--or-just-alias}

Un gestionnaire de packages installe la version Go sur toutes les plateformes :

<Terminal>
$ brew install yq            # macOS and Linux (Homebrew)
$ winget install MikeFarah.yq  # Windows
</Terminal>

Ne rien installer du tout est aussi une option : une petite fonction `yq` lance l'image officielle à la place, dans son propre fichier placé dans un dossier que votre shell charge au démarrage (l'organisation expliquée dans <Link to="/blog/modular-zsh-workflow">mon workflow ZSH modulaire</Link>) :

<Snippet filename="yq.sh" source="./files/yq.sh" defaultOpen={true} />

Elle monte votre répertoire courant dans le container et exécute `yq` de façon transparente, avec votre propre ID utilisateur pour que les fichiers modifiés avec `-i` gardent leur propriétaire. Toutes les commandes `yq` ci-dessous fonctionnent avec elle telles quelles. Le code est identique pour zsh et bash ; seuls le dossier et le chargeur diffèrent.

<Tabs groupId="shell">
<TabItem value="zsh" label="zsh" default>

**1. Créez le fichier** dans `~/.zsh/fns/` :

<ProjectSetup folderName="~/.zsh/fns">
  <Snippet filename="yq.zsh" source="./files/yq.sh" defaultOpen={false} />
</ProjectSetup>

**2. Chargez le dossier depuis `~/.zshrc`.** C'est déjà fait si vous avez suivi un de mes articles « Ollama au quotidien ». Sinon, ajoutez ceci à la fin de `~/.zshrc` :

```zsh title="~/.zshrc"
for fn_file in ~/.zsh/fns/*.zsh; do
  source "$fn_file"
done
```

**3. Ouvrez un nouveau terminal** (ou lancez `exec zsh`).

</TabItem>
<TabItem value="bash" label="bash">

**1. Créez le fichier** dans `~/.bash/fns/` :

<ProjectSetup folderName="~/.bash/fns">
  <Snippet filename="yq.sh" source="./files/yq.sh" defaultOpen={false} />
</ProjectSetup>

**2. Chargez le dossier depuis `~/.bashrc`.** Ajoutez ceci à la fin de `~/.bashrc` (le test `-r` évite qu'un dossier vide ne génère une erreur) :

```bash title="~/.bashrc"
for fn_file in ~/.bash/fns/*.sh; do
  [[ -r "$fn_file" ]] && source "$fn_file"
done
```

**3. Ouvrez un nouveau terminal** (ou lancez `exec bash`).

</TabItem>
</Tabs>

Vérifiez que le shell connaît la fonction : `type yq` doit répondre `yq is a shell function`.

La [page des releases](https://github.com/mikefarah/yq/releases) propose aussi des binaires statiques pour Linux, macOS et Windows — sans aucune dépendance à l'exécution.

## Lire des valeurs {#reading-values}

Travaillons avec un `compose.yaml` typique :

<Snippet source="./files/compose.yaml" language="yaml" />

Lire une valeur unique :

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

Récupérer uniquement les services qui définissent une clé `ports` :

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
`yq -i` conserve les commentaires et les guillemets, mais supprime les lignes vides — la ligne vide entre `web` et `db` disparaît après la première modification. Vérifiez le diff avant de committer un fichier formaté à la main.
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

### Mettre à jour une version dans tout un fichier CI {#update-a-version-across-a-ci-file}

Pour un `.gitlab-ci.yml` qui référence une version d'image à plusieurs endroits, `..` parcourt chaque nœud du fichier, quelle que soit sa profondeur :

<Terminal>
yq -i '(.. | select(. == "node:20")) = "node:22"' .gitlab-ci.yml
</Terminal>

### Merger deux fichiers YAML {#merge-two-yaml-files}

<Terminal>
yq '. *= load("overrides.yaml")' base.yaml
</Terminal>

Cette commande fusionne en profondeur `overrides.yaml` dans `base.yaml` et affiche le résultat — les fichiers source restent inchangés, sauf si vous ajoutez `-i`.

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

Vous pouvez ensuite envoyer cette sortie directement à `jq` pour la traiter davantage.

## Le pont avec jq {#the-jq-crossover}

Si vous utilisez déjà <Link to="/blog/linux-jq">`jq`</Link> pour JSON, la syntaxe de `yq` vous semblera immédiatement familière. Les expressions `jq` du quotidien fonctionnent telles quelles :

| Tâche | jq (JSON) | yq (YAML) |
| ------ | ----------- | ----------- |
| Lire une clé | `jq '.key'` | `yq '.key'` |
| Filtrer un tableau | `jq '.[] \| select(.active)'` | `yq '.[] \| select(.active)'` |
| Récupérer les clés | `jq 'keys'` | `yq 'keys'` |
| Modifier sur place | — | `yq -i '.key = "value"'` |
| Convertir le format | — | `yq -o json '.'` |

Les principales différences : `yq` ajoute `-i` pour les modifications sur place et `-o` pour le format de sortie, et gère les fonctionnalités natives de YAML comme les ancres et les fichiers multi-documents (séparateurs `---`).

## Conclusion {#conclusion}

`yq` comble le manque que tout utilisateur de `jq` finit par ressentir : le même outil, mais pour YAML. Avec un alias Docker, il n'y a rien à installer, et la syntaxe se transpose directement depuis tout ce que vous connaissez déjà. Si votre workflow implique des `compose.yaml`, GitLab CI, GitHub Actions ou des manifests Kubernetes, `yq` a sa place dans votre boîte à outils aux côtés de `jq` et de son équivalent XML, <Link to="/blog/linux-xmlstarlet">`xmlstarlet`</Link>.

La prochaine fois que vous ouvrirez un éditeur de texte pour vérifier une version d'image ou modifier une clé de configuration, utilisez plutôt `yq`.
