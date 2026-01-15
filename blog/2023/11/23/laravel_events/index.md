---
slug: laravel_events
title: Working with Laravel events
date: 2023-11-23
description: Explore the power of Laravel events for clean, decoupled code. This guide provides a practical, step-by-step example of creating and dispatching an event with a listener.
authors: [christophe]
image: /img/v2/laravel.webp
mainTag: laravel
tags: [laravel, php]
language: en
---
![Working with Laravel events](/img/v2/laravel.webp)

When I started developing for the Joomla CMS (which was 15 years ago, in 2009), one of the things I liked most was the notion of events.

For example *An article is about to be posted*, *An article has been posted*, *A user has registered*, these are actions that are announced by the CMS and to which you can react.

When *An article is about to be displayed* is generated, you can have one (or more) pieces of code that interact with this event. You can add dynamic content, you can also prevent the article from being displayed if certain conditions are not met.

<!-- truncate -->

When *A user has registered* is thrown, you can do a lot of things like welcoming this person, adding them to a distribution list, sending them an email, but above all, and this is the most important for me, leave the door open to other actions that you don't yet know about.

For a web developer, the best approach, I think is to generate events even if it's your own code and you know what to do.

<AlertBox variant="info" title="In fact, you never know">
You never know because your software will have a life of its own, because over the years other features will be added and other developers will modify it. If you're working with events, it will be very easy for anyone to add a code "OK, when a new user registers, I need to"; something you didn't know then. Events are ideal for simplifying the addition of new functionality.

</AlertBox>

## Laravel example

The example below is for the Laravel framework.

You need to run an event having one or more listeners and, in your main code, you want to retrieve some values once listeners have done their job.

In our example below, we will fire a `SampleEvent` class and its `SampleListener`. The idea is to initialize an `employee`.

File `app/Providers/EventServiceProvider.php`

<Snippet filename="app/Providers/EventServiceProvider.php" source="./files/EventServiceProvider.php" />

For our example, your `routes/web.php` can look like this:

<Snippet filename="routes/web.php" source="./files/web.php" />

What we do is:

1. Create a new `employee` based on the `Employee` class,
2. Call our `SampleEvent` event and pass in our new `employee` object,
3. Let the magic happen,
4. Display the employee's first and last name.

Here is our default employee.

### File app/Employee.php

This class will initialize our employee and provide a setter and a getter.

By default, our employee will be called `John Doe (cavo789)`.

<Snippet filename="app/Employee.php" source="./files/Employee.php" />

### File app/Events/SampleEvent.php

Our event will receive an employee and store it as a private property.

Make the three setters public to allow listeners to update the first and the last name. Also, allow initializing the pseudo.

<Snippet filename="app/Events/SampleEvent.php" source="./files/SampleEvent.php" />

### File app/Listeners/SampleListener.php

Our listener logic. `SampleListener` will receive the `SampleEvent` as a parameter and, thus, has access to all its public methods. We will here update the first and the last name, we will not update the pseudo.

<Snippet filename="app/Listeners/SampleListener.php" source="./files/SampleListener.php" />

### The result

If we run `curl localhost` in the console, we'll get the output below showing us it has worked perfectly as expected.

<Terminal>
$ curl localhost

FIRSTNAME is Georges
NAME      is Washington
PSEUDO    is cavo789
</Terminal>

If we edit back the `app/Providers/EventServiceProvider.php` file and comment the listener as illustrated below, our code will still work.

<Snippet filename="app/Providers/EventServiceProvider.php" source="./files/EventServiceProvider.part2.php" />

<Terminal>
$ curl localhost

FIRSTNAME is John
NAME      is Doe
PSEUDO    is cavo789
</Terminal>

## PHP example (not Laravel)

Years ago, I have written an example in pure PHP (not Laravel) and using the `League\Event` library as you can find at [https://event.thephpleague.com/](https://event.thephpleague.com/).

The repository and sample code are on GitHub: [https://github.com/cavo789/event_thephpleague_learning](https://github.com/cavo789/event_thephpleague_learning).

<AlertBox variant="note" title="">
This is, partially, a copy of an article I have previously posted on [https://dev.to/cavo789/working-with-laravel-events-2i6m](https://dev.to/cavo789/working-with-laravel-events-2i6m)

</AlertBox>
