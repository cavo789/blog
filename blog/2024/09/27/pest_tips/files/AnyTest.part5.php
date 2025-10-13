<?php

declare(strict_types=1);

namespace Tests\Feature;

use Tests\TestCase;

class VisitLoginPageTest extends TestWebCase
{
    /** @test */
    public function test_we_should_see_fields_email_and_password()
    {
        $this->response->assertSee('id="password"', false);
        $this->response->assertSee('id="email"', false);
    }
}
