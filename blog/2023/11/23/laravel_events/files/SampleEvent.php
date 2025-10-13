<?php

namespace App\Events;

use App\Employee;
use Illuminate\Foundation\Events\Dispatchable;

class SampleEvent
{
    use Dispatchable;

    public function __construct(private Employee $employee)
    {
    }

    public function setFirstName(string $firstname): self
    {
        $this->employee->setFirstName($firstname);
        return $this;
    }

    public function setLastName(string $lastname): self
    {
        $this->employee->setLastName($lastname);
        return $this;
    }

    public function setPseudo(string $pseudo): self
    {
        $this->employee->setPseudo($pseudo);
        return $this;
    }
}
