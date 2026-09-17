---
slug: matomo-install
title: Comment auto-héberger Matomo
date: 2024-01-28
description: Auto-hébergez Matomo gratuitement et obtenez des statistiques de fréquentation conformes au RGPD. Ce guide simple couvre l'installation, la configuration de la base de données et l'intégration avec Docusaurus.
authors: [christophe]
image: /img/v2/matomo.webp
series: Self-host your own services
mainTag: self-hosted
tags:
  - docusaurus
  - self-hosted
language: fr
review_date: 2026-07-30
---
![Comment auto-héberger Matomo](/img/v2/matomo.webp)

<TLDR>
Cet article explique comment auto-héberger Matomo, un outil d'analyse web conforme au RGPD, sur un sous-domaine : téléchargement et décompression de la release via SSH, création d'une base de données MySQL, exécution de l'assistant d'installation et, enfin, mise en place du script de tracking — y compris le plugin `docusaurus-plugin-matomo` pour les sites Docusaurus.
</TLDR>

[Matomo](https://matomo.org) est un outil de tracking conforme au RGPD pour votre site web. J'ai enfin décidé de l'installer pour obtenir les chiffres de fréquentation du blog ; savoir quels articles sont les plus lus, quels sujets intéressent le plus, etc., pas seulement par curiosité mais aussi pour mieux cerner mon audience.

J'ai choisi la <Link to="/blog/docker-memos">solution auto-hébergée</Link> (parce qu'elle est gratuite) afin que mes chiffres de fréquentation restent sur mon propre serveur.

<!-- truncate -->

L'installation est un jeu d'enfant : télécharger un fichier zip, le décompresser et lancer l'assistant. Vraiment facile.

Il existe un bon tutoriel sur [https://matomo.org/faq/on-premise/installing-matomo/](https://matomo.org/faq/on-premise/installing-matomo/).

De mon côté, voici les actions que j'ai menées :

<StepsCard
  variant="steps"
  steps={[
    "Créer un sous-domaine `matomo.avonture.be` pointant vers un dossier précis sur mon host.",
    "Créer un certificat SSL pour le sous-domaine.",
    {
      content: "Se connecter à ce nouveau dossier en SSH",
      substeps: [
        "Lancer `wget https://builds.matomo.org/matomo.zip` pour télécharger la dernière version",
        "Lancer `unzip -o matomo.zip` pour décompresser et récupérer les fichiers",
        'Lancer `rm -f matomo.zip "How to install Matomo"` pour supprimer deux fichiers inutiles',
      ],
    },
  ]}
/>

Comme je savais qu'il me fallait une base de données MySQL, je suis allé sur mon dashboard. Pour <Link to="/blog/planethoster-n0c-spam">PlanetHoster</Link>, c'est [https://my.planethoster.com](https://my.planethoster.com) et là, j'ai créé une nouvelle base MySQL et son utilisateur.

Enfin, il ne me reste plus qu'à lancer l'assistant sur `https://matomo.avonture.be/index.php` et suivre le guide.

L'assistant est vraiment bien fait et très simple à suivre.

Une fois terminé, j'obtiens mon dashboard sur [https://matomo.avonture.be/index.php](https://matomo.avonture.be/index.php) et il ne me reste qu'à ajouter le script de tracking à mes pages, comme expliqué dans l'assistant.

## Docusaurus {#docusaurus}

Sur <Link to="/blog/docusaurus-docker-own-blog">ce blog</Link>, j'utilise [Docusaurus](https://docusaurus.io/) donc j'ai installé un plugin pour ça : [https://github.com/karser/docusaurus-plugin-matomo](https://github.com/karser/docusaurus-plugin-matomo).
