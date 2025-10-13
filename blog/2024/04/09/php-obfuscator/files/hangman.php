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
