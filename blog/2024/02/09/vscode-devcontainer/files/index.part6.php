<?php

function sayHello(string $firstname = ""): string
{
    return $firstname == "" ? "Hello World!" : "Hello " . $firstname;
}

echo sayHello();
