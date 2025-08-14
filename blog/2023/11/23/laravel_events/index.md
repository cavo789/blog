---
slug: laravel_events
title: Working with Laravel events
authors: [christophe]
image: /img/laravel_tips_social_media.jpg
tags: [laravel, php]
enableComments: true
---
![Working with Laravel events](/img/laravel_tips_banner.jpg)

When I started developing for the Joomla CMS (that was 15 years ago, in 2009), one of the things I liked most was the notion of events.

For example *An article is about to be posted*, *An article has been posted*, *A user has registered*, ... i.e. actions that are announced by the CMS and to which you can react.

When *An article is about to be displayed* is generated, you can have one (or more) pieces of code interact with this event. You can add dynamic content, you can also deny the article to be displayed if certain conditions are not met.

<!-- truncate -->

When *A user has registered* is thrown, you can do a lot of things like welcoming this person, adding him to a distribution list, send him an email, ... but above all, and this is the most important for me, leave the door open to other actions that you don't yet know about.

For a web developer, a best approach, I think is to generate events even if it's your own code and you know what to do.

:::tip In fact, you never know
You don't know because your software will have a life of its own, because over the years other features will be added and other developers will modify it. If you're working with events, it will be terribly easy for anyone to add a code "OK, when a new user registers, I need to ..."; something you didn't know then. Events are ideal for simplifying the addition of new functionalities.
:::

## Laravel example

The example below is for the Laravel framework.

You need to run an event having one or more listeners and, in your main code, you wish to retrieve some values once listeners have done their job.

In our example below, we'll fire a `SampleEvent` class and his `SampleListener`. The idea is to initialize an `employee`.

File `app/Providers/EventServiceProvider.php`

<Snippets filename="app/Providers/EventServiceProvider.php">

```php
protected $listen = [
    SampleEvent::class => [
        SampleListener::class,
    ],
];
```

</Snippets>

For our sample, your `routes/web.php` can look like this:

<Snippets filename="routes/web.php">

```php
use App\Employee;
use App\Events\SampleEvent;

Route::get('/', function () {
    $employee = new Employee();

    SampleEvent::dispatch($employee);

    echo 'FIRSTNAME is ' . $employee->getFirstName() . PHP_EOL;
    echo 'NAME      is ' . $employee->getLastName()  . PHP_EOL;
    echo 'PSEUDO    is ' . $employee->getPseudo()  . PHP_EOL;
});
```

</Snippets>

What we do is:

1. Create a new `employee` based on the `Employee` class,
2. Call our `SampleEvent` event and give our new `employee`,
3. Let the magic happens,
4. Display the employee's first and last name.

Here, by default, our employee.

### File app/Employee.php

This class will initialize our employee and provide setters and getters.

By default, our employee will be called `John Doe (cavo789)`.

<Snippets filename="app/Employee.php">

```php
<?php

namespace App;

class Employee
{
    public function __construct(
        private string $firstname = 'John',
        private string $lastname  = 'Doe',
        private string $pseudo    = 'cavo789'
    ) {
    }

    public function getFirstName(): string
    {
        return $this->firstname;
    }

    public function setFirstName(string $firstname)
    {
        $this->firstname = $firstname;
        return $this;
    }

    public function getLastName(): string
    {
        return $this->lastname;
    }

    public function setLastName(string $lastname)
    {
        $this->lastname = $lastname;
        return $this;
    }

    public function getPseudo(): string
    {
        return $this->pseudo;
    }

    public function setPseudo(string $pseudo)
    {
        $this->pseudo = $pseudo;
        return $this;
    }
};
```

</Snippets>

### File app/Events/SampleEvent.php

Our event will receive an employee and make it private.

Make three setters public to allow listeners to update the first and the last name. Also allow initializing the pseudo.

<Snippets filename="app/Events/SampleEvent.php">

```php
<?php

namespace App\Events;

use App\Employee;
use Illuminate\Foundation\Events\Dispatchable;

class SampleEvent
{
    use Dispatchable;

    public function __construct(private Employee $employee)
    {
    }

    public function setFirstName(string $firstname): self
    {
        $this->employee->setFirstName($firstname);
        return $this;
    }

    public function setLastName(string $lastname): self
    {
        $this->employee->setLastName($lastname);
        return $this;
    }

    public function setPseudo(string $pseudo): self
    {
        $this->employee->setPseudo($pseudo);
        return $this;
    }
}
```

</Snippets>

### File app/Listeners/SampleListener.php

Our listener logic. `SampleListener` will receive the `SampleEvent` as parameter and, thus, has access to all his public methods. We'll here update the first and the lastname, we'll not update the pseudo.

<Snippets filename="app/Listeners/SampleListener.php">

```php
<?php

namespace App\Listeners;

use App\Events\SampleEvent;

class SampleListener
{
    public function handle(SampleEvent $event): void
    {
        $event->setFirstName('Georges')->setLastName('Washington');
    }
}
```

</Snippets>

### The result

If we run `curl localhost` in the console, we'll get the output below showing us it has worked perfectly as expected.

```text
FIRSTNAME is Georges
NAME      is Washington
PSEUDO    is cavo789
```

If we edit back the `app/Providers/EventServiceProvider.php` file and comment the listener like below illustrated, our code will still work.

<Snippets filename="app/Providers/EventServiceProvider.php">

```php
protected $listen = [
    SampleEvent::class => [
        // SampleListener::class,
    ],
];
```

</Snippets>

```text
FIRSTNAME is John
NAME      is Doe
PSEUDO    is cavo789
```

## PHP example (not Laravel)

Years ago, I've written an example in pure PHP (not Laravel) and using the `League\Event` library as you can retrieve on [https://event.thephpleague.com/](https://event.thephpleague.com/).

The repository and sample code are on Github: [https://github.com/cavo789/event_thephpleague_learning](https://github.com/cavo789/event_thephpleague_learning).

:::note
This is, partially, a copy of an article I've previously posted on [https://dev.to/cavo789/working-with-laravel-events-2i6m](https://dev.to/cavo789/working-with-laravel-events-2i6m)
:::
