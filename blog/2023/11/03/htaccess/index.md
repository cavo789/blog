---
date: 2023-11-03
slug: apache-htaccess
title: Apache .htaccess file
authors: [christophe]
mainTag: apache
description: Master your Apache .htaccess file with essential tips and tricks for security, redirection, file access control, Content Security Policy (CSP), forcing HTTPS, and performance optimization.
tags: [apache, snippets, .htaccess]
image: /img/v2/htaccess.webp
---
<!-- cspell:ignore webm -->
![Apache .htaccess file](/img/v2/htaccess.webp)

Some tips and tricks for your .htaccess file (Apache)

<!-- truncate -->

## CSP - Content Security Policy

Be inspired by the following lines:

<Snippet filename=".htaccess" source="./files/csp.htaccess" />

## Files

### Block access to some files based on their names

Refuse requests to these files:

<Snippet filename=".htaccess" source="./files/block_filenames.htaccess" />

### Block access to some files based on their extensions

Blocks access to all files except those whose extension is mentioned in the list below:

First option:

<Snippet filename=".htaccess" source="./files/block_fileextensions_option1.htaccess" />

Second option:

<Snippet filename=".htaccess" source="./files/block_fileextensions_option2.htaccess" />

### Block access to hidden files & directories

Don't allow to access to a file or folder when the name start with a dot (i.e. a hidden file / folder):

<Snippet filename=".htaccess" source="./files/block_hidden_files_folders.htaccess" />

## Force

### Force download

Don't allow the browser to download such files but tell him how to display them (text in the example):

<Snippet filename=".htaccess" source="./files/.part6.htaccess" />

#### Prevent downloading

For instance, force download for pdf files:

<Snippet filename=".htaccess" source="./files/.part7.htaccess" />

#### Force https and www, compatible hstspreload

> When implemented in your .htaccess, try to get access to `yoursite.com` or `http://yoursite.com` should redirect to `https://www.yoursite.com`.

Also, test your site with [https://hstspreload.org/](https://hstspreload.org/) to verify that your preloading is correct (green).

<Snippet filename=".htaccess" source="./files/.part8.htaccess" />

## Misc

### Disable error reporting

Don't show errors (just like a `error_reporting=E_NONE` does)

<Snippet filename=".htaccess" source="./files/.part9.htaccess" />

#### Enable error reporting

Show errors (just like a `error_reporting=E_ALL` does).

Only use this on a development server otherwise you'll expose sensitive information to your visitor.

<Snippet filename=".htaccess" source="./files/.part10.htaccess" />

#### Enable a maintenance mode

Redirect every requests done to your site to a specific page (called `maintenance.php` here below). Just think to replace the code `ADD_YOUR_IP_HERE` by your current IP address.

<Snippet filename=".htaccess" source="./files/.part11.htaccess" />

## Optimization

### Compress files based on their type or extensions

<Snippet filename=".htaccess" source="./files/.part12.htaccess" />

### Add expiration (expires headers)

Enable ETAGs

<Snippet filename=".htaccess" source="./files/.part13.htaccess" />

## Protection

### Deny All Access

<Snippet filename=".htaccess" source="./files/.part14.htaccess" />

### Deny All Access except you

Just replace `xxx.xxx.xxx.xxx` by your IP address.

<Snippet filename=".htaccess" source="./files/.part15.htaccess" />

### Stops a browser from trying to MIME-sniff

<Snippet filename=".htaccess" source="./files/.part16.htaccess" />

### Avoid Clickjacking and enable XSS-protection for browsers

<Snippet filename=".htaccess" source="./files/.part17.htaccess" />

### Disable script execution

Put these lines in f.i. `/tmp/.htaccess` to prevent execution of scripts in the `/tmp` folder.

<Snippet filename="/tmp/.htaccess" source="./files/no_execution.htaccess" />

### Disallow listing for directories

Don't allow the web server to provide the list of files / folders like a `dir` does.

<Snippet filename=".htaccess" source="./files/.part18.htaccess" />

### htpasswd

* `.htpasswd` generator : [http://aspirine.org/htpasswd.html](http://aspirine.org/htpasswd.html)

#### File password

<Snippet filename=".htaccess" source="./files/.part19.htaccess" />

#### Folder password

Place these lines in a file called `.htaccess` in the folder to protect (f.i. `folder_name`):

<Snippet filename="folder_name/.htaccess" source="./files/folder_password.htaccess" />

### Whitelist - Disallow access to all files except the ones mentioned

<Snippet filename=".htaccess" source="./files/.part20.htaccess" />

## Redirect

### Redirect an entire site

<Snippet filename=".htaccess" source="./files/.part21.htaccess" />

### Permanent redirection

<Snippet filename=".htaccess" source="./files/.part22.htaccess" />

### Temporary redirection

<Snippet filename=".htaccess" source="./files/.part23.htaccess" />

### Redirect a subfolder

For instance, redirect `/category/apple.php` to `apple.php`

<Snippet filename=".htaccess" source="./files/.part24.htaccess" />

or solve spelling issue by f.i. redirect every requests to the `fruit` folder to the plural form.

<Snippet filename=".htaccess" source="./files/.part25.htaccess" />

Another example: redirecting URLs from `/archive/2020/...` to `/2020/...`.

<Snippet filename=".htaccess" source="./files/.part26.htaccess" />

## Search engine

### Disallow indexing

Put these lines in f.i. `yoursite/administrator` to inform search engines that you don't allow him to index files in that folder (and sub-folders).

<Snippet filename="administrator/.htaccess" source="./files/administrator.htaccess" />