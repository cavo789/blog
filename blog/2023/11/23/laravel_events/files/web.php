use App\Employee;
use App\Events\SampleEvent;

Route::get('/', function () {
    $employee = new Employee();

    SampleEvent::dispatch($employee);

    echo 'FIRSTNAME is ' . $employee->getFirstName() . PHP_EOL;
    echo 'NAME      is ' . $employee->getLastName()  . PHP_EOL;
    echo 'PSEUDO    is ' . $employee->getPseudo()  . PHP_EOL;
});
