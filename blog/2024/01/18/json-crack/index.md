---
slug: json-crack
title: Rendering a JSON file as a mind map
date: 2024-01-18
description: Transform complex JSON data into clear, interactive mind maps with JSON Crack. Discover how this powerful tool simplifies data visualization and enhances data understanding.
authors: [christophe]
image: /img/v2/mindmaps.webp
mainTag: mindmap
tags: [json, visualisation, vscode]
language: en
---
![Rendering a JSON file as a mind map](/img/v2/mindmaps.webp)

> [https://jsoncrack.com/editor](https://jsoncrack.com/editor)

I really like the idea of not having to draw (actually, that is just because I am really bad at it) a diagram, a flow chart, a graphic representation of something that ... can be written.

[Json crack](https://jsoncrack.com/editor) is one of the tools in my toolkit when I want to draw something that can be written in json.

<!-- truncate -->

Let us take an example found randomly on the net [superheroes](https://medium.com/@Goldzila/superheroes-of-data-exploring-xml-json-and-binary-formats-through-the-lens-of-marvel-characters-3754f2691cdc). How can we represent Spider-Man as a JSON object? Below an attempt:

<Snippet filename="superheroes.json" source="./files/superheroes.json" />

Isn't it nicer in visual form?

![Json crack](./images/spiderman_json.png)

Another example (found [here](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Objects/JSON)):

<Snippet filename="superheroes.json" source="./files/superheroes.part2.json" />

![Super hero squad](./images/super_hero_squad.png)

The advantage of the image is that it is much clearer: we can see straight away that the squad is made up of three members and that the strongest (and oldest) is *Eternal Flame*, who has five powers.

<AlertBox variant="note" title="">
Json crack has some limitations for the free version like the number of lines in your JSON content. You can also install an [add-on for vscode](https://marketplace.visualstudio.com/items?itemName=AykutSarac.jsoncrack-vscode).

</AlertBox>