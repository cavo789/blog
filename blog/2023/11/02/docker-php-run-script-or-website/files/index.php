<?php

echo "<h2>Incorrect, silent bug</h2>";

print_r(json_decode(utf8_decode("Ipso lorem"), true));

echo "<h2>Incorrect, we got an exception</h2>";

print_r(json_decode(utf8_decode("Ipso lorem"), true, 512, JSON_THROW_ON_ERROR));
