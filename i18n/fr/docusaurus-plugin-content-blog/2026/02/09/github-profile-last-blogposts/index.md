---
slug: github-profile-last-blogposts
title: Automatisez votre README GitHub avec vos derniers articles de blog
date: 2026-02-09
description: Gardez le README de votre profil GitHub à jour avec vos derniers articles de blog grâce aux GitHub Actions. Découvrez comment mettre en place un workflow planifié qui récupère votre flux RSS et met à jour votre README automatiquement chaque semaine.
authors: [christophe]
image: /img/v2/github_profile_automate.webp
mainTag: github
tags:
  - docusaurus
  - github
language: fr
blueskyRecordKey: 3meftwuqydk2x
---
![Automatisez votre README GitHub avec vos derniers articles de blog](/img/v2/github_profile_automate.webp)

<TLDR>
Cet article explique comment utiliser la GitHub Action `gautamkrishnar/blog-post-workflow` pour mettre à jour automatiquement un README de profil avec les derniers articles d'un flux RSS. Le principe : créer un fichier de workflow YAML planifié via un cron et ajouter des tags en commentaire dans le fichier README.md pour marquer l'endroit où la liste dynamique des articles doit être injectée.
</TLDR>

J'ai récemment découvert la GitHub Action `gautamkrishnar/blog-post-workflow` et je me suis dit : *voilà de quoi garder le README de mon profil à jour automatiquement*.

Comme j'avais déjà refactorisé le [flux RSS](https://www.avonture.be/blog/rss.xml) de mon Docusaurus (voir <Link to="/blog/blog-post-feed">Best Practice - Customizing the Docusaurus RSS Feed for Full Content & Images</Link>), c'est parfait pour automatiser l'affichage des dix derniers articles sur mon profil GitHub.

*C'est la deuxième GitHub Action qui tourne sur ce blog ; la première, décrite dans <Link to="/blog/github-action">GitHub - Use Actions to deploy this blog</Link>, publie le site lui-même.*

