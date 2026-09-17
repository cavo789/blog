---
slug: gemini-tldr
title: Automatiser les résumés TL;DR avec Gemini AI
date: 2026-02-16
description: Améliorez l'expérience de vos lecteurs en générant automatiquement des résumés TL;DR concis pour vos articles de blog avec Gemini AI de Google et Python.
authors: [christophe]
image: /img/v2/gemini_tldr.webp
series: Creating Docusaurus components
mainTag: component
tags:
  - ai
  - component
  - docker
  - docusaurus
  - python
language: fr
blueskyRecordKey: 3mexhwsmhac2n
---

![Automatiser les résumés TL;DR avec Gemini AI](/img/v2/gemini_tldr.webp)

<TLDR>
Écrire des résumés pour de longs articles améliore l'expérience utilisateur, mais ça prend du temps. Cet article explique comment automatiser la génération de sections « Too Long; Didn't Read » (TL;DR) avec un script Python et Gemini AI de Google. Nous verrons la mise en place Docker, l'utilisation du script et son intégration dans votre workflow Docusaurus.
</TLDR>

En tant que blogueur technique, je cherchais un moyen d'améliorer l'expérience de mes lecteurs en proposant des résumés concis au début de mes articles — pour qu'ils ne perdent pas leur temps (j'espère !) à lire un article entier avant de se dire : « Attends, ce n'est pas ce que je cherchais. »

J'ai donc décidé d'automatiser la génération de résumés TL;DR avec Gemini AI de Google et un simple script Python. Dans cet article, je vous explique comment j'ai fait.

*Ce n'est pas mon seul usage de Gemini sur ce blog : lisez <Link to="/blog/gemini-meerkat">How I used Google Gemini Nano Banana on my blog</Link> pour le volet illustrations de l'histoire.*

<!-- truncate -->

<QuickJump
  links={[
    { label: "Avant et après", to: "#before-and-after" },
    { label: "Récupérer tous les fichiers", to: "#conclusion" },
  ]}
/>

## Avant et après {#before-and-after}

Le script prend un article entier — chaque paragraphe, chaque titre — et le réduit à quelques phrases. Voici un exemple réel, tiré directement de <Link to="/blog/lovable-dev-ai">l'article sur Lovable.dev</Link> de ce blog.

**Avant** — les premiers paragraphes que le script lit réellement :

> Cette semaine, un collègue m'a parlé de Lovable.dev en me disant : « *Dans un prompt, il suffit de décrire le programme que vous voulez générer, et l'outil le construit et le déploie même pour vous* ». Waouh, il fallait absolument que j'essaie.
>
> Mais que demander ? Et si je lui demandais de créer un clone de Marknotes ? Ceux qui me suivent depuis des années savent que j'ai créé Marknotes, une application de prise de notes, il y a 10 ans. J'y ai travaillé pendant cinq ans avant de passer à autre chose.
>
> Voyons si Lovable.dev peut construire la même chose en une seule heure. **Spoiler : non, mais ce n'était pas si mal.**

**Après** — le `<TLDR>` que le script a généré et injecté en haut de ce même article :

![Le TLDR généré, tel qu'il s'affiche sur l'article publié](./images/example_tldr_output.png)

La même densité d'information dont les lecteurs ont vraiment besoin, en une fraction du temps de lecture.

## Le concept {#the-concept}

L'idée est simple : il me faut un script qui parcourt mes articles de blog (un ou plusieurs) et génère un court résumé avec Gemini AI. Ensuite, il doit insérer ce résumé dans l'article, enveloppé dans un composant `<TLDR>` maison pour le style et la visibilité.

Le script va faire ceci :

1. Recevoir un chemin en entrée (fichier ou dossier).
2. Lire les fichiers Markdown.
3. Envoyer le contenu à Gemini AI pour résumé.
4. Récupérer le résumé.
5. Réinjecter le résumé dans le fichier Markdown.

Ma structure de dossiers ressemble à ceci : `blog/YYYY/MM/DD/index.md` pour chaque article. Donc en appelant le script avec `blog/2026/01/`, il traitera tous les articles de janvier 2026.

## Le composant React {#the-react-component}

D'abord, il nous faut une façon d'afficher joliment le résumé dans Docusaurus. J'utilise un simple composant maison pour ça. Voici l'implémentation :

```html
<TLDR> This is the summary of the article... </TLDR>
```

Le code du composant est le suivant :

<Snippet filename="src/components/TLDR/index.tsx" source="src/components/TLDR/index.tsx" />

<Snippet filename="src/components/TLDR/styles.module.css" source="src/components/TLDR/styles.module.css" />

## Le script d'automatisation {#the-automation-script}

Sur mon blog, j'ai créé un dossier `.scripts/python_tldr` pour héberger le script Python et ses dépendances.

<AlertBox variant="info" title="API Gemini">
Il vous faudra une clé d'API Google Gemini pour que ça fonctionne. Vous pouvez en obtenir une sur [https://aistudio.google.com/api-keys](https://aistudio.google.com/api-keys).
</AlertBox>

### Exécution avec Docker {#running-with-docker}

Comme je suis un grand fan de Docker, je voulais m'assurer que le script tourne dans un environnement reproductible.

Voici comment démarrer le container :

<Terminal typewriter wrap={true}>
$ docker run -it --rm --env-file .env -v .:/app -w /app python sh -c "pip install google-genai python-dotenv > /dev/null 2>&1 && /bin/bash"
</Terminal>

Cette commande va créer un container Python, monter votre répertoire courant sur `/app`, lire et charger votre fichier d'environnement, installer les packages nécessaires (`google-genai` pour l'accès à l'API Gemini et `python-dotenv` pour la gestion des variables d'environnement), puis lancer un shell bash où vous pourrez exécuter le script.

