<?php

function sayHello($firstname = "")
{
    if($firstname == "") {
        $text = "Hello World!";
    } else {
        $text = "Hello " . $firstname;
    }

    return $text;
}

echo sayHello();
