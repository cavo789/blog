---
slug: vscode-regions
title: Working with regions in VSCode
date: 2024-08-05
description: Master code folding in VSCode with regions. Learn how to use them in PHP and how to enable region support for unsupported files like Dockerfile with a simple extension.
authors: [christophe]
image: /img/v2/vscode_tips.webp
mainTag: vscode
tags: [tips, vscode]
language: en
---
![Working with regions in VSCode](/img/v2/vscode_tips.webp)

<!-- cspell:ignore hadolint,skel,maptz,regionfolder,specialised -->

VSCode supports `region` and `endregion` tags but not everywhere. These two special tags can be written differently depending on the language you're using but have, always, the same objective: allow you to fold part of the code.

Not everywhere means, for instance, VSCode didn't support code folding by default in Dockerfile. Let's see how to solve this.

<!-- truncate -->

## Code folding in PHP

Consider the following, very basic, example (*very brief example for illustrative purposes*):

<Snippet filename="my_class.php" source="./files/my_class.php" />

We can clearly identify three blocks: preparation of the query, run it and return the data. Using regions, we can do this:

<Snippet filename="my_class.php" source="./files/my_class.part2.php" />

And now, why folding can be really useful: we can fold / unfold them:

![VSCode - Regions folding](./images/regions.gif)

<AlertBox variant="info" title="You should avoid having functions having more than 60 lines">
Regions are supported by a very large number of languages, but don't make the mistake of assuming that this allows you to have functions of several dozen lines. That's not the point!  If you have long functions, you need to split them up. You need to create smaller, more specialised functions. We've already touched on this point in a <Link to="/blog/vscode-php-refactoring">previous post</Link>.

</AlertBox>

## What to do when VSCode didn't support these tags by default?

Let's take a look and the following Dockerfile:

<Snippet filename="Dockerfile" source="./files/Dockerfile" />

By opening such file in VSCode didn't provide any collapse/expand features and we will need to scroll a lot. And we don't have a global overview of the structure.

![No region support in VSCode for Dockerfile](./images/dockerfile-before.png)

The solution comes by installing a specialised extension: [https://marketplace.visualstudio.com/items?itemName=maptz.regionfolder](https://marketplace.visualstudio.com/items?itemName=maptz.regionfolder).

And, too, by adding these settings in your `.vscode/settings.json` file:

<Snippet filename=".vscode/settings.json" source="./files/settings.json" />

Switch back to your tab in VSCode with your opened Dockerfile, press <kbd>CTRL</kbd>+<kbd>P</kbd> and run `Developer: Reload Window` to reload the window once the extension has been enabled and tadaaa!

![Now, VSCode supports regions in Dockerfile](./images/dockerfile-after.png)

<AlertBox variant="info" title="No, it's not just a visual trick">
When you're working on very long files like, for me, a Dockerfile of over 900 lines, it's really imperative to be able to have regions that you can reduce/expand.

Not only does this make it easier to read, it also facilitates the succession of 'stages' (when programming a multistage Dockerfile).

</AlertBox>

## Auto fold extension

There some extensions like [Auto Fold](https://marketplace.visualstudio.com/items?itemName=bobmagicii.autofoldyeah) who can automatically fold regions when opening a file.

The idea is: when you open a file with a lot of methods, all functions are first *folded* (we just see the function name, not his content). That way you can directly see the structure of the file, the list of functions and so on without to scroll much.

If you install [Auto Fold](https://marketplace.visualstudio.com/items?itemName=bobmagicii.autofoldyeah), you also need to add the `"autofold.default": 1,` setting in your `settings.json` file.

If you don't know how to do, just press <kbd>CTRL</kbd>-<kbd>,</kbd> (the comma) to display the `Settings` page then start to type `autofold` to get access to the setting.

Now, if you open a file, his content will be automatically folded.

![Autofold](./images/autofold.png)
