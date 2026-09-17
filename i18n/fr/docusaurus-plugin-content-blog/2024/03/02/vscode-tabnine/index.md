---
slug: vscode-tabnine
title: Tabnine - Autocomplétion et chat IA pour Javascript, Python, Typescript, PHP, Go, Java et plus
date: 2024-03-02
description: "Tabnine était autrefois une extension d'autocomplétion IA gratuite incontournable pour VS Code. Depuis 2025, elle est réservée aux entreprises (39 $/utilisateur/mois). Cet article est conservé comme référence historique."
authors: [christophe]
image: /img/v2/vscode_tips.webp
mainTag: ai
tags:
  - ai
  - php
  - vscode
language: fr
updates:
  - date: 2026-07-31
    note: "Tabnine went fully enterprise-only in 2025 (free tier dropped April 2025, individual Dev plan dropped October 2025). Starts at $39/user/month. No longer relevant for free users. Article kept as historical reference."
---
![Tabnine - Autocomplétion et chat IA pour Javascript, Python, Typescript, PHP, Go, Java et plus](/img/v2/vscode_tips.webp)

<AlertBox variant="caution" title="Tabnine n'est plus gratuit — évitez-le">
Tabnine a supprimé son offre gratuite le **2 avril 2025** et son plan Dev individuel le **16 octobre 2025**. L'outil est désormais **réservé aux entreprises**, à partir de 39 $/utilisateur/mois (facturation annuelle obligatoire). Si vous êtes un développeur indépendant ou que vous cherchez un outil gratuit, Tabnine n'est tout simplement plus une option. Cet article est conservé comme témoignage de ce qui fut une excellente extension.
</AlertBox>

<TLDR>
Cet article est un témoignage historique sur Tabnine, une extension VSCode d'autocomplétion IA capable de prédire des appels de méthodes et des setters entiers à partir du contexte (par exemple suggérer `setFirstName(string $firstname)` à partir d'une propriété `firstName`). Elle fonctionnait hors ligne par défaut et ne stockait jamais votre code. **Depuis 2025, Tabnine est réservé aux entreprises et n'est plus disponible gratuitement.**
</TLDR>

Tabnine **était** une extension **INCONTOURNABLE**. Elle prédisait votre prochaine frappe et parfois c'était juste **WAOUH ; COMMENT EST-CE POSSIBLE ?**.

Imaginez que vous avez une propriété `private string $firstName` en PHP. En commençant à taper `private function set`, Tabnine comprenait que vous étiez *probablement* en train de créer un setter et suggérait alors `setFirstName(string $firstname)`.

<Snippet filename="customer.php" source="./files/customer.php" />

<!-- truncate -->

Autre exemple...

Imaginez le code ci-dessous et regardez la méthode `__construct`. Nous devons gérer le paramètre `$price`. Il faut appeler le setter correspondant.

<Snippet filename="product.php" source="./files/product.php" />

Et voici comment VSCode prédisait les frappes quand Tabnine était activé. Comme vous pouvez le voir, Tabnine a prédit qu'après avoir tapé `$this-`, la méthode `setProductPrice` allait suivre — et il savait même que la fonction attendait un paramètre, en suggérant `$price`.

![Tabnine is so wow!](./images/tabnine.gif)

C'était vraiment impressionnant.

Par défaut, Tabnine fonctionnait hors ligne et n'utilisait aucun fournisseur cloud. Son argument sur la confidentialité était solide : il ne stockait ni ne partageait jamais votre code sans accord explicite.

## Adieu, Tabnine {#bye-bye-tabnine}

Ce qui faisait la force de Tabnine — le mode hors ligne d'abord, de vraies garanties de confidentialité, une prédiction de code réellement impressionnante — était bien réel. C'était l'un des meilleurs outils IA gratuits pour coder à son époque.

Puis sont venus les changements de tarifs. L'offre gratuite a disparu en avril 2025. Le plan Dev individuel a suivi en octobre 2025. Aujourd'hui, Tabnine est un produit pour entreprises à partir de 39 $/utilisateur/mois. Pour un développeur indépendant, il n'existe tout simplement plus.

Il n'y a plus rien à installer, plus rien à essayer. Le Tabnine que nous connaissions a disparu. Adieu.
