---
date: 2024-09-27
slug: pest_tips
title: Write PHP unit tests using Pest
authors: [christophe]
mainTag: tests
tags: [laravel, pest, php, phpunit, rector, tests, tips, vscode]
image: /img/writing_tests_social_media.jpg
---

<!-- cspell:ignore Nuno -->

![Write PHP unit tests using Pest](./images/writing_tests_header.jpg)

If you think writing unit tests in PHP is fun, stay in the room; the rest of you please leave. And then everyone leaves, including the person who asked the question.

Writing “old-fashioned” unit tests with PHPUnit is so boring that almost nobody does it.

And for some time now, [https://pestphp.com/](https://pestphp.com/) has come along and totally changed the way things are done.

Pest is a wrapper around PhpUnit so, for instance, every command line arguments supported by PhpUnit can be used for Pest.

<!-- truncate -->

## Installation

> [https://pestphp.com/docs/installation#installation](https://pestphp.com/docs/installation#installation)

Simply run the commands below in your PHP application folder:

<Terminal>
$ composer require pestphp/pest --dev --with-all-dependencies

$ composer require pestphp/pest-plugin-laravel --dev

$ php artisan pest:install

$ ./vendor/bin/pest --init
</Terminal>

From now, we can run `./vendor/bin/pest` to run our Pest tests.

## Writing tests

### Introduction about Pest

#### Files should have the Test suffix

Just like PHPUnit, Pest will process every files in folders `tests/Feature` and `tests/Unit` having the `Test` suffix like f.i. `ShoppingBasketTest.php`.

#### What means $this in a test?

In our `tests/Pest.php` file, we've this line:

<Snippet filename="tests/Pest.php">

```php
uses(Tests\TestCase::class)->in('Features');
```

</Snippet>

In a Pest test, `$this` refers to the PHPUnit `Tests\TestCase` class.

#### it or test

Pest give us the choice between `it()` and `test()`. *Use the one that best fits your test naming convention, or both. They share the same behaviour & syntax.*

Read more: [https://pestphp.com/docs/writing-tests#api-reference](https://pestphp.com/docs/writing-tests#api-reference)

The result is the same, just how the output is done on the console.

### Our first tests

Create a file like `tests/Feature/MyFirstTest.php` with this content:

<Snippet filename="tests/Feature/MyFirstTest.php">

```php
<?php

test('assert true is true', function () {
    expect(true)->toBeTrue();
});

test('assert false is not true', function () {
    expect(false)->not->toBeTrue();   // we can also write `not()->`
});
```

</Snippet>

This illustrates that Pest start with a `expect` verb and some method like `toBeTrue()`.  Methods can be negated using `not->` ([https://pestphp.com/docs/expectations#expect-not](https://pestphp.com/docs/expectations#expect-not)).

Running our test can be simply done using `./vendor/bin/pest tests/Feature/MyFirstTest.php` and here is the result:

<Terminal>
   PASS  Tests\Feature\MyFirstTest
  ✓ assert true is true
  ✓ assert false is not true

  Tests:  2 passed
  Time:   0.08s
</Terminal>

#### Autocomplete

Make sure to install and enable [PHP Intelephense](https://marketplace.visualstudio.com/items?itemName=bmewburn.vscode-intelephense-client) and enjoy the autocomplete feature of vscode.

#### Difference between toBe and toEqual

<Snippet filename="tests/Feature/AnyTest.php">

```php
<?php

test('assert count is correct', function () {
    expect(2 + 2)->toBe(4);       // Will be true
    expect(2 + 2)->toBe('4');     // Will NOT be true

    expect(2 + 2)->toEqual(4);    // Will be true
    expect(2 + 2)->toEqual('4');  // Will be true
});
```

</Snippet>

`toBe` will be stricter i.e. will check both the value and the data type when, `toBe` will just check the value.

### Assertions

> [https://pestphp.com/docs/assertions](https://pestphp.com/docs/assertions)

Assertions come from PhpUnit and work the same way.

Assertions are accessible through the `$this` object and this because  `tests/pest.php` contains the line below.

<Snippet filename="tests/pest.php">

```php
uses(Tests\TestCase::class)->in('Feature');
```

</Snippet>

So `$this` refers to the `Tests\TestCase` PHPUnit class.

### Expectations

> [https://pestphp.com/docs/expectations](https://pestphp.com/docs/expectations)

*In addition to assertions, Pest offers you a set of expectations. These functions let you test your values against certain conditions. This API is inspired by Jest. Expectations also allow you to write your tests like you would a natural sentence*

Assertions and expectations can be used in Pest tests files but ... expectations are more explicits and intuitive.

<Snippet filename="tests/Feature/AnyTest.php">

```php
<?php

test('assert true is true', function () {
    // These two lines do exactly the same. Keep just one...
    $this->assertTrue(true);
    expect(true)->toBeTrue();
});
```

</Snippet>

### Using datasets

> [https://pestphp.com/docs/datasets](https://pestphp.com/docs/datasets)

We've multiple way to provide data to a function.

Here is [inline](https://pestphp.com/docs/datasets#inline-datasets)

<Snippet filename="tests/Feature/AnyTest.php">

```php
it('has emails', function (string $email) {
    expect($email)->not->toBeEmpty();
})->with([
    'enunomaduro@gmail.com',
    'other@example.com'
]);
```

</Snippet>

The dataset is then an array and we can have a multi-dimension array:

<Snippet filename="tests/Feature/AnyTest.php">

```php
it('has emails', function (string $name, string $email) {
    expect($email)->not->toBeEmpty();
})->with([
    ['Nuno', 'enunomaduro@gmail.com'],
    ['Other', 'other@example.com']
]);
```

</Snippet>

There is also a way to create a shared dataset which is probably better when the test file becomes big ([https://pestphp.com/docs/datasets#shared-datasets](https://pestphp.com/docs/datasets#shared-datasets)).

### Reuse PHPUnit tests cases without changes

This is damned simply, we just need to add `/** @test */` as the doc block before the test scenario.

For instance

<Snippet filename="tests/Feature/AnyTest.php">

```php
<?php

declare(strict_types=1);

namespace Tests\Feature;

use Tests\TestCase;

class VisitLoginPageTest extends TestWebCase
{
    /** @test */
    public function test_we_should_see_fields_email_and_password()
    {
        $this->response->assertSee('id="password"', false);
        $this->response->assertSee('id="email"', false);
    }
}
```

</Snippet>

And from now that test can be fired using `./vendor/bin/pest`.

### Architectural tests

> [https://pestphp.com/docs/arch-testing](https://pestphp.com/docs/arch-testing)

Using Pest (as from v2), we can ensure some architectural consistencies like not using validations in a controller (using `$request->validate(...)`) but forcing to use the Form request control classes.

The architectural plugin will not help to fire unit tests but will scan the project and will ensure some rules are followed.

Architectural tests can be:

<Snippet filename="tests/Feature/AnyTest.php">

```php
test('controllers')
    ->expect('App\Http\Controllers')
    ->not->toUse('Illuminate\Http\Request');

// Models can only be used in a repository
test('models')
    ->expect('App\Models')
    ->toOnlyBeUsedOn('App\Repositories')
    ->toOnlyUse('Illuminate\Database');

test('repositories')
    ->expect('App\Repositories')
    ->toOnlyBeUsedOn('App\Controllers')
    ->toOnlyUse('App\Models');

test('globals')
    ->expect(['dd','dump','var_dump'])
    ->not->toBeUsed();

test('facades')
    ->expect('Illuminate\Support\Facades')
    ->not->toBeUsed()
    ->ignoring('App\Providers');
```

</Snippet>

This part can be seen on video [https://youtu.be/9EGPo_enEc8?t=1021](https://youtu.be/9EGPo_enEc8?t=1021)

We can also check if a class is final:

<Snippet filename="tests/Feature/AnyTest.php">

```php
test('controllers')
    ->expect('App\Http\Controllers')
    ->toUseStrictTypes()
    ->toHaveSuffix('Controller') // or toHavePrefix, ...
    ->toBeReadonly()
    ->toBeClasses() // or toBeInterfaces, toBeTraits, ...
    ->classes->toBeFinal() // 🌶
    ->classes->toExtendNothing() // or toExtend(Controller::class),
    ->classes->toImplementNothing() // or toImplement(ShouldQueue::class),
```

</Snippet>

### Taking snapshots

There is also a feature called `Snapshots`. The idea is to store a content as a snapshot then compares future run with that snapshot.

A snapshot can be the content of an HTML page, a JSON answer, the content of a file / array, ... everything in fact (for an object; we can serialise it so we can store it too as a snapshot).

<Snippet filename="tests/Feature/AnyTest.php">

```php
it('has a welcome page', function() {
    $response = $this->get('/');
    expect($response)->toMatchSnapshot();
});
```

</Snippet>

On the very first run (`vendor/bin/pest`), the snapshot didn't exist yet so it'll be created on disk and the test will be noted as *WARN*.

The snapshot will be created in a subdirectory in the `./tests/.pest/snapshots` folder (the subdirectory will match the location of your fired test (f.i. `Feature/ExampleTest/it_has_a_welcome_page.snap`)).

As from the second run, the taken snapshot will then be compared with, in the example here above, the HTML content of the homepage. As soon as a difference is noted (like the today date if present on the page), Pest will show it in a diff: the previous string coming from the snapshot and the retrieved, actual, string.

## Write global functions

We can write our own custom functions in the `tests/Pest.php` file.

## Pest bootstrap

The file `tests/pest.php` can be used to place there global function but we'll also need to update it if, inside our tests files, we need some other classes.

<Snippet filename="tests/Feature/AnyTest.php">

```php
uses(Tests\TestCase::class)->in('Feature');
```

</Snippet>

The line above will make `Tests\TestCase` available in all tests in `tests/Feature`. If we need more classes, we can add them:

<Snippet filename="tests/Feature/AnyTest.php">

```php
uses(Tests\TestCase::class,Illuminate\Foundation\Testing\RefreshDatabase::class)->in('Feature');
```

</Snippet>

And also in the `test/Unit` folder:

<Snippet filename="tests/Feature/AnyTest.php">

```php
uses(Tests\TestCase::class)->in('Unit');
```

</Snippet>

## Tips and tricks

### Dump and die

We can use the `dd` method to dump the current expectation value and end the test suite like this:

<Snippet filename="tests/Feature/AnyTest.php">

```php
expect($response)
    ->dd()
    ->toHaveKey('data')
    ->data->toBeEmpty();
```

</Snippet>

## Convert from PHPUnit

> [[Migrate from PHPUnit to Pest - Online migration tool](https://benjamincrozat.com/phpunit-to-pest)t](https://benjamincrozat.com/phpunit-to-pest)

Introduced in Pest since v2.9, there is a tool to convert from PHPUnit to Pest.

See [https://pestphp.com/docs/pest-spicy-summer-release#content-drift-plugin](https://pestphp.com/docs/pest-spicy-summer-release#content-drift-plugin)

Note: Rector has also a tool: [https://github.com/rectorphp/rector-pest](https://github.com/rectorphp/rector-pest)

For example, the code below

<Snippet filename="tests/Feature/example_test.php">

```php
<?php

namespace Tests\Unit;

use PHPUnit\Framework\TestCase;

class ExampleTest extends TestCase
{
    public function test_that_true_is_true(): void
    {
        $this->assertTrue(true);
    }
}
```

</Snippet>

will be converted to

<Snippet filename="tests/Feature/example_test.php">

```php
test('true is true', function () {
    expect(true)->toBeTrue();
});
```

</Snippet>

## Tools

### Laravel plugin

> [Laravel Pest plugin](https://pestphp.com/docs/plugins/laravel)

Install the plugin like this: `composer require pestphp/pest-plugin-laravel --dev`

Then some new artisan commands will be available:

<Terminal>
$ php artisan | grep pest
 pest
  pest:dataset           Create a new dataset file
  pest:install           Creates Pest resources in your current PHPUnit test suite
  pest:test              Create a new test file
</Terminal>

### Visual Studio Code Add-on

* If not yet installed, [PHP Intelephense](https://marketplace.visualstudio.com/items?itemName=bmewburn.vscode-intelephense-client) will allow you to press <kbd>F12</kbd> on a method name (like `toBeTrue`) and jump where the method is implemented,
* [Better Pest](https://marketplace.visualstudio.com/items?itemName=m1guelpf.better-pest) and
* [Pest Snippets](https://marketplace.visualstudio.com/items?itemName=dansysanalyst.pest-snippets)

#### Better Pest with Docker

If you're using Docker, think to add the next lines in your `.vscode/settings.json` configuration file:

<Snippet filename=".vscode/settings.json">

```json
{
    "better-pest.docker.enable": true,
    "better-pest.docker.command": "docker compose exec -u root:root app",
    "better-pest.docker.paths": {
        "/your/local/path": "/your/remote/path"
    }
}
```

</Snippet>

Think to adjust the name of your container (`app` here) and paths:

* `/your/local/path` is where your repository is stored, on your host machine,
* `/your/remote/path` is the path in your container, probably `/var/www/html`.

Now, just open any Pest file and press <kbd>CTRL</kbd>+<kbd>Shift</kbd>+<kbd>P</kbd> to open the Command Palette. Start to type `Better Pest` and select the desired option (like `Better Pest: run` for running the file).

### Convert from PHPUnit to Pest

The repository [https://github.com/mandisma/pest-converter](https://github.com/mandisma/pest-converter) proposes a **PHPUnit to Pest Converter**: PestConverter is a PHP library for converting PHPUnit tests to Pest tests.

## Links

### Videos

* [Laracast - Pest](https://laracasts.com/series/jeffreys-larabits/episodes/30)
* [Laracast - Pest from Scratch](https://laracasts.com/series/pest-from-scratch)
* [Laracon IN 2023: the future of PEST](https://youtu.be/9EGPo_enEc8)
