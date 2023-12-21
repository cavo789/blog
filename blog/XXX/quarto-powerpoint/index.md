---
slug: quarto-powerpoint
title: Use Quarto and create a PowerPoint slideshow
authors: [christophe]
image: /img/quarto_tips_social_media.jpg
tags: [markdown, powerpoint, quarto, revealjs, tips]
draft: true
enableComments: true
---
# Use Quarto and create a PowerPoint slideshow

![Use Quarto and create a PowerPoint slideshow](/img/quarto_tips_banner.jpg)

Quarto can convert a markdown file to a revealjs HTML slideshow but, too, can create a `pptx` file that you can open and play in Microsoft PowerPoint.

In this article, we'll create a `pptx` file from our Markdown documentation.

<!-- truncate -->

:::tip Docker image with Quarto
If you don't have yet a Docker image with Quarto, read this article [Running Quarto Markdown in Docker](docker-quarto).
:::

## Syntax

The official documentation of Quarto for rendering PowerPoint slides can be found on [https://quarto.org/docs/presentations/powerpoint.html](https://quarto.org/docs/presentations/powerpoint.html).

Let's start and create our `slides.md` file:

```markdown
---
title: "My thesis in Latin"
---

## Chapter 1

Voluptatem minus labore architecto sed voluptas molestiae perferendis. Sed voluptatem ut amet at blanditiis sunt et exercitationem quidem. Vel id impedit dicta omnis repudiandae iure.

Expedita magni facere. Ullam non non sint qui provident. Ea beatae voluptatem pariatur. Et beatae error ea aut neque omnis pariatur rerum ut.

Ad aut nobis magni aut est dicta adipisci est. Quo reiciendis eum aut rem. Dolores sit magni non.

## Chapter 2

Iure repudiandae perferendis maiores dolorem consequuntur exercitationem suscipit.

Animi voluptatem est quia. Quia id optio. Architecto ut ipsa voluptas minima voluptate accusamus architecto.

Consequatur debitis et sunt eos quod qui unde aut.

---

### Chapter 2.1

Quis voluptate est quis in ea veniam qui incididunt ad cillum nostrud. Nisi proident adipisicing nulla proident esse consequat veniam qui magna deserunt cillum enim. Reprehenderit aliqua sit veniam quis amet dolore magna.
```

Now, run the conversion using `quarto render slides.md --to pptx`

And you'll obtain this:

![PowerPoint - Slide 1](./images/pptx_slide_1.png)

![PowerPoint - Slide 2](./images/pptx_slide_2.png)

![PowerPoint - Slide 3](./images/pptx_slide_3.png)

![PowerPoint - Slide 4](./images/pptx_slide_4.png)

You'll find a lot of tips and tricks on the [official documentation page](https://quarto.org/docs/presentations/powerpoint.html).

:::tip Did you know you can generate an online slideshow easily?
Instead of running `quarto render slides.md --to pptx` and get a PowerPoint *offline* file, just run `quarto render slides.md --to revealjs` and enjoy your slideshow in your browser. Copy files to internet and everyone can consult your great work.
:::
