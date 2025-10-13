expect($response)
    ->dd()
    ->toHaveKey('data')
    ->data->toBeEmpty();
