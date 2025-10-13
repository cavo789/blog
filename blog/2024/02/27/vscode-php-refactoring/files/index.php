<?php

namespace Cavo;

require_once('Product.php');

$product = new Product();

$product->setProductName('keyboard');
$product->setProductPrice(125);

printf(
    'The name is %s cost %d €'.PHP_EOL,
    $product->getProductName(),
    $product->getProductPrice()
);
