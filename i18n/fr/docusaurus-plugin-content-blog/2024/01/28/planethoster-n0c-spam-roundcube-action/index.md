---
slug: planethoster-n0c-spam-roundcube-action
title: "Exterminez-les tous : tuer le spam avec GitHub Actions"
date: 2024-01-28
description: Tuez le spam automatiquement ! Ce guide montre comment utiliser GitHub Actions, du JSON et un script Bash pour générer et déployer des filtres Sieve Roundcube sur votre hébergement N0C de PlanetHoster, en automatisant la gestion de votre liste de blocage.
authors: [christophe]
image: /img/v2/fighting_against_spam.webp
mainTag: self-hosted
tags:
  - github
  - linux
  - self-hosted
language: fr
updates:
  - date: 2026-07-30
    note: "Updated GitHub Actions to Node 24 runtime: actions/checkout@v3 → @v6, SamKirkland/FTP-Deploy-Action@v4.3.4 → @v4.3.5 (Node 24 required on GitHub runners since June 2026)."
---
<!-- cSpell:ignore allof,fileinto -->
![Exterminez-les tous : tuer le spam avec GitHub Actions](/img/v2/fighting_against_spam.webp)

<TLDR>
Cet article automatise le workflow de filtrage anti-spam Sieve de RoundCube décrit dans l'article précédent sur le N0C de PlanetHoster : un script Bash génère un fichier `roundcube.sieve` à partir d'une liste de domaines `patterns.json` et d'un template, et un workflow GitHub Actions reconstruit puis déploie ce fichier par FTP automatiquement dès que `patterns.json` est poussé. Fini les clics dans l'interface de filtres de RoundCube.
</TLDR>

Dans des articles précédents, j'ai expliqué comment lutter contre le spam si vous avez un <Link to="/blog/cpanel-spam">cpanel</Link> ou l'<Link to="/blog/planethoster-n0c-spam">infrastructure N0C de PlanetHoster</Link>.

Et si on automatisait un maximum de choses ?

*Cet article utilise GitHub Actions pour déployer un fichier généré par FTP — exactement le mécanisme décrit dans <Link to="/blog/github-action">GitHub - Use Actions to deploy this blog</Link>.*

Dans l'article sur l'<Link to="/blog/planethoster-n0c-spam">infrastructure N0C de PlanetHoster</Link>, j'ai montré qu'il faut écrire des règles pour que RoundCube identifie les sources de spam et les écarte. Ces règles doivent être créées depuis l'interface de RoundCube et, bon, d'accord, ce n'est pas optimisé du tout.

Voyons comment en faire le moins possible tout en restant un chasseur de spam acharné.

<!-- truncate -->

## Ce que vous obtenez {#what-you-get}

À la fin de cet article, un script transforme une simple liste de domaines en un fichier de filtres RoundCube complet :

```none
# rule:[Identify as spam: *.buzz]
if allof (header :matches "from" "*.buzz")
{
  fileinto "spam";
}
# rule:[Identify as spam: *.cf]
if allof (header :matches "from" "*.cf")
{
  fileinto "spam";
}
# rule:[Identify as spam: *.cn]
if allof (header :matches "from" "*.cn")
{
  fileinto "spam";
}
```

Ce fichier atterrit sur votre compte d'hébergement et RoundCube le lit comme sa liste de filtres :

![Filtres RoundCube](./images/filters.webp)

<AlertBox variant="note" title="J'ai déjà ajouté davantage de domaines de spam pour mon propre compte">
Si vous n'avez pas la même liste de filtres, c'est tout à fait normal.

</AlertBox>

Pour faire simple : **vous ajoutez une ligne à un fichier JSON sur votre ordinateur, vous le poussez, et RoundCube reçoit les nouvelles règles automatiquement quelques secondes plus tard.** Fini les clics dans l'interface de filtres, une règle à la fois.

## L'idée {#the-idea}

Comme déjà expliqué, RoundCube utilise un fichier sieve pour stocker vos règles. Un tel fichier peut ressembler à ceci :

