---
slug: zorin
title: À la découverte de Zorin
date: 2025-12-01
description: Envie d'essayer un nouvel OS ? Zorin OS 18 est une distribution Linux basée sur Ubuntu, parfaite pour quitter Windows. Installation facile, interface familière et excellente compatibilité !
authors: [christophe]
image: /img/v2/zorin_os.webp
series: WSL2 - Install, move and use it
mainTag: linux
tags:
  - linux
language: fr
tried_it: false
blueskyRecordKey: 3m6w2zwj7u22n
---
![À la découverte de Zorin](/img/v2/zorin_os.webp)

<TLDR>
Zorin OS 18 est une distribution Linux basée sur Ubuntu, conçue pour les utilisateurs de Windows en quête d'une alternative, en particulier sur les PC un peu anciens. L'installation est simple et l'interface, très proche de celle de Windows, rend la transition immédiate. L'OS offre aussi la compatibilité avec de nombreuses applications Windows via WINE et un excellent support du jeu vidéo, ce qui en fait un choix de premier plan.
</TLDR>


Comme tout le monde, j'ai un vieil ordinateur et, avec la fin du support de Windows 10, j'ai vu tellement d'articles de blog ou de news à propos de [Zorin OS 18](https://zorin.com/) que la curiosité m'a gagné et que j'ai voulu l'essayer.

Zorin OS est une distribution Linux basée sur Ubuntu qui vise les utilisateurs venant de Windows ou de macOS, avec un environnement de bureau très similaire à Windows.

*Pas prêt à réaffecter une machine entière ? Vous pouvez vous faire une idée d'un bureau Linux depuis Windows : <Link to="/blog/docker-lubuntu">Start lubuntu Desktop in Docker</Link>. Et si vous voulez juste la ligne de commande, <Link to="/blog/ubuntu-install">Ubuntu - Install from scratch</Link> couvre la voie WSL.*

<!-- truncate -->

Zorin peut être [téléchargé](https://zorin.com/os/download/) gratuitement (c'est-à-dire l'édition Core ou l'édition `Education`). Si vous voulez soutenir les développeurs ou avez besoin de fonctionnalités supplémentaires, vous pouvez télécharger l'édition Pro (moins de 50 € TVA comprise fin 2025).

Vous devrez télécharger un fichier `.iso` et un programme appelé `balenaEtcher` afin de flasher une clé USB. Tout est clairement décrit sur la [page how to install Zorin OS](https://help.zorin.com/docs/getting-started/install-zorin-os/).

Une fois ma clé USB prête, je la mets dans mon vieux PC, je démarre le PC, j'appuie sur <kbd>F12</kbd> dans mon cas pour entrer dans le BIOS et je change la séquence de démarrage : le PC doit démarrer sur la clé USB cette fois, pas sur le disque dur.

J'enregistre, je quitte le BIOS et, effectivement, l'écran d'installation s'affiche. Comme indiqué dans le guide, je dois sélectionner l'option `Try or Install Zorin OS` et attendre quelques instants pendant que Zorin effectue quelques vérifications.

![Le menu d'installation de Zorin](./images/zorin_installation_menu.webp)

Le PC va redémarrer et vous obtiendrez l'écran d'accueil de Zorin. Sélectionnez la langue de votre OS, la configuration de votre clavier, une installation normale ou minimale, ... puis lancez l'installation.

Jusqu'ici, ce n'est pas plus compliqué qu'avec un installateur Windows, et pas différent : il suffit d'attendre que tout soit installé.

Les utilisateurs de Windows apprécieront que l'interface graphique de Zorin OS soit très proche de celle de Windows, avec des menus, des barres de tâches et un gestionnaire de fichiers.

![Interface de Zorin](./images/zorin_desktop.webp)

<AlertBox variant="tip" title="On dirait Windows, non ?">

</AlertBox>

## Ce qui peut faire la différence {#what-can-make-the-differences}

- L'installateur est bien fait : clic, clic, clic et reboot.
- Zorin intègre nativement Microsoft OneDrive.
- Vous pourrez aussi installer certaines applications Windows directement sur Zorin grâce à `WINE` (*couche de compatibilité open-source qui permet aux applications et aux jeux Windows de tourner sous Linux.*).
- Si vous êtes joueur, [près de 90 % des jeux Windows tournent désormais sous Linux](https://www.techpowerup.com/342337/almost-90-of-windows-games-run-on-linux-notes-report).

Le système était immédiatement opérationnel : aucun problème avec ma carte graphique et ma connexion internet fonctionnait.

Zorin arrive avec beaucoup de logiciels préinstallés comme **Libre-Office**.

Je ne suis pas allé plus loin dans l'exploration de Zorin, mais si je devais un jour me passer de Windows, Zorin serait sans aucun doute en tête de ma liste d'options.

<AlertBox variant="caution" title="Reformater la clé USB">
Maintenant que Zorin est installé, vous pouvez reformater votre clé USB pour la réutiliser... mais attention : si vous la formatez depuis Zorin (donc sous Linux), votre clé ne fonctionnera plus sous Windows.

Si vous avez déjà formaté votre clé depuis Zorin, vous devrez lancer l'utilitaire `diskpart` dans une console DOS.

<StepsCard
  variant="steps"
  steps={[
    "Branchez votre clé USB",
    "Appuyez sur Win+R, tapez `diskpart` et appuyez sur Enter",
    {
      content: "Dans la fenêtre Diskpart, exécutez ces commandes",
      substeps: [
        "`list disk` pour afficher la liste des disques dont vous disposez",
        "`select disk X` (remplacez `X` par le numéro de votre clé USB). Ne sélectionnez pas le disque `0`, c'est votre disque dur. Votre clé USB sera très probablement le disque `1` mais vérifiez plusieurs fois ! avant d'appuyer sur Enter",
        "`clean` pour tout supprimer sur la clé",
        "`create partition primary` pour créer une partition primaire",
        "`format fs=ntfs quick` pour formater la clé avec le système de fichiers NTFS",
        "`assign` pour attribuer une lettre de lecteur à la clé",
        "enfin, lancez `exit` pour quitter l'utilitaire diskpart"
      ]
    }
  ]}
/>

La clé sera à nouveau reconnue par Windows.
</AlertBox>

Pour plus d'informations sur Zorin et sa dernière version : [Zorin OS 18 Has Arrived](https://blog.zorin.com/2025/10/14/zorin-os-18-has-arrived/).
