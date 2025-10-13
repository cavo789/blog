<?php

namespace App;

class Employee
{
    public function __construct(
        private string $firstname = 'John',
        private string $lastname  = 'Doe',
        private string $pseudo    = 'cavo789'
    ) {
    }

    public function getFirstName(): string
    {
        return $this->firstname;
    }

    public function setFirstName(string $firstname)
    {
        $this->firstname = $firstname;
        return $this;
    }

    public function getLastName(): string
    {
        return $this->lastname;
    }

    public function setLastName(string $lastname)
    {
        $this->lastname = $lastname;
        return $this;
    }

    public function getPseudo(): string
    {
        return $this->pseudo;
    }

    public function setPseudo(string $pseudo)
    {
        $this->pseudo = $pseudo;
        return $this;
    }
};
