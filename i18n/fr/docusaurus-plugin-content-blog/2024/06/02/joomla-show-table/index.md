---
slug: joomla-show-table
title: Joomla - Exécuter une requête SQL en dehors de Joomla et afficher un joli tableau HTML
date: 2024-06-02
description: Exportez facilement vos données Joomla en direct vers Microsoft Excel. Apprenez à exécuter une requête SQL personnalisée en dehors de Joomla et à afficher les résultats dans un tableau HTML actualisable, à lier à votre feuille de calcul.
authors: [christophe]
image: /img/v2/joomla.webp
mainTag: joomla
tags:
  - database
  - excel
  - joomla
language: fr
updates:
  - date: 2026-07-30
    note: "The cavo789/joomla_show_table repo has been archived (May 2025); the script remains functional but is no longer maintained. Joomla 6.x compatibility is untested."
---
<!-- cspell:ignore showtable,sortering,qrjlq -->
![Joomla - Exécuter une requête SQL en dehors de Joomla et afficher un joli tableau HTML](/img/v2/joomla.webp)

<TLDR>
Cet article partage un script `showtable.php` qui exécute une requête SQL personnalisée sur la base de données Joomla et affiche le résultat dans un tableau HTML protégé par mot de passe. Excel peut ensuite s'y connecter via « Obtenir les données à partir du Web » (avec `&format=raw`) pour des exports actualisables en un clic — pratique pour du courrier fusionné ou des rapports basés sur des données Joomla en direct.
</TLDR>

Il y a longtemps, à des années d'ici, j'avais besoin d'exposer les données de mon site Joomla dans une simple page web *en dehors* de Joomla, sous forme de tableau HTML. L'objectif : lier une feuille Microsoft Excel à ce tableau et, dans Excel, faire un simple *Actualiser* pour récupérer les données les plus récentes de mon site Joomla.

Le but était d'obtenir la liste des personnes qui m'avaient acheté un logiciel ou un service. Entre autres, il me fallait leur prénom, leur nom, leur adresse de facturation, etc. pour créer une facture dans Microsoft Word via la fonctionnalité de courrier fusionné (source de données = Excel).

<AlertBox variant="info" title="Cas d'usage réel">
Ah, attendez : donc une page web qui exécute une requête SQL du type `SELECT ... FROM ... WHERE ...` sur la base de données Joomla, récupère les enregistrements puis les affiche dans une page HTML. Excel peut lier le tableau et Word peut les récupérer pour générer par exemple un pdf. Sympa, non ?

</AlertBox>

Bien sûr, exécuter simplement une requête sur votre base de données et afficher le résultat dans une page web peut être très utile.

*Ce script est en lecture seule. Son pendant destructeur — supprimer les tables correspondant à un préfixe — c'est <Link to="/blog/joomla-db-kill-tables-prefix">Joomla - delete tables from your database according to a certain prefix</Link>. Et pour parcourir la base de données de façon interactive plutôt qu'avec une requête figée, <Link to="/blog/docker-adminer-pgadmin-phpmyadmin">Adminer, pgadmin ou phpmyadmin</Link> est l'outil qu'il vous faut.*

<!-- truncate -->

