---
slug: planethoster-n0c-spam
title: Exterminez-les tous, combattez le spam directement chez PlanetHoster - N0C
date: 2024-01-27
description: Automatisez votre lutte contre le spam sur PlanetHoster N0C ! Découvrez comment générer et déployer des règles Sieve personnalisées avec RoundCube et un script pour bloquer efficacement de grandes quantités d'emails indésirables.
authors: [christophe]
image: /img/v2/fighting_against_spam.webp
mainTag: self-hosted
tags:
  - linux
  - self-hosted
language: fr
review_date: 2026-07-30
---
<!-- cspell:ignore allof,fileinto -->
![Exterminez-les tous, combattez le spam directement chez PlanetHoster - N0C](/img/v2/fighting_against_spam.webp)

<TLDR>
Cet article explique comment combattre le spam sur l'hébergement N0C de PlanetHoster, où SpamAssassin n'est pas accessible aux clients : les règles doivent être créées dans l'interface Filtres de RoundCube, qui génère un fichier `roundcube.sieve` en syntaxe `Sieve`. Il montre le format des règles Sieve et où se trouve ce fichier sur le serveur FTP, comme première étape vers l'automatisation de la génération des règles.
</TLDR>

Il y a quelques jours, j'ai publié un article sur <Link to="/blog/cpanel-spam">comment lutter contre le spam si vous avez un cpanel</Link>. Si vous êtes hébergé sur l'infrastructure N0C de PlanetHoster, ça ne fonctionnera pas.

Après discussion avec eux, ils nous ont dit que SpamAssassin est géré de leur côté (PH) et n'est plus accessible pour nous (les clients). Nous ne pouvons plus créer nos propres règles comme expliqué dans l'article mentionné ci-dessus.

Ok, voici donc comment gérer le spam sur la plateforme PlanetHoster - N0C.

*Créer ces règles une par une dans RoundCube devient vite pénible ; <Link to="/blog/planethoster-n0c-spam-roundcube-action">Exterminate them all, kill spam using GitHub Actions</Link> génère l'intégralité du fichier `roundcube.sieve` à partir d'une simple liste JSON et l'uploade pour vous.*

<!-- truncate -->

## Vous devez utiliser RoundCube pour le filtrage {#you-need-to-use-roundcube-for-the-filtering}

