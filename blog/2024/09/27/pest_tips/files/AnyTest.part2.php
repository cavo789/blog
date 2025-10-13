<?php

test('assert true is true', function () {
    // These two lines do exactly the same. Keep just one...
    $this->assertTrue(true);
    expect(true)->toBeTrue();
});
