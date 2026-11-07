---
slug: openhands-laravel-upgrade
title: "OpenHands: Upgrading a 2018 Laravel 5.6 Project to PHP 8.6"
description: "An autonomous agent in a container takes a forgotten Laravel 5.6 / PHP 7.1 side project to Laravel 12 and PHP 8.6, one major version per commit, with Rector for the mechanical work."
authors: [christophe, claude]
image: /img/v2/laravel.webp
mainTag: ai
tags: [ai, docker, php, laravel]
date: 2026-11-27
draft: true
tried_it: false
ai_assisted: true
language: en
---

<!-- AUTHOR-CHECK(run): rien de cet article n'a encore tourné. Prérequis : PHP 8.6 GA (2026-11-19) ET une version de Laravel qui le supporte officiellement. Vérifier les deux avant de lancer la mission. -->
<!-- AUTHOR-CHECK(decision): cet article suppose l'installation de /blog/openhands-agents (même compose.yaml + Dockerfile). Le Dockerfile n'embarque que PHP 8.4 (Debian trixie) : il faudra des images php:7.1-cli / php:8.6-cli, donc soit le socket Docker (DooD, à justifier), soit plusieurs versions de PHP dans l'image. À trancher. -->

![OpenHands: Upgrading a 2018 Laravel 5.6 Project](/img/v2/laravel.webp)

<!-- cspell:ignore OpenHands openhands Rector laravelcollective fzaninotto fideloper fakerphp driftingly -->

<TLDR>
TODO — written once the run is done.
</TLDR>

I have a GitHub account full of projects I wrote years ago and never touched again. `laravel_todos` is one of them: Laravel 5.6, PHP 7.1, December 2018. Upgrading it by hand means seven Laravel major versions, a handful of abandoned packages and an afternoon of reading changelogs. Nobody does that for a side project. So it rots.

<!-- truncate -->

## The Patient

<!-- AUTHOR-CHECK(run): git clone https://github.com/cavo789/laravel_todos dans projects/ (clone local uniquement, jamais de push) puis `git tag before-agent`. -->

33 PHP files in `app/`, almost no tests, and a `composer.json` frozen in 2018:

| Package | Status |
| --- | --- |
| `laravel/framework` 5.6 | Seven major versions behind |
| `fzaninotto/faker` | Abandoned, replaced by `fakerphp/faker` |
| `fideloper/proxy` | Merged into the framework since Laravel 9 — delete it |
| `laravelcollective/html` | Abandoned; the Blade views using it must be rewritten |
| `phpunit/phpunit` ^7 | Jump to PHPUnit 11+ |
| `database/seeds` classmap | Laravel 8 moved to namespaced `database/seeders` and class-based factories |

The hard part is not PHP 7.1 → 8.6. It is Laravel 5.6 → 12.

## The Mission

Split in two, because tests come first:

<!-- AUTHOR-CHECK(run): formulation finale après un essai à blanc ; la déplacer ensuite dans ./files/mission_prompt.txt -->

```text
Step 1 — Under PHP 7.1, write HTTP characterization tests for every route of this
todo application. Commit when they are green.

Step 2 — Upgrade the project one Laravel major version at a time (5.6 → 5.8 → 6 → … → 12),
then to PHP 8.6. Use Rector (rector/rector + driftingly/rector-laravel) for mechanical
changes. Replace abandoned packages. After each step, the test suite must be green;
make one commit per step. Never delete or weaken a test to make it pass.
```

The last sentence is there for a reason: in <Link to="/blog/openhands-agents">the first OpenHands article</Link>, the agent corrected a wrong expectation in its own test. It was right that time, and an agent can edit a test as easily as the code.

Rector does the mechanical rewrite (see <Link to="/blog/php-rector">Rector, my friend, my coach</Link>); the agent does what Rector cannot: read changelogs, choose a replacement package, rewrite the views.

## The Result

<!-- AUTHOR-CHECK(run): git log before-agent.. --oneline, nombre de tests avant/après, git diff --stat, durée et coût (Ollama vs Claude). -->

## What the Agent Got Wrong

<!-- AUTHOR-CHECK(run): uniquement ce qui a été réellement observé. -->

## Under the Hood (skip this if you just want to use it)

<!-- AUTHOR-CHECK(decision): agent vs. Laravel Shift (payant, déterministe) — garder cette comparaison ? -->

## Conclusion

<!-- AUTHOR-CHECK(run): à écrire après le run. -->
