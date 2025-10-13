//highlight-next-line
public function getName(): string
{
    return $this->name;
}

//highlight-next-line
public function setName(string $name): self
{
    // Force the product name to be written in lowercase
    $this->name = strtolower($name);

    return $this;
}

//highlight-next-line
public function getPrice(): float
{
    return $this->price;
}

//highlight-next-line
public function setPrice(float $price): self
{
    if ($price < 0) {
        throw new \Exception("Negative prices are not correct; please review your code");
    }

    $this->price = $price;

    return $this;
}
