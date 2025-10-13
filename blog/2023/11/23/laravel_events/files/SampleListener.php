<?php

namespace App\Listeners;

use App\Events\SampleEvent;

class SampleListener
{
    public function handle(SampleEvent $event): void
    {
        $event->setFirstName('Georges')->setLastName('Washington');
    }
}
