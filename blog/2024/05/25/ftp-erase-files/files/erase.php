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
