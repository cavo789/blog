---
slug: ftp-erase-files
title: FTP - Remove files and folders at light speed
authors: [christophe]
image: ./images/erase-light-speed_social_media.jpg
tags: [ftp, tips]
enableComments: true
---
<!-- cspell:ignore subfolders -->
![FTP - Remove files and folders at light speed](./images/erase-light-speed_banner.jpg)

Have you ever deleted a website from your FTP client? It's easy, just select the folder containing the website and press the <kbd>delete</kbd> key.

Easy, simple and ... so slow. It takes ages to suppress files / folders. Several dozen minutes! Ouch.

If you've a SSH connection to your web server and if you're comfortable with it; you can `rm -rf` the folder and it'll be done in seconds.

But what if you don't have SSH or fear to make errors?

There is an alternative, the `erase.php` script.

<!-- truncate -->

Open your FTP client, open your website folder (like `/var/www/html/old_site`); the one you wish to remove and create a new file called f.i. `erase.php` then copy/paste the code below in it.

<Snippets filename="erase.php">

```php
<?php

$script_name = basename(__FILE__);
$directory = dirname(__FILE__);

echo '<h1>Deleting all files and subfolders in '.$directory.'</h1>';

$it = new RecursiveDirectoryIterator($directory);

foreach (new RecursiveIteratorIterator($it, RecursiveIteratorIterator::CHILD_FIRST) as $file) {
  if ( ($file->isDir()) && (!in_array($file->getFilename(), array('.', '..'))) ){
    echo '<h3>Deleting folder '.$file->getPathname().'</h3>';
    rmdir($file->getPathname());
  } else {
    if ( ($file->isFile()) && ($file->getPathname()!=__FILE__) ) {
      echo '<p>Deleting file '.$file->getPathname().'</p>';
      unlink ($file->getPathname());
    }
  }
}

echo '<h4 style="color:green;">Deletion complete.  Only the '.$script_name.' file remains in the folder.</h4>';

unlink(__FILE__);
?>
```

</Snippets>

Start your browser, navigate to your website (`http://your_old_site.com`) and add `/erase.php` at the end to run the script.

:::danger Make sure this is what you want
:::danger Be really sure this is what you want
:::danger Be extremely sure this is what you want
The script will then start immediately and will remove everything without asking confirmation nor backup. Just killing files and folders.

At the end of the process (i.e. in just a few seconds), the folder will be completely empty.
:::
