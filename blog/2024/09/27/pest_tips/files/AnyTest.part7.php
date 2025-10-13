test('controllers')
    ->expect('App\Http\Controllers')
    ->toUseStrictTypes()
    ->toHaveSuffix('Controller') // or toHavePrefix, ...
    ->toBeReadonly()
    ->toBeClasses() // or toBeInterfaces, toBeTraits, ...
    ->classes->toBeFinal() // 🌶
    ->classes->toExtendNothing() // or toExtend(Controller::class),
    ->classes->toImplementNothing() // or toImplement(ShouldQueue::class),
