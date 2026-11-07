<?php

require __DIR__ . '/src/Invoice.php';

$invoice = new App\Invoice();
$invoice->addLine(200.00, 2);
$invoice->addLine(50.00, 1);

printf("Total with 10%% discount: %.2f EUR\n", $invoice->total(10));
