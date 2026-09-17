---
slug: ftp-erase-files
title: FTP - Supprimer fichiers et dossiers à la vitesse de la lumière
date: 2024-05-25
description: "Fini la suppression interminable de fichiers via FTP ! Découvrez comment effacer des sites et des dossiers entiers à la vitesse de l'éclair grâce à un simple script PHP qui s'auto-supprime — même sans accès SSH."
authors: [christophe]
image: /img/v2/winscp.webp
series: WinSCP & remote file transfer
mainTag: linux
tags:
  - linux
  - ssh
language: fr
review_date: 2026-07-30
---
<!-- cspell:ignore subfolders -->
![FTP - Supprimer fichiers et dossiers à la vitesse de la lumière](/img/v2/winscp.webp)

<TLDR>
Cet article partage un petit script `erase.php` que vous pouvez envoyer par FTP et lancer une seule fois depuis le navigateur pour vider instantanément tout un dossier de site côté serveur, et éviter la suppression fichier par fichier, terriblement lente, via un client FTP — avec un avertissement clair : il supprime tout immédiatement, sans confirmation ni sauvegarde.
</TLDR>

Avez-vous déjà supprimé un site web depuis votre client FTP ? C'est facile, il suffit de sélectionner le dossier contenant le site et d'appuyer sur la touche <kbd>delete</kbd>.

Facile, simple et... tellement lent. Supprimer les fichiers et les dossiers prend un temps fou. Plusieurs dizaines de minutes ! Aïe.

Si vous avez <Link to="/blog/connect-using-ssh-to-your-hosting-server">une connexion SSH vers votre serveur web</Link> et que vous êtes à l'aise avec elle, vous pouvez faire un `rm -rf` sur le dossier et ce sera terminé en quelques secondes.

Mais si vous n'avez pas SSH ou si vous craignez de faire des erreurs ?

Il existe une alternative, le script `erase.php`.

<!-- truncate -->

Ouvrez votre client FTP, ouvrez le dossier de votre site (par exemple `/var/www/html/old_site`), celui que vous voulez supprimer, et créez un nouveau fichier appelé par exemple `erase.php` puis copiez/collez le code ci-dessous dedans.

<Snippet filename="erase.php" source="./files/erase.php" />

Lancez votre navigateur, allez sur votre site (`http://your_old_site.com`) et ajoutez `/erase.php` à la fin pour exécuter le script.

<AlertBox variant="danger" title="Assurez-vous que c'est bien ce que vous voulez">
Soyez vraiment sûr que c'est ce que vous voulez
</AlertBox>

<AlertBox variant="danger" title="Soyez absolument certain que c'est ce que vous voulez">
Le script démarre immédiatement et supprime tout sans demander de confirmation ni faire de sauvegarde. Il tue simplement fichiers et dossiers.

À la fin du processus (c'est-à-dire en quelques secondes à peine), le dossier sera complètement vide.

*Et, exactement comme pour <Link to="/blog/aesecure-quickscan">le scanner QuickScan</Link>, pensez à supprimer `erase.php` de votre serveur dès que vous avez terminé : un script capable de vider un dossier n'a rien à faire accessible depuis Internet.*
</AlertBox>
