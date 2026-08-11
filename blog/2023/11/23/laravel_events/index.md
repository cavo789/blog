---
slug: laravel_events
title: Working with Laravel events
date: 2023-11-23
description: Explore the power of Laravel events for clean, decoupled code. This guide provides a practical, step-by-step example of creating and dispatching an event with a listener.
authors: [christophe]
image: /img/v2/laravel.webp
mainTag: laravel
tags:
  - laravel
  - php
language: en
updates:
  - date: 2026-07-30
    note: "Removed link to cavo789/event_thephpleague_learning (GitHub repository no longer exists)."
---
![Working with Laravel events](/img/v2/laravel.webp)

<TLDR>
This article shows how to use Laravel's event/listener system to keep code decoupled: a `SampleEvent` carries an `Employee` object, a `SampleListener` (registered in `EventServiceProvider`) reacts to it and updates the employee's name, and removing the listener still leaves the base flow working — illustrating how events let future functionality hook into existing code without modifying it. A non-Laravel PHP example using `League\Event` is also referenced.
</TLDR>

When I started developing for the <Link to="/blog/docker-joomla-right-to-the-point">Joomla CMS</Link> (which was 15 years ago, in 2009), one of the things I liked most was the notion of events.

For example *An article is about to be posted*, *An article has been posted*, *A user has registered*, these are actions that are announced by the CMS and to which you can react.

When *An article is about to be displayed* is generated, you can have one (or more) pieces of code that interact with this event. You can add dynamic content, you can also prevent the article from being displayed if certain conditions are not met.

<!-- truncate -->

## What an event actually buys you

Here is a Laravel route that creates an employee and displays their name. A listener is plugged on the event it fires:

<Terminal typewriter source="./files/terminal-2.txt" />

Now the very same route, with that listener commented out. Same URL, same calling code, not a line changed in the controller:

<Terminal typewriter source="./files/terminal-1.txt" />

The employee is back to their default name, and nothing crashed. That's the entire promise of events: a feature can be added or removed without the code that fires the event knowing about it.

## Why it works

1. The route creates a new `employee` based on the `Employee` class, then fires a `SampleEvent` carrying that object.
2. Any registered listener receives the event, and through it, the very same employee object; it can modify it.
3. The route then displays the employee's first and last name, without ever knowing whether a listener did something or not.

<AlertBox variant="info" title="In fact, you never know">
You never know because your software will have a life of its own, because over the years other features will be added and other developers will modify it. If you're working with events, it will be very easy for anyone to add code like "OK, when a new user registers, I need to..."; something you didn't know then. Events are ideal for simplifying the addition of new functionality.

</AlertBox>

## Building it

Four small files and one line of wiring. Let's follow the flow, starting with the entry point.

For our example, your `routes/web.php` can look like this:

<Snippet filename="routes/web.php" source="./files/web.php" defaultOpen={false} />

This class will initialize our employee and provide a setter and a getter. By default, our employee will be called `John Doe (cavo789)`.

<Snippet filename="app/Employee.php" source="./files/Employee.php" defaultOpen={false} />

Our event will receive an employee and store it as a private property:

<Snippet filename="app/Events/SampleEvent.php" source="./files/SampleEvent.php" defaultOpen={false} />

Our listener logic. `SampleListener` will receive the `SampleEvent` as a parameter and, thus, has access to all its public methods. We will here update the first and the last name, we will not update the pseudo:

<Snippet filename="app/Listeners/SampleListener.php" source="./files/SampleListener.php" defaultOpen={true} />

And finally the wiring, i.e. the file that tells Laravel which listener answers which event:

<Snippet filename="app/Providers/EventServiceProvider.php" source="./files/EventServiceProvider.php" defaultOpen={false} />

To reproduce the second terminal shown at the top of this article, comment the listener in that file:

<Snippet filename="app/Providers/EventServiceProvider.php" source="./files/EventServiceProvider.part2.php" defaultOpen={false} />

## Under the Hood (skip this if you just want to use it)

The three setters of the event are public on purpose: that's the only reason a listener, which lives in a totally different file, is allowed to update the first and the last name.

The pseudo, on the other hand, is only initialized and never updated by the listener; it's the part of the object that stays under the control of the code that fired the event. Deciding what a listener may and may not touch is exactly the design work an event class asks from you.

## The same idea outside Laravel

Events are not a Laravel invention. In plain PHP, the `League\Event` library ([https://event.thephpleague.com/](https://event.thephpleague.com/)) gives you the same dispatcher/listener pair, with no framework attached.

## Conclusion

The whole point is in the two terminal outputs at the top: a feature was removed and the calling code didn't notice. Write events even in your own code, even when you're sure you know what to do with them, because in two years, someone (probably you) will want to hook something in.

*Events are, by nature, invisible: they fire somewhere and something happens elsewhere. <Link to="/blog/laravel-telescope">Laravel Telescope</Link> makes them visible again, which is a real help when debugging a decoupled application like this one.*

<AlertBox variant="note">
This is, partially, a copy of an article I have previously posted on [https://dev.to/cavo789/working-with-laravel-events-2i6m](https://dev.to/cavo789/working-with-laravel-events-2i6m)

</AlertBox>