Ajoutons une GitHub Action planifiée (par exemple, chaque lundi) pour mettre à jour automatiquement mon repo [cavo789](https://github.com/cavo789/cavo789).

<!-- truncate -->

## Le résultat {#the-result}

Ce n'est pas une maquette — c'est la sortie réelle du workflow, récupérée directement depuis le README de [cavo789/cavo789](https://github.com/cavo789/cavo789) tel qu'il est aujourd'hui :

```html
<!-- BLOG-POST-LIST:START --><tr><td>Adding Reader Reactions to Your Docusaurus Blog</td><td>https://www.avonture.be/blog/docusaurus-reactions</td></tr><tr><td>AI-Powered Code Tooltips in Docusaurus — Explain Like I'm Five</td><td>https://www.avonture.be/blog/docusaurus-eli5-snippet-tooltips</td></tr><tr><td>Meerkat Mischief: Sprinkling Easter Eggs Across my Blog</td><td>https://www.avonture.be/blog/docusaurus-easter-eggs</td></tr><tr><td>ripgrep — The Search Tool That Changed My WSL2 Workflow</td><td>https://www.avonture.be/blog/ripgrep</td></tr><tr><td>git worktree: Work on Two Branches at the Same Time</td><td>https://www.avonture.be/blog/git-worktree</td></tr><!-- ... 5 more rows ... --><!-- BLOG-POST-LIST:END -->
```

Neuf vrais articles, injectés automatiquement entre les deux tags en commentaire — exactement le template `<tr><td>$title</td><td>$url</td></tr>` du workflow ci-dessous, alimenté par le flux RSS en direct, sans aucune modification manuelle.

## Créer le fichier YAML du workflow {#create-the-workflow-yaml-file}

Pour que les choses soient claires :

- Une fois par semaine, je veux que le fichier `README.md` de mon repo [cavo789](https://github.com/cavo789/cavo789) soit mis à jour automatiquement.
- Le contenu du chapitre `My last published articles on my blog` sera réécrit et la liste des articles viendra de mon fichier [blog/rss.xml](https://www.avonture.be/blog/rss.xml).

Commençons par cloner le repository.

Dans mon cas, je clone donc mon repo [cavo789](https://github.com/cavo789/cavo789) sur mon disque puis je lance VSCode pour l'éditer.

Je dois créer une GitHub Action (je dois donc créer le dossier `.github/workflows` s'il n'existe pas encore).

Et dans ce dossier, je vais créer un nouveau fichier YAML, appelons-le `blog-post-workflow.yml` :

<Snippet filename=".github/workflows/blog-post-workflow.yml" source=".github/workflows/blog-post-workflow.yml" />

### Explications pas à pas {#step-by-step-explanations}

#### Le bloc d'introduction {#the-introduction-block}

Rien de compliqué ici, ce sera le nom de notre action.

```yaml
name: Latest blog post workflow
```

Ici, on indique à GitHub de lancer notre workflow via un cron, c'est-à-dire automatiquement selon une planification précise.
Dans l'exemple ci-dessous, chaque lundi à 12:00 UTC.

```yaml
on:
  schedule:              # Run workflow automatically (in a cron)
    - cron: '0 12 * * 1' # Runs every Monday at 12:00 UTC
  workflow_dispatch:     # This will allow to run the workflow manually too
```

mais nous voulons aussi pouvoir démarrer le workflow manuellement. Pour cela, ouvrez simplement votre repo dans un navigateur, cliquez sur le bouton `Actions` et, dans la barre latérale de gauche, vous verrez l'action (`Latest blog post workflow` dans notre exemple) et vous trouverez le bouton `Run workflow` quelque part dans la partie droite de l'écran.

Nous devons aussi autoriser l'action à écrire des fichiers (puisque nous allons mettre à jour le fichier `README.md`).

```yaml
permissions:
  contents: write       # To write the generated contents to the readme
```

#### Le bloc jobs {#the-jobs-block}

Nous devons prévoir deux étapes ; la première pour cloner le repo et la seconde pour faire le vrai travail.

La première étape, c'est comme sur votre machine : il faut faire un `git clone` du repo avant de pouvoir le mettre à jour.

La seconde étape est prise en charge par l'action `gautamkrishnar/blog-post-workflow@v1`.

```yaml
jobs:
  update-readme-with-blog:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4

      - name: Fetch and Update README
        uses: gautamkrishnar/blog-post-workflow@v1
        with:
          feed_list: 'https://www.avonture.be/blog/rss.xml'
          max_post_count: 10
          comment_tag_name: 'BLOG-POST-LIST'
          date_format: 'yyyy-mm-dd'
          template: "<tr><td>$title</td><td>$url</td></tr>"
          commit_message: 'feat: Update README with latest blog posts'
```

Vous trouverez une documentation détaillée sur son site officiel : [https://github.com/marketplace/actions/blog-post-workflow](https://github.com/marketplace/actions/blog-post-workflow) mais, en résumé :

- `feed_list` est le flux RSS source à interroger pour récupérer les articles
- `max_post_count` est le nombre maximum d'articles à récupérer et à injecter dans votre fichier `README.md`
- `comment_tag_name` est le bloc en commentaire à remplacer (nous verrons cela plus bas)
- `date_format` pour être sûr, si vous affichez des dates dans votre contenu, qu'elles utilisent le format souhaité
- `template` est un ... template (HTML dans mon cas) qui sera utilisé pour chaque entrée du résultat (donc si vous récupérez 10 articles, vous obtiendrez une chaîne contenant dix fois votre template) et
- `commit_message` sera utilisé par l'action `gautamkrishnar/blog-post-workflow` pour pousser les changements vers votre repo.

## Mettre à jour le fichier README.md {#updating-the-readmemd-file}

Nous avons vu que, dans notre étape, nous avons demandé à `gautamkrishnar/blog-post-workflow` de chercher un tag en commentaire appelé `BLOG-POST-LIST`.

Voyons maintenant comment l'utiliser :

<Snippet filename="README.md" source="./files/readme.txt" />

Comme vous le voyez, il y a un bloc `<!-- BLOG-POST-LIST:START -->` et `<!-- BLOG-POST-LIST:END -->` dans mon fichier — les deux mêmes tags entre lesquels la sortie réelle montrée en début d'article a été injectée.

Et maintenant, plus vraiment un secret : la GitHub Action va donc générer une chaîne HTML avec mes 10 articles, l'injecter dans mon fichier en remplaçant le contenu entre les deux tags en commentaire et pousser le changement vers GitHub.

Désormais, chaque lundi, mon repo sera mis à jour automatiquement.

Facile, non ?
