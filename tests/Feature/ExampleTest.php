<?php

test('returns a redirect response to login', function () {
    $response = $this->get(route('home'));

    $response->assertRedirect(route('login'));
});
