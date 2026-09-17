---
slug: vscode-multiple-cursors
title: Les curseurs multiples dans vscode
date: 2024-04-19
description: Besoin de modifier plusieurs lignes dans VSCode là où le rechercher/remplacer ne suffit pas ? Découvrez la puissante fonctionnalité Multiple Cursors et le raccourci clavier pour faire des modifications en masse instantanément.
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
![Les curseurs multiples dans vscode](/img/v2/vscode_tips.webp)

<TLDR>
Cet article présente la fonctionnalité *Multiple Cursors* de VSCode pour éditer en masse plusieurs lignes d'un coup (par exemple transformer un bloc de lignes en liste à puces) quand le rechercher/remplacer ne peut rien faire : sélectionnez les lignes, appuyez sur <kbd>Shift</kbd>+<kbd>Alt</kbd>+<kbd>I</kbd> pour placer un curseur sur chacune, puis modifiez-les toutes en même temps avec la navigation <kbd>Home</kbd>/<kbd>End</kbd>/<kbd>Ctrl</kbd>+<kbd>Right</kbd>.
</TLDR>

Une des meilleures fonctionnalités de vscode, c'est *Multiple cursors*.

Imaginez un paquet de lignes où vous devez, par exemple, supprimer les deux premiers caractères. Chaque ligne commence par `//` et vous voulez supprimer uniquement ce préfixe, pas les `//` qui pourraient apparaître ailleurs dans la ligne (un rechercher/remplacer ne peut pas faire ça).

Autre exemple : vous devez entourer chaque ligne de doubles crochets.

Avec vscode, c'est ultra-simple : les curseurs multiples.

*Les curseurs multiples brillent pour les modifications ponctuelles et irrégulières. Quand le changement est une règle répétable appliquée à tout un fichier, <Link to="/blog/linux-sed-tips">Search and replace (or add) using sed</Link> est le meilleur outil.*

<!-- truncate -->

Imaginez les lignes ci-dessous et le besoin d'ajouter `*` devant chacune pour en faire une liste d'éléments. Dans cet exemple, je n'ai que six lignes donc oui, c'est faisable à la main, une par une. Imaginez maintenant que vous en ayez cent ou mille.

<!-- cspell:disable -->
```markdown
Lorem ipsum dolor sit amet, consectetur adipiscing elit.
Vestibulum ut purus nec dui tincidunt consequat.
Aliquam ac orci vel tellus posuere auctor.
Vestibulum auctor lacus eget sagittis laoreet.
Phasellus eleifend nulla blandit arcu tempor, sed posuere elit efficitur.
Donec blandit erat non placerat cursus.
```
<!-- cspell:enable -->

Voici le résultat — chaque ligne transformée en puce en une seule fois :

![Curseurs multiples](./images/make_bullet_list.gif)

Voici comment faire :

- Sélectionnez toutes les lignes à modifier,
- Appuyez sur <kbd>SHIFT</kbd>-<kbd>ALT</kbd>-<kbd>I</kbd> pour activer les curseurs multiples,
- Appuyez sur <kbd>Home</kbd> pour placer les curseurs au début de chaque ligne,
- Tapez `*` suivi d'un espace pour transformer la liste de lignes en liste à puces.
- Appuyez sur <kbd>ESC</kbd> pour quitter le mode curseurs multiples.

Tant que le mode curseurs multiples est actif, vous pouvez aussi appuyer sur <kbd>END</kbd> pour aller en fin de ligne, ajouter/supprimer par exemple un caractère, appuyer sur <kbd>CTRL</kbd>-<kbd>RIGHT</kbd> pour avancer d'un mot vers la droite, et ainsi de suite.

Une option bien pratique.

VSCode regorge de ces fonctionnalités natives qu'on ne découvre que par hasard. Deux autres que j'utilise tous les jours : le <Link to="/blog/vscode-sticky-scroll">sticky scroll</Link>, pour toujours savoir dans quelle fonction ou quel titre on se trouve, et l'<Link to="/blog/vscode-autosave">autosave</Link>, pour arrêter complètement d'appuyer sur <kbd>CTRL</kbd>+<kbd>S</kbd>.
