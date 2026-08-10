---
slug: pest_tips
title: Write PHP unit tests using Pest
date: 2024-09-27
description: Master PHP unit testing with Pest! Discover easy installation, the expressive expect syntax, datasets, snapshots, and powerful architectural testing features.
authors: [christophe]
image: /img/v2/unit_tests.webp
mainTag: tests
tags:
  - code-quality
  - laravel
  - php
  - tests
  - vscode
language: en
updates:
  - date: 2026-07-30
    note: "Pest v5 released at Laracon US 2026 (requires PHP 8.4 + PHPUnit 13); core unit-testing API unchanged."
---
<!-- cspell:ignore Nuno -->

![Write PHP unit tests using Pest](/img/v2/unit_tests.webp)

<TLDR>
This is a broad reference for Pest, the expressive PHPUnit wrapper for PHP: installation, the `it()`/`test()`/`expect()` syntax, assertions vs expectations, inline and shared datasets, reusing existing PHPUnit test cases, architectural tests (enforcing rules like "no validation in controllers"), snapshot testing, custom global functions in `tests/Pest.php`, converting from PHPUnit, and VSCode tooling (Better Pest, Pest Snippets) including Docker-container setup.
</TLDR>

If you think writing unit tests in PHP is fun, stay in the room; the rest of you please leave. And then everyone leaves, including the person who asked the question.

Writing *old-fashioned* unit tests with PHPUnit is so boring that almost nobody does it.

