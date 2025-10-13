<?php

namespace Cavo;

class Product
{
    private string $name = '';
    private float $price = 0;

    public function __construct(string $name='', float $price=0)
    {
        $this->setName($name);
        $this->setPrice($price);
    }

    public function getName(): string {
        return $this->name;
    }

    public function setName(string $name): void {
        $this->name = $name;
    }

    public function getPrice(): float {
        return $this->price;
    }

    public function setPrice(float $price): void {
        $this->price = $price;
    }
}
