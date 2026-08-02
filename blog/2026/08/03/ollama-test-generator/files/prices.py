"""Tiny pricing helpers — small enough to check the generated tests by hand."""


def apply_discount(price: float, percent: float) -> float:
    """Return `price` reduced by `percent`, rounded to the cent.

    A 0% discount returns the price unchanged; 100% returns 0.0.
    """
    if price < 0:
        raise ValueError("price cannot be negative")

    if not 0 <= percent <= 100:
        raise ValueError("percent must be between 0 and 100")

    return round(price * (1 - percent / 100), 2)


def cheapest(offers: dict[str, float]) -> str:
    """Return the name of the cheapest offer.

    Ties are resolved by name, so the result never depends on dict ordering.
    """
    if not offers:
        raise ValueError("no offer given")

    return min(sorted(offers), key=offers.__getitem__)
