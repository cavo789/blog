---
slug: quarto-revealjs-tips
title: Some tips and tricks for Quarto when rendering as a reveal.js slideshow
date: 2024-01-03
description: Elevate your Quarto presentations! Discover essential tips and tricks for rendering stunning reveal.js slideshows, including custom title slides, logo placement, CSS/JS customization, and advanced slide layouts.
authors: [christophe]
image: /img/v2/quarto.webp
series: Discovering Quarto
mainTag: quarto
tags: [markdown, powerpoint, quarto, revealjs, tips]
language: en
---
![Some tips and tricks for Quarto when rendering as a reveal.js slideshow](/img/v2/quarto.webp)

The [Quarto reveal.js documentation](https://quarto.org/docs/reference/formats/presentations/revealjs.html) is the best place to find instructions for creating impeccable reveal.js presentations.

In this article, we'll take a quick look at a few tips and tricks to make your reveal.js presentations even better.

<!-- truncate -->

<AlertBox variant="info" title="Docker image with Quarto">
If you don't have yet a Docker image with Quarto, read this article <Link to="/blog/docker-quarto">Running Quarto Markdown in Docker</Link>.

</AlertBox>

## Working with slides

### Create a title slide

The [title slide](https://quarto.org/docs/presentations/revealjs/advanced.html#title-slide) is the first one of your presentation. You can add such slide with a few yaml lines:

<Snippet filename="slides.md">

```markdown
---
title: "My Slide Show"
title-slide-attributes:
  data-background-image: ./img/background.jpg
  data-background-size: cover
  data-background-opacity: "0.9"
---
# Slide 1

# Slide 2

# Slide 3
```

</Snippet>

The slideshow will have four slides, the first one will be the title-slide.

![Title slide](./images/title-slide.webp)

### Display a logo top left on the first slide, then bottom right

The example below illustrates the need: on your first slide, you want to make your logo much more visible than on the other slides.

To achieve this, on the first slide displayed, your logo will be displayed at the top left with a certain size, whereas when you change slides, the logo will be positioned at the bottom right and will be much smaller.

Here is a visual example:

![Logo top left](./images/logo-top-left.webp)

![Logo bottom right](./images/logo-bottom-right.webp)

To do this, we'll need to add a custom JavaScript and custom CSS.

Create a new folder called `assets` and, in that folder, a file called `style.css` and a second called `custom.js`.

In `assets/style.css`, copy/paste the following code:

<Snippet filename="assets/style.css" source="./files/style.css" />

In `assets/custom.js`, copy/paste the following code:

<Snippet filename="assets/custom.js" source="./files/custom.js" />

Now, use them in your `slides.md` like this:

<Snippet filename="slides.md">

```markdown
---
title: "My Slide Show"
subtitle: "Playing with logo"
author: "Christophe Avonture"
date: last-modified
lang: "en"

format:
  revealjs:
    logo: images/my-logo.svg
    css: assets/style.css
    resources: images
    header-includes: |
      <script src="assets/custom.js" type="application/javascript"></script>
---
```

</Snippet>

As you can see above, the JavaScript code is injected in your presentation using the `header-includes` directive. For the stylesheet, the `css` directive is used (*there is no `js:` directive unfortunately*).

*To run this example, run `quarto render slides.md --to revealjs`.*

### Adding a background image to a slide

A background, a title and some style:

<Snippet filename="slides.md">

```markdown
# Merry Christmas {background-image="images/winter.jpg" style="text-align: center; background-color: #cfb0f399; color: #210753;"}
```

</Snippet>

*To run this example, run `quarto render slides.md --to revealjs`.*

![Adding a background image to a slide](./images/background-title-style.webp)

#### Background-size contain or cover

Sometimes the image display isn't what you'd like; this is the case when the image is too large and/or the slide too narrow.

The illustration below shows this: the photo of the sloth is far too large and you can't see the whole thing.

This can be corrected by using the attribute `background-size`. When not mentioned (as for the first slide below), the default value is `cover` (see [https://developer.mozilla.org/en-US/docs/Web/CSS/background-size](https://developer.mozilla.org/en-US/docs/Web/CSS/background-size) to get more information).

You can ask the browser to resize the image so it's fully displayed. This is the behavior when `background-size` is set to `contain`.

<Snippet filename="slides.md">

```markdown
## {background-image="images/2024.jpg"}

## {background-image="images/2024.jpg" background-size="contain"}
```

</Snippet>

*To run this example, run `quarto render slides.md --to revealjs`.*

The slide below is using `cover` and, no, not really attractive.

![Background-size is set to cover](./images/background-cover.webp)

The second slide is using `contain` and, at least, we can see what the sloth was trying to tell us.

![Background-size is set to contain](./images/background-contain.webp)

### Slide-level

The slide level is an important configuration item ([official documentation](https://pandoc.org/MANUAL.html#structuring-the-slide-show)).

If we look at the markdown below, how many slides will we have? Two or three? The first is for the title, the second for `Technologies and tools`, but will `Apache` be a separate slide or not?

<Snippet filename="slides.md">

```markdown
---
title: "Playing with slide-level"
---

## Technologies and tools

### Apache

Our web applications are running under [Apache](https://httpd.apache.org/).

We don't need to have Apache locally since we're using it as a Docker image.
```

</Snippet>

In fact, it depends on the `slide-level` setting. By default, `slide-level` is equal to `2` and then, the result will be:

![Slide level 2](./images/slide-level-2.webp)

We've two slides. On the second slide, we can see our `Apache` heading 3 as a text on `Technologies and tools`.

If you want a slide to be created for each level 2 and level 3 (or higher) title, you need to set this with slide-level.

<Snippet filename="slides.md">

```markdown
---
title: "Playing with slide-level"
# highlight-next-line
format:
  # highlight-next-line
  revealjs:
    # highlight-next-line
    slide-level: 3
---

## Technologies and tools

### Apache

Our web applications are running under [Apache](https://httpd.apache.org/).

We don't need to have Apache locally since we're using it as a Docker image.
```

</Snippet>

And the result will give:

![Slide level 3](./images/slide-level-3.webp)

### Using emoji

It's simple, just add the following entry to your YAML front matter.

```yaml
---
from: markdown+emoji
---
```

Then you can add emoji by just typing the code like `:wave:` or `:raised_hands:`.

You can find a full list on [https://gist.github.com/rxaviers/7360908](https://gist.github.com/rxaviers/7360908).

### Big text

The `r-fit-text` class ([official doc](https://quarto.org/docs/presentations/revealjs/advanced.html#fit-text)) will give the maximum size to your content i.e.

<Snippet filename="slides.md">

```markdown
#

::: {.r-fit-text}
Big Text
:::
```

</Snippet>

![Big text](./images/big-text.webp)

### Stretch

The `r-stretch` class ([official doc](https://quarto.org/docs/presentations/revealjs/advanced.html#stretch)) is my preferred one.

Consider the example below:

<Snippet filename="slides.md">

```markdown
# Slide 1

Here is an image:

![](image.jpg){.r-stretch}

Some text after the image.
```

</Snippet>

This will generate this slide:

![Stretch 1](./images/stretch-1.webp)

Adding a lot of more text / paragraphs will give this new slide:

![Stretch 2](./images/stretch-2.webp)

The image height will be resized automatically so both text and images can be displayed on the same slide. If you have less text, the height of the image will be bigger, smaller otherwise. Without to have to manually resize the image on the disk. Very useful.

### Show an image on key press

Using `::: {.fragment .fade-up}` to define a content area, you are asking reveal.js to show its content only the next key sequence.

<Snippet filename="slides.md">

```markdown
# It's a candy dog

::: {style="font-size: 2em; color: #75AADB;"}
Would you like to see a candy dog?
:::

::: {.fragment .fade-up}
![](./images/dog.jpg)
:::
```

</Snippet>

*To run this example, run `quarto render slides.md --to revealjs`.*

![It's a candy dog](./images/candy-dog.gif)

### Creating columns

You can use `columns` to divide your slide:

<Snippet filename="slides.md">

```markdown
##

::: columns
::: {.column width="70%"}
![](./images/image_1.jpg)
:::

::: {.column width="30%"}
![](./images/image_2.jpg)

![](./images/image_3.jpg)
:::
:::
```

</Snippet>

*To run this example, run `quarto render slides.md --to revealjs`.*

![Columns](./images/columns.webp)

#### Four quadrants

The example below comes from [https://mine.quarto.pub/hello-quarto/#/quarto-highlights](https://mine.quarto.pub/hello-quarto/#/quarto-highlights), a reveal.js slideshow made using Quarto.

The idea is to split the slides in four parts and display content clockwise, starting with the top-left dial.

<Snippet filename="slides.md">

```markdown
::: columns
::: {.column width="5%"}
:::

::: {.column width="40%"}
::: bulletbox
::: {.fragment .fade-in-then-semi-out}
![](./images/top-left.jpg){width="450px"}
:::
:::
:::

::: {.column width="5%"}
:::

::: {.column width="40%"}
::: bulletbox
::: {.fragment .fade-in-then-semi-out}
![](./images/top-right.jpg){width="450px"}
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
![](./images/bottom-left.jpg){width="450px"}
:::
:::
:::

::: {.column width="5%"}
:::

::: {.column width="40%"}
::: bulletbox
::: {.fragment .fade-in-then-semi-out}
![](./images/bottom-right.jpg){width="450px"}
:::
:::
:::

::: {.column width="5%"}
:::
:::
```

</Snippet>

*To run this example, run `quarto render slides.md --to revealjs`.*

![Four quadrants](./images/four-quadrants.gif)

### Creating our own short code, easily

I like to be able to write `==Important text==` and, for a revealjs presentation, transform this text automatically to `<mark>Important text</mark>` so I can easily add a custom CSS to it.

First, create a `assets/custom.js` if not yet present and copy/paste the following code:

<Snippet filename="assets/custom.js" source="./files/custom.part2.js" />

In your YAML front matter, add this:

<Snippet filename="slides.md">

```markdown
---
format:
  revealjs:
    header-includes: |
      <script src="assets/custom.js" type="application/javascript"></script>
---
```

</Snippet>

And now, when the slideshow will be played, a custom JavaScript code will replace on-the-fly each fragment with `==xxxx==` and replace with `<mark>xxx</mark>`.

## CSS

### Using inline css

You can apply styles to inline text by creating spans using `[]` to surround the text you want to style and `{}` to define the style you want to apply.

<Snippet filename="slides.md">

```markdown
# Inline style

To draw attention to a specific part of the text, you might want to make it [red]{style="color: red;"} with a [yellow background]{style="background-color: yellow;"}; [like this]{style="color: red; background-color: yellow;"}.
```

</Snippet>

*To run this example, run `quarto render slides.md --to revealjs`.*

This is correctly rendered in HTML:

![html](./images/html.webp)

### Use a custom css

Use the YAML header block for this.

<Snippet filename="slides.md">

```markdown
---
pagetitle: "Using my custom css"
format:
  revealjs:
    theme: custom.css
---
##

![](./images/mimikyu.jpg){style="width:400px;"}
```

</Snippet>

*To run this example, run `quarto render slides.md --to revealjs`.*

Now, create the `custom.css` file in the same folder as your markdown one and, for instance, set the slide background to yellow:

<Snippet filename="custom.css" source="./files/custom.css" />

![Custom css](./images/custom-css.webp)

### Hide image caption

By default, revealjs will display the caption of the image below it. You can hide it by using this stylesheet:

<Snippet filename="custom.css" source="./files/custom.part2.css" />

### Callout can be stylized

A callout is a special div like below:

<Snippet filename="slides.md">

```markdown
## Customize your terminal

:::{.callout-note}
## Notice
Skip this part if you do not want to customize your terminal right now
:::

As you can see on the image below, we can customize the terminal:
```

</Snippet>

In revealjs, personally, I find that the rendering takes up too much space compared to the content of my slide. So I use css to hide the title:

![Callout title](./images/callout-title.webp)

<Snippet filename="custom.css" source="./files/custom.part3.css" />

## Navigation

### Vertical slides

There are three types of navigation: `linear` (default one), `vertical` or `grid` ([official doc](https://quarto.org/docs/presentations/revealjs/advanced.html#vertical-slides)).

If you use vertical or grid navigation, you should structure your slides using level 1 headings for the horizontal axis and level 2 headings for the vertical axis.

In a normal, `linear` navigation, revealjs will show each slide, whatever the key the user is pressing on his keyboard. In a `linear` navigation, as author, you are sure that your visitor will see each of them.

In a `vertical` or `grid` navigation, it's just like you're showing the chapter's title and if the user press the <kbd>down</kbd> or <kbd>space</kbd>key, he will jump in the chapter (and this *vertically*). But if he is pressing the <kbd>right</kbd> key he'll skip it and go to the next chapter.

The `navigation-mode` in the yaml header allows you to enable `vertical` mode, below an example:

<Snippet filename="slides.md">

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

</Snippet>

![Vertical navigation](./images/vertical.webp)

<AlertBox variant="info" title="Press <kbd>esc</kbd> key">
The <kbd>esc</kbd> key allow you to see the structure of your revealjs slideshow.

</AlertBox>

### Define a name for your slide

By default, reveal.js will generate a slug from the title so you can reference the slide in a URL.

Consider the following example:

<Snippet filename="slides.md">

<!-- cspell:disable -->
```markdown
## Elit ad fugiat proident culpa sint

Elit ad fugiat proident culpa sint qui id pariatur nostrud ullamco velit irure tempor culpa. Laborum occaecat ea tempor voluptate duis pariatur proident ea. Aute adipisicing ut ullamco exercitation nisi nulla sint. Reprehenderit tempor quis non cupidatat.

## Cillum do et commodo minim ullamco elit culpa

Occaecat minim eu veniam laborumanim. Nostrud duis eiusmod ut amet velit commodo. Aliqua laborum cillum officia culpa quis duis enim cillum esse duis excepteur cillum do qui. Veniam dolore enim qui labore proident. Minim ipsum nisi Lorem cillum proident labore cupidatat aliqua pariatur. Nisi id magna incididunt et culpa.
```
<!-- cspell:enable -->

</Snippet>

*To run this example, run `quarto render slides.md --to revealjs`.*

The generated URL for the first slide will be `http://[...]index.html#/elit-ad-fugiat-proident-culpa-sint` and, for the second slide, `http://[...]index.html#/cillum-do-et-commodo-minim-ullamco-elit-culpa`.

To define the name yourself, just add `{#}` followed by the slug you desire.

<Snippet filename="slides.md">

<!-- cspell:disable -->
```markdown
<!-- highlight-next-line -->
## Elit ad fugiat proident culpa sint {#intro}

Elit ad fugiat proident culpa sint qui id pariatur nostrud ullamco velit irure tempor culpa. Laborum occaecat ea tempor voluptate duis pariatur proident ea. Aute adipisicing ut ullamco exercitation nisi nulla sint. Reprehenderit tempor quis non cupidatat.

<!-- highlight-next-line -->
## Cillum do et commodo minim ullamco elit culpa {#chapter1}

Occaecat minim eu veniam laborumanim. Nostrud duis eiusmod ut amet velit commodo. Aliqua laborum cillum officia culpa quis duis enim cillum esse duis excepteur cillum do qui. Veniam dolore enim qui labore proident. Minim ipsum nisi Lorem cillum proident labore cupidatat aliqua pariatur. Nisi id magna incididunt et culpa.
```
<!-- cspell:enable -->

</Snippet>

![Define a name for your slide](./images/set-slide-slug.webp)

But, pay attention to the slide's menu (bottom left): perhaps it's also good to define a suitable name there.

![Also define the name in the menu](./images/set-name-in-menu.webp)

To do this, set the `data-menu-title` attribute; f.i.:

<Snippet filename="slides.md">

<!-- cspell:disable -->
```markdown
<!-- highlight-next-line -->
## Elit ad fugiat proident culpa sint {#intro data-menu-title="Introduction"}

<!-- highlight-next-line -->
## Cillum do et commodo minim ullamco elit culpa {#chapter1 data-menu-title="Chapter 1"}
```
<!-- cspell:enable -->

</Snippet>

### Show slide number

To only show the current slide number, you can use `slide-number: true` but, if you also want the total number of slides, you should use `slide-number: c/t` :

<Snippet filename="slides.md">

```yaml
format:
  revealjs:
    slide-number: c/t
```

</Snippet>

![Slide / Total of slides](./images/slides_c_t.webp)

You can retrieve more information [here](https://quarto.org/docs/presentations/revealjs/presenting.html#slide-numbers).

## Misc

### Using speaker notes

You can write messages in your presentation that will not be displayed when the slideshow is played, but only as a second screen when the presenter wishes.

The example below illustrate this. The way to insert such presenter's notes is by using the `::: notes` block.

<Snippet filename="slides.md">

```markdown
##

::: columns
::: {.column width="70%"}
![](./images/image_1.jpg)
:::

::: {.column width="30%"}
![](./images/image_2.jpg)

![](./images/image_3.jpg)
:::
:::

::: notes
On the left side, you have ... and, on the right side, the first image is ....

The second image has been ...
:::

##

![](./images/image_4.jpg)
```

</Snippet>

*To run this example, run `quarto render slides.md --to revealjs`.*

So, in the example above, we'll have two slides. By pressing the <kbd>s</kbd> touch on the keyboard (<span style={{color: 'blue'}}>s for speakers</span>) a new window will be displayed.

When you have two screens, on the first you'll display your presentation without the notes (left screen below) and on the second you'll display the notes (right screen below).

If you share your screen through a tool like Teams or Zoom, same thing; you share the screen where the presentation is displayed (the first one) and keep the notes only for you.

![Speaker notes](./images/speaker-notes.webp)

As you can see on the image above, the speaker notes are displaying valuable information as the elapsed time since the start of the presentation, the current time and the next slide to make your transition easier.