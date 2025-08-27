---
slug: php-obfuscator
title: Obfuscate your PHP code
authors: [christophe]
image: /img/hell_social_media.jpg
mainTag: php
tags: [code-quality, IA, php]
---
<!-- cspell:ignore ctype, fgets, ppmb, ppmc, ppms, ppmu, ppmw, ppmx, ppnc, ppnt, ppnx, ppny, ppnz, strlen, strpos, strtolower -->

![Obfuscate your PHP code](/img/hell_banner.jpg)

A few years ago, I sold a software called aeSecure, which was a Web Application Firewall. In order to prevent my proprietary code from being picked up by someone who could then sell it, for example, I had developed an obfuscation script.

Since then, I've released a reusable version of that script: [https://github.com/cavo789/php_obfuscator](https://github.com/cavo789/php_obfuscator).

And what if, today, with artificial intelligence, this type of code was no longer of any interest? The aim of this article is to see if it's always a good idea to make your code unreadable.

<!-- truncate -->

## Obtaining a previously non-existent code, ask Gemini

Just to give you some PHP code to use as an example for this article, let's create a hangman game using artificial intelligence.

![Asking Gemini](./images/gemini.png)

Here is the code proposed by [Gemini](https://gemini.google.com/). Save it to your disk as `hangman.php`:

<Snippet filename="hangman.php">

```php
<?php

function generateWordList() {
  // Replace these with your own word list
  return [
    "apple",
    "banana",
    "orange",
    "computer",
    "programming",
  ];
}

function getRandomWord($wordList) {
  $randomIndex = array_rand($wordList);
  return $wordList[$randomIndex];
}

function displayHangman($guessesLeft) {
  $stages = [
    "[   O    ]",
    "[   |    ]",
    "[  /|    ]",
    "[  /|\\   ]",
    "[   |    ]",
    "[  /     ]",
    "Wrong guess: ",
  ];
  echo $stages[$guessesLeft] . PHP_EOL;
}

function displayWord($word, $guessedLetters) {
  $displayedWord = "";
  for ($i = 0; $i < strlen($word); $i++) {
    $letter = $word[$i];
    if (in_array($letter, $guessedLetters)) {
      $displayedWord .= $letter . " ";
    } else {
      $displayedWord .= "_ ";
    }
  }
  echo trim($displayedWord) . PHP_EOL;
}

function playHangman() {
  $wordList = generateWordList();
  $word = getRandomWord($wordList);
  $guessedLetters = [];
  $guessesLeft = 6;

  while ($guessesLeft > 0) {
    displayHangman($guessesLeft);
    displayWord($word, $guessedLetters);

    echo "Guess a letter: ";
    $guess = trim(fgets(STDIN));

    if (strlen($guess) !== 1 || !ctype_alpha($guess)) {
      echo "Please enter a single letter." . PHP_EOL;
      continue;
    }

    $guess = strtolower($guess);

    if (in_array($guess, $guessedLetters)) {
      echo "You already guessed that letter." . PHP_EOL;
      continue;
    }

    $guessedLetters[] = $guess;

    if (strpos($word, $guess) === false) {
      $guessesLeft--;
    }

    if (str_replace(" ", "", displayWord($word, $guessedLetters)) === $word) {
      echo "Congratulations! You guessed the word." . PHP_EOL;
      break;
    }
  }

  if ($guessesLeft === 0) {
    displayHangman($guessesLeft);
    echo "You ran out of guesses. The word was: " . $word . PHP_EOL;
  }
}

playHangman();
```

</Snippet>

To play with this game, just run `docker run -it -v ${PWD}:/src -w /src php:7.4-fpm php hangman.php`.

As you'll see the script works fine without any change!

![Playing](./images/playing.png)

## Obfuscate

Now, we'll make this code unreadable by removing unneeded spaces, carriage return and replacing names by some random letters. For instance, replace the `playHangman` function name by a random suite like `ppny`. And to make the code more unreadable, I'll choose only suites like `ppmx`, `ppnx`, `ppny` and so on.

To do such obfuscation, just download my [https://github.com/cavo789/php_obfuscator/blob/main/src/minify.php](https://github.com/cavo789/php_obfuscator/blob/main/src/minify.php) script and save it on your disk as `minify.php`. Also create a file called `settings.json` with this content:

<Snippet filename="settings.json">

```json
{
    "replace": {
        "getRandomWord":"ppmx",
        "displayHangman":"ppnx",
        "playHangman":"ppny",
        "displayWord":"ppnz",
        "guessesLeft":"ppnc",
        "guessedLetters":"ppnt",
        "randomIndex":"ppmw",
        "wordList":"ppmu",
        "generateWordList":"ppms",
        "displayedWord":"ppmb",
        "stages":"ppmc"
    }
}
```

</Snippet>

Right now, in your folder, you've three files:

<Terminal>
$ ls -alh
total 28K
drwxr-xr-x  2 root root 4.0K Apr  7 20:11 .
drwxrwxrwt 22 root root 4.0K Apr  7 19:55 ..
-rw-r--r--  1 root root 1.9K Apr  7 20:07 hangman.php
-rw-r--r--  1 root root  12K Apr  7 19:34 minify.php
-rw-r--r--  1 root root  731 Apr  7 19:47 settings.json
</Terminal>

Time to make the `hangman.php` file unreadable by running `docker run -it -v ${PWD}:/src -w /src php:7.4-fpm php minify.php input=hangman.php output=hangman_minify.php`.

![Obfuscating your PHP code](./images/obfuscate.png)

Now, you've a new file called `hangman_minify.php`:

<Snippet filename="hangman_minify.php">

```php
<?php
function ppms(){return [
"apple",
"banana",
"orange",
"computer",
"programming",
];}
function ppmx($ppmu){$ppmw=array_rand($ppmu);return $ppmu[$ppmw];}
function ppnx($ppnc){$ppmc=[
"[   O    ]",
"[   |    ]",
"[  /|    ]",
"[  /|\\   ]",
"[   |    ]",
"[  /     ]",
"Wrong guess: ",
];echo $ppmc[$ppnc].PHP_EOL;}
function ppnz($word,$ppnt){$ppmb="";
for ($i=0; $i < strlen($word); $i++){$letter=$word[$i];if(in_array($letter,$ppnt)){$ppmb .=$letter." ";}else{$ppmb .="_ ";}}echo trim($ppmb).PHP_EOL;}
function ppny(){$ppmu=ppms();$word=ppmx($ppmu);$ppnt=[];$ppnc=6;while ($ppnc > 0){
ppnx($ppnc);
ppnz($word,$ppnt);echo "Guess a letter: ";$guess=trim(fgets(STDIN));if(strlen($guess) !==1||!ctype_alpha($guess)){echo "Please enter a single letter.".PHP_EOL;continue;}$guess=strtolower($guess);if(in_array($guess,$ppnt)){echo "You already guessed that letter.".PHP_EOL;continue;}$ppnt[]=$guess;if(strpos($word,$guess)===false){$ppnc--;}
if(str_replace(" ", "", ppnz($word,$ppnt))===$word){echo "Congratulations! You guessed the word.".PHP_EOL;break;}}
if($ppnc===0){
ppnx($ppnc);echo "You ran out of guesses. The word was: ".$word.PHP_EOL;}}
ppny();
```

</Snippet>

What you see here above is the newer version of the `hangman.php` file and it's still running. You can check by running `docker run -it -v ${PWD}:/src -w /src php:7.4-fpm php hangman_minify.php`.

## Make the code readable again, ask Copilot

![Asking copilot](./images/copilot.png)

The first time, [Copilot](https://copilot.microsoft.com/) has kept my minified function name. By asking him *Can you suggest me another version?*, Copilot suggests this code:

![Rewriting the code](./images/copilot_rewritting.png)

<Snippet filename="hangman.php">

```php
<?php
// Define an array of words
function getRandomWord()
{
    $words = [
        "apple",
        "banana",
        "orange",
        "computer",
        "programming",
    ];
    return $words[array_rand($words)];
}

// Display hangman art based on the number of incorrect guesses
function displayHangman($incorrectGuesses)
{
    $hangmanArt = [
        "[   O    ]",
        "[   |    ]",
        "[  /|    ]",
        "[  /|\\   ]",
        "[   |    ]",
        "[  /     ]",
    ];
    echo $hangmanArt[$incorrectGuesses] . PHP_EOL;
}

// Display the word with guessed letters revealed
function displayWord($word, $guessedLetters)
{
    $displayedWord = "";
    foreach (str_split($word) as $letter) {
        if (in_array($letter, $guessedLetters)) {
            $displayedWord .= $letter . " ";
        } else {
            $displayedWord .= "_ ";
        }
    }
    echo trim($displayedWord) . PHP_EOL;
}

// Main game loop
function playHangman()
{
    $wordToGuess = getRandomWord();
    $guessedLetters = [];
    $incorrectGuesses = 6;

    while ($incorrectGuesses > 0) {
        displayHangman($incorrectGuesses);
        displayWord($wordToGuess, $guessedLetters);
        echo "Guess a letter: ";
        $guess = trim(fgets(STDIN));

        if (strlen($guess) !== 1 || !ctype_alpha($guess)) {
            echo "Please enter a single letter." . PHP_EOL;
            continue;
        }

        $guess = strtolower($guess);

        if (in_array($guess, $guessedLetters)) {
            echo "You already guessed that letter." . PHP_EOL;
            continue;
        }

        $guessedLetters[] = $guess;

        if (strpos($wordToGuess, $guess) === false) {
            $incorrectGuesses--;
        }

        if (str_replace(" ", "", displayWord($wordToGuess, $guessedLetters)) === $wordToGuess) {
            echo "Congratulations! You guessed the word." . PHP_EOL;
            break;
        }
    }

    if ($incorrectGuesses === 0) {
        displayHangman($incorrectGuesses);
        echo "You ran out of guesses. The word was: " . $wordToGuess . PHP_EOL;
    }
}

// Start the game
playHangman();
```

</Snippet>

The artificial intelligence managed to understand the purpose of the script (a hangman game) and rewrote the code to make it readable. Not only is the code readable, the function names are too, but it has also written comments. Just incredible!