```none
# rule:[Identify as spam: *.su]
if allof (header :matches "from" "*.su")
{
    fileinto "spam";
}
```

Et donc l'objectif est simple et évident : nous allons créer un petit script qui n'a besoin que de deux choses.

1. une liste de valeurs, par exemple des noms de domaine à bloquer
2. un template sieve

## Notre plan d'action {#our-action-plan}

<StepsCard
  variant="steps"
  steps={[
    "On crée un répertoire et on s'y place : `mkdir ~/sieve-generator && cd $_`,",
    "On crée notre fichier JSON,",
    "On crée notre template sieve,",
    "On crée notre script, en Bash (mais vous pouvez le faire dans n'importe quel langage)",
    "On crée un repository sur GitHub et on y pousse notre code",
    "Et on met enfin en place GitHub Actions pour automatiser le build et le déploiement.",
  ]}
/>

## Construire le générateur {#building-the-generator}

### Créer {#create}

Lancez `mkdir ~/sieve-generator && cd $_` pour créer le dossier `sieve-generator` dans votre répertoire personnel et vous y placer.

### Stocker la liste de valeurs dans un fichier JSON {#storing-the-list-of-values-in-a-json-file}

Créez un fichier appelé `patterns.json` avec ce contenu :

```json
{
  "spam": [
    "*.buzz",
    "*.cf",
    "*.cn",
    "*.ga",
    "*.gq",
    "*.host",
    "*.icu",
    "*.india",
    "*.info",
    "*.live",
    "*.ml",
    "*.net",
    "*.online",
    "*.ru",
    "*.su",
    "*.tk",
    "*.top",
    "*.ua",
    "*.us",
    "*.wang",
    "*.xyz"
  ]
}
```

### Créer notre template {#create-our-template}

Créez un fichier appelé `spam.template` avec ce contenu :

```none
# rule:[Identify as spam: {{ pattern }}]
if allof (header :matches "from" "{{ pattern }}")
{
 fileinto "spam";
}

```

<AlertBox variant="caution" title="Conservez bien la dernière ligne vide">
La dernière ligne du fichier `spam.template` doit être une ligne vide : le fichier doit donc compter 6 lignes, pas 5.

</AlertBox>

### Créer le script de génération {#create-the-generation-script}

Créez un fichier appelé `generate.sh` avec ce contenu :

```bash
#!/usr/bin/env bash

clear

if [ ! -f patterns.json ]; then
    echo "Please create a patterns.json file."
    echo "Run 'cp patterns.json.dist patterns.json' to use an example."
    exit 1
fi

if [ ! -f spam.template ]; then
    echo "Please create a spam.template file. Below an example of what you can put in it:"
    echo ""
    echo "# rule:[Identify as spam: {{ pattern }}]"
    echo "if allof (header :matches \"from\" \"{{ pattern }}\")"
    echo "{"
    echo "  fileinto \"spam\";"
    echo "}"
    echo ""
    exit 1
fi

# File to create
outFile="${PWD}/build/roundcube.sieve"

[ ! -d "$(dirname "${outFile}")" ] && mkdir "$(dirname "${outFile}")"

rm -f "${outFile}" && touch "${outFile}"

cat patterns.json \
    | jq '.spam[]' \
    | sort \
    | while read -r pattern; do \
        # Trim quotes
        pattern=$(echo "$pattern" | tr -d '"')
        # Read the spam.template file, make the replace and append in file roundcube.sieve
        sed "s/{{ pattern }}/${pattern}/g" spam.template >>"${outFile}"; \
    done

echo "File ${outFile} has been created."
```

Lancez aussi `chmod +x generate.sh` pour le rendre exécutable.

À ce stade, vous avez donc trois fichiers dans votre dossier :

- `generate.sh`,
- `patterns.json` et
- `spam.template`

Dans votre console, lancez `./generate.sh` et si tout se passe bien, vous obtiendrez un message du type `File /home/xxx/sieve-generator/build/roundcube.sieve has been created.`.

