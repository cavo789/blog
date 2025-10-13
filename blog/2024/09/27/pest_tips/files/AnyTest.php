<?php

test('assert count is correct', function () {
    expect(2 + 2)->toBe(4);       // Will be true
    expect(2 + 2)->toBe('4');     // Will NOT be true

    expect(2 + 2)->toEqual(4);    // Will be true
    expect(2 + 2)->toEqual('4');  // Will be true
});
