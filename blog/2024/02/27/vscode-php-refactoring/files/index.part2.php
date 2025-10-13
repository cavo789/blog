<?php

namespace Cavo;

require_once('Product.php');

$product = new Product();

$product->setName('keyboard');
$product->setPrice(125);

printf(
    'The name is %s cost %d €'.PHP_EOL,
    $product->getName(),
    $product->getPrice()
);
