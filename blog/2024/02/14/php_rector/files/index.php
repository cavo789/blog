<?php

function sayHello(string $firstname = ''): string
{
    return 'Hello ' . ($firstname == '' ? 'World!' : $firstname);
}

echo sayHello();