Vous trouverez toutes les informations sur mon repo : [https://github.com/cavo789/joomla_show_table](https://github.com/cavo789/joomla_show_table) ; compatible jusqu'à Joomla 5.1. Le repository est archivé depuis mai 2025 — le script fonctionne toujours mais n'est plus maintenu, et la compatibilité avec Joomla 6.x n'a pas été testée.

## Créons un exemple {#lets-create-an-example}

1. Si vous n'avez pas encore de site Joomla, créez-en un. Pour ma part, je vais suivre mon tutoriel <Link to="/blog/docker-joomla">Créez votre site web Joomla avec Docker</Link> ;

2. Téléchargez une copie de mon script [showtable.php](https://raw.githubusercontent.com/cavo789/joomla_show_table/master/src/showtable.php) et copiez-le dans le dossier racine de votre site Joomla ;

3. Accédez au script depuis votre navigateur (par exemple `http://localhost:8080/showtable.php`) ; un mot de passe vous sera demandé, c'est `Joomla` par défaut (comme vous pouvez le voir [ici](https://github.com/cavo789/joomla_show_table/blob/master/src/showtable.php#L131)) ;

4. Par défaut, vous obtenez la liste des utilisateurs de votre site Joomla :

    <BrowserWindow url="http://localhost:8080/showtable.php">
      ![La liste de vos utilisateurs](./images/list_of_users.webp)
    </BrowserWindow>

Vous voyez comme le script est simple à utiliser : il n'y a rien à configurer pour qu'il fonctionne.

## Afficher la liste des articles {#show-the-list-of-articles}

Comme vous l'avez vu, le script est livré avec une requête déjà prédéfinie pour afficher la liste des utilisateurs.

Affichons maintenant la liste des articles : ouvrez votre éditeur préféré et ouvrez le script `showtable.php` ; allez à la ligne 70 et commentez les lignes 70 à 79. Décommentez ensuite la requête suivante, comme illustré ci-dessous.

![Commenter la requête des utilisateurs](./images/comment_users_query.webp)

Nous allons donc utiliser un autre exemple prédéfini... Enregistrez et actualisez votre page web. Vous obtenez un nouveau résultat :

<BrowserWindow url="http://localhost:8080/showtable.php?password=Joomla&submit=Submit">
  ![La liste des articles](./images/list_of_articles.webp)
</BrowserWindow>

Si vous voulez exporter cette liste vers Excel, repérez le bouton `Excel` en haut à gauche et cliquez dessus :

<BrowserWindow url="http://localhost:8080/showtable.php?password=Joomla&submit=Submit">
  ![Exporter vers Excel](./images/export_to_excel.webp)
</BrowserWindow>

## Depuis Excel, récupérer nos données Joomla {#from-within-excel-retrieve-our-joomla-data}

Démarrez Excel, cliquez sur le menu `Données` puis, dans `Récupérer et transformer des données`, cliquez sur le bouton `À partir du Web` et collez l'URL de votre script `showtable.php`, comme ceci dans mon cas : `http://localhost:8080/showtable.php?password=Joomla&format=raw`.

<AlertBox variant="caution" title="Le format doit être raw">
Pensez bien à ajouter `&format=raw` à l'URL. C'est important pour que `showtable.php` sache qu'il ne doit pas ajouter de fonctionnalités supplémentaires comme les options de filtrage ou de tri. En sortie RAW, le script ne crée qu'un simple objet HTML `<table></table>`, ce qui facilite la vie d'Excel.

</AlertBox>

![Accéder au tableau depuis Excel](./images/excel_webdata.webp)

Et maintenant, faites juste un clic droit sur le tableau dans Excel puis cliquez sur `Actualiser` pour obtenir à tout moment une mise à jour de votre contenu Joomla.

![Actualiser depuis Excel](./images/excel_refresh.webp)

Vous pouvez donner cette feuille Excel à n'importe qui, par exemple votre client, et lui dire *Faites un clic droit sur la feuille pour récupérer une mise à jour depuis le site Joomla.* Rien de plus.

<AlertBox variant="caution">
Oui ! Vous devez fournir le mot de passe dans la query string, sinon Excel ne pourra pas accéder au tableau. C'est sous votre propre responsabilité de ne pas afficher de données confidentielles.

</AlertBox>

## Utiliser un autre mot de passe {#using-another-password}

Ouvrez votre éditeur préféré et ouvrez le script `showtable.php`. Cherchez `const PASSWORD` et lisez le commentaire. La valeur est chiffrée en md5. Vous pouvez utiliser n'importe quel outil de chiffrement MD5, par exemple [http://www.md5.cz/](http://www.md5.cz/).

Tapez le mot de passe souhaité (`MyVeryStrongPassword`) ; soumettez le formulaire et copiez/collez le résultat (`41ae0707c6150f0f1c78803424949f5f`) comme nouvelle valeur du mot de passe.

Retournez sur votre site, actualisez la page et vous verrez que l'URL `password=Joomla` ne fonctionne plus. Tapez votre mot de passe dans le champ du formulaire et, oui, c'est revenu.

## Créer votre propre requête SQL {#creating-your-own-sql}

Pour créer votre propre requête SQL, vous devez accéder à votre base de données. Vous pouvez utiliser l'outil de votre choix : `Adminer`, `phpMyAdmin`, `pgAdmin`, ... celui que vous préférez.

Je ne vais pas détailler chaque outil ici (lisez mon article <Link to="/blog/docker-adminer-pgadmin-phpmyadmin#run-adminer">Utiliser Adminer, pgadmin ou phpmyadmin pour accéder à votre base de données dans un container Docker</Link> pour plus d'infos), mais l'objectif est de pouvoir créer une requête dans une telle interface et vérifier qu'elle fonctionne.

Une fois créée avec succès, vous obtenez une requête du type `SELECT ... FROM ... WHERE ...`. Copiez-la dans le script `showtable.php` : cherchez le motif `'SQL'` et vous verrez le SQL actuellement utilisé. Collez le vôtre et vérifiez que vous avez respecté la syntaxe. Vous pouvez remplacer le préfixe de votre base de données par le placeholder `#_`, ainsi par exemple `qrjlq_content` devient `#_content`.