<AlertBox variant="tip" title="`jq` est requis">
Le script lit la liste JSON avec `jq`. Si vous obtenez une erreur à ce sujet, installez-le avec `sudo apt-get update && sudo apt-get install jq` puis relancez `./generate.sh`.
</AlertBox>

Vous devriez maintenant avoir un nouveau dossier appelé `build` dans lequel le fichier `roundcube.sieve` a été créé. Ouvrez-le : son contenu est la liste de règles montrée au début de cet article, un bloc par pattern, trié par ordre alphabétique.

Félicitations : vous venez de créer votre générateur anti-spam.

## Déployer le fichier par FTP {#deploying-the-file-by-ftp}

Pour valider le fichier `roundcube.sieve`, vous pouvez démarrer votre client FTP, aller sur votre serveur N0C (hébergé chez PlanetHoster) et vous rendre dans le dossier `/mail/DOMAIN.TLD/ACCOUNT/sieve` (reportez-vous à l'article <Link to="/blog/planethoster-n0c-spam">infrastructure N0C de PlanetHoster</Link> si nécessaire).

Poussez-y le fichier, sur votre host.

Allez maintenant sur votre webmail (lien direct : [https://mg.n0c.com/email/accounts](https://mg.n0c.com/email/accounts)) et démarrez RoundCube. Ouvrez votre compte, cliquez sur `Settings` puis `Filters` et tadaaa — la liste de filtres montrée au début de cet article est maintenant la vôtre, sans un seul clic dans l'éditeur de filtres.

## Automatiser avec GitHub Actions (optionnel) {#automating-it-with-github-actions-optional}

### Créer votre propre repository GitHub {#create-your-own-github-repository}

<AlertBox variant="info" title="Chapitre optionnel">
  Passez ce chapitre si vous ne voulez pas l'automatisation complète.
</AlertBox>

Pour pouvoir créer de l'automatisation avec GitHub Actions, il faut d'abord créer un repository GitHub.

Je suppose que vous avez déjà un compte GitHub et que vous savez l'utiliser.

Allez sur [https://github.com/new](https://github.com/new) et créez un nouveau repository **privé** (c'est gratuit).

Ensuite, copiez/collez simplement l'exemple donné par GitHub ; quelque chose comme :

<Terminal typewriter source="./files/terminal-2.txt" />

Poussez maintenant les autres fichiers :

<Terminal typewriter source="./files/terminal-1.txt" />

De retour sur GitHub, vous obtiendrez un repo comme celui-ci :

![Repo GitHub](./images/github_repo.webp)

Donc, désormais, chaque fois que vous mettrez à jour la liste des domaines (dans le fichier `patterns.json`), notre objectif est de demander à GitHub de lancer lui-même le script `./generate.sh`, de générer le fichier `build/roundcube.sieve` et de le publier sur votre compte FTP.

### Ajouter GitHub Actions {#adding-github-actions}

<AlertBox variant="info" title="Chapitre optionnel">
  Passez ce chapitre si vous ne voulez pas l'automatisation complète.
</AlertBox>

Revenez sur votre ordinateur, replacez-vous dans le dossier `~/sieve-generator` et créez un nouveau fichier appelé `.github/workflows/build_and_deploy.yaml`.

Voici le contenu de ce nouveau fichier :

```yaml
name: Create roundcube.sieve and deploy

on:
  push:
    branches:
      - main

  workflow_dispatch:
    inputs:
      version:
        type: string
        required: false
        description: 'Version of jq to install'
        default: '1.7'
      force:
        type: boolean
        required: false
        description: 'Do not check for existing jq installation before continuing.'
        default: false

permissions:
  contents: write

jobs:
  deploy:
    name: Create roundcube.sieve and deploy
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6

      - name: 'Setup jq'
        uses: dcarbone/install-jq-action@v2
        with:
          version: '${{ inputs.version }}'
          force: '${{ inputs.force }}'

      - name: 'Build'
        run: |
          ./generate.sh

      - name: Push files
        uses: SamKirkland/FTP-Deploy-Action@v4.3.5
        with:
          server: ${{ secrets.ftp_server }}
          username: ${{ secrets.ftp_login }}
          password: ${{ secrets.ftp_password }}
          local-dir: ./build/
```

Je ne vais pas détailler ce fichier, mais il demande à GitHub de :

1. Installer JQ sur son serveur,
2. Lancer le script `generate.sh` et donc construire le fichier `build/roundcube.sieve`
3. Utiliser FTP-Deploy-Action pour pousser le fichier sur votre serveur.

Comme vous pouvez le voir, il y a trois `secrets`.

Retournez dans votre navigateur, sur le repository GitHub créé au chapitre précédent.

Cliquez sur `Settings` puis `Secrets and variables` et enfin sur `Actions`

![Secrets GitHub](./images/settings_actions_secrets.webp)

Cliquez sur le bouton vert `New repository secret` et créez le premier, appelé `FTP_SERVER` (il semble qu'il doive être en majuscules). Mettez-y le nom de votre serveur FTP, du type `node99-xx.N0c.com` (récupérez le nom depuis votre page *My planethoster*).

Vous devrez ajouter deux nouveaux secrets, `FTP_LOGIN` et `FTP_PASSWORD`, mais avant cela, créez un nouvel utilisateur FTP.

Allez sur [https://mg.n0c.com/files/ftp-accounts](https://mg.n0c.com/files/ftp-accounts) et créez un nouvel utilisateur. Utilisez un nom très explicite comme `deploy_spam_roundcube_xxx` et définissez un mot de passe très solide (30 caractères ou plus).

Restreignez le path de cet utilisateur exactement à l'endroit où se trouve le fichier sieve sur votre FTP. Comme indiqué dans <Link to="/blog/planethoster-n0c-spam">infrastructure N0C de PlanetHoster</Link>, pour moi c'est `/mail/avonture.be/christophe/mail/avonture.be/christophe/sieve`. Veillez à trouver le vôtre.

<AlertBox variant="note">
Si le dossier `sieve` n'existe pas encore, la meilleure façon de le créer, à mon avis, est de créer manuellement un filtre dans Roundcube. Voici la [documentation officielle de PlanetHoster](https://kb.n0c.com/en/knowledge-base/redirecting-emails-with-a-filter-in-roundcube-2/).

</AlertBox>

Voilà, vous avez maintenant un nouveau login FTP, son mot de passe très sécurisé, et un accès restreint à votre seul dossier sieve.

Copiez le login et le mot de passe dans la page des secrets GitHub.

Vous obtiendrez alors ceci :

![Secrets](./images/secrets.webp)

## Tout est maintenant en place pour l'automatisation {#everything-is-now-in-place-for-automation}

Si vous avez suivi les chapitres GitHub, tout est désormais configuré.

Retournez sur votre ordinateur, éditez le fichier `patterns.json` et ajoutez un nouveau pattern, par exemple `newsletters@*`.

Poussez le changement sur GitHub (`git add . ; git commit -m "chore: new pattern" ; git push`).

Juste par curiosité, allez dans l'onglet Actions de GitHub :

![Build and deploy](./images/build_and_deploy.webp)

Si vous avez tout configuré correctement, vous devriez obtenir ceci :

![FTP Deploy Action](./images/ftp_deploy_action.webp)

## Conclusion {#conclusion}

Désormais, il vous suffit de copier/coller les adresses e-mail d'où proviennent les spams, de voir si vous pouvez les généraliser au maximum (en utilisant l'astérisque comme dans `newsletter@*`) puis de les copier/coller dans le fichier JSON qu'il ne reste plus qu'à envoyer sur GitHub.

Lutter contre le spam se résume maintenant à un commit d'une ligne, et la liste de blocage est versionnée : vous pouvez voir quand un domaine a été ajouté, et le retirer tout aussi facilement.

Et voilà !
