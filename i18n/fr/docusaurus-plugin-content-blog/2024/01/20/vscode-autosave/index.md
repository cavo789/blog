---
slug: vscode-autosave
title: La fonctionnalité Autosave dans VSCode
date: 2024-01-20
description: "Fatigué d'oublier d'enregistrer vos fichiers dans VS Code ? Découvrez comment activer facilement la fonctionnalité Autosave, la régler sur onFocusChange et ne plus jamais perdre vos modifications !"
authors: [christophe]
image: /img/v2/vscode_tips.webp
series: VSCode - Tips, extensions and shortcuts
mainTag: vscode
tags:
  - markdown
  - vscode
language: fr
review_date: 2026-07-30
---
![La fonctionnalité Autosave dans VSCode](/img/v2/vscode_tips.webp)

<TLDR>
Cet article montre comment activer la fonctionnalité Autosave de VSCode, soit via l'interface des paramètres (`Files: Auto save` réglé sur `onFocusChange`), soit en ajoutant la ligne correspondante dans `settings.json`, pour que les modifications soient enregistrées automatiquement dès que l'éditeur perd le focus, au lieu de dépendre d'un `Ctrl+S` manuel.
</TLDR>

Combien de fois avez-vous modifié un fichier dans VSCode (en oubliant d'enregistrer la modification) pour ensuite rafraîchir votre page web, lancer le script depuis votre console, etc., et vous dire *Oh non, zut, ça ne marche toujours pas* ?

Et cela peut prendre plusieurs minutes d'allers-retours avant que — mince, quel idiot — vous réalisiez que vous n'aviez pas enregistré vos changements.

Et c'est encore pire quand vous avez fait un Search & Replace dans plusieurs fichiers ; certains enregistrés, d'autres non — pensez à une session de <Link to="/blog/vscode-multiple-cursors">curseurs multiples</Link> répartie sur une dizaine d'onglets.

Voyons comment éviter ça.

<!-- truncate -->

C'est vraiment simple : appuyez sur <kbd>CTRL</kbd>-<kbd>,</kbd> (virgule) pour afficher la page des paramètres et commencez à taper `autosave`.

Les paramètres concernés s'affichent ; réglez `Files: Auto save` sur `onFocusChange`.

![Page des paramètres](./images/autosave.webp)

Ou alors, vous pouvez simplement ajouter la ligne suivante dans votre fichier `settings.json` :

<Snippet filename="settings.json" source="./files/settings.json" />

<AlertBox variant="info" title="Vous utilisez un système de versioning, n'est-ce pas ?">
Certains n'aiment pas cette fonctionnalité et disent *je veux savoir quand j'enregistre quelque chose* (au cas où je ferais une bêtise, hein) mais, oh, il y a bien un système de versioning comme Git, non ? Donc si vous faites une bêtise, n'enregistrez simplement pas les changements et/ou faites un `revert`.

Si vous faites partie de ces personnes, essayez l'autosave pendant quelques jours, et vous verrez que le confort est indéniable.

</AlertBox>

Un autre réglage dans le même esprit, de ceux qu'on active une fois et qu'on oublie ensuite : <Link to="/blog/vscode-sticky-scroll">Sticky scroll in vscode</Link>.
