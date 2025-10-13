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
