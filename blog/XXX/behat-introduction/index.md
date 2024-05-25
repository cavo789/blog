---
slug: behat-introduction
title: Introduction to Behat
authors: [christophe]
image: ./images/behat_introduction_social_media.jpg
tags: [behat, docker, php, tests]
draft: true
enableComments: true
---
![Introduction to Behat](./images/behat_introduction_banner.jpg)

At work, I'm part of a team of PHP developers where we work together to create a very large proprietary application with a web interface.

This application is developed using the Laravel framework and we use [PHPUnit](https://phpunit.de/index.html) and [Pes](https://pestphp.com/) to run our unit tests.

However, in addition to the unit tests, we are also putting in place a tool that will simulate actions on our interface, such as accessing the login page, entering a login and password, simulating the click on the 'login' button and then on the new page displaying ... (a long list of actions).  

It's a bit like asking a human to play out scenarios over and over again, every day, to make sure we haven't introduced any regressions in our latest developments, like a cool new feature whose code changes have broken a previous feature.

For this, we're using [Behat](https://docs.behat.org/en/latest/). This is a [composer](https://getcomposer.org/) dependency you can add to your project (or a new one). The idea is to be able to write assertions in pure English (or French) like "I go to the ABC website then I'll click on the blog menu item and I should receive a list of blog items" or "In the search box, I type Docker then I click on the search button and I should receive articles having the Docker tags".

<!-- truncate -->

As you can read on the [Behat](https://docs.behat.org/en/latest/) site, *Behat is an open source Behavior-Driven Development framework for PHP. It is a tool to support you in delivering software that matters through continuous communication, deliberate discovery and test-automation.*  This means that, in fact, you can start to write your scenarios even before coding. You can ask to your client to write assertions in common english. Once done, the developper will start to code and once done, he just need to run the written scenarios to make sure the software answers to the client requirements.

Let's play.

## Create a new project

As you know if you're a regular reader of my blog, I drink, eat and breathe Docker, which means that I no longer have PHP, composer or anything else on my computer.

To illustrate this blog, I'm going to quickly create a little 'from scratch' project with Docker, PHP 8.2 and composer. If you already have a project and you want to reuse it, you can skip this chapter.

* Create a temporary directory: `mkdir /tmp/behat && cd $_`.

* Create a file called `Dockerfile` with this content:

```Dockerfile
FROM php:8.2-fpm

# Install system dependencies
RUN apt-get update && apt-get install -y git

# Get latest Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www
```

* Create a file called `docker-compose.yml` with this content:

```yaml
services:
  app:
    build: .
    container_name: php-app
    working_dir: /var/www
    volumes:
      - ./:/var/www
```

* Create a simple `index.php` with the content below. *That file is only for debugging and can be removed later on.*

```php
<?php

echo "Hello World!\n";
```

* Run `docker compose up --detach` to create your Docker container

* And finally run `docker compose exec app php -f index.php`

![Hello World](./images/hello_world.png)

Ok, let's do one more thing; we need to create our `composer.json` file.

* Run `docker compose exec -u $(id -u):$(id -g) app /bin/bash` to start an interactive shell in your Docker container and be yourself (i.e. by using `-u $(id -u):$(id -g)` files and folders created in Docker will be owned by you),

* Run `composer init` to start the composer wizard; type any value you want f.i.
    * Package name: `johndoe/behat`,
    * Description: `Introduction to behat`,
    * Author: `John Doe`,
    * Minimum Stability: *Just press enter*,
    * Packate Type: `project`,
    * License: *Just press enter*,
    * Composer will ask if you want to define dependencies and dev dependencies; answer `no` twice right now,
    * The next question will be about PSR-4, *just press enter*,
    * Finally answer `yes` to the confirmation message.

Now, if you're curious, you'll see you've a new file called `composer.json` and two folders called `src` and `vendor`.

## Let's install behat

As stated in the [How to install?](https://docs.behat.org/en/latest/quick_start.html#installation) documentation, you just need to execute `composer require --dev behat/behat` to install Behat as a dev dependency.

Once installed, you can start Behat by running `vendor/bin/behat` but right now, you'll got an error and this is perfectly normal since we need to start to write our first scenario.

![FeatureContext not found](./images/FeatureContext_not_found.png)

As you can read in the official documentation, just run `vendor/bin/behat --init` to create the required files.

![Running Behat init](./images/behat_init.png)

If you look at your folder, you can see you've now a new folder called `features/bootstrap` with a file called `FeatureContext.php`.

![FeatureContext in vscode](./images/vscode_FeatureContext.png)

## Time to learn more about features

A feature is something you want to play using automation. For instance:

```
Feature: Clicking on the Blog menu item should gives me the list of articles

  Scenario: I click on the Blog menu
    Given I am on "https://www.avonture.be"
    Then I click on the "Blog" menu item
    Then I should be on "/blog"
```

This has to be put in a file having the `.feature` extension in the  `features` folder; let's create the `Blog.feature` file with this content:

![The Blog.feature file](./images/blog_feature.png)

:::note Think to install `Cucumber (Gerkin) Full Support`
If you're using Visual Studio Code, you can install [Cucumber (Gerkin) Full Support](https://marketplace.visualstudio.com/items?itemName=alexkrechik.cucumberautocomplete) to get colorization, a better integration in vscode like autocompletion.
:::

Your scenario here above is using three **steps**:

1. `Given I am on "https://www.avonture.be"`,
2. `Then I click on the "Blog" menu item` and
3. `Then I should be on "/blog"`. 

You've to learn to Behat how to *translate* these sentences (it's the [Gherkin language](https://cucumber.io/docs/gherkin/)) in PHP code.

## Writing your steps in PHP

Now, please open the file `features/bootsrap/FeatureContext.php` in your preferred editor:

![Editing the FeatureContext.php file](./images/vscode_edit_0_FeatureContext.png)

As you can see, this is the default file, added by Behat. We need to create some PHP code here but how?

Go back to your console and run `vendor/bin/behat --dry-run --append-snippets`. This will ask Behat to create the steps for you, automagically.

![Append snippets](./images/append_snippets.png)

Please type `1` to ask Behat to use your `FeatureContext.php` file. You'll then get a confirmation on screen:

```bash
u features/bootstrap/FeatureContext.php - `I am on "https://www.avonture.be"` definition added
u features/bootstrap/FeatureContext.php - `I click on the "Blog" menu item` definition added
u features/bootstrap/FeatureContext.php - `I should be on "/blog"` definition added
```

Please open the file `features/bootsrap/FeatureContext.php` once more in your preferred editor:

![Now we have our steps](./images/vscode_edit_1_FeatureContext.png)

Nice isn't?

And, now, before even starting to code, let's ask Behat to run our scenario; please run `vendor/bin/behat` in the console:

![First run](./images/first_run.png)

Wow! So nice! We've thus ask Behat to run our scenario and he knows that we've three steps and we still need to write the associated code in PHP (therefore the **TODO: write pending definition** message in yellow).

Let's give ourselves the means to do the best we can as quickly as possible, without reinventing the wheel if someone else has already done it. Let's install two new dependencies. In your console, please run `composer require --dev friends-of-behat/mink` and `composer require dmore/behat-chrome-extension`.

Indeed, for sure, someone has already written the `iAmOn` function no?

![I am on](./images/iamon.png)

## Using Mink

Now that Mink has been installed, go to your editor, open the file `features/bootsrap/FeatureContext.php` and replace the line `class FeatureContext implements Context` like this `class FeatureContext extends \Behat\MinkExtension\Context\MinkContext`.

![Using MinkContext](./images/MinkContext.png)

This small changes will empower us because Mink will comes with a lot of already written steps.

To get the list, run `vendor/bin/behat -di` in your console:

![Print definitions](./images/print_definitions.png)

Did you see? We've our three steps (the first three displayed) then we got extra steps coming from Mink. And you can scroll a lot, there are already many steps that Mink allows you to reuse.

Run `vendor/bin/behat` in the console again:

![Ambiguous match](./images/ambiguous_match.png)

We got the *Ambiguous match of ...* error on the very first step, our *I am on "https://www.avonture.be"* step. Ambiguous means that we're trying to add some PHP code in our context while that step is already defined (by Mink). So, just drop it by editing your `FeatureContext.php` file, select the `public function iAmOn` and remove the entire function.

![Remove the iAmOn method](./images/drop_iamon.png)

By running `vendor/bin/behat` again; now we'll got a new error:

![Mink instance not set](./images/mink_instance_not_set.png)

## Installing the Mink extension

We'll now need to reference the `behat-chrome-extension` in a such called `behat.yml` file.

Please create the file called `behat.yml` in your project's root directory; with this content:

```yaml
default:
    extensions:
        DMore\ChromeExtension\Behat\ServiceContainer\ChromeExtension: ~
        Behat\MinkExtension:
            browser_name: chrome
            base_url: http://localhost
            sessions:
                default:
                    chrome:
                      api_url: http://0.0.0.0:9222
```

Also, please edit the file `features/bootsrap/FeatureContext.php` and replace the existing content below.

We've changes a few `use` to add Mink libraries (and remove unneded ones). We've also added a `$mink` private property and put some lines in the `__constructor`.

:::warning Please update the url `https://www.avonture.be` to match your site
:::

```php
<?php

use Behat\Mink\Mink;
use Behat\Mink\Session;
use DMore\ChromeDriver\ChromeDriver;
use Behat\Behat\Tester\Exception\PendingException;

/**
 * Defines application features from the specific context.
 */
class FeatureContext extends \Behat\MinkExtension\Context\MinkContext
{

    private Behat\Mink\Mink $mink;

    /**
     * Initializes context.
     *
     * Every scenario gets its own context instance.
     * You can also pass arbitrary arguments to the
     * context constructor through behat.yml.
     */
    public function __construct()
    {
        $this->mink = new Mink(
            [
                'browser' => new Session(
                    new ChromeDriver(
                        'http://0.0.0.0:9222',
                        null,
                        "https://www.avonture.be"  // <-- Think to update to the site you wish to test
                    )
                )
            ]
        );
        
    }

    /**
     * @Then I click on the :arg1 menu item
     */
    public function iClickOnTheMenuItem($arg1)
    {
        throw new PendingException();
    }

    /**
     * @Then I should be on :arg1
     */
    public function iShouldBeOn($arg1)
    {
        throw new PendingException();
    }
}
```

By running `vendor/bin/behat` again, we've now another error:

![Chrome is not running](./images/chrome_not_running.png)

## Time to install google-chrome-stable

To install `google-chrome-stable` i.e. the web client we'll use with Behat, please run these commands:

```bash
apt-get update && apt-get install gpg wget
wget https://dl-ssl.google.com/linux/linux_signing_key.pub -O /tmp/google.pub
gpg --no-default-keyring --keyring /etc/apt/keyrings/google-chrome.gpg --import /tmp/google.pub
echo 'deb [arch=amd64 signed-by=/etc/apt/keyrings/google-chrome.gpg] http://dl.google.com/linux/chrome/deb/ stable main' | tee /etc/apt/sources.list.d/google-chrome.list
apt-get update && apt-get install google-chrome-stable
```

Once done, you should be able to run `which google-chrome-stable` and receive, as answer, `/usr/bin/google-chrome-stable`. This is a confirmation Chrome is now installed. You can also run `google-chrome-stable --version` to get the installed version.

So now, please run google-chrome-stable in background using: `nohup google-chrome-stable --disable-extensions --disable-gpu --headless --remote-debugging-address=0.0.0.0 --remote-debugging-port=9222 >/tmp/nohup.out 2>&1`
