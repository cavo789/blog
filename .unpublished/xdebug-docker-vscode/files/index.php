<?php

function cartTotal(array $items): float
{
    $total = 0.0;

    foreach ($items as $item) {
        $total += $item['price'] * $item['qty'];
    }

    return $total;
}

$items = [
    ['price' => 12.50, 'qty' => 2],
    ['price' => 4.00, 'qty' => 5],
];

echo cartTotal($items);