Le support de PlanetHoster m'a indiqué qu'il faut utiliser le client mail RoundCube présent dans leur hébergement PH (lien direct : [https://mg.n0c.com/email/accounts](https://mg.n0c.com/email/accounts)).

<AlertBox variant="caution" title="Vous n'êtes pas obligé d'utiliser RoundCube comme client mail.">
Les règles définies dans RoundCube seront exécutées au niveau du serveur même si vous ne l'ouvrez pas. Quel que soit votre client mail, *peu importe lequel*, les règles RoundCube seront exécutées.

</AlertBox>

La documentation officielle de PH est, en anglais : [https://kb.n0c.com/en/knowledge-base/redirecting-emails-with-a-filter-in-roundcube-2/](https://kb.n0c.com/en/knowledge-base/redirecting-emails-with-a-filter-in-roundcube-2/) ou, en français, [https://kb.n0c.com/knowledge-base/creation-et-redirection-de-tous-les-courriels-avec-un-filtre-dans-roundcube/#marche-a-suivre](https://kb.n0c.com/knowledge-base/creation-et-redirection-de-tous-les-courriels-avec-un-filtre-dans-roundcube/#marche-a-suivre)

Cliquez ensuite sur l'icône mail à droite d'un de vos comptes et vous démarrerez normalement RoundCube.

Dans la partie droite de l'écran, cliquez sur l'icône `Settings` puis `Filters` et enfin sur le bouton `Create` en haut à droite de l'écran.

Remplissez l'écran avec votre propre règle ; par exemple pour identifier comme spam tous les emails provenant de `*.su` (Union soviétique) :

![Identifier comme spam les emails venant d'Union soviétique](./images/rule_su.webp)

<AlertBox variant="note" title="Emails non sollicités">
  Dans mon cas, tous les emails venant de `.su` ne peuvent être que des emails non sollicités.
</AlertBox>

Une fois enregistrée, vous pouvez créer d'autres règles.

## Trop d'actions manuelles {#too-many-manual-actions}

Nous serons tous d'accord : pour arriver au bouton « Save », il a fallu cliquer au moins 13 fois, voire plus. Et pour créer une deuxième règle, il faudrait cliquer au moins 8 fois. Non, ce n'est vraiment pas possible.

Si besoin, cliquez à nouveau sur le menu `Settings` puis `Filters`. Maintenant que vous avez au moins une règle, cliquez sur le bouton `Actions` en haut de l'écran et vous y trouverez une action `Download`.

![Télécharger les règles](./images/actions.webp)

Ouvrez le fichier téléchargé et vous obtiendrez quelque chose comme ceci :

```none
# rule:[Identify as spam: *.su]
if allof (header :contains "from" "*.su")
{
    fileinto "spam";
}
```

Cette syntaxe s'appelle `Sieve` (plus d'infos sur [wiki](https://en.wikipedia.org/wiki/Sieve_(mail_filtering_language))).

La syntaxe est plutôt simple, non ? En fait, on peut la reproduire avec une boucle en PHP, Bash, Python ou *le langage que vous préférez*.

Il y a une seule variable et c'est `*.su`. Donc, si je veux aussi bloquer `.india` (aussi, parce que je n'ai aucun contact en Inde), il me suffit de coder une boucle avec un tableau de deux entrées et j'obtiens :

```none
# rule:[Identify as spam: *.india]
if allof (header :contains "from" "*.india")
{
    fileinto "spam";
}
# rule:[Identify as spam: *.su]
if allof (header :contains "from" "*.su")
{
    fileinto "spam";
}
```

## Où placer notre fichier {#where-to-put-our-file}

Une fois que vous avez un fichier .sieve correctement formaté (pensez à l'enregistrer pour Linux, càd `CR` et non `CRLF`), vous devez copier le fichier sur votre host, très probablement via un client FTP.

L'emplacement se trouve, à la racine de mon FTP, dans le dossier `/mail/DOMAIN.TLD/ACCOUNT/sieve` (pour moi, `DOMAIN.TLD` est `avonture.be` et `ACCOUNT` est `christophe`) puis, je ne sais pas pourquoi, le chemin est doublé (donc, pour moi, c'est `/mail/avonture.be/christophe/mail/avonture.be/christophe/sieve`).

Dans ce dossier, vous trouverez un fichier `roundcube.sieve`.

<AlertBox variant="info" title="Créez une première règle si le chemin n'existe pas encore">
Au cas où vous ne trouveriez pas ce chemin ou ce fichier, allez simplement dans RoundCube et créez un filtre manuellement comme vu au chapitre précédent. Retournez ensuite sur votre FTP, le fichier devrait maintenant s'y trouver.

</AlertBox>

## Restez connecté {#stay-in-touch}

Comme vous me connaissez, je ne peux pas me contenter d'une solution manuelle. Aller dans RoundCube et créer un filtre demande 13 actions. Aïe.

Comme nous l'avons vu, avec un peu de programmation, il est possible d'automatiser la création du fichier `roundcube.sieve`.

J'ai commencé à programmer un petit script en bash Linux qui prendra un fichier JSON en entrée (comme montré ci-dessous) et écrira le fichier `roundcube.sieve`.

<Snippet filename="roundcube.sieve" source="./files/roundcube.sieve" />

Le code, en mode preuve de concept, est déjà écrit (voir ci-dessous), mais il doit être affiné et, surtout, son exécution automatisée.

Laissez-moi un peu de temps pour le faire et dès que ce sera prêt, je publierai ma solution.

<Snippet filename="script.sh" source="./files/script.sh" />

<AlertBox variant="info">
L'article <Link to="/blog/planethoster-n0c-spam-roundcube-action">Exterminate them all, kill spam using GitHub Actions</Link> est maintenant écrit ; n'hésitez pas à le lire.

</AlertBox>

## Remerciements {#special-thanks}

Pour cet article, je voudrais remercier [Marc Dechèvre](https://www.woluweb.be/) car c'est Marc qui a identifié le fichier .sieve et où l'enregistrer via FTP. Merci maestro 👏.
