---
slug: quarto-revealjs-tips
title: Some tips and tricks for Quarto when rendering as a reveal.js slideshow
authors: [christophe]
image: /img/quarto_tips_social_media.jpg
tags: [markdown, powerpoint, quarto, revealjs, tips]
enableComments: true
---
# Some tips and tricks for Quarto when rendering as a reveal.js slideshow

![Some tips and tricks for Quarto when rendering as a reveal.js slideshow](/img/quarto_tips_banner.jpg)

The [Quarto reveal.js documentation](https://quarto.org/docs/reference/formats/presentations/revealjs.html) is the best place to find instructions for creating impeccable reveal.js presentations.

In this article, we'll take a quick look at a few tips and tricks to make your reveal.js presentations even better.

<!-- truncate -->

:::tip Docker image with Quarto
If you don't have yet a Docker image with Quarto, read this article [Running Quarto Markdown in Docker](/blog/docker-quarto).
:::

## Working with slides

### Create a title slide

The [title slide](https://quarto.org/docs/presentations/revealjs/advanced.html#title-slide) is the first one of your presentation. You can add such slide with a few yaml lines:

```markdown
---
title: My Slide Show
title-slide-attributes:
  data-background-image: ./img/background.jpg
  data-background-size: cover
  data-background-opacity: "0.9"
---
# Slide 1

# Slide 2

# Slide 3
```

The slideshow will have four slides, the first one will be the title-slide.

![Title slide](./images/title-slide.png)

### Adding a background image to a slide

A background, a title and some style:

```markdown
# Merry Christmas {background-image="images/winter.jpg" style="text-align: center; background-color: #cfb0f399; color: #210753;"}
```

*To run this example, run `quarto render slides.md --to revealjs`.*

![Adding a background image to a slide](./images/background-title-style.png)

#### Background-size contain or cover

Sometimes the image display isn't what you'd like; this is the case when the image is too large and/or the slide too narrow.

The illustration below shows this: the photo of the sloth is far too large and you can't see the whole thing.

This can be corrected by using the attribute `background-size`. When not mentioned (as for the first slide below), the default value is `cover` (see [https://developer.mozilla.org/en-US/docs/Web/CSS/background-size](https://developer.mozilla.org/en-US/docs/Web/CSS/background-size) to get more information).

You can ask the browser to resize the image so it's fully displayed. This is the behavior when `background-size` is set to `contain`.

```markdown
## {background-image="images/2024.jpg"}

## {background-image="images/2024.jpg" background-size="contain"}
```

*To run this example, run `quarto render slides.md --to revealjs`.*

The slide below is using `cover` and, no, not really attractive.

![Background-size is set to cover](./images/background-cover.png)

The second slide is using `contain` and, at least, we can see what the sloth was trying to tell us.

![Background-size is set to contain](./images/background-contain.png)

### Big text

The `r-fit-text` class ([official doc](https://quarto.org/docs/presentations/revealjs/advanced.html#fit-text)) will give the maximum size to your content i.e.

```markdown
# 

::: {.r-fit-text} 
Big Text
:::
```

![Big text](./images/big-text.png)

### Stretch

The `r-stretch` class ([official doc](https://quarto.org/docs/presentations/revealjs/advanced.html#stretch)) is my preferred one.

Consider the example below:

```markdown
# Slide 1

Here is an image:

![](image.jpg){.r-stretch}

Some text after the image.
```

This will generate this slide:

![Stretch 1](./images/stretch-1.png)

Adding a lot of more text / paragraphs will give this new slide:

![Stretch 2](./images/stretch-2.png)

The image height will be resized automatically so both text and images can be displayed on the same slide. If you have less text, the height of the image will be bigger, smaller otherwise. Without to have to manually resize the image on the disk. Very useful.

### Show an image on key press

Using `::: {.fragment .fade-up}` to define a content area, you are asking reveal.js to show its content only the next key sequence.

```markdown
# It's a candy dog

::: {style="font-size: 2em; color: #75AADB;"}
Would you like to see a candy dog?
:::

::: {.fragment .fade-up}
![](./images/dog.jpg)
:::
```

*To run this example, run `quarto render slides.md --to revealjs`.*

![It's a candy dog](./images/candy-dog.gif)

### Creating columns

You can use `columns` to divide your slide:

```markdown
##

::: columns
::: {.column width="70%"}
![](images/image_1.jpg)
:::

::: {.column width="30%"}
![](images/image_2.jpg)

![](images/image_3.jpg)
:::
:::
```

*To run this example, run `quarto render slides.md --to revealjs`.*

![Columns](./images/columns.png)

#### Four quadrants

The example below comes from [https://mine.quarto.pub/hello-quarto/#/quarto-highlights](https://mine.quarto.pub/hello-quarto/#/quarto-highlights), a reveal.js slideshow made using Quarto.

The idea is to split the slides in four parts and display content clockwise, starting with the top-left dial.

```markdown
::: columns
::: {.column width="5%"}
:::

::: {.column width="40%"}
::: bulletbox
::: {.fragment .fade-in-then-semi-out}
![](images/top-left.jpg){width="450px"} 
:::
:::
::: 

::: {.column width="5%"}
:::

::: {.column width="40%"}
::: bulletbox
::: {.fragment .fade-in-then-semi-out}
![](images/top-right.jpg){width="450px"}
:::
:::
:::

::: {.column width="5%"}
:::
:::

::: columns
::: {.column width="5%"}
:::

::: {.column width="40%"}
::: bulletbox
::: {.fragment .fade-in-then-semi-out}
![](images/bottom-left.jpg){width="450px"}
:::
:::
:::

::: {.column width="5%"}
:::

::: {.column width="40%"}
::: bulletbox
::: {.fragment .fade-in-then-semi-out}
![](images/bottom-right.jpg){width="450px"}
:::
:::
:::

::: {.column width="5%"}
:::
:::
```

*To run this example, run `quarto render slides.md --to revealjs`.*

![Four quadrants](./images/four-quadrants.gif)

## CSS

### Using inline css

You can apply styles to inline text by creating spans using `[]` to surround the text you want to style and `{}` to define the style you want to apply.

```markdown
# Inline style

To draw attention to a specific part of the text, you might want to make it [red]{style="color: red;"} with a [yellow background]{style="background-color: yellow;"}; [like this]{style="color: red; background-color: yellow;"}.
```

*To run this example, run `quarto render slides.md --to revealjs`.*

This is correctly rendered in HTML:

![html](./images/html.png)

### Use a custom css

Use the YAML header block for this.

```markdown
---
pagetitle: "Using my custom css"
format:
  revealjs:
    theme: custom.css
---
##

![](images/mimikyu.jpg){style="width:400px;"}
```

*To run this example, run `quarto render slides.md --to revealjs`.*

Now, create the `custom.css` file in the same folder as your markdown one and, for instance, set the slide background to yellow:

```css
/*-- scss:defaults --*/
.reveal {
    background-color: rgb(224, 226, 98);
}
```

![Custom css](./images/custom-css.png)

## Navigation

### Vertical slides

There are three types of navigation: `linear` (default one), `vertical` or `grid` ([official doc](https://quarto.org/docs/presentations/revealjs/advanced.html#vertical-slides)).

If you use vertical or grid navigation, you should structure your slides using level 1 headings for the horizontal axis and level 2 headings for the vertical axis.

In a normal, `linear` navigation, reaveljs will show each slide, whatever the key the user is pressing on his keyboard. In a `linear` navigation, as author, you are sure that your visitor will see each of them.

In a `vertical` or `grid` navigation, it's just like you're showing the chapter's title and if the user press the <kbd>down</kbd> or <kbd>space</kbd>key, he will jump in the chapter (and this *vertically*). But if he is pressing the <kbd>right</kbd> key he'll skip it and go to the next chapter.

The `navigation-mode` in the yaml header allows you to enable `vertical` mode, below an example:

```markdown
---
title: "Presentation"
format:
  revealjs:
    navigation-mode: vertical
---

# Slide 1

## Slide 1.1

# Slide 2

## Slide 2.1

## Slide 2.2

## Slide 2.3
```

![Vertical navigation](./images/vertical.png)

:::tip Press <kbd>esc</kbd> key
The <kbd>esc</kbd> key allow you to see the structure of your revealjs slideshow.
:::

### Define a name for your slide

By default, reveal.js will generate a slug from the title so you can reference the slide in a URL.

Consider the following example:

```markdown
## Elit ad fugiat proident culpa sint

Elit ad fugiat proident culpa sint qui id pariatur nostrud ullamco velit irure tempor culpa. Laborum occaecat ea tempor voluptate duis pariatur proident ea. Aute adipisicing ut ullamco exercitation nisi nulla sint. Reprehenderit tempor quis non cupidatat.

## Cillum do et commodo minim ullamco elit culpa

Occaecat minim eu veniam laborumanim. Nostrud duis eiusmod ut amet velit commodo. Aliqua laborum cillum officia culpa quis duis enim cillum esse duis excepteur cillum do qui. Veniam dolore enim qui labore proident. Minim ipsum nisi Lorem cillum proident labore cupidatat aliqua pariatur. Nisi id magna incididunt et culpa.
```

*To run this example, run `quarto render slides.md --to revealjs`.*

The generated URL for the first slide will be `http://[...]index.html#/elit-ad-fugiat-proident-culpa-sint` and, for the second slide, `http://[...]index.html#/cillum-do-et-commodo-minim-ullamco-elit-culpa`.

To define the name yourself, just add `{#}` followed by the slug you desire.

```markdown
<!-- highlight-next-line -->
## Elit ad fugiat proident culpa sint {#intro}

Elit ad fugiat proident culpa sint qui id pariatur nostrud ullamco velit irure tempor culpa. Laborum occaecat ea tempor voluptate duis pariatur proident ea. Aute adipisicing ut ullamco exercitation nisi nulla sint. Reprehenderit tempor quis non cupidatat.

<!-- highlight-next-line -->
## Cillum do et commodo minim ullamco elit culpa {#chapter1}

Occaecat minim eu veniam laborumanim. Nostrud duis eiusmod ut amet velit commodo. Aliqua laborum cillum officia culpa quis duis enim cillum esse duis excepteur cillum do qui. Veniam dolore enim qui labore proident. Minim ipsum nisi Lorem cillum proident labore cupidatat aliqua pariatur. Nisi id magna incididunt et culpa.
```

![Define a name for your slide](./images/set-slide-slug.png)

But, pay attention to the slide's menu (bottom left): perhaps it's also good to define a suitable name there.

![Also define the name in the menu](./images/set-name-in-menu.png)

To do this, set the `data-menu-title` attribute; f.i.:

```markdown
<!-- highlight-next-line -->
## Elit ad fugiat proident culpa sint {#intro data-menu-title="Introduction"}

<!-- highlight-next-line -->
## Cillum do et commodo minim ullamco elit culpa {#chapter1 data-menu-title="Chapter 1"}
```

## Misc

### Using speaker notes

You can write messages in your presentation that will not be displayed when the slideshow is played, but only as a second screen when the presenter wishes.

The example below illustrate this. The way to insert such presenter's notes is by using the `::: notes` block.

```markdown
##

::: columns
::: {.column width="70%"}
![](images/image_1.jpg)
:::

::: {.column width="30%"}
![](images/image_2.jpg)

![](images/image_3.jpg)
:::
:::

::: notes
On the left side, you have ... and, on the right side, the first image is ....

The second image has been ...
:::

##

![](images/image_4.jpg)
```

*To run this example, run `quarto render slides.md --to revealjs`.*

So, in the example above, we'll have two slides. By pressing the <kbd>s</kbd> touch on the keyboard (<span style={{color: 'blue'}}>s for speakers</span>) a new window will be displayed.

When you have two screens, on the first you'll display your presentation without the notes (left screen below) and on the second you'll display the notes (right screen below).

If you share your screen through a tool like Teams or Zoom, same thing; you share the screen where the presentation is displayed (the first one) and keep the notes only for you.

![Speaker notes](./images/speaker-notes.png)

As you can see on the image above, the speaker notes are displaying valuable information as the elapsed time since the start of the presentation, the current time and the next slide to make your transition easier.