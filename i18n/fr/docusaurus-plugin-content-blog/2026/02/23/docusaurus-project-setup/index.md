---
slug: docusaurus-project-setup
title: Le composant ProjectSetup - Une façon standardisée de partager des structures de projet
description: Découvrez comment utiliser le nouveau composant ProjectSetup pour partager facilement des structures de projet dans vos articles de blog Docusaurus, avec des snippets de fichiers interactifs et des scripts d'installation automatisés.
authors: [christophe]
image: /img/v2/project_setup.webp
series: Creating Docusaurus components
mainTag: component
tags:
  - component
  - docusaurus
date: 2026-02-23
ai_assisted: true
blueskyRecordKey: 3mfj335ykxc2d
---
![Le composant ProjectSetup - Une façon standardisée de partager des structures de projet](/img/v2/project_setup.webp)

<TLDR>
Le composant `ProjectSetup` est un nouvel outil pour Docusaurus qui permet de partager des structures de projet de façon standardisée et interactive. Il affiche les arborescences de fichiers avec des snippets repliables, génère des scripts d'installation et propose un téléchargement au format ZIP. Vos lecteurs peuvent ainsi reproduire les projets de vos articles beaucoup plus facilement.
</TLDR>

Sur mon blog, je partage souvent des <Link to="/blog/docusaurus-series">composants que j'ai créés pour Docusaurus</Link>. Pour permettre aux lecteurs de reproduire facilement ces projets, je cherchais une manière interactive et standardisée de partager des arborescences de fichiers. C'est ce qui m'a amené à créer le composant `ProjectSetup`.

Il permet d'afficher la structure d'un projet de façon claire et interactive, avec un snippet de code pour chaque fichier. Mais sa vraie force, sa « **killer feature** », c'est ceci : en un seul clic sur le bouton **« Generate install script »**, vous obtenez une commande shell. Copiez-la, collez-la dans votre terminal Linux, exécutez-la et... voilà. Toute l'arborescence du projet, dossiers et fichiers compris, est créée pour vous.

Pour ceux qui préfèrent, le composant propose aussi de télécharger le projet sous forme d'archive ZIP. Dans cet article, je vous montre comment ça fonctionne et comment l'intégrer pour partager efficacement vos propres projets.

<!-- truncate -->

<QuickJump
  links={[
    { label: "Le voir à l'œuvre", to: "#seeing-it-work" },
    { label: "Installer le reste", to: "#installing-the-rest" },
  ]}
/>

## Le voir à l'œuvre {#seeing-it-work}

La meilleure façon de vous montrer comment utiliser `ProjectSetup`, c'est d'utiliser le composant lui-même. Voici comment installer le composant `LogoIcon` dans votre propre projet Docusaurus.

<ProjectSetup folderName="src/components/Blog/LogoIcon">
  <Guideline>
    Installez la dépendance : `npm install @iconify/react`
  </Guideline>
  <Snippet filename="src/components/Blog/LogoIcon/index.tsx" source="src/components/Blog/LogoIcon/index.tsx" defaultOpen={false} />
</ProjectSetup>

À ce stade, vous vous dites peut-être : oh la la, ça doit être fastidieux d'écrire le code HTML derrière cette jolie boîte **📦 Project setup: src/components/Blog/LogoIcon** ci-dessus. En fait, pas du tout. Tout le rendu est pris en charge par le composant `ProjectSetup` lui-même. Voici le code Markdown que j'ai écrit dans mon article Docusaurus :

```markdown
<ProjectSetup folderName="src/components/Blog/LogoIcon">
  <Guideline>
    Install the dependency: `npm install @iconify/react`
  </Guideline>
  <Snippet filename="src/components/Blog/LogoIcon/index.tsx" source="src/components/Blog/LogoIcon/index.tsx" />
</ProjectSetup>
```

<AlertBox variant="tip" title="Toujours à jour">
Et vous savez quoi ? Le composant `Snippet` utilisé ici est assez malin pour lire la structure et le contenu du fichier `src/components/Blog/LogoIcon/index.tsx`, et pour en faire ce joli rendu interactif. Vous n'avez qu'à écrire le code Markdown ci-dessus, le composant fait le reste. Votre documentation reste toujours synchronisée avec le contenu réel du fichier, et vous n'avez pas à vous soucier du formatage ou du style. Vous écrivez le Markdown, le composant s'occupe du reste.
</AlertBox>

