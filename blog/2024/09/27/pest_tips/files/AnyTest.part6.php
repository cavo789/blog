test('controllers')
    ->expect('App\Http\Controllers')
    ->not->toUse('Illuminate\Http\Request');

// Models can only be used in a repository
test('models')
    ->expect('App\Models')
    ->toOnlyBeUsedOn('App\Repositories')
    ->toOnlyUse('Illuminate\Database');

test('repositories')
    ->expect('App\Repositories')
    ->toOnlyBeUsedOn('App\Controllers')
    ->toOnlyUse('App\Models');

test('globals')
    ->expect(['dd','dump','var_dump'])
    ->not->toBeUsed();

test('facades')
    ->expect('Illuminate\Support\Facades')
    ->not->toBeUsed()
    ->ignoring('App\Providers');