And for some time now, [https://pestphp.com/](https://pestphp.com/) has come along and totally changed the way things are done.

Pest is a wrapper around PhpUnit so, for instance, every command-line argument supported by PhpUnit can be used for Pest.

*Unit tests are one layer of a quality strategy; the others on this blog are <Link to="/blog/php-jakzal-phpqa">static analysis with jakzal/phpqa</Link> and <Link to="/blog/git-precommit">pre-commit hooks</Link>, which run both before a commit can pass.*

<AlertBox variant="note" title="Looking for browser/functional testing instead?">
This article focuses on classic unit tests. Pest v4 added built-in browser testing; Pest v5 (current, July 2026) adds Test Impact Analysis and requires PHP 8.4 — see <Link to="/blog/pest-functional-testing">Writing functional tests with Pest</Link>. Testing Bash scripts? Check out <Link to="/blog/bats-unit-tests">Running unit tests with bats/bats</Link>.
</AlertBox>

<!-- truncate -->

## Result

A test file, and the bootstrap line that wires it to PHPUnit's `TestCase`:

<Snippet filename="tests/Pest.php" source="./files/Pest.php" />

<Snippet filename="tests/Feature/MyFirstTest.php" source="./files/MyFirstTest.php" />

Running it with `./vendor/bin/pest tests/Feature/MyFirstTest.php` gives:

<Terminal typewriter source="./files/terminal-2.txt" />

## Why Pest

- Tests read like natural sentences: `expect($value)->toBeTrue()` instead of PHPUnit's `$this->assertTrue($value)` — methods can be negated with `not->`.
- `it()` and `test()` are interchangeable; use whichever fits your naming convention, both share the same behavior and syntax.
- Pest is a wrapper around PHPUnit, not a replacement: every PHPUnit command-line argument still works, and existing PHPUnit test cases can be reused as-is (just add `/** @test */`).

## Installation

> [https://pestphp.com/docs/installation#installation](https://pestphp.com/docs/installation#installation)

Simply run the commands below in your PHP application folder:

<Terminal typewriter source="./files/terminal-3.txt" />

From now, we can run `./vendor/bin/pest` to run our Pest tests.

## Writing tests

### Introduction about Pest

#### Files should have the Test suffix

Just like PHPUnit, Pest will process every files in folders `tests/Feature` and `tests/Unit` having the `Test` suffix like f.i. `ShoppingBasketTest.php`.

#### What does $this mean in a test?

In our `tests/Pest.php` file, we've the bootstrap line shown at the top of this article.

In a Pest test, `$this` refers to the PHPUnit `Tests\TestCase` class.

#### it or test

Pest gives us the choice between `it()` and `test()`. *Use the one that best fits your test naming convention, or both. They share the same behavior & syntax.*

Read more: [https://pestphp.com/docs/writing-tests#api-reference](https://pestphp.com/docs/writing-tests#api-reference)

The result is the same, just how the output is done on the console.

### Our first tests

That's the `MyFirstTest.php` test and its `PASS` output shown at the top of this article. It illustrates that Pest starts with an `expect` verb and some method like `toBeTrue()`. Methods can be negated using `not->` ([https://pestphp.com/docs/expectations#expect-not](https://pestphp.com/docs/expectations#expect-not)).

#### Autocomplete

Make sure to install and enable [PHP Intelephense](https://marketplace.visualstudio.com/items?itemName=bmewburn.vscode-intelephense-client) and enjoy the autocomplete feature of vscode.

#### Difference between toBe and toEqual

<Snippet filename="tests/Feature/AnyTest.php" source="./files/AnyTest.php" />

`toBe` will be stricter i.e. will check both the value and the data type when, `toEqual` will just check the value.

### Assertions

> [https://pestphp.com/docs/assertions](https://pestphp.com/docs/assertions)

Assertions come from PhpUnit and work the same way.

Assertions are accessible through the `$this` object and this because  `tests/pest.php` contains the line below.

<Snippet filename="tests/pest.php" source="./files/pest.php" />

So `$this` refers to the `Tests\TestCase` PHPUnit class.

### Expectations

> [https://pestphp.com/docs/expectations](https://pestphp.com/docs/expectations)

In addition to assertions, Pest offers you a set of expectations. These functions let you test your values against certain conditions. This API is inspired by Jest. Expectations also allow you to write your tests like you would a natural sentence.

Assertions and expectations can be used in Pest tests files but ... expectations are more explicit and intuitive.

<Snippet filename="tests/Feature/AnyTest.php" source="./files/AnyTest.part2.php" />

### Using datasets

> [https://pestphp.com/docs/datasets](https://pestphp.com/docs/datasets)

We've multiple way to provide data to a function.

Here is [inline](https://pestphp.com/docs/datasets#inline-datasets)

<Snippet filename="tests/Feature/AnyTest.php" source="./files/AnyTest.part3.php" />

The dataset is then an array and we can have a multi-dimension array:

<Snippet filename="tests/Feature/AnyTest.php" source="./files/AnyTest.part4.php" />

There is also a way to create a shared dataset which is probably better when the test file becomes big ([https://pestphp.com/docs/datasets#shared-datasets](https://pestphp.com/docs/datasets#shared-datasets)).

### Reuse PHPUnit tests cases without changes

This is damned simple: we just need to add `/** @test */` as the doc block before the test scenario.

For instance

<Snippet filename="tests/Feature/AnyTest.php" source="./files/AnyTest.part5.php" />

And from now that test can be fired using `./vendor/bin/pest`.

### Architectural tests

> [https://pestphp.com/docs/arch-testing](https://pestphp.com/docs/arch-testing)

Using Pest (as from v2), we can ensure some architectural consistencies, like not using validations in a controller (using `$request->validate(...)`) but forcing the use of Form request control classes instead.

The architectural plugin will not help to fire unit tests but will scan the project and will ensure some rules are followed.

Architectural tests can be:

<Snippet filename="tests/Feature/AnyTest.php" source="./files/AnyTest.part6.php" />

This part can be seen on video [https://youtu.be/9EGPo_enEc8?t=1021](https://youtu.be/9EGPo_enEc8?t=1021)

We can also check if a class is final:

<Snippet filename="tests/Feature/AnyTest.php" source="./files/AnyTest.part7.php" />

### Taking snapshots

There is also a feature called `Snapshots`. The idea is to store a content as a snapshot then compares future run with that snapshot.

A snapshot can be the content of an HTML page, a JSON answer, the content of a file / array, ... everything in fact (for an object; we can serialize it so we can store it too as a snapshot).

<Snippet filename="tests/Feature/AnyTest.php" source="./files/AnyTest.part8.php" />

On the very first run (`vendor/bin/pest`), the snapshot didn't exist yet so it'll be created on disk and the test will be noted as *WARN*.

The snapshot will be created in a subdirectory in the `./tests/.pest/snapshots` folder (the subdirectory will match the location of your fired test (f.i. `Feature/ExampleTest/it_has_a_welcome_page.snap`)).

As from the second run, the taken snapshot will then be compared with, in the example here above, the HTML content of the homepage. As soon as a difference is noted (like the today date if present on the page), Pest will show it in a diff: the previous string coming from the snapshot and the retrieved, actual, string.

## Write global functions

We can write our own custom functions in the `tests/Pest.php` file.

## Pest bootstrap

The file `tests/pest.php` can be used to place there global function but we'll also need to update it if, inside our tests files, we need some other classes.

<Snippet filename="tests/Feature/AnyTest.php" source="./files/AnyTest.part9.php" />

The line above will make `Tests\TestCase` available in all tests in `tests/Feature`. If we need more classes, we can add them:

<Snippet filename="tests/Feature/AnyTest.php" source="./files/AnyTest.part10.php" />

And also in the `tests/Unit` folder:

<Snippet filename="tests/Feature/AnyTest.php" source="./files/AnyTest.part11.php" />

## Tips and tricks

*Optional.*

### Dump and die

We can use the `dd` method to dump the current expectation value and end the test suite like this:

<Snippet filename="tests/Feature/AnyTest.php" source="./files/AnyTest.part12.php" />

## Convert from PHPUnit

*Optional — only relevant if you have an existing PHPUnit suite to migrate.*

> [Migrate from PHPUnit to Pest - Online migration tool](https://benjamincrozat.com/phpunit-to-pest)

Introduced in Pest since v2.9, there is a tool to convert from PHPUnit to Pest.

See [https://pestphp.com/docs/pest-spicy-summer-release#content-drift-plugin](https://pestphp.com/docs/pest-spicy-summer-release#content-drift-plugin)

Note: Rector has also a tool: [https://github.com/rectorphp/rector-pest](https://github.com/rectorphp/rector-pest)

For example, the code below

<Snippet filename="tests/Feature/example_test.php" source="./files/example_test.php" />

will be converted to

<Snippet filename="tests/Feature/example_test.php" source="./files/example_test.part2.php" />

## Tools

### Laravel plugin

> [Laravel Pest plugin](https://pestphp.com/docs/plugins/laravel)

Install the plugin like this: `composer require pestphp/pest-plugin-laravel --dev`

Then some new artisan commands will be available:

<Terminal typewriter source="./files/terminal-1.txt" />

### Visual Studio Code Add-on

- If not yet installed, [PHP Intelephense](https://marketplace.visualstudio.com/items?itemName=bmewburn.vscode-intelephense-client) will allow you to press <kbd>F12</kbd> on a method name (like `toBeTrue`) and jump where the method is implemented,
- [Better Pest](https://marketplace.visualstudio.com/items?itemName=m1guelpf.better-pest) and
- [Pest Snippets](https://marketplace.visualstudio.com/items?itemName=dansysanalyst.pest-snippets)

#### Better Pest with Docker

If you're using Docker, think to add the next lines in your `.vscode/settings.json` configuration file:

<Snippet filename=".vscode/settings.json" source="./files/settings.json" />

Think to adjust the name of your container (`app` here) and paths:

- `/your/local/path` is where your repository is stored, on your host machine,
- `/your/remote/path` is the path in your container, probably `/var/www/html`.

Now, just open any Pest file and press <kbd>CTRL</kbd>+<kbd>Shift</kbd>+<kbd>P</kbd> to open the Command Palette. Start to type `Better Pest` and select the desired option (like `Better Pest: run` for running the file).

### Convert from PHPUnit to Pest

The repository [https://github.com/mandisma/pest-converter](https://github.com/mandisma/pest-converter) proposes a **PHPUnit to Pest Converter**: PestConverter is a PHP library for converting PHPUnit tests to Pest tests.

## Conclusion

Pest doesn't replace PHPUnit, it just replaces the *ceremony* — `expect()->toBeTrue()` instead of
boilerplate assertions, datasets and architectural tests for free, and every existing PHPUnit
test case still works unchanged. Install it once, write the next test in the expressive syntax,
and migrate the rest only when it's convenient.

## Links

### Videos

- [Laracast - Pest](https://laracasts.com/series/jeffreys-larabits/episodes/30)
- [Laracast - Pest from Scratch](https://laracasts.com/series/pest-from-scratch)
- [Laracon IN 2023: the future of PEST](https://youtu.be/9EGPo_enEc8)
