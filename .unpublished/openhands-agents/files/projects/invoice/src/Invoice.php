<?php

declare(strict_types=1);

namespace App;

final class Invoice
{
    /** @var array<int, array{price: float, quantity: int}> */
    private array $lines = [];

    public function __construct(private readonly float $vatRate = 0.21)
    {
    }

    public function addLine(float $price, int $quantity): void
    {
        $this->lines[] = ['price' => $price, 'quantity' => $quantity];
    }

    /** Total excluding VAT, after a percentage discount (e.g. 10 for 10%). */
    public function subtotal(float $discountPercent = 0): float
    {
        $sum = 0.0;
        foreach ($this->lines as $line) {
            $sum += $line['price'] * $line['quantity'];
        }

        return round($sum - $discountPercent, 2);
    }

    /** Total including VAT. */
    public function total(float $discountPercent = 0): float
    {
        return round($this->subtotal($discountPercent) * (1 + $this->vatRate), 2);
    }
}