<AlertBox variant="info" title="Variables d'environnement">

Vous devrez créer un fichier `.env` à la racine de votre projet avec le contenu suivant :

<Snippet filename=".env" source="./files/.env" defaultOpen={true} />

</AlertBox>

### Générer les résumés {#generating-summaries}

Une fois dans le container, vous pouvez lancer le script sur un fichier précis ou sur tout un répertoire.

Pour traiter un seul fichier :

<Terminal typewriter wrap={true}>
$ python .scripts/python_tldr/main.py blog/2026/01/index.md
</Terminal>

Pour traiter tous les articles d'un mois donné :

<Terminal typewriter wrap={true}>
$ python .scripts/python_tldr/main.py blog/2026/01/
</Terminal>

Le script est assez malin pour ignorer les fichiers qui contiennent déjà un tag `<TLDR>`, vous pouvez donc le lancer sans risque sur toute l'archive de votre blog.

<AlertBox variant="note" title="Soyez transparent avec vos lecteurs">
Un résumé écrit par une machine reste du contenu généré par une machine. Je le signale explicitement sur chaque article concerné ; voir <Link to="/blog/docusaurus-ai-gemini">How to indicate AI-assisted content in a Docusaurus blog</Link>.
</AlertBox>

Le même principe — *générer une fois à l'écriture, committer le résultat* — est réutilisé dans <Link to="/blog/docusaurus-eli5-snippet-tooltips">AI-Powered Code Tooltips in Docusaurus</Link> : les lecteurs n'attendent jamais un appel d'API et votre clé ne quitte jamais votre machine.

## Erreur - 429 RESOURCE_EXHAUSTED {#error---429-resource_exhausted}

Cette erreur indique que vous avez dépassé vos limites d'utilisation de l'API Gemini. Selon votre plan, il peut y avoir des restrictions sur le nombre de requêtes ou sur le volume de données traitables dans un intervalle de temps donné.

*Le plan gratuit est assez limité : si vous avez beaucoup d'articles, envisagez de passer à un plan supérieur ou de lancer le script par lots pour éviter d'atteindre la limite.*

Vous pouvez toujours utiliser la même fonctionnalité, mais manuellement : allez sur [https://gemini.google.com/app](https://gemini.google.com/app), collez le contenu de votre article et demandez à Gemini de générer un résumé TL;DR. Copiez ensuite le résultat et collez-le dans votre article, à l'intérieur du composant `<TLDR>`.

Voici le prompt utilisé pour obtenir le résumé :

```text
You are an expert technical editor.

Read the following article content and generate a 'TL;DR' summary.

The summary must be concise (max 3 sentences) and written in the same language as the article.
```

## Conclusion {#conclusion}

Vous trouverez ci-dessous tous les fichiers nécessaires pour mettre ça en place sur votre propre blog Docusaurus. N'hésitez pas à adapter et améliorer le script selon vos besoins !

<ProjectSetup folderName="/your_docusaurus_site" createFolder={false} >
  <Guideline>
    Maintenant, lancez 'docker run -it --rm -v .:/app -w /app python sh -c "pip install google-genai python-dotenv && python .scripts/python_tldr/main.py blog/"' pour ajouter le résumé TLDR dans chaque article sous /blog/.
  </Guideline>
  <Snippet filename=".env" source="./files/.env" defaultOpen={true} />
  <Snippet filename=".scripts/python_tldr/main.py" source="./files/main.py" />
  <Snippet filename=".scripts/python_tldr/src/ai_service.py" source="./files/src/ai_service.py" />
  <Snippet filename=".scripts/python_tldr/src/file_manager.py" source="./files/src/file_manager.py" />
  <Snippet filename="src/components/TLDR/index.tsx" source="src/components/TLDR/index.tsx" />
  <Snippet filename="src/components/TLDR/styles.module.css" source="src/components/TLDR/styles.module.css" />
</ProjectSetup>

<AlertBox variant="info" title="Limitations de Gemini" >
Selon votre plan Gemini AI, il peut y avoir des limites sur le nombre de requêtes ou la longueur du texte traité. Vérifiez bien les détails de votre plan pour éviter les frais inattendus ou les interruptions.

Actuellement, mon propre plan me permet de faire 20 appels par jour.
</AlertBox>

<AlertBox variant="note" title="src/theme/MDXComponents.js">

N'oubliez pas de mettre à jour votre fichier `src/theme/MDXComponents.js` pour y inclure le nouveau composant `TLDR`, afin que Docusaurus sache comment le rendre. Si vous n'avez pas encore ce fichier, créez-le. Voici son contenu :

<Snippet filename="src/theme/MDXComponents.js" source="./files/MDXComponents.js" defaultOpen={false} />
</AlertBox>
