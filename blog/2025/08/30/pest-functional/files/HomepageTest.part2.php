<?php

it('loads the homepage', function () {
    visit(getenv('WEBSITE'))
        ->assertSee('Avonture');
});

it('displays my name somewhere', function () {
    visit(getenv('WEBSITE'))
        ->assertSee('Christophe Avonture');
});

it('shows blog posts on the blog page', function () {
    visit(getenv('WEBSITE') . '/blog')
        ->assertSee('All posts');
});

it('navigates to the blog from the homepage', function () {
    visit(getenv('WEBSITE'))
        ->click('Blog')
        ->assertPathIs('/blog')
        ->assertSee('All Posts');
});

it('loads a specific blog post', function () {
    visit(getenv('WEBSITE') . '/blog/docker-joomla')
        ->assertSee('Create your Joomla website using Docker');
});

it('displays the about page', function () {
    visit(getenv('WEBSITE') . '/about')
        ->assertSee('My name is Christophe Avonture');
});

it('can search for a post', function () {
    visit(getenv('WEBSITE'))
        ->click('.DocSearch-Button')
        ->type('.DocSearch-Input', 'Bluesky')
        // highlight-next-line
        ->assertSee('React component and provide a "Share on Bluesky" button');
});

it('navigates to the archive and click on aeSecure QuickScan article', function () {
    visit(getenv('WEBSITE') . '/blog/archive')
        ->click('August 1 - aeSecure - QuickScan - Free viruses scanner')
        ->assertPathIs('/blog/aesecure-quickscan')
        ->assertSee('Just start your browser and go to the URL where your site is accessible.');
});

it('shows 404 for non-existent page', function () {
    visit(getenv('WEBSITE') . '/this-page-does-not-exist')
        ->assertSee('Page Not Found');
});

it('can load the robots.txt file', function () {
    visit(getenv('WEBSITE') . '/robots.txt')
        ->assertSee('User-agent');
});
