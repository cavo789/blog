---
slug: vscode-php-refactoring
title: PHP code refactoring in VSCode
authors: [christophe]
tags: [php, tips, vscode]
enableComments: true
image: /img/vscode_tips_social_media.jpg
draft: true
---
# PHP code refactoring in VSCode

![PHP code refactoring in VSCode](/img/vscode_tips_header.jpg)

Currently, at the end of 2023, there aren't many **free** refactoring extensions for PHP under vscode. We'll take a look to [PHP Refactor Tool](https://marketplace.visualstudio.com/items?itemName=st-pham.php-refactor-tool)

## Create sample files

For the demo, please start a Linux shell and run `mkdir -p /tmp/refactor && cd $_` to create a folder called `refactor` in your Linux temporary folder and jump in it.

Please create two php files. The first one will be called `index.php` and will contains this code:

```php
<?php

namespace Cavo;

require_once('Product.php');

$product = new Product();

$product->setProductName('keyboard');
$product->setProductPrice(125);

printf(
    'The name is %s cost %d €'.PHP_EOL,
    $product->getProductName(),
    $product->getProductPrice()
);
```

The second file `Product.php` will contain:

```php
<?php

namespace Cavo;

class Product 
{
    private string $productName = '';
    private float $productPrice = 0;

    public function __construct(string $name='', float $price=0)
    {
        $this->setProductName($name);
        $this->setProductPrice($price);
    }

    public function getProductName(): string {
        return $this->productName;
    }

    public function setProductName(string $name): void {
        $this->productName = $name;
    }

    public function getProductPrice(): float {
        return $this->productPrice;
    }

    public function setProductPrice(float $price): void {
        $this->productPrice = $price;
    }
}
```

### Run the example

Run `docker run -it --rm -v "${PWD}":/project -w /project php:8.2 php index.php` to run our example.

You'll get, as expected:

```bash
❯ docker run -it --rm -v "$PWD":/project -w /project php:8.2 php index.php

The name is keyboard cost 125 €
```

## Refactoring

Make sure `PHP Refactor Tool` is installed. Go to the list of extensions in vscode (press <kbd>CTRL</kbd>-<kbd>SHIFT</kbd>-<kbd>X</kbd>) and search for `PHP Refactor Tool`. Install the one of `Son Tung PHAM` (the author).

### Rename a symbol

The illustration below is showing a sample `index.php` script using a class defined in `Product.php`.

Everything is working fine but, yeah, functions are called `getProductName` and `getProductPrice` and it's quite overqualified: our object is `$product` so, yes, `$product->getProductName()` and `$product->getProductPrice()` can be rewritten to `$product->getName()` and `$product->getPrice()`. The smaller the best.

So, we need to rename our functions. 

By opening our `Product.php` file, we can do it manually but ... don't do this because you'll need to update manually every single files using your `Product` class and if you forgot just one use, your code will be broken.

The rename feature serves this objective. You just need to select a property like `productPrice` as illustrated in the animation, press <kbd>F2</kbd> and rename it.

1. Select a property f.i. in the `Product.php` file, put the cursor on the word `productName` in line 7 `private string $productName = '';`,
2. Press <kbd>F2</kbd> (or choose Rename Symbol in the Command palette (press <kbd>CTRL</kbd>-<kbd>SHIFT</kbd>-<kbd>P</kbd>)) and type the new name f.i. `name` (instead of `productName`),
3. VSCode will display a small list at the top of the screen, just validate i.e. select `Update Getter name and Setter name`.

Do the same for `productPrice` and rename it to `price`.

The new `Product.php` file is now:

```php
<?php

namespace Cavo;

class Product 
{
    private string $name = '';
    private float $price = 0;

    public function __construct(string $name='', float $price=0)
    {
        $this->setName($name);
        $this->setPrice($price);
    }

    public function getName(): string {
        return $this->name;
    }

    public function setName(string $name): void {
        $this->name = $name;
    }

    public function getPrice(): float {
        return $this->price;
    }

    public function setPrice(float $price): void {
        $this->price = $price;
    }
}
```

But the very cool thing is that `index.php` has been automatically updated:

```php
<?php

namespace Cavo;

require_once('Product.php');

$product = new Product();

$product->setName('keyboard');
$product->setPrice(125);

printf(
    'The name is %s cost %d €'.PHP_EOL,
    $product->getName(),
    $product->getPrice()
);
```

By running `docker run -it --rm -v "${PWD}":/project -w /project php:8.2 php index.php`, it's still work. We've refactored our code without breaking it.

The same thing in pictures:

![Rename a symbol](./images/rename_symbol.gif)

### Rename a class

Open the file where your class is defined, go to the `class Yourclass` line, put the cursor on the class name and press <kbd>F2</kbd> to rename it.

![Renaming a class](./images/rename-a-class.png)

The class name will be updated but, too, the file name. Here from `Product.php` to `Products.php` and, even better, if you open the `index.php` file, you can see that `$product = new Product();` has been perfectly changed to `$product = new Products();`.

:::info You can rename also from index.php
Locate the `$product = new Product();` line in your `index.php` file. Put the cursor on the `Product` word, press <kbd>F2</kbd> and rename it. This work too i.e. the class will be updated too in `Products.php` (since the file has been renamed too). Nice!
:::

![Rename a class](./images/rename_class.gif)

:::caution Don't rename the file
Renaming the file from the Explorer won't refactor the code. So, don't go to the `Explorer`, click on `Product.php` and rename it. This will not refactor the code. Avoid!
:::

### Extract to a new method

The third very nice method is the `Extract method`.

Consider the following example (the code isn't running, it's just for the illustration).

```php
<?php

namespace Avonture;

class Pandoc
{
    public function download(string $filename): void
    {
        $filename = Sanitize::sanitizeFileName(trim($filename));

        if ('' == $filename) {
            throw new PandocFileNotSpecified();
        }

        if (!is_file($this->outputFolder . $filename)) {
            throw new PandocFileNotFound($filename);
        }

        // Make the filename absolute
        $filename = $this->outputFolder . ltrim($filename, self::DS);

        $this->outputType = pathinfo($filename)['extension'];

        $contentType = $this->getContentType()['type'];

        header('Content-Type: ' . $contentType);
        header('Content-Transfer-Encoding: ' . $this->getContentType()['encoding']);

        header('Content-Disposition: attachment; filename="' . basename($filename) . '"');
        header('Content-Length: ' . filesize(utf8_decode($filename)));
        header('Accept-Ranges: bytes');
        header('Pragma: no-cache');
        header('Expires: 0');

        ob_end_flush();

        @readfile(utf8_decode($filename));
    }
}
```

The `download` function didn't respect the single-responsibility concept. We're made a few initializations and assertions. Can we do better? Yes, we can extract the lines concerning the browser and create a new `sendToBrowser` function but instead of doing it manually, we'll use the `Extract` feature.

See the animation below:

![Extract to a new method](./images/extract-new-method.gif)

:::tip Did you have notice the use of input parameters?
In the lines we're moving, there are variables like `contentType` and `filename` that are not part of the new method. These variables are still local in our first, `download` method.

And, as you can see, during the creation of the new method, these two local variables have been added to the definition of the new function. Nice feature.
:::