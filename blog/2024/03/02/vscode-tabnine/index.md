---
slug: vscode-tabnine
title: Tabnine - AI Autocomplete & Chat for Javascript, Python, Typescript, PHP, Go, Java & more
date: 2024-03-02
description: Discover Tabnine, the must-have AI Autocomplete & Chat for VS Code. Get 'WOW' code prediction speed for PHP, Python, JS, and more, while ensuring complete code privacy.
authors: [christophe]
image: /img/v2/vscode_tips.webp
mainTag: ai
tags: [addon, php, tips, vscode]
language: en
---
![Tabnine - AI Autocomplete & Chat for Javascript, Python, Typescript, PHP, Go, Java & more](/img/v2/vscode_tips.webp)

Tabnine is a **MUST HAVE** extension. He will predict your next keystroke and sometimes it's just **WOW; HOW IS IT POSSIBLE?**.

Imagine you've a `private string $firstName` property in PHP. By starting to type `private function set`, Tabnine will understand you're *probably* creating a setter and will then suggest `setFirstName(string $firstname)`.

<Snippet filename="customer.php" source="./files/customer.php" />

<!-- truncate -->

> Download page [Tabnine: AI Autocomplete & Chat for JavaScript, Python, Typescript, PHP, Go, Java & more](https://marketplace.visualstudio.com/items?itemName=TabNine.tabnine-vscode)

Another example...

Imagine the code below and take a look on the `__construct` method. We need to handle the `$price` parameter. We need to call the setter for it.

<Snippet filename="product.php" source="./files/product.php" />

And here is how VSCode will predict my keystrokes when Tabnine is enabled. As you can see, Tabnine will predict that, after I've typed `$this-` that I'll use my `setProductPrice` method. And he knows that this function requires a parameter so he suggests that I use my `$price` one.

![Tabnine is so wow!](./images/tabnine.gif)

It's really amazing.

By default, Tabnine works offline i.e. don't use any cloud data provider like what GitHub Copilot does.

<AlertBox variant="info" title="Complete code privacy">

The information below comes from [https://marketplace.visualstudio.com/items?itemName=TabNine.tabnine-vscode#complete-code-privacy](https://marketplace.visualstudio.com/items?itemName=TabNine.tabnine-vscode#complete-code-privacy.)

> Your code always remains private.
>
> Tabnine NEVER stores or shares any of your code. Any action that shares your code with the Tabnine servers for the purpose of private code models (part of enterprise) requires explicit opt-in. Tabnine does not retain any user code beyond the immediate time frame required for training models. Private code models created by Tabnine Enterprise are only accessible by your team members.

</AlertBox>

Tabnine support a lot of languages, for instance, he's also working with pure text file (like this blog post).
