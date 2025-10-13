<?php

test('assert true is true', function () {
    expect(true)->toBeTrue();
});

test('assert false is not true', function () {
    expect(false)->not->toBeTrue();   // we can also write `not()->`
});
