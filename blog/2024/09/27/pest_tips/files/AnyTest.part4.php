it('has emails', function (string $name, string $email) {
    expect($email)->not->toBeEmpty();
})->with([
    ['John', 'enunomaduro@gmail.com'],
    ['Other', 'other@example.com']
]);
