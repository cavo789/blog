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