## Qu'est-ce que ProjectSetup ? {#what-is-projectsetup}

`ProjectSetup` est un composant React qui permet d'afficher la structure de fichiers d'un projet de façon propre, interactive et standardisée. Il montre non seulement les fichiers et leur contenu, mais fournit aussi des outils pour générer le projet en une seule commande ou le télécharger au format ZIP.

Cet article illustre comment utiliser le composant `ProjectSetup` pour partager des structures de projet dans vos articles de blog Docusaurus, et ainsi permettre à vos lecteurs de reproduire vos projets et d'en tirer profit plus facilement.

## Fonctionnalités principales {#core-features}

- **Affichage interactif des fichiers** : les fichiers s'affichent dans des snippets repliables, avec coloration syntaxique.
- **Génération de script shell** : un script bash est généré automatiquement pour créer toute l'arborescence de dossiers et de fichiers.
- **Téléchargement ZIP** : les utilisateurs peuvent télécharger le projet complet sous forme d'archive ZIP.
- **Instructions post-installation** : vous pouvez ajouter des consignes à afficher après l'installation.

## Dépendances {#dependencies}

Le composant `ProjectSetup` s'appuie sur deux autres composants :

1.  **`LogoIcon`** : un composant simple qui affiche une icône selon le type de fichier, ce qui rend l'interface plus intuitive. Il utilise la très répandue bibliothèque `@iconify/react`. LogoIcon a été créé par <img alt="Docux" src="/img/docux.webp" style={{border: "none", borderRadius: 0, height: "1.2em", verticalAlign: "middle", margin: "0 0.2em"}} /> <Link to="https://github.com/Juniors017">Docux</Link>, allez jeter un œil à son travail : <Link to="https://docuxlab.com/blog/logoicon-component-docusaurus/">Component LogoIcon</Link>.
2.  **`Snippet`** : ce composant se charge d'afficher chaque fichier. C'est un container repliable qui montre le nom du fichier, une icône pertinente et le code correspondant. Lisez mon article précédent sur le sujet : <Link to="/blog/docusaurus-snippets">A component for showing code snippets in a Docusaurus blog</Link>

## Installer le reste {#installing-the-rest}

Voici comment installer les composants `Snippet` et `ProjectSetup` restants dans votre propre projet Docusaurus.

### 1. Installer `Snippet` {#1-installing-snippet}

Mettons maintenant en place le composant `Snippet`. Il a un peu plus de dépendances.

<ProjectSetup folderName="src/components/Snippet">
  <Guideline>
    Installez les dépendances : `npm install clsx`
  </Guideline>
  <Snippet filename="src/components/Snippet/index.tsx" source="src/components/Snippet/index.tsx" defaultOpen={false} />
  <Snippet filename="src/components/Snippet/styles.module.css" source="src/components/Snippet/styles.module.css" defaultOpen={false} />
</ProjectSetup>

### 2. Installer `ProjectSetup` {#2-installing-projectsetup}

Enfin, voici comment installer le composant `ProjectSetup` lui-même.

<ProjectSetup folderName="src/components/ProjectSetup">
  <Guideline>
    Installez les dépendances : `npm install jszip`
  </Guideline>

  <Snippet filename="src/components/ProjectSetup/index.tsx" source="src/components/ProjectSetup/index.tsx" defaultOpen={false} />
  <Snippet filename="src/components/ProjectSetup/styles.module.css" source="src/components/ProjectSetup/styles.module.css" defaultOpen={false} />
</ProjectSetup>

### 3. La page d'aide project_setup {#3-the-project_setup-help-page}

Le composant ProjectSetup renvoie vers une page d'aide qui explique comment l'utiliser. Vous pouvez personnaliser cette page en éditant le fichier `src/pages/project_setup.mdx`. Voici la mienne :

<Snippet filename="src/pages/project_setup.mdx" source="src/pages/project_setup.mdx" defaultOpen={false} />

## Conclusion {#conclusion}

Le composant `ProjectSetup` est un outil puissant pour partager des structures de projet dans vos articles de blog Docusaurus. Il offre une manière interactive d'explorer l'arborescence des fichiers, génère des scripts d'installation et propose un téléchargement ZIP, ce qui facilite la reproduction de vos projets. En l'utilisant, vous améliorez l'expérience d'apprentissage de vos lecteurs et les incitez à s'impliquer davantage dans votre contenu.
